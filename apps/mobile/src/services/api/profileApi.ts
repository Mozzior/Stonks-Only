import { appwriteConfig, appwriteMobile, ID, Query } from "../../lib/appwrite";
import { fail, getUserId, ok, requireDataConfig, type ApiResult } from "./client";

export async function getProfileMe() {
  const config = requireDataConfig();
  if (!config.ok) return config;

  try {
    const userId = await getUserId();
    if (!userId) return fail("未登录", "UNAUTHORIZED");

    const response = await appwriteMobile.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.userProfileCollectionId!,
      [Query.equal("user_id", userId), Query.limit(1)],
    );
    return ok((response.documents[0] || null) as Record<string, unknown> | null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "获取资料失败");
  }
}

export async function patchProfileMe(payload: Record<string, unknown>): Promise<ApiResult<Record<string, unknown>>> {
  const config = requireDataConfig();
  if (!config.ok) return config;

  try {
    const userId = await getUserId();
    if (!userId) return fail("未登录", "UNAUTHORIZED");

    const listRes = await appwriteMobile.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.userProfileCollectionId!,
      [Query.equal("user_id", userId), Query.limit(1)],
    );

    if (listRes.total > 0) {
      const updated = await appwriteMobile.databases.updateDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.userProfileCollectionId!,
        listRes.documents[0].$id,
        {
          ...payload,
          updated_at: new Date().toISOString(),
        },
      );
      return ok(updated as Record<string, unknown>);
    }

    const created = await appwriteMobile.databases.createDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.userProfileCollectionId!,
      ID.unique(),
      {
        user_id: userId,
        training_balance: 10000,
        currency: "USD",
        membership_tier: "free",
        membership_status: "inactive",
        ...payload,
        updated_at: new Date().toISOString(),
      },
    );
    return ok(created as Record<string, unknown>);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "更新资料失败");
  }
}
