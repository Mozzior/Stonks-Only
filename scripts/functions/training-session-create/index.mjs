import { withHandler, ok, fail, parseBody } from "../_shared/response.mjs";
import { Client, Databases, ID, Query } from "node-appwrite";

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
  const status =
    reqStatus === "completed"
      ? "completed"
      : reqStatus === "aborted"
        ? "aborted"
        : "running";
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
  
  // 获取用户当前的 training_balance
  let userBalance = 10000;
  try {
    const userProfileList = await databases.listDocuments(databaseId, "user_profile", [
      Query.equal("user_id", userId)
    ]);
    if (userProfileList.documents.length > 0) {
      const profile = userProfileList.documents[0];
      if (typeof profile.training_balance === "number") {
        userBalance = profile.training_balance;
      }
    }
  } catch (err) {
    logger.error("Failed to fetch user_profile for balance", err);
  }

  const initialBalance = Number(body?.initialBalance ?? userBalance);
  const startPrice = Number(body?.startPrice ?? 0);
  const docId = ID.unique();

  // Check unfinished sessions before creating
  try {
    const activeStatuses = [
      "active",
      "running",
      "initialized",
      "pending",
      "in_progress",
      "not_started",
    ];
    const existing = await databases.listDocuments(databaseId, sessionsCol, [
      Query.equal("user_id", userId),
      Query.equal("status", activeStatuses),
      Query.limit(1),
    ]);
    if (existing.total > 0) {
      return fail(
        409,
        "SESSION_EXISTS",
        "You have an unfinished training session. Please complete it first.",
      );
    }
  } catch (err) {
    logger.error("Failed to check unfinished sessions", err);
  }

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
