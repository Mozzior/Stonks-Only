import {
  ok,
  fail,
  requestId,
  parseBody,
  withHandler,
} from "../_shared/response.mjs";

const endpoint = (
  process.env.APPWRITE_FUNCTION_ENDPOINT ||
  process.env.APPWRITE_ENDPOINT ||
  process.env.APPWRITE_API_ENDPOINT ||
  "http://appwrite/v1"
).replace(/\/$/, "");
const projectId =
  process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const db = process.env.APPWRITE_DATABASE_ID;
const sessionCol = process.env.APPWRITE_TRAINING_SESSION_COLLECTION_ID;
const tradeCol = process.env.APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID;
const profileCol = process.env.APPWRITE_USER_PROFILE_COLLECTION_ID;
const ledgerCol = process.env.APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID;

export default withHandler(async ({ req }, logger) => {
  const rid = requestId(req);
  const body = parseBody(req);
  const sessionId = String(body.sessionId || "");
  const reason = String(body.reason || "completed");
  const userId = String(req?.headers?.["x-user-id"] || "");
  if (!userId) return fail(401, "UNAUTHORIZED", "未登录", rid);
  if (!sessionId) return fail(400, "BAD_REQUEST", "缺少sessionId", rid);

  const hasProject = Boolean(projectId);
  const hasKey = Boolean(apiKey);
  const hasDb = Boolean(db);
  const hasSessionCol = Boolean(sessionCol);
  const hasTradeCol = Boolean(tradeCol);
  const hasLedgerCol = Boolean(ledgerCol);
  logger.info("cfg_check", {
    endpoint,
    hasProject,
    hasKey,
    hasDb,
    hasSessionCol,
    hasTradeCol,
    hasLedgerCol,
    hasProfileCol: Boolean(profileCol),
  });
  if (
    !hasProject ||
    !hasKey ||
    !hasDb ||
    !hasSessionCol ||
    !hasTradeCol ||
    !hasLedgerCol
  ) {
    return fail(500, "CONFIG_ERROR", "后端配置缺失", rid);
  }

  const headers = {
    "x-appwrite-project": projectId,
    "x-appwrite-key": apiKey,
  };

  const sessUrl = `${endpoint}/databases/${db}/collections/${sessionCol}/documents/${sessionId}`;
  const sessRes = await fetch(sessUrl, { headers });
  if (!sessRes.ok)
    return fail(404, "TRAINING_SESSION_NOT_FOUND", "会话不存在", rid);
  const session = await sessRes.json();
  if (!session || session.user_id !== userId) {
    return fail(404, "TRAINING_SESSION_NOT_FOUND", "会话不存在", rid);
  }
  if (session.status !== "running") {
    return fail(409, "TRAINING_SETTLEMENT_CONFLICT", "会话已结算", rid);
  }

  const qs = (arr) =>
    arr.map((q) => `queries[]=${encodeURIComponent(q)}`).join("&");
  let allTrades = [];
  let lastId = null;
  while (true) {
    const q = [`equal("session_id",["${sessionId}"])`, "limit(100)"];
    if (lastId) q.push(`cursorAfter("${lastId}")`);
    const url = `${endpoint}/databases/${db}/collections/${tradeCol}/documents?${qs(q)}`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const data = await res.json();
    allTrades = allTrades.concat(data.documents || []);
    if (!data.documents || data.documents.length < 100) break;
    lastId = data.documents[data.documents.length - 1].$id;
  }

  const realizedPnl = allTrades.reduce((s, row) => {
    try {
      const ex = JSON.parse(String(row.extra || "{}"));
      return s + Number(ex.realizedPnl || 0);
    } catch {
      return s;
    }
  }, 0);

  let prevBalance = 0;
  let profileId = null;
  if (profileCol) {
    try {
      const q = qs([`equal("user_id",["${userId}"])`, "limit(1)"]);
      const url = `${endpoint}/databases/${db}/collections/${profileCol}/documents?${q}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const ps = await res.json();
        if (ps.total) {
          const p = ps.documents[0];
          profileId = p.$id;
          prevBalance = Number(p.training_balance || 0);
        }
      }
    } catch {}
  }
  const endingBalance = Number((prevBalance + realizedPnl).toFixed(2));

  const patchSessionUrl = `${endpoint}/databases/${db}/collections/${sessionCol}/documents/${sessionId}`;
  const patchSessionRes = await fetch(patchSessionUrl, {
    method: "PATCH",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({
      data: {
        status: reason === "aborted" ? "aborted" : "completed",
        ended_at: new Date().toISOString(),
        ending_balance: endingBalance,
        realized_pnl: realizedPnl,
        return_pct: prevBalance === 0 ? 0 : (realizedPnl / prevBalance) * 100,
        max_drawdown: 0,
      },
    }),
  });
  if (!patchSessionRes.ok) {
    const txt = await patchSessionRes.text().catch(() => "");
    return fail(500, "DB_UPDATE_FAILED", txt || "更新会话失败", rid);
  }

  if (profileId) {
    const patchProfileUrl = `${endpoint}/databases/${db}/collections/${profileCol}/documents/${profileId}`;
    await fetch(patchProfileUrl, {
      method: "PATCH",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        data: {
          training_balance: endingBalance,
          updated_at: new Date().toISOString(),
        },
      }),
    });
  }

  const createLedgerUrl = `${endpoint}/databases/${db}/collections/${ledgerCol}/documents`;
  const createLedgerRes = await fetch(createLedgerUrl, {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({
      documentId: "unique()",
      data: {
        user_id: userId,
        session_id: sessionId,
        order_id: null,
        change_type: "trade_pnl",
        amount: realizedPnl,
        balance_after: endingBalance,
        currency: "USD",
        note: "training session settlement",
        created_at: new Date().toISOString(),
      },
      permissions: [`read("user:${userId}")`],
    }),
  });
  if (!createLedgerRes.ok) {
    const txt = await createLedgerRes.text().catch(() => "");
    return fail(500, "DB_CREATE_FAILED", txt || "创建流水失败", rid);
  }
  const entry = await createLedgerRes.json();

  return ok(
    { sessionId, endingBalance, realizedPnl, ledgerId: entry.$id },
    rid,
  );
});
