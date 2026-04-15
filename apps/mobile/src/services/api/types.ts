export type WalletRechargePayload = {
  amount: number;
  channel: string;
  clientTxnId: string;
};

export type MembershipUpgradePayload = {
  planId: string;
  paymentMethod: string;
  clientTxnId: string;
};

export type ReviewKpi = {
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
};

export type MembershipStatus = {
  tier: string;
  status: string;
  expiresAt: string | null;
};
