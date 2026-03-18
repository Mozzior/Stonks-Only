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
const profileCol = process.env.APPWRITE_USER_PROFILE_COLLECTION_ID;

export default withHandler(async ({ req }, logger) => {
  const rid = requestId(req);
  const userId = String(req?.headers?.["x-user-id"] || "");
  if (!userId) return fail(401, "UNAUTHORIZED", "未登录", rid);
  const body = parseBody(req);

  const hasProject = Boolean(projectId);
  const hasKey = Boolean(apiKey);
  const hasDb = Boolean(db);
  const hasSessionCol = Boolean(sessionCol);
  const hasProfileCol = Boolean(profileCol);
  logger.info("cfg_check", {
    endpoint,
    hasProject,
    hasKey,
    hasDb,
    hasSessionCol,
    hasProfileCol,
  });
  if (!hasProject || !hasKey || !hasDb || !hasSessionCol) {
    return fail(500, "CONFIG_ERROR", "后端配置缺失", rid);
  }

  const qs = (arr) =>
    arr.map((q) => `queries[]=${encodeURIComponent(q)}`).join("&");
  let initialBalance = 0;
  if (hasProfileCol) {
    try {
      const q = qs([`equal("user_id",["${userId}"])`, "limit(1)"]);
      const url = `${endpoint}/databases/${db}/collections/${profileCol}/documents?${q}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-appwrite-project": projectId,
          "x-appwrite-key": apiKey,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows.total) {
          initialBalance = Number(rows.documents[0]?.training_balance || 0);
        }
      }
    } catch {}
  }

  const tsCode = String(
    body.tsCode || body.ts_code || body.symbol || "",
  ).trim();
  if (!tsCode) return fail(400, "BAD_REQUEST", "缺少tsCode或symbol", rid);
  const period = String(body.period || "daily");
  const trainStartIdx = Number(
    body.startIndex ?? body.trainRange?.startIndex ?? 0,
  );
  const trainEndIdx = Number(body.endIndex ?? body.trainRange?.endIndex ?? 0);
  const startedAt = new Date().toISOString();

  try {
    const createUrl = `${endpoint}/databases/${db}/collections/${sessionCol}/documents`;
    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-appwrite-project": projectId,
        "x-appwrite-key": apiKey,
      },
      body: JSON.stringify({
        documentId: "unique()",
        data: {
          user_id: userId,
          ts_code: tsCode,
          symbol: body.symbol || null,
          period,
          train_start_idx: trainStartIdx,
          train_end_idx: trainEndIdx,
          started_at: startedAt,
          initial_balance: initialBalance,
          status: "running",
        },
        permissions: [
          `read("user:${userId}")`,
          `update("user:${userId}")`,
          `delete("user:${userId}")`,
        ],
      }),
    });
    if (!createRes.ok) {
      const errTxt = await createRes.text().catch(() => "");
      return fail(
        createRes.status || 500,
        "DB_CREATE_FAILED",
        errTxt || "创建训练会话失败",
        rid,
      );
    }
    const doc = await createRes.json();
    return ok({ sessionId: doc.$id }, rid);
  } catch (e) {
    return fail(
      500,
      "DB_CREATE_FAILED",
      String(e?.message || "创建训练会话失败"),
      rid,
    );
  }
});
