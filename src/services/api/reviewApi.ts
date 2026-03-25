import { getUserId } from "./client";
import { appwrite, appwriteConfig, Query } from "../../utils/appwrite";
import { fail, ok } from "../../utils/backendError";

export async function getReviewKpi(timeRange: "7d" | "30d" | "ytd" | "all", symbol?: string) {
  void timeRange; // Reserved for future filtering
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    // Client-side aggregation
    const queries = [
      Query.equal("user_id", userId),
      Query.equal("status", "completed"),
      Query.orderDesc("started_at"),
      Query.limit(500)
    ];
    if (symbol) queries.push(Query.equal("symbol", symbol));

    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      queries
    );

    const sessions = response.documents;
    const pnl = sessions.map((x) => Number(x.realized_pnl || 0));
    const wins = pnl.filter((x) => x > 0).length;
    const losses = pnl.filter((x) => x < 0).length;
    const total = wins + losses;
    const gp = pnl.filter((x) => x > 0).reduce((a, b) => a + b, 0);
    const gl = Math.abs(pnl.filter((x) => x < 0).reduce((a, b) => a + b, 0));

    return ok({
      winRate: total ? Number(((wins / total) * 100).toFixed(2)) : 0,
      profitFactor: gl ? Number((gp / gl).toFixed(2)) : 0,
      avgWin: wins ? Number((gp / wins).toFixed(2)) : 0,
      avgLoss: losses ? Number((gl / losses).toFixed(2)) : 0,
      totalTrades: total
    });
  } catch (error) {
    return fail(error);
  }
}

export async function getReviewEquityCurve(
  timeRange: "7d" | "30d" | "ytd" | "all",
  bucket: "day" | "week" | "month" = "day",
) {
  void timeRange;
  void bucket;
  // Simplified equity curve: just return sessions accumulation
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      [
        Query.equal("user_id", userId),
        Query.equal("status", "completed"),
        Query.orderAsc("started_at"),
        Query.limit(500)
      ]
    );

    let cumPnl = 0;
    const data = response.documents.map(d => {
      cumPnl += Number(d.realized_pnl || 0);
      return {
        date: d.started_at,
        value: cumPnl
      };
    });

    return ok({ data });
  } catch (error) {
    return fail(error);
  }
}

export async function exportReviewCsv(payload: {
  timeRange: "7d" | "30d" | "ytd" | "all";
  symbol?: string;
  side?: "LONG" | "SHORT";
  status?: string;
}) {
  try {
    const userId = await getUserId();
    if (!userId) return fail({ message: "Not logged in", code: "UNAUTHORIZED" });

    const queries = [
      Query.equal("user_id", userId),
      Query.limit(1000) // Max limit
    ];
    if (payload.symbol) queries.push(Query.equal("symbol", payload.symbol));
    // Side is in trades, not sessions. This function might need to query trades or sessions.
    // Assuming sessions for now as per previous logic which aggregated sessions.

    const response = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      queries
    );

    // Basic CSV generation
    const header = "Date,Symbol,Result,PnL\n";
    const rows = response.documents.map(d => 
      `${d.started_at},${d.symbol},${d.status},${d.realized_pnl}`
    ).join("\n");

    return ok({ csv: header + rows });
  } catch (error) {
    return fail(error);
  }
}
