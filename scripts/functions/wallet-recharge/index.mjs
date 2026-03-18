import { withHandler, ok, fail, parseBody } from "../_shared/response.mjs";
import { Client, Databases, Query, ID } from "node-appwrite";

export default withHandler(async (context, logger) => {
  const { req } = context;

  // 1. 初始化 Appwrite Client 与 Databases
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  if (process.env.APPWRITE_SELF_SIGNED === "true") {
    client.setSelfSigned(true);
  }

  const databases = new Databases(client);

  // 2. 从 req.headers 获取 userId
  const userId = req.headers["x-appwrite-user-id"];
  if (!userId) {
    return fail(401, "UNAUTHORIZED", "Missing x-appwrite-user-id header");
  }

  // 3. 从 req.body 获取 amount 与 clientTxnId
  const body = parseBody(req);
  const { amount, clientTxnId } = body;

  // 4. 合法性校验：确保 amount 为正数
  if (typeof amount !== "number" || amount <= 0) {
    return fail(400, "BAD_REQUEST", "Amount must be a positive number");
  }

  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
  if (!databaseId) {
    return fail(500, "INTERNAL_ERROR", "Missing database configuration");
  }

  try {
    // 5. 查询 user_profile 集合中对应 userId 的记录
    const userProfileList = await databases.listDocuments(
      databaseId,
      "user_profile",
      [Query.equal("user_id", userId)],
    );

    if (userProfileList.documents.length === 0) {
      return fail(404, "NOT_FOUND", "User profile not found");
    }

    const userProfile = userProfileList.documents[0];

    // 获取当前 training_balance（默认 0）
    const currentBalance =
      typeof userProfile.training_balance === "number"
        ? userProfile.training_balance
        : 0;

    // 计算新余额
    // 充值汇率 1:1000
    const exchangeRate = 1000;
    const virtualAmount = amount * exchangeRate;
    const newBalance = currentBalance + virtualAmount;

    // 6. 更新 user_profile 的 training_balance
    await databases.updateDocument(
      databaseId,
      "user_profile",
      userProfile.$id,
      {
        training_balance: newBalance,
      },
    );

    // 7. 在 training_balance_ledger 集合中插入一条流水记录
    const ledgerData = {
      user_id: userId,
      amount: virtualAmount,
      balance_after: newBalance,
      change_type: "recharge",
      created_at: new Date().toISOString(),
    };

    if (clientTxnId) {
      ledgerData.source_id = clientTxnId;
      ledgerData.order_id = clientTxnId;
    } else {
      const uniqueId = ID.unique();
      ledgerData.source_id = uniqueId;
      ledgerData.order_id = uniqueId;
    }

    await databases.createDocument(
      databaseId,
      "training_balance_ledger",
      ID.unique(),
      ledgerData,
    );

    // 8. 返回成功响应
    return ok({ recharged: true, newBalance });
  } catch (error) {
    logger.error("Failed to process recharge", error);
    logger.error("Detailed error stack:", error.stack);
    logger.error("Detailed error string:", String(error));
    // 捕获异常时返回规范错误，如果由于 order_id 唯一索引冲突（重复提交），则可以通过 error.code 判断
    if (error.code === 409) {
      return fail(409, "CONFLICT", "Transaction already processed");
    }
    return fail(500, "INTERNAL_ERROR", "Failed to process recharge");
  }
});
