import { appwriteConfig, appwriteMobile, Query } from "../../lib/appwrite";
import { fail, getUserId, ok, requireDataConfig } from "./client";

export async function getLatestActiveSession() {
  const config = requireDataConfig();
  if (!config.ok) return config;

  try {
    const userId = await getUserId();
    if (!userId) return fail("未登录", "UNAUTHORIZED");
    const statuses = [
      "active",
      "running",
      "initialized",
      "pending",
      "in_progress",
      "not_started",
    ];
    const response = await appwriteMobile.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      [
        Query.equal("user_id", userId),
        Query.equal("status", statuses),
        Query.orderDesc("updated_at"),
        Query.limit(1),
      ],
    );
    return ok(response.total > 0 ? response.documents[0] : null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "获取训练会话失败");
  }
}
