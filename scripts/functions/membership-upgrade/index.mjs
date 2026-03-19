import { withHandler, ok, fail, parseBody } from "../_shared/response.mjs";
import { Client, Databases, Query, ID } from "node-appwrite";

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

  const body = parseBody(req);
  const { planId, paymentMethod, clientTxnId } = body;

  if (!planId) {
    return fail(400, "BAD_REQUEST", "Missing planId");
  }

  const validTiers = ["free", "pro", "vip"];
  if (!validTiers.includes(planId)) {
    return fail(400, "BAD_REQUEST", "Invalid planId");
  }

  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
  if (!databaseId) {
    return fail(500, "INTERNAL_ERROR", "Missing database configuration");
  }

  try {
    const userProfileList = await databases.listDocuments(
      databaseId,
      "user_profile",
      [Query.equal("user_id", userId)],
    );

    if (userProfileList.documents.length === 0) {
      return fail(404, "NOT_FOUND", "User profile not found");
    }

    const userProfile = userProfileList.documents[0];

    // calculate expires_at (e.g. 30 days from now for pro/vip, null for free)
    let expiresAt = null;
    let status = "inactive";
    if (planId !== "free") {
      const date = new Date();
      date.setDate(date.getDate() + 30); // 30 days
      expiresAt = date.toISOString();
      status = "active";
    }

    await databases.updateDocument(
      databaseId,
      "user_profile",
      userProfile.$id,
      {
        membership_tier: planId,
        membership_status: status,
        membership_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
    );

    // create membership_orders record
    const orderId = clientTxnId || ID.unique();
    try {
      await databases.createDocument(
        databaseId,
        "membership_orders",
        ID.unique(),
        {
          order_id: orderId,
          user_id: userId,
          plan_id: planId,
          amount: planId === "vip" ? 99 : planId === "pro" ? 29 : 0,
          status: "completed",
          provider: paymentMethod || "system",
          provider_txn_id: orderId,
          expires_at: expiresAt,
        },
      );
    } catch (orderError) {
      logger.warn(
        "Failed to create membership order, but membership was updated",
        { error: orderError.message },
      );
    }

    return ok({ upgraded: true, planId, expiresAt, status });
  } catch (error) {
    logger.error("Failed to upgrade membership", error);
    return fail(500, "INTERNAL_ERROR", "Failed to upgrade membership");
  }
});
