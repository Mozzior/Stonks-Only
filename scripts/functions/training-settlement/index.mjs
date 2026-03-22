import { withHandler, ok, fail, parseBody } from "../_shared/response.mjs";
import { Client, Databases, ID, Query } from "node-appwrite";

function createClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  if (process.env.APPWRITE_SELF_SIGNED === "true") {
    client.setSelfSigned(true);
  }
  return new Databases(client);
}

function safeNumber(n, d = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : d;
}

function computeStats(orders, initialEquity) {
  let tradeCount = orders.length;
  let wins = 0;
  let profit = 0;
  let loss = 0;
  let equity = initialEquity;
  let peak = initialEquity;
  let maxDrawdown = 0;
  for (const o of orders) {
    let pnl = 0;
    try {
      if (o.extra) {
        const ex = typeof o.extra === "string" ? JSON.parse(o.extra) : o.extra;
        pnl = safeNumber(ex?.realized_pnl ?? ex?.net_amount ?? 0);
      } else {
        pnl = safeNumber(o.realized_pnl ?? o.net_amount ?? 0);
      }
    } catch {
      pnl = safeNumber(0);
    }
    if (pnl > 0) wins += 1;
    if (pnl >= 0) profit += pnl;
    else loss += -pnl;
    equity += pnl;
    if (equity > peak) peak = equity;
    const dd = peak > 0 ? (peak - equity) / peak : 0;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }
  const totalReturn = equity - initialEquity;
  const totalReturnPct = initialEquity > 0 ? totalReturn / initialEquity : 0;
  const winRate = tradeCount > 0 ? wins / tradeCount : 0;
  const profitFactor = loss > 0 ? profit / loss : profit > 0 ? Infinity : 0;
  const avgTradeReturn = tradeCount > 0 ? totalReturn / tradeCount : 0;
  const sharpeRatio = 0;
  return {
    totalReturn: Number(totalReturn.toFixed(2)),
    totalReturnPct: Number(totalReturnPct.toFixed(4)),
    maxDrawdown: Number(maxDrawdown.toFixed(4)),
    winRate: Number(winRate.toFixed(4)),
    profitFactor: Number(profitFactor.toFixed(4)),
    tradeCount,
    avgTradeReturn: Number(avgTradeReturn.toFixed(4)),
    sharpeRatio,
  };
}

export default withHandler(async (context, logger) => {
  const { req } = context;
  const body = parseBody(req);
  const userId = req.headers["x-appwrite-user-id"];
  if (!userId) {
    return fail(401, "UNAUTHORIZED", "Missing x-appwrite-user-id header");
  }
  const db = process.env.VITE_APPWRITE_DATABASE_ID;
  const sessionsCol = "training_session";
  const ordersCol = "training_trade_log";
  const statsCol = "training_stats";
  if (!db || !sessionsCol || !ordersCol) {
    return fail(500, "CONFIG_MISSING", "Missing database or collection id");
  }
  const databases = createClient();
  const sessionId = body.sessionId;
  if (!sessionId) return fail(400, "BAD_REQUEST", "Missing sessionId");
  const session = await databases.getDocument(db, sessionsCol, sessionId);
  if (!session || session.user_id !== userId) {
    return fail(404, "NOT_FOUND", "Session not found");
  }
  const reason = body.reason || "daily";
  const markPrice = Number(body.markPrice ?? 0);
  const currentDate = body.currentDate || new Date().toISOString();
  let updates = {};
  if (reason === "completed" || reason === "aborted") {
    updates = { status: reason, updated_at: new Date().toISOString() };
  } else if (reason === "recalc") {
    updates = {};
  } else {
    const marketValue = Number(
      (
        Number(session.position || 0) *
        (markPrice || Number(session.start_price || 0))
      ).toFixed(2),
    );
    const totalEquity = Number(
      (Number(session.cash || 0) + marketValue).toFixed(2),
    );
    updates = {
      current_date: currentDate,
      market_value: marketValue,
      total_equity: totalEquity,
      updated_at: new Date().toISOString(),
    };
  }
  if (Object.keys(updates).length > 0) {
    await databases.updateDocument(db, sessionsCol, sessionId, updates);
  }
  const orders =
    (
      await databases.listDocuments(db, ordersCol, [
        Query.equal("session_id", sessionId),
      ])
    ).documents || [];
  const stats = computeStats(
    orders,
    Number(session.initial_balance || session.total_equity || 10000),
  );
  if (statsCol) {
    try {
      await databases.getDocument(db, statsCol, sessionId);
      await databases.updateDocument(db, statsCol, sessionId, {
        session_id: sessionId,
        ...stats,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      await databases.createDocument(db, statsCol, sessionId, {
        session_id: sessionId,
        ...stats,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  return ok({
    endingBalance: Number(session.cash || 0),
    reason,
    stats,
  });
});
