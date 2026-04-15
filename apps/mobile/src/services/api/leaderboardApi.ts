import { appwriteConfig, appwriteMobile, Query } from "../../lib/appwrite";
import { fail, ok, requireDataConfig, type ApiResult } from "./client";
import type { LeaderboardItem } from "../../types/mobile";

export async function getLeaderboard(limit = 50): Promise<ApiResult<LeaderboardItem[]>> {
  const config = requireDataConfig();
  if (!config.ok) return config;

  try {
    const profileRes = await appwriteMobile.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.userProfileCollectionId!,
      [Query.limit(limit)],
    );

    const rows = profileRes.documents.map((doc, index) => {
      const row = doc as Record<string, unknown>;
      return {
        rank: index + 1,
        nickname: String(row.display_name || row.nickname || row.handle || `User-${index + 1}`),
        winRate: Number(row.win_rate || 0),
        monthlyReturnPercent: Number(
          row.month_return_pct || row.total_return_pct || row.return_pct || 0,
        ),
      } satisfies LeaderboardItem;
    });

    rows.sort((a, b) => b.monthlyReturnPercent - a.monthlyReturnPercent);
    rows.forEach((item, index) => {
      item.rank = index + 1;
    });
    return ok(rows);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "获取排行榜失败");
  }
}
