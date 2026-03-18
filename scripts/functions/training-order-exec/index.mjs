import { Client, Databases, Query, ID } from "node-appwrite";
import { ok, fail, requestId, parseBody, withHandler } from "../_shared/response.mjs";

const client = new Client().setEndpoint(process.env.APPWRITE_ENDPOINT).setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID).setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);
const db = process.env.APPWRITE_DATABASE_ID;
const sessionCol = process.env.APPWRITE_TRAINING_SESSION_COLLECTION_ID;
const tradeCol = process.env.APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID;

export default withHandler(async ({ req }, logger) => {
  const rid = requestId(req);
  const body = parseBody(req);
  const sessionId = String(body.sessionId || "");
  const action = String(body.action || "");
  const reqAmount = Number(body.amount || 0);
  const reqPrice = Number(body.priceHint || 0);
  const klineTimestamp = Number(body.klineTimestamp || 0);
  const orderType = String(body.orderType || "MARKET");
  const userId = String(req?.headers?.["x-user-id"] || "");
  
  logger.info("Order execution request received", { userId, sessionId, action, reqAmount, reqPrice });

  if (!userId) {
    logger.warn("Unauthorized: Missing user ID");
    return fail(401, "UNAUTHORIZED", "未登录", rid);
  }
  if (!sessionId || !["BUY", "SELL", "CLOSE"].includes(action)) {
    logger.warn("Invalid order parameters", { sessionId, action });
    return fail(400, "TRAINING_ORDER_INVALID", "订单参数错误", rid);
  }
  if (action !== "CLOSE" && (!Number.isFinite(reqAmount) || reqAmount <= 0 || reqPrice <= 0)) {
    logger.warn("Invalid order amount or price", { action, reqAmount, reqPrice });
    return fail(400, "TRAINING_ORDER_INVALID", "订单参数错误", rid);
  }
  
  const session = await databases.getDocument(db, sessionCol, sessionId);
  if (!session || session.user_id !== userId) {
    logger.warn("Training session not found or user mismatch", { sessionId, userId });
    return fail(404, "TRAINING_SESSION_NOT_FOUND", "会话不存在", rid);
  }
  if (session.status !== "running") {
    logger.warn("Training session is not active", { sessionId, status: session.status });
    return fail(409, "TRAINING_SESSION_CLOSED", "训练会话已结束", rid);
  }
  
  const latest = await databases.listDocuments(db, tradeCol, [Query.equal("session_id", [sessionId]), Query.orderDesc("seq_no"), Query.limit(1)]);
  const seqNo = (latest.documents[0]?.seq_no || 0) + 1;
  let prevPosition = { side: "FLAT", amount: 0, entryPrice: 0, plAmount: 0 };
  
  if (latest.documents[0]?.position_after) {
    try {
      prevPosition = { ...prevPosition, ...JSON.parse(String(latest.documents[0].position_after)) };
    } catch {}
  }
  
  const side = action === "BUY" ? "LONG" : action === "SELL" ? "SHORT" : "FLAT";
  const amount = action === "CLOSE" ? Math.max(Number(prevPosition.amount || 0), 0) : Number(reqAmount);
  const price = action === "CLOSE" ? Number(body.closePriceHint || reqPrice || 0) : Number(reqPrice);
  const notional = Number((amount * price).toFixed(2));
  const feeRate = Number(process.env.TRAINING_FEE_RATE || 0);
  const fee = Number((notional * feeRate).toFixed(2));
  
  // Calculate PnL for CLOSE action
  let realizedPnl = 0;
  if (action === "CLOSE" && prevPosition.side !== "FLAT") {
    const direction = prevPosition.side === "LONG" ? 1 : -1;
    realizedPnl = direction * (price - prevPosition.entryPrice) * amount - fee;
    realizedPnl = Number(realizedPnl.toFixed(2));
  }
  
  const afterPosition = action === "CLOSE" 
    ? { side: "FLAT", amount: 0, entryPrice: Number(prevPosition.entryPrice || 0), plAmount: 0 } 
    : { side, amount, entryPrice: price, plAmount: 0 };
    
  const tradeTime = new Date().toISOString();
  
  const extra = {
    engine: "function-v2",
    orderType,
    notional,
    feeRate,
    beforePosition: prevPosition,
    afterPosition,
    tradeTime,
    status: "FILLED",
    klineTimestamp: Number.isFinite(klineTimestamp) ? klineTimestamp : null,
    realizedPnl
  };

  const doc = await databases.createDocument(db, tradeCol, ID.unique(), {
    session_id: sessionId,
    user_id: userId,
    seq_no: seqNo,
    action,
    side,
    amount,
    price,
    trade_time: tradeTime,
    kline_timestamp: Number.isFinite(klineTimestamp) ? klineTimestamp : null,
    fee,
    position_after: JSON.stringify(afterPosition),
    extra: JSON.stringify(extra)
  });
  
  logger.info("Order executed successfully", { tradeId: doc.$id, seqNo, realizedPnl });

  return ok({ 
    tradeId: doc.$id, 
    seqNo, 
    sessionId, 
    action, 
    side, 
    amount, 
    price, 
    notional, 
    fee, 
    beforePosition: prevPosition, 
    afterPosition,
    realizedPnl
  }, rid);
});
