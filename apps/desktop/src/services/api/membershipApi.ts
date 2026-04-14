import { executeFunction, getUserId } from "./client";
import { appwrite, appwriteConfig, Query } from "../../utils/appwrite";
import { fail, ok } from "../../utils/backendError";
import type { ApiEnvelope, MembershipUpgradePayload } from "./types";

const membershipUpgradeFunctionId =
  import.meta.env.VITE_APPWRITE_FN_MEMBERSHIP_UPGRADE_ID || "fn-membership-upgrade";

export function upgradeMembership(payload: MembershipUpgradePayload) {
  return executeFunction<MembershipUpgradePayload, ApiEnvelope<Record<string, unknown>>>(
    membershipUpgradeFunctionId,
    payload,
  );
}

export async function getMembershipStatus() {
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    // Fetch from User Profile
    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.userProfileCollectionId!,
      [Query.equal("user_id", userId), Query.limit(1)]
    );

    if (response.total > 0) {
      const p = response.documents[0];
      return ok({
        tier: p.membership_tier,
        status: p.membership_status,
        expiresAt: p.membership_expires_at
      });
    }
    return ok({ tier: "free", status: "inactive", expiresAt: null });
  } catch (error) {
    return fail(error);
  }
}
