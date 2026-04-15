import { appwriteConfig, appwriteMobile, Query } from "../../lib/appwrite";
import {
  executeFunction,
  fail,
  getUserId,
  ok,
  requireDataConfig,
  type ApiResult,
} from "./client";
import type { WalletRechargePayload } from "./types";

export function rechargeWallet(payload: WalletRechargePayload) {
  return executeFunction<WalletRechargePayload, Record<string, unknown>>(
    appwriteConfig.walletRechargeFunctionId || "fn-wallet-recharge",
    payload,
  );
}

export async function getWalletBalance(): Promise<
  ApiResult<{ balance: number; currency: string }>
> {
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

    const row = response.documents[0] as Record<string, unknown> | undefined;
    return ok({
      balance: Number(row?.training_balance || 0),
      currency: String(row?.currency || "USD"),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "获取钱包余额失败");
  }
}

export async function getWalletLedger(limit = 20) {
  const config = requireDataConfig();
  if (!config.ok) return config;

  try {
    const userId = await getUserId();
    if (!userId) return fail("未登录", "UNAUTHORIZED");

    const response = await appwriteMobile.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingBalanceLedgerCollectionId!,
      [Query.equal("user_id", userId), Query.orderDesc("$createdAt"), Query.limit(limit)],
    );
    return ok(response.documents);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "获取钱包流水失败");
  }
}
