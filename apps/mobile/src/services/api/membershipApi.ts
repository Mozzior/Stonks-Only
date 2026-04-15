import { appwriteConfig, appwriteMobile, Query } from "../../lib/appwrite";
import {
  executeFunction,
  fail,
  getUserId,
  ok,
  requireDataConfig,
  type ApiResult,
} from "./client";
import type { MembershipStatus, MembershipUpgradePayload } from "./types";

export function upgradeMembership(payload: MembershipUpgradePayload) {
  return executeFunction<MembershipUpgradePayload, Record<string, unknown>>(
    appwriteConfig.membershipUpgradeFunctionId || "fn-membership-upgrade",
    payload,
  );
}

export async function getMembershipStatus(): Promise<ApiResult<MembershipStatus>> {
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

    const p = (response.documents[0] || {}) as Record<string, unknown>;
    return ok({
      tier: String(p.membership_tier || "free"),
      status: String(p.membership_status || "inactive"),
      expiresAt: p.membership_expires_at ? String(p.membership_expires_at) : null,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "获取会员状态失败");
  }
}
