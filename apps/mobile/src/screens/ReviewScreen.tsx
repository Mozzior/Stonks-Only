import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DailyBrief, TrainingSession } from "../types/mobile";
import type { ReviewKpi } from "../services/api";

type ReviewScreenProps = {
  brief: DailyBrief;
  session: TrainingSession;
  reviewKpi: ReviewKpi | null;
  onRefreshKpi: () => Promise<void>;
};

export function ReviewScreen({
  brief,
  session,
  reviewKpi,
  onRefreshKpi,
}: ReviewScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>复盘分析</Text>
        <Text style={styles.subtitle}>与桌面端一致的复盘入口，移动端用于快速查看关键指标。</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>会话结果</Text>
          <Text style={styles.cardText}>标的 {session.symbol}</Text>
          <Text style={styles.cardText}>胜率 {session.winRate}%</Text>
          <Text style={styles.cardText}>
            收益 {session.pnlPercent >= 0 ? "+" : ""}
            {session.pnlPercent.toFixed(2)}%
          </Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>当日交易</Text>
            <Text style={styles.kpiValue}>{brief.trades}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>当日胜单</Text>
            <Text style={styles.kpiValue}>{brief.winTrades}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>复盘 KPI</Text>
          <Text style={styles.cardText}>
            胜率 {reviewKpi?.winRate ?? 0}% · 盈亏因子 {reviewKpi?.profitFactor ?? 0}
          </Text>
          <Text style={styles.cardText}>
            平均盈利 {reviewKpi?.avgWin ?? 0} · 平均亏损 {reviewKpi?.avgLoss ?? 0}
          </Text>
          <Pressable style={styles.button} onPress={onRefreshKpi}>
            <Text style={styles.buttonText}>刷新复盘指标</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>说明</Text>
          <Text style={styles.cardText}>
            深度图表级复盘仍在桌面端执行，手机端提供同名模块用于跟踪核心结果。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0b1220" },
  container: { padding: 18, paddingBottom: 120, backgroundColor: "#0b1220" },
  title: { color: "#f8fbff", fontSize: 28, fontWeight: "700" },
  subtitle: { marginTop: 8, color: "#93a4bd", fontSize: 14, lineHeight: 22 },
  card: {
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  cardTitle: { color: "#f8fbff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  cardText: { color: "#93a4bd", fontSize: 14, lineHeight: 22 },
  button: {
    marginTop: 12,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(94, 234, 212, 0.14)",
  },
  buttonText: { color: "#5eead4", fontSize: 13, fontWeight: "700" },
  kpiRow: { marginTop: 16, flexDirection: "row", gap: 12 },
  kpiCard: {
    flex: 1,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  kpiLabel: { color: "#93a4bd", fontSize: 12 },
  kpiValue: { marginTop: 8, color: "#f8fbff", fontSize: 26, fontWeight: "700" },
});
