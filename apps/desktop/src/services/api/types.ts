export interface ApiEnvelope<T> {
  code: string;
  data: T;
  requestId: string;
}

export interface DashboardSummary {
  portfolioValue: number;
  availableCash: number;
  buyingPower: number;
  totalPnl: number;
  todayPnl: number;
  winRate: number;
  tradeCount: number;
  profitableCount: number;
}

export interface WalletRechargePayload {
  amount: number;
  channel: string;
  clientTxnId: string;
}

export interface MembershipUpgradePayload {
  planId: string;
  paymentMethod: string;
  clientTxnId: string;
}

export interface TrainingOrderPayload {
  sessionId: string;
  action: "LONG" | "SHORT" | "CLOSE";
  closeSide?: "LONG" | "SHORT";
  amount?: number;
  priceHint?: number;
  klineTimestamp?: number;
  override?: boolean;
  cash?: number;
  position?: number;
  avgEntryPrice?: number;
  marketValue?: number;
  totalEquity?: number;
  realizedPnl?: number;
  fee?: number;
  notional?: number;
  orderId?: string;
}
