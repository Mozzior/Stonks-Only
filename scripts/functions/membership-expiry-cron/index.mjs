import { withHandler, ok, fail } from "../_shared/response.mjs";
import { Client, Databases, Query } from "node-appwrite";

export default withHandler(async (context, logger) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  if (process.env.APPWRITE_SELF_SIGNED === "true") {
    client.setSelfSigned(true);
  }

  const databases = new Databases(client);
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;

  if (!databaseId) {
    return fail(500, "INTERNAL_ERROR", "Missing database configuration");
  }

  try {
    const now = new Date().toISOString();

    // Find all users whose membership has expired but status is still 'active'
    // or who have a membership tier > 'free' but their expiry date has passed
    const expiredUsersResponse = await databases.listDocuments(
      databaseId,
      "user_profile",
      [
        Query.lessThanEqual("membership_expires_at", now),
        Query.notEqual("membership_tier", "free"),
      ],
    );

    const expiredUsers = expiredUsersResponse.documents;
    let updatedCount = 0;

    for (const user of expiredUsers) {
      try {
        await databases.updateDocument(databaseId, "user_profile", user.$id, {
          membership_tier: "free",
          membership_status: "expired",
          updated_at: new Date().toISOString(),
        });
        updatedCount++;
        logger.info(`Expired membership for user: ${user.user_id}`);
      } catch (updateError) {
        logger.error(
          `Failed to update expired membership for user: ${user.user_id}`,
          updateError,
        );
      }
    }

    return ok({
      processed: true,
      checkedCount: expiredUsers.length,
      updatedCount,
    });
  } catch (error) {
    logger.error("Failed to run membership expiry cron", error);
    return fail(500, "INTERNAL_ERROR", "Failed to process membership expiry");
  }
});
