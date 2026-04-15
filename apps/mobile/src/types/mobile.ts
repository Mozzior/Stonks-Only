export type TabKey =
  | "home"
  | "training"
  | "review"
  | "leaderboard"
  | "wallet"
  | "membership"
  | "profile"
  | "settings"
  | "about";

export type SessionStatus = "active" | "paused" | "completed";

export type PositionSide = "long" | "short";

export type TrainingSession = {
  id: string;
  symbol: string;
  timeframe: "1D" | "1W" | "1M";
  strategy: string;
  winRate: number;
  progress: number;
  barsDone: number;
  barsTotal: number;
  pnlPercent: number;
  status: SessionStatus;
};

export type Holding = {
  symbol: string;
  side: PositionSide;
  quantity: number;
  avgPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
};

export type DailyBrief = {
  date: string;
  totalReturnPercent: number;
  realizedPnl: number;
  trades: number;
  winTrades: number;
};

export type ActivityItem = {
  id: string;
  at: string;
  title: string;
  detail: string;
  impact?: "positive" | "neutral" | "negative";
};

export type AlertItem = {
  id: string;
  title: string;
  detail: string;
  level: "info" | "success" | "warning";
  createdAt: string;
  read: boolean;
};

export type LeaderboardItem = {
  rank: number;
  nickname: string;
  winRate: number;
  monthlyReturnPercent: number;
};

export type WalletSummary = {
  cash: number;
  equity: number;
  todayPnl: number;
  totalPnl: number;
};

export type MobileDashboardData = {
  session: TrainingSession;
  wallet: WalletSummary;
  holdings: Holding[];
  dailyBrief: DailyBrief;
  activities: ActivityItem[];
  leaderboard: LeaderboardItem[];
  alerts: AlertItem[];
};
