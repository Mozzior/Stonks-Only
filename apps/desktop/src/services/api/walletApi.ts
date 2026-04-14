import { executeFunction, getUserId } from "./client";
import { appwrite, appwriteConfig, Query } from "../../utils/appwrite";
import { fail, ok } from "../../utils/backendError";
import type { WalletRechargePayload } from "./types";

const walletRechargeFunctionId =
  import.meta.env.VITE_APPWRITE_FN_WALLET_RECHARGE_ID || "fn-wallet-recharge";

export function rechargeWallet(payload: WalletRechargePayload) {
  return executeFunction<WalletRechargePayload, Record<string, unknown>>(
    walletRechargeFunctionId,
    payload,
  );
}

export async function getWalletBalance() {
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
      return ok({
        balance: response.documents[0].training_balance || 0,
        currency: response.documents[0].currency || "USD"
      });
    }
    return ok({ balance: 0, currency: "USD" });
  } catch (error) {
    return fail(error);
  }
}

export async function getWalletLedger(
  limit = 20,
  cursor?: string,
  category: "all" | "trade" | "other" = "all",
) {
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    const queries = [
      Query.equal("user_id", [userId]),
      Query.limit(limit),
      Query.orderDesc("$createdAt"),
    ];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }
    if (category === "trade") {
      queries.push(Query.equal("change_type", ["trade", "trade_pnl"]));
    } else if (category === "other") {
      queries.push(Query.notEqual("change_type", "trade"));
      queries.push(Query.notEqual("change_type", "trade_pnl"));
    }

    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingBalanceLedgerCollectionId!,
      queries,
    );
    return ok(response);
  } catch (error) {
    return fail(error);
  }
}
