import { getUserId } from "./client";
import { appwriteConfig, Query, appwrite } from "../../utils/appwrite";
import { fail, ok } from "../../utils/backendError";

export async function getDashboardSummary(timeRange: "7d" | "30d" | "ytd" | "all") {
  // timeRange is reserved for future filtering logic
  void timeRange;
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    // Client-side calculation for dashboard
    // Fetch recent completed sessions
    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      [
        Query.equal("user_id", userId),
        Query.equal("status", "completed"),
        Query.orderDesc("started_at"),
        Query.limit(100)
      ]
    );
    
    const sessions = response.documents;
    const pnl = sessions.map((x) => Number(x.realized_pnl || 0));
    const wins = pnl.filter((x) => x > 0).length;
    const total = pnl.length;
    const totalPnl = pnl.reduce((a, b) => a + b, 0);

    return ok({
      portfolioValue: 0, // Need to fetch balance separately or pass it
      availableCash: 0,
      buyingPower: 0,
      totalPnl,
      todayPnl: 0, // Complex to calc
      winRate: total ? Number(((wins / total) * 100).toFixed(2)) : 0,
      tradeCount: total,
      profitableCount: wins
    });
  } catch (error) {
    return fail(error);
  }
}

export async function getRecentSessions(limit = 10) {
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      [
        Query.equal("user_id", userId),
        Query.orderDesc("started_at"),
        Query.limit(limit)
      ]
    );
    return ok(response.documents);
  } catch (error) {
    return fail(error);
  }
}

export async function getMarketMovers(limit = 10, market = "us") {
  void market; // Reserved for future multi-market support
  try {
    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.stockInfoCollectionId!,
      [Query.limit(limit)]
    );
    return ok(response.documents);
  } catch (error) {
    return fail(error);
  }
}
