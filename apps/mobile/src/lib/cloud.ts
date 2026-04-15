import { appwriteConfig, appwriteMobile, Query } from "./appwrite";
import type {
  AlertItem,
  Holding,
  MobileDashboardData,
  SessionStatus,
  TrainingSession,
} from "../types/mobile";

type AnyDoc = Record<string, unknown> & { $id?: string; $createdAt?: string; $updatedAt?: string };

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asArray(value: unknown): AnyDoc[] {
  return Array.isArray(value) ? (value as AnyDoc[]) : [];
}

function parseSessionStatus(input: string): SessionStatus {
  const value = input.toLowerCase();
  if (["active", "running", "initialized", "in_progress", "pending", "not_started"].includes(value)) {
    return "active";
  }
  if (["paused", "aborted"].includes(value)) {
    return "paused";
  }
  return "completed";
}

function parseTimeframe(raw: string): TrainingSession["timeframe"] {
  const value = raw.toLowerCase();
  if (value === "weekly" || value === "1w") return "1W";
  if (value === "monthly" || value === "1m") return "1M";
  return "1D";
}

async function safeListDocuments(collectionId: string, queries: string[]) {
  if (!appwriteConfig.databaseId || !collectionId) return [];

  try {
    const response = await appwriteMobile.databases.listDocuments(
      appwriteConfig.databaseId,
      collectionId,
      queries,
    );
    return asArray(response.documents);
  } catch {
    try {
      const response = await appwriteMobile.databases.listDocuments(
        appwriteConfig.databaseId,
        collectionId,
        [Query.limit(50)],
      );
      return asArray(response.documents);
    } catch {
      return [];
    }
  }
}

function buildTrainingSession(doc?: AnyDoc): TrainingSession {
  if (!doc) {
    return {
      id: "no-session",
      symbol: "N/A",
      timeframe: "1D",
      strategy: "暂无进行中的训练",
      winRate: 0,
      progress: 0,
      barsDone: 0,
      barsTotal: 0,
      pnlPercent: 0,
      status: "paused",
    };
  }

  const startIndex = asNumber(doc.start_index, 0);
  const endIndex = asNumber(doc.end_index, 0);
  const totalByRange = endIndex > startIndex ? endIndex - startIndex : 0;
  const totalByField = asNumber(doc.total_bars, 0);
  const barsTotal = totalByField || totalByRange;
  const barsDone = asNumber(doc.current_index, asNumber(doc.trained_bars, 0));
  const rawProgress = asNumber(doc.progress_pct, -1);
  const progress =
    rawProgress >= 0
      ? (rawProgress > 1 ? rawProgress / 100 : rawProgress)
      : barsTotal > 0
        ? barsDone / barsTotal
        : 0;

  return {
    id: asString(doc.$id, "unknown-session"),
    symbol: asString(doc.symbol || doc.ts_code || doc.ticker, "N/A"),
    timeframe: parseTimeframe(asString(doc.period || doc.timeframe, "daily")),
    strategy: asString(doc.strategy || doc.strategy_name, "移动端云端会话"),
    winRate: asNumber(doc.win_rate, 0),
    progress: Math.max(0, Math.min(1, progress)),
    barsDone,
    barsTotal,
    pnlPercent: asNumber(doc.return_pct, asNumber(doc.total_return_pct, 0)),
    status: parseSessionStatus(asString(doc.status, "pending")),
  };
}

function buildHoldingsFromTrades(trades: AnyDoc[]): Holding[] {
  const grouped = new Map<string, Holding>();

  for (const trade of trades) {
    const symbol = asString(trade.symbol || trade.ts_code, "");
    if (!symbol) continue;

    const sideRaw = asString(trade.side || trade.position_side || trade.action, "long").toLowerCase();
    const side = sideRaw.includes("short") || sideRaw.includes("sell") ? "short" : "long";
    const quantity = asNumber(trade.quantity, asNumber(trade.amount, 0));
    const price = asNumber(trade.price, 0);
    const pnl = asNumber(trade.realized_pnl, asNumber(trade.pnl, 0));
    const markPrice = asNumber(trade.mark_price, price);

    const key = `${symbol}-${side}`;
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, {
        symbol,
        side,
        quantity,
        avgPrice: price,
        markPrice,
        pnl,
        pnlPercent: price > 0 ? (pnl / (price * Math.max(quantity, 1))) * 100 : 0,
      });
      continue;
    }

    const mergedQty = current.quantity + quantity;
    const weightedPrice =
      mergedQty > 0
        ? (current.avgPrice * current.quantity + price * quantity) / mergedQty
        : current.avgPrice;

    grouped.set(key, {
      ...current,
      quantity: mergedQty,
      avgPrice: weightedPrice,
      markPrice: markPrice || current.markPrice,
      pnl: current.pnl + pnl,
      pnlPercent:
        weightedPrice > 0
          ? ((current.pnl + pnl) / (weightedPrice * Math.max(mergedQty, 1))) * 100
          : 0,
    });
  }

  return Array.from(grouped.values()).slice(0, 5);
}

