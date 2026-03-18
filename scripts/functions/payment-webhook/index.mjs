import { Client, Databases, Query, ID } from "node-appwrite";
import { fail, parseBody, withHandler } from "../_shared/response.mjs";
import crypto from "crypto";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);

const db = process.env.APPWRITE_DATABASE_ID;
const profileCol = process.env.APPWRITE_USER_PROFILE_COLLECTION_ID;
const ledgerCol = process.env.APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID;

export default withHandler(async ({ req }, logger) => {
  const signature = req?.headers?.["x-webhook-signature"];
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    return fail(401, "UNAUTHORIZED", "Webhook secret not configured");
  }

  if (signature) {
    const payload = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      logger.warn("Invalid webhook signature", { signature, expectedSignature });
      return fail(401, "UNAUTHORIZED", "无效的签名");
    }
  }

  const body = parseBody(req);
  const eventId = String(body.eventId || "");
  const eventType = String(body.eventType || "");

  logger.info("Webhook received", { eventId, eventType });

  if (!eventId) {
    logger.warn("Missing eventId in webhook payload");
    return fail(400, "BAD_REQUEST", "缺少eventId");
  }

  if (eventType !== "payment.success") {
    logger.info("Ignoring non-payment success event", { eventType });
    return { received: true, ignored: true };
  }

  const data = body.data || {};
  const userId = String(data.userId || "");
  const amount = Number(data.amount);
  const transactionId = String(data.transactionId || eventId);

  if (!userId || !Number.isFinite(amount) || amount <= 0) {
    logger.error("Invalid payment data", null, { userId, amount, transactionId });
    return fail(400, "BAD_REQUEST", "支付数据无效");
  }

  // Idempotency check: look for an existing ledger entry with this transactionId
  const dup = await databases.listDocuments(db, ledgerCol, [
    Query.equal("user_id", [userId]),
    Query.equal("order_id", [transactionId]),
    Query.limit(1)
  ]);

  if (dup.total) {
    const row = dup.documents[0];
    logger.info("Idempotent webhook: Payment already processed", { ledgerId: row.$id, transactionId });
    return { received: true, status: "ALREADY_PROCESSED" };
  }

  const rows = await databases.listDocuments(db, profileCol, [
    Query.equal("user_id", [userId]),
    Query.limit(1)
  ]);

  if (!rows.total) {
    logger.warn("User profile not found for payment", { userId });
    return fail(404, "NOT_FOUND", "用户资料不存在");
  }

  const profile = rows.documents[0];
  const prev = Number(profile.training_balance || 0);
  const next = Number((prev + amount).toFixed(2));

  logger.info("Processing webhook payment: Updating balance", { userId, prev, next, amount });
  await databases.updateDocument(db, profileCol, profile.$id, { training_balance: next });

  const ledger = await databases.createDocument(db, ledgerCol, ID.unique(), {
    user_id: userId,
    session_id: null,
    order_id: transactionId,
    change_type: "recharge",
    amount,
    balance_after: next,
    currency: data.currency || "USD",
    note: `Webhook payment ${eventId}`,
    created_at: new Date().toISOString()
  });

  logger.info("Webhook payment processed successfully", { userId, ledgerId: ledger.$id, balanceAfter: next });
  return { received: true, status: "COMPLETED", rechargeId: ledger.$id };
});
