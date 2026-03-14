export type MembershipTier = "free" | "pro" | "vip";
export type MembershipStatus = "inactive" | "active" | "expired";
export type TrainingSessionStatus = "running" | "completed" | "aborted";
export type TrainingTradeAction = "BUY" | "SELL" | "CLOSE";
export type TrainingPositionSide = "LONG" | "SHORT";

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  training_balance: number;
  currency: string;
  membership_tier: MembershipTier;
  membership_status: MembershipStatus;
  membership_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTrainingSessionPayload {
  user_id: string;
  ts_code: string;
  symbol?: string | null;
  period: string;
  train_start_idx: number;
  train_end_idx: number;
  train_start_date?: string | null;
  train_end_date?: string | null;
  initial_balance: number;
  meta?: Record<string, unknown>;
}

export interface TrainingSessionSummaryPayload {
  ended_at: string;
  status: TrainingSessionStatus;
  ending_balance: number;
  realized_pnl: number;
  return_pct: number;
  max_drawdown?: number | null;
}

export interface TrainingTradeLogPayload {
  session_id: number;
  user_id: string;
  seq_no: number;
  action: TrainingTradeAction;
  side: TrainingPositionSide;
  price: number;
  amount: number;
  fee?: number;
  trade_time: string;
  kline_timestamp?: number | null;
  position_after?: Record<string, unknown>;
  extra?: Record<string, unknown>;
}

export interface BalanceLedgerPayload {
  user_id: string;
  session_id?: number | null;
  change_type: "init" | "trade_pnl" | "manual_adjust" | "membership_bonus";
  amount: number;
  balance_after: number;
  note?: string | null;
}