function buildAlerts(session: TrainingSession, trades: AnyDoc[], profile?: AnyDoc): AlertItem[] {
  const alerts: AlertItem[] = [];

  if (session.id !== "no-session") {
    alerts.push({
      id: `session-${session.id}`,
      title: "训练会话状态",
      detail: `${session.symbol} 进度 ${Math.round(session.progress * 100)}%，当前状态 ${
        session.status === "active" ? "进行中" : session.status === "paused" ? "已暂停" : "已完成"
      }`,
      level: session.status === "active" ? "info" : "warning",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  const lastTrade = trades[0];
  if (lastTrade) {
    alerts.push({
      id: `trade-${asString(lastTrade.$id, "latest")}`,
      title: "最近成交更新",
      detail: `${asString(lastTrade.symbol || lastTrade.ts_code, "标的")} 成交 ${
        asNumber(lastTrade.quantity, asNumber(lastTrade.amount, 0)) || 0
      }`,
      level: "success",
      createdAt: asString(lastTrade.$createdAt, new Date().toISOString()),
      read: false,
    });
  }

  if (profile) {
    const tier = asString(profile.membership_tier, "");
    if (tier) {
      alerts.push({
        id: `membership-${tier}`,
        title: "会员状态",
        detail: `当前会员等级：${tier}`,
        level: "info",
        createdAt: new Date().toISOString(),
        read: true,
      });
    }
  }

  return alerts;
}

export async function fetchMobileDashboardData() {
  const user = await appwriteMobile.account.get();
  const userId = user.$id;

  const profileCollectionId = appwriteConfig.userProfileCollectionId || "";
  const sessionCollectionId = appwriteConfig.trainingSessionCollectionId || "";
  const tradeCollectionId = appwriteConfig.trainingTradeLogCollectionId || "";
  const ledgerCollectionId = appwriteConfig.trainingBalanceLedgerCollectionId || "";

  const [profiles, sessions, trades, ledgers, leaderboardRaw] = await Promise.all([
    safeListDocuments(profileCollectionId, [Query.equal("user_id", userId), Query.limit(1)]),
    safeListDocuments(sessionCollectionId, [
      Query.equal("user_id", userId),
      Query.orderDesc("$updatedAt"),
      Query.limit(20),
    ]),
    safeListDocuments(tradeCollectionId, [
      Query.equal("user_id", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(60),
    ]),
    safeListDocuments(ledgerCollectionId, [
      Query.equal("user_id", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(60),
    ]),
    safeListDocuments(profileCollectionId, [Query.orderDesc("$updatedAt"), Query.limit(20)]),
  ]);

  const profile = profiles[0];
  const session = buildTrainingSession(sessions[0]);
  const holdings = buildHoldingsFromTrades(trades);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const todayLedgers = ledgers.filter((item) => {
    const at = new Date(asString(item.$createdAt)).getTime();
    return Number.isFinite(at) && at >= todayMs;
  });
  const todayPnl = todayLedgers.reduce(
    (sum, item) => sum + asNumber(item.amount_delta, asNumber(item.amount, 0)),
    0,
  );

  const wins = sessions.filter((item) => asNumber(item.return_pct, 0) > 0).length;
  const dailyBrief = {
    date: new Date().toISOString(),
    totalReturnPercent: asNumber(session.pnlPercent, 0),
    realizedPnl: ledgers.reduce(
      (sum, item) => sum + asNumber(item.realized_pnl, asNumber(item.amount_delta, 0)),
      0,
    ),
    trades: trades.length,
    winTrades: wins,
  };

  const wallet = {
    cash: asNumber(profile?.training_balance, 0),
    equity: holdings.reduce((sum, item) => sum + item.markPrice * item.quantity, 0),
    todayPnl,
    totalPnl: asNumber(profile?.total_pnl, asNumber(profile?.all_time_pnl, dailyBrief.realizedPnl)),
  };

  const activities = trades.slice(0, 6).map((item) => ({
    id: asString(item.$id, `trade-${Math.random()}`),
    at: asString(item.$createdAt, new Date().toISOString()),
    title: "训练成交",
    detail: `${asString(item.symbol || item.ts_code, "标的")} ${
      asString(item.side || item.action, "成交")
    } ${asNumber(item.quantity, asNumber(item.amount, 0))}`,
    impact: asNumber(item.realized_pnl, 0) >= 0 ? ("positive" as const) : ("negative" as const),
  }));

  const leaderboard = leaderboardRaw.slice(0, 8).map((item, index) => ({
    rank: index + 1,
    nickname: asString(item.display_name || item.nickname || item.handle, `User-${index + 1}`),
    winRate: asNumber(item.win_rate, 0),
    monthlyReturnPercent: asNumber(
      item.month_return_pct,
      asNumber(item.total_return_pct, asNumber(item.return_pct, 0)),
    ),
  }));

  const alerts = buildAlerts(session, trades, profile);

  return {
    user,
    data: {
      session,
      wallet,
      holdings,
      dailyBrief,
      activities,
      leaderboard,
      alerts,
    } satisfies MobileDashboardData,
  };
}
