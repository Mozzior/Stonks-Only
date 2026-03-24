import { withHandler, ok, fail, parseBody } from "../_shared/response.mjs";
import { Client, Databases, ID, Query } from "node-appwrite";

export default withHandler(async (context, logger) => {
  const { req } = context;
  const body = parseBody(req);
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  if (process.env.APPWRITE_SELF_SIGNED === "true") {
    client.setSelfSigned(true);
  }
  const databases = new Databases(client);
  const userId = req.headers["x-appwrite-user-id"];
  if (!userId) {
    return fail(401, "UNAUTHORIZED", "Missing x-appwrite-user-id header");
  }
  const db = process.env.VITE_APPWRITE_DATABASE_ID;
  const sessionsCol =
    process.env.VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID ||
    "training_session";
  const ordersCol =
    process.env.VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID ||
    "training_trade_log";
  if (!db || !sessionsCol || !ordersCol) {
    return fail(500, "CONFIG_MISSING", "Missing database or collection id");
  }
  const sessionId = body.sessionId;
  if (!sessionId) return fail(400, "BAD_REQUEST", "Missing sessionId");
  const actionRaw = body.action || body.orderSide;
  if (!actionRaw) return fail(400, "BAD_REQUEST", "Missing action");
  const actionUpper = String(actionRaw).toUpperCase();
  const isClose = actionUpper === "CLOSE";
  const actionDir =
    actionUpper === "LONG"
      ? "LONG"
      : actionUpper === "SHORT"
        ? "SHORT"
        : actionUpper === "BUY"
          ? "LONG"
          : actionUpper === "SELL"
            ? "SHORT"
            : "UNKNOWN";
  if (actionDir === "UNKNOWN" && !isClose)
    return fail(400, "BAD_REQUEST", "Invalid action");
  const orderType = (body.orderType || body.type || "MARKET").toUpperCase();
  const volume = Number(body.amount ?? body.volume ?? 0);
  const price = Number(body.priceHint ?? body.price ?? 0);
  const feeRate = Number(body.feeRate ?? 0);
  const executedAt = body.klineTimestamp
    ? new Date(body.klineTimestamp).toISOString()
    : body.timestamp
      ? new Date(body.timestamp).toISOString()
      : new Date().toISOString();
  const session = await databases.getDocument(db, sessionsCol, sessionId);
  if (!session || session.user_id !== userId) {
    return fail(404, "NOT_FOUND", "Session not found");
  }
  const stockKlineCol =
    process.env.VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID || "stock_kline";
  let cash = Number(session.cash || 0);
  
  // Parse positions array from session
  let positions = [];
  try {
    if (session.positions) {
      positions = JSON.parse(session.positions);
    } else {
      // Legacy fallback
      const oldPos = Number(session.position || 0);
      if (oldPos !== 0) {
        positions.push({
          id: ID.unique(),
          side: oldPos > 0 ? "LONG" : "SHORT",
          amount: Math.abs(oldPos),
          entryPrice: Number(session.avg_entry_price || 0)
        });
      }
    }
  } catch (e) {
    logger.error("Failed to parse positions", e);
  }

  const closeSide = body.closeSide; // Optional parameter for CLOSE action

  const sideForCalc = isClose ? "CLOSE" : actionDir === "LONG" ? "BUY" : "SELL";
  if (!isClose && (!volume || !price))
    return fail(400, "BAD_REQUEST", "Missing volume or price");
  if (stockKlineCol) {
    try {
      const d = new Date(executedAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      let prevClose = 0;
      try {
        const todays = await databases.listDocuments(db, stockKlineCol, [
          Query.equal("symbol", session.symbol || session.ts_code),
          Query.equal("trade_date", dateStr),
          Query.limit(1),
        ]);
        const tdoc = todays.documents?.[0];
        if (tdoc?.pre_close) prevClose = Number(tdoc.pre_close);
      } catch {}
      if (!prevClose) {
        const prev = await databases.listDocuments(db, stockKlineCol, [
          Query.equal("symbol", session.symbol || session.ts_code),
          Query.lessThan("trade_date", dateStr),
          Query.orderDesc("trade_date"),
          Query.limit(1),
        ]);
        const pdoc = prev.documents?.[0];
        prevClose = Number(pdoc?.close || pdoc?.pre_close || 0);
      }
      if (prevClose > 0) {
        const up = Number((prevClose * 1.1).toFixed(4));
        const down = Number((prevClose * 0.9).toFixed(4));
        if (price > up || price < down) {
          return fail(
            400,
            "PRICE_LIMIT",
            `Price out of limit [${down}, ${up}]`,
          );
        }
      }
    } catch {}
  }

const fee =
    body.fee !== undefined
      ? Number(body.fee)
      : Number((price * volume * feeRate).toFixed(2));
  let notional = Number((price * volume).toFixed(2));
  let realizedPnl = 0;

  if (body.override) {
    cash = Number(body.cash ?? cash);
    if (body.positions) {
      positions = body.positions;
    }
    notional = Number(body.notional ?? notional);
    realizedPnl = Number(body.realizedPnl ?? 0);
  } else {
    if (isClose) {
      if (!closeSide) return fail(400, "BAD_REQUEST", "Missing closeSide for CLOSE action");
      
      const posIndex = positions.findIndex(p => p.side === closeSide);
      if (posIndex === -1) return fail(400, "NO_POSITION", `No ${closeSide} position to close`);
      
      const pos = positions[posIndex];
      const closeVol = Math.min(pos.amount, volume);
      const closeFee = Number((closeVol * price * feeRate).toFixed(2));
      
      const pnl = closeSide === "LONG" 
        ? (price - pos.entryPrice) * closeVol 
        : (pos.entryPrice - price) * closeVol;
        
      realizedPnl = Number(pnl.toFixed(2));
      const marginReleased = closeVol * pos.entryPrice;
      
      cash = Number((cash + marginReleased + pnl - closeFee).toFixed(2));
      notional = Number((closeVol * price).toFixed(2));
      body.fee = closeFee;
      
      pos.amount -= closeVol;
      if (pos.amount <= 0) {
        positions.splice(posIndex, 1);
      }
    } else if (actionDir === "LONG") {
      const costForOpen = volume * price;
      const openFee = volume * price * feeRate;
      const totalCashNeeded = costForOpen + openFee;

      if (cash < totalCashNeeded) {
        return fail(400, "INSUFFICIENT_FUNDS", "Insufficient cash");
      }

      cash = Number((cash - totalCashNeeded).toFixed(2));
      
      const existingPos = positions.find(p => p.side === "LONG");
      if (existingPos) {
        existingPos.entryPrice = Number(((existingPos.amount * existingPos.entryPrice + volume * price) / (existingPos.amount + volume)).toFixed(4));
        existingPos.amount += volume;
      } else {
        positions.push({
          id: ID.unique(),
          side: "LONG",
          amount: volume,
          entryPrice: price
        });
      }
    } else if (actionDir === "SHORT") {
      const costForOpen = volume * price;
      const openFee = volume * price * feeRate;
      const totalCashNeeded = costForOpen + openFee;

      if (cash < totalCashNeeded) {
        return fail(400, "INSUFFICIENT_FUNDS", "Insufficient cash");
      }

      cash = Number((cash - totalCashNeeded).toFixed(2));
      
      const existingPos = positions.find(p => p.side === "SHORT");
      if (existingPos) {
        existingPos.entryPrice = Number(((existingPos.amount * existingPos.entryPrice + volume * price) / (existingPos.amount + volume)).toFixed(4));
        existingPos.amount += volume;
      } else {
        positions.push({
          id: ID.unique(),
          side: "SHORT",
          amount: volume,
          entryPrice: price
        });
      }
    }
  }

  const finalFee = body.fee !== undefined ? Number(body.fee) : fee;

  let totalMarketValue = 0;
  for (const p of positions) {
    const pnl = p.side === "LONG" 
      ? (price - p.entryPrice) * p.amount 
      : (p.entryPrice - price) * p.amount;
    const margin = p.amount * p.entryPrice;
    totalMarketValue += margin + pnl;
  }

  const marketValue = body.override
    ? Number(body.marketValue ?? 0)
    : Number(totalMarketValue.toFixed(2));
    
  const totalEquity = body.override
    ? Number(body.totalEquity ?? 0)
    : Number((cash + marketValue).toFixed(2));
    
  const countList = await databases.listDocuments(db, ordersCol, [
    Query.equal("session_id", sessionId),
  ]);
  const seqNo = (countList?.total || countList?.documents?.length || 0) + 1;
  const orderId = body.orderId || ID.unique();
  
  // Create a snapshot of positions for the log
  const afterPosition = [...positions];
  const sideEnum = actionDir === "SHORT" ? "SHORT" : "LONG";
  const extra = {
    net_amount: isClose
      ? notional - fee
      : sideForCalc === "BUY"
        ? -(notional + fee)
        : notional - fee,
    remaining_balance: cash,
    remaining_positions: JSON.stringify(positions),
    realized_pnl: realizedPnl,
    order_type: orderType,
  };
  const orderData = {
    session_id: sessionId,
    user_id: userId,
    seq_no: seqNo,
    action: isClose ? "CLOSE" : actionDir,
    side: sideEnum,
    price,
    amount: volume,
    fee,
    trade_time: executedAt,
    kline_timestamp: body.klineTimestamp ?? null,
    position_after: JSON.stringify(afterPosition),
    extra: JSON.stringify(extra),
  };

  try {
    await databases.createDocument(db, ordersCol, orderId, orderData);
  } catch (err) {
    if (err.code === 409) {
      // Document already exists, meaning this is a duplicate retry.
      // We can just proceed and return success because it's already recorded.
    } else {
      throw err;
    }
  }
  
  // Calculate legacy position for backward compatibility
  let legacyPosition = 0;
  let legacyAvgPrice = 0;
  if (positions.length > 0) {
    const longPos = positions.find(p => p.side === "LONG");
    const shortPos = positions.find(p => p.side === "SHORT");
    
    if (longPos) {
      legacyPosition += longPos.amount;
      legacyAvgPrice = longPos.entryPrice;
    }
    if (shortPos) {
      legacyPosition -= shortPos.amount;
      legacyAvgPrice = shortPos.entryPrice;
    }
  }
  
  const updated = await databases.updateDocument(db, sessionsCol, sessionId, {
    cash,
    positions: JSON.stringify(positions),
    position: legacyPosition,
    market_value: marketValue,
    total_equity: totalEquity,
    updated_at: new Date().toISOString(),
  });

  const oldCash = Number(session.cash || 0);
  const cashChange = Number((cash - oldCash).toFixed(2));
  
  let newTrainingBalance = cash;
  if (cashChange !== 0) {
    try {
      const userProfileList = await databases.listDocuments(db, "user_profile", [
        Query.equal("user_id", userId)
      ]);
      
      if (userProfileList.documents.length > 0) {
        const userProfile = userProfileList.documents[0];
        const currentProfileBalance = Number(userProfile.training_balance || 0);
        newTrainingBalance = Number((currentProfileBalance + cashChange).toFixed(2));

        await databases.updateDocument(db, "user_profile", userProfile.$id, {
          training_balance: newTrainingBalance
        });
      }

      const ledgerData = {
        user_id: userId,
        session_id: sessionId,
        amount: cashChange,
        balance_after: newTrainingBalance,
        change_type: "trade",
        source_id: orderId,
        order_id: orderId,
        created_at: new Date().toISOString(),
      };
      
      await databases.createDocument(
        db,
        "training_balance_ledger",
        ID.unique(),
        ledgerData
      );
    } catch (err) {
      logger.error("Failed to update user_profile or ledger", err);
    }
  } else {
    try {
      const userProfileList = await databases.listDocuments(db, "user_profile", [
        Query.equal("user_id", userId)
      ]);
      if (userProfileList.documents.length > 0) {
        newTrainingBalance = Number(userProfileList.documents[0].training_balance || 0);
      }
    } catch (e) {}
  }

  const beforePosition = [];
  try {
    if (session.positions) {
      beforePosition.push(...JSON.parse(session.positions));
    } else if (session.position) {
      beforePosition.push({
        side: session.position > 0 ? "LONG" : "SHORT",
        amount: Math.abs(Number(session.position)),
        entryPrice: Number(session.avg_entry_price || session.start_price || 0)
      });
    }
  } catch (e) {}

  return ok({
    seqNo,
    tradeTime: executedAt,
    notional: notional,
    fee,
    beforePosition,
    afterPosition,
    realizedPnl,
    cash,
    trainingBalance: newTrainingBalance,
    marketValue,
    totalEquity,
    status: "FILLED",
  });
});
