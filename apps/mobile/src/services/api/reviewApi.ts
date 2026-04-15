import { appwriteConfig, appwriteMobile, Query } from "../../lib/appwrite";
import { fail, getUserId, ok, requireDataConfig, type ApiResult } from "./client";
import type { ReviewKpi } from "./types";

export async function getReviewKpi(): Promise<ApiResult<ReviewKpi>> {
  const config = requireDataConfig();
  if (!config.ok) return config;

  try {
    const userId = await getUserId();
    if (!userId) return fail("未登录", "UNAUTHORIZED");

    const response = await appwriteMobile.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.trainingSessionCollectionId!,
      [
        Query.equal("user_id", userId),
        Query.equal("status", "completed"),
        Query.orderDesc("started_at"),
        Query.limit(500),
      ],
    );

    const pnl = response.documents.map((x) => Number((x as Record<string, unknown>).realized_pnl || 0));
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
      totalTrades: total,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "获取复盘指标失败");
  }
}
