import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  ActivityItem,
  DailyBrief,
  Holding,
  LeaderboardItem,
  WalletSummary,
} from "../types/mobile";

type DashboardScreenProps = {
  hasConfig: boolean;
  sessionText: string;
  brief: DailyBrief;
  wallet: WalletSummary;
  holdings: Holding[];
  activities: ActivityItem[];
  leaderboard: LeaderboardItem[];
  onGoTraining: () => void;
  onGoReview: () => void;
  onGoWallet: () => void;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

export function DashboardScreen({
  hasConfig,
  sessionText,
  brief,
  wallet,
  holdings,
  activities,
  leaderboard,
  onGoTraining,
  onGoReview,
  onGoWallet,
  refreshing,
  onRefresh,
  t,
}: DashboardScreenProps) {
  const totalAssets = wallet.cash + wallet.equity;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>React Native Companion</Text>
          </View>
          <Text style={styles.title}>{t("menu.home", "首页")}</Text>
          <Text style={styles.subtitle}>
            随时查看训练进度、资产概览与提醒。
          </Text>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>今日收益</Text>
            <Text style={styles.metricValue}>
              {brief.totalReturnPercent >= 0 ? "+" : ""}
              {brief.totalReturnPercent.toFixed(2)}%
            </Text>
            <Text style={styles.metricHint}>
              已完成 {brief.trades} 笔，胜出 {brief.winTrades} 笔
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>
              {t("wallet.balance.totalAssets", "总资产")}
            </Text>
            <Text style={styles.metricValue}>${totalAssets.toFixed(2)}</Text>
            <Text style={styles.metricHint}>
              现金 ${wallet.cash.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>云端账号</Text>
          <Text style={styles.cardText}>{sessionText}</Text>
          <View style={styles.inlineBadge}>
            <Text style={styles.inlineBadgeText}>
              {hasConfig ? "Cloud Ready" : "Config Missing"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>持仓概览</Text>
          {holdings.length === 0 ? (
            <Text style={styles.emptyText}>
              当前暂无持仓，等待云端同步最新会话。
            </Text>
          ) : (
            holdings.map((holding) => (
              <View style={styles.rowItem} key={holding.symbol}>
                <View>
                  <Text style={styles.rowTitle}>
                    {holding.symbol} · {holding.side === "long" ? "多" : "空"}
                  </Text>
                  <Text style={styles.rowHint}>
                    {holding.quantity} 股 · 开仓 ${holding.avgPrice.toFixed(2)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.rowValue,
                    holding.pnl >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {holding.pnl >= 0 ? "+" : ""}${holding.pnl.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>最近动态</Text>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>
              暂无成交动态，完成一次训练后会自动出现。
            </Text>
          ) : (
            activities.map((item) => (
              <View style={styles.activityItem} key={item.id}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDetail}>{item.detail}</Text>
              </View>
            ))
          )}
          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={onGoTraining}>
              <Text style={styles.primaryButtonText}>
                {t("menu.training", "训练")}
              </Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onGoReview}>
              <Text style={styles.secondaryButtonText}>{t("menu.review", "复盘")}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onGoWallet}>
              <Text style={styles.secondaryButtonText}>{t("menu.wallet", "钱包")}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>排行榜（本月）</Text>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>暂无排行榜数据，请稍后刷新。</Text>
          ) : (
            leaderboard.map((item) => (
              <View
                style={styles.rowItem}
                key={`${item.rank}-${item.nickname}`}
              >
                <View>
                  <Text style={styles.rowTitle}>
                    #{item.rank} {item.nickname}
                  </Text>
                  <Text style={styles.rowHint}>胜率 {item.winRate}%</Text>
                </View>
                <Text style={styles.rowValue}>
                  +{item.monthlyReturnPercent.toFixed(2)}%
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  container: {
    padding: 18,
    paddingBottom: 120,
    backgroundColor: "#0b1220",
  },
  header: {
    marginBottom: 16,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(94, 234, 212, 0.12)",
  },
  badgeText: {
    color: "#5eead4",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    marginTop: 12,
    color: "#f8fbff",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    color: "#93a4bd",
    fontSize: 14,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  metricLabel: {
    color: "#93a4bd",
    fontSize: 12,
  },
  metricValue: {
    marginTop: 8,
    color: "#f8fbff",
    fontSize: 24,
    fontWeight: "700",
  },
  metricHint: {
    marginTop: 8,
    color: "#93a4bd",
    fontSize: 12,
  },
  card: {
    marginBottom: 16,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  cardTitle: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    color: "#93a4bd",
    fontSize: 14,
    lineHeight: 22,
  },
  emptyText: {
    color: "#93a4bd",
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 10,
  },
  rowItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowTitle: {
    color: "#f8fbff",
    fontSize: 14,
    fontWeight: "600",
  },
  rowHint: {
    marginTop: 4,
    color: "#93a4bd",
    fontSize: 12,
  },
  rowValue: {
    color: "#dbe7f6",
    fontSize: 14,
    fontWeight: "700",
  },
  positive: {
    color: "#34d399",
  },
  negative: {
    color: "#fb7185",
  },
  activityItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.12)",
  },
  activityTitle: {
    color: "#f8fbff",
    fontSize: 14,
    fontWeight: "600",
  },
  activityDetail: {
    marginTop: 4,
    color: "#93a4bd",
    fontSize: 13,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  inlineBadge: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(94, 234, 212, 0.12)",
  },
  inlineBadgeText: {
    color: "#5eead4",
    fontSize: 12,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5eead4",
  },
  primaryButtonText: {
    color: "#041018",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.22)",
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
  secondaryButtonText: {
    color: "#dbe7f6",
    fontSize: 14,
    fontWeight: "600",
  },
});
