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
  const action = body.action || body.orderSide;
  if (!action) return fail(400, "BAD_REQUEST", "Missing action");
  const orderType = (body.orderType || body.type || "MARKET").toUpperCase();
  const volume = Number(body.amount ?? body.volume ?? 0);
  const price = Number(body.priceHint ?? body.price ?? 0);
  const feeRate = Number(body.feeRate ?? 0.001);
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
  let position = Number(session.position || 0);
  const isClose = String(action).toUpperCase() === "CLOSE";
  const side =
    String(action).toUpperCase() === "SELL"
      ? "SELL"
      : String(action).toUpperCase() === "BUY"
        ? "BUY"
        : "CLOSE";
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
  const dupCheck = await databases.listDocuments(db, ordersCol, [
    Query.equal("session_id", sessionId),
    Query.equal("action", isClose ? "CLOSE" : side),
    Query.equal("price", price),
    Query.equal("amount", isClose ? Number(session.position || 0) : volume),
    Query.equal("trade_time", executedAt),
    Query.limit(1),
  ]);
  if (dupCheck.total > 0) {
    return fail(400, "DUPLICATE_ORDER", "Duplicate order");
  }
  const fee = Number((price * volume * feeRate).toFixed(2));
  let notional = Number((price * volume).toFixed(2));
  let realizedPnl = 0;
  if (side === "BUY") {
    const cost = notional + fee;
    if (cash < cost)
      return fail(400, "INSUFFICIENT_FUNDS", "Insufficient cash");
    position += volume;
    cash = Number((cash - cost).toFixed(2));
  } else if (side === "SELL") {
    if (position < volume)
      return fail(400, "INSUFFICIENT_POSITION", "Insufficient position");
    position -= volume;
    cash = Number((cash + notional - fee).toFixed(2));
  } else if (isClose) {
    if (position === 0) return fail(400, "NO_POSITION", "No position to close");
    const closeVolume = position;
    notional = Number((price * closeVolume).toFixed(2));
    realizedPnl = 0;
    const avgEntryPrice = Number(session.avg_entry_price || 0);
    if (avgEntryPrice > 0) {
      realizedPnl =
        side === "CLOSE"
          ? Number(((price - avgEntryPrice) * closeVolume).toFixed(2))
          : 0;
    }
    cash = Number((cash + notional - fee).toFixed(2));
    position = 0;
  }
  const marketValue = Number((position * price).toFixed(2));
  const totalEquity = Number((cash + marketValue).toFixed(2));
  const countList = await databases.listDocuments(db, ordersCol, [
    Query.equal("session_id", sessionId),
  ]);
  const seqNo = (countList?.total || countList?.documents?.length || 0) + 1;
  const orderId = ID.unique();
  const afterPosition = {
    side: position > 0 ? "LONG" : position < 0 ? "SHORT" : "FLAT",
    amount: position,
    entryPrice: Number(session.avg_entry_price || session.start_price || 0),
  };
  const sideEnum = afterPosition.side === "SHORT" ? "SHORT" : "LONG";
  const extra = {
    net_amount: isClose
      ? notional - fee
      : side === "BUY"
        ? -(notional + fee)
        : notional - fee,
    remaining_balance: cash,
    remaining_position: position,
    realized_pnl: realizedPnl,
    order_type: orderType,
  };
  const orderData = {
    session_id: sessionId,
    user_id: userId,
    seq_no: seqNo,
    action: isClose ? "CLOSE" : side,
    side: sideEnum,
    price,
    amount: isClose ? Number(session.position || 0) : volume,
    fee,
    trade_time: executedAt,
    kline_timestamp: body.klineTimestamp ?? null,
    position_after: JSON.stringify(afterPosition),
    extra: JSON.stringify(extra),
  };
  await databases.createDocument(db, ordersCol, orderId, orderData);
  const updated = await databases.updateDocument(db, sessionsCol, sessionId, {
    cash,
    position,
    market_value: marketValue,
    total_equity: totalEquity,
    updated_at: new Date().toISOString(),
  });
  const beforePosition = {
    side:
      session.position > 0 ? "LONG" : session.position < 0 ? "SHORT" : "FLAT",
    amount: Number(session.position || 0),
    entryPrice: Number(session.avg_entry_price || session.start_price || 0),
  };
  return ok({
    seqNo,
    tradeTime: executedAt,
    notional: notional,
    fee,
    beforePosition,
    afterPosition,
    realizedPnl,
    status: "FILLED",
  });
});
