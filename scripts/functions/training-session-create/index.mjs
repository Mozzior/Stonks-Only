import { withHandler, ok, fail, parseBody } from "../_shared/response.mjs";
import { Client, Databases, ID } from "node-appwrite";

export default withHandler(async (context, logger) => {
  const { req } = context;
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
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
  const sessionsCol =
    process.env.VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID ||
    "training_session";
  if (!databaseId || !sessionsCol) {
    return fail(500, "CONFIG_MISSING", "Missing database or collection id");
  }
  const body = parseBody(req);
  const now = new Date().toISOString();
  const symbol =
    body?.symbol ||
    `RND-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const period = body?.period || "daily";
  const reqStatus = String(body?.status || "").toLowerCase();
  const status = reqStatus === "completed" ? "completed" : reqStatus === "aborted" ? "aborted" : "running";
  const tsCode = body?.tsCode || symbol;
  const trainStartIdx = Number(body?.trainRange?.startIndex ?? 0);
  const trainEndIdx = Number(body?.trainRange?.endIndex ?? 0);
  const startDate =
    body?.startDate ||
    (body?.trainRange && body?.trainRange.startDate) ||
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString();
  const endDate =
    body?.endDate ||
    (body?.trainRange && body?.trainRange.endDate) ||
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString();
  const initialBalance = Number(body?.initialBalance ?? 100000);
  const startPrice = Number(body?.startPrice ?? 0);
  const docId = ID.unique();
  const data = {
    user_id: userId,
    status,
    ts_code: tsCode,
    symbol: symbol,
    period,
    train_start_idx: trainStartIdx,
    train_end_idx: trainEndIdx,
    train_start_date: startDate,
    train_end_date: endDate,
    // Extra app fields (not required by schema but useful for runtime)
    start_price: startPrice,
    initial_balance: initialBalance,
    current_date: startDate,
    cash: initialBalance,
    position: 0,
    market_value: 0,
    total_equity: initialBalance,
    created_at: now,
    updated_at: now,
  };
  try {
    const created = await databases.createDocument(
      databaseId,
      sessionsCol,
      docId,
      data,
    );
    return ok({
      sessionId: created.$id,
      symbol,
      period,
      startDate,
      endDate,
      initialBalance,
    });
  } catch (error) {
    logger.error("Failed to create session", error);
    return fail(500, "INTERNAL_ERROR", "Failed to create session");
  }
});
