import { Client, Databases, Query, ID } from "node-appwrite";
import { fail, parseBody, withHandler } from "../_shared/response.mjs";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);

const db = process.env.APPWRITE_DATABASE_ID;
const profileCol = process.env.APPWRITE_USER_PROFILE_COLLECTION_ID;
const ledgerCol = process.env.APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID;

export default withHandler(async ({ req }, logger) => {
  const body = parseBody(req);
  const amount = Number(body.amount);
  const clientTxnId = String(body.clientTxnId || "");
  const userId = String(req?.headers?.["x-user-id"] || "");

  logger.info("Recharge request received", { userId, amount, clientTxnId });

  if (!userId) {
    logger.warn("Unauthorized: Missing user ID");
    return fail(401, "UNAUTHORIZED", "未登录");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    logger.warn("Invalid amount", { amount });
    return fail(400, "WALLET_INVALID_AMOUNT", "充值金额无效");
  }
  if (!clientTxnId) {
    logger.warn("Missing clientTxnId");
    return fail(400, "BAD_REQUEST", "缺少clientTxnId");
  }

  // Idempotency check
  const dup = await databases.listDocuments(db, ledgerCol, [
    Query.equal("user_id", [userId]),
    Query.equal("order_id", [clientTxnId]),
    Query.limit(1)
  ]);
  
  if (dup.total) {
    const row = dup.documents[0];
    logger.info("Idempotent request: Recharge already processed", { rechargeId: row.$id, clientTxnId });
    return { rechargeId: row.$id, status: "COMPLETED", balanceAfter: Number(row.balance_after || 0) };
  }

  const rows = await databases.listDocuments(db, profileCol, [
    Query.equal("user_id", [userId]),
    Query.limit(1)
  ]);
  
  if (!rows.total) {
    logger.warn("User profile not found", { userId });
    return fail(404, "NOT_FOUND", "用户资料不存在");
  }

  const profile = rows.documents[0];
  const prev = Number(profile.training_balance || 0);
  const next = Number((prev + amount).toFixed(2));

  logger.info("Updating user balance", { userId, prev, next, amount });
  await databases.updateDocument(db, profileCol, profile.$id, { training_balance: next });

  const ledger = await databases.createDocument(db, ledgerCol, ID.unique(), {
    user_id: userId,
    session_id: null,
    order_id: clientTxnId,
    change_type: "recharge",
    amount,
    balance_after: next,
    currency: "USD",
    note: "wallet recharge",
    created_at: new Date().toISOString()
  });

  logger.info("Recharge successful", { userId, rechargeId: ledger.$id, balanceAfter: next });
  return { rechargeId: ledger.$id, status: "COMPLETED", balanceAfter: next };
});
