import { appwrite, appwriteConfig, Query } from "../../utils/appwrite";
import { ok, fail } from "../../utils/backendError";

export interface LeaderboardEntry {
  userId: string;
  user: string;
  avatar?: string;
  level: number;
  winRate: number;
  trades: number;
  pl: number;
}

function getFromDate(range: "daily" | "weekly" | "monthly" | "all") {
  const now = new Date();
  if (range === "daily") {
    const d = new Date(now);
    d.setDate(now.getDate() - 1);
    return d.toISOString();
  }
  if (range === "weekly") {
    const d = new Date(now);
    d.setDate(now.getDate() - 7);
    return d.toISOString();
  }
  if (range === "monthly") {
    const d = new Date(now);
    d.setMonth(now.getMonth() - 1);
    return d.toISOString();
  }
  return null;
}

export async function getLeaderboard(
  range: "daily" | "weekly" | "monthly" | "all" = "all",
) {
  try {
    const profileRes = await appwrite.databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.userProfileCollectionId!,
      [Query.limit(100)],
    );

    const from = getFromDate(range);
    const profiles = profileRes.documents;

    const stats = await Promise.all(
      profiles.map(async (p: any) => {
        const queries = [
          Query.equal("user_id", p.user_id),
          Query.equal("status", "completed"),
          Query.limit(500),
          Query.orderDesc("$createdAt"),
        ];
        if (from) queries.push(Query.greaterThanEqual("$createdAt", from));

        const sessionsRes = await appwrite.databases.listDocuments(
          appwriteConfig.databaseId!,
          appwriteConfig.trainingSessionCollectionId!,
          queries,
        );
        const sessions = sessionsRes.documents || [];
        const perSessionReturns: number[] = sessions.map((s: any) => {
          const r = Number(s.return_pct);
          if (Number.isFinite(r)) return r;
          const pnl = Number(s.realized_pnl || 0);
          const ib = Number(s.initial_balance || 0);
          if (ib > 0) return (pnl / ib) * 100;
          return (pnl / 10000) * 100;
        });
        const total = perSessionReturns.length;
        const sum = perSessionReturns.reduce((a, b) => a + b, 0);
        const avgReturn = total > 0 ? sum / total : 0;
        const wins = perSessionReturns.filter((x) => x > 0).length;
        const winRate = total ? Number(((wins / total) * 100).toFixed(2)) : 0;

        const userName =
          p.display_name ||
          p.nickname ||
          p.handle ||
          p.user_id?.slice(0, 6) ||
          "Trader";
        const avatar =
          p.avatar_url ||
          p.photo_url ||
          `https://i.pravatar.cc/150?u=${encodeURIComponent(p.user_id || userName)}`;
        const level = Number(p.level || 1);

        return {
          userId: p.user_id,
          userName,
          avatar,
          level: Number.isFinite(level) && level > 0 ? level : 1,
          n: total,
          sum,
          avgReturn,
          winRate,
        };
      }),
    );

    const league = stats.reduce(
      (acc, s) => {
        acc.count += s.n;
        acc.sum += s.sum;
        return acc;
      },
      { count: 0, sum: 0 },
    );
    const C = league.count > 0 ? league.sum / league.count : 0;
    const m = 20;

    const entries: LeaderboardEntry[] = stats.map((s) => {
      const n = s.n;
      const score = n > 0 ? (n / (n + m)) * s.avgReturn + (m / (n + m)) * C : 0;
      return {
        userId: s.userId,
        user: s.userName,
        avatar: s.avatar,
        level: s.level,
        winRate: s.winRate,
        trades: n,
        pl: Number(score.toFixed(2)),
      };
    });

    const sorted = entries.sort((a, b) => b.pl - a.pl).slice(0, 50);
    return ok(sorted);
  } catch (error) {
    return fail(error);
  }
}
