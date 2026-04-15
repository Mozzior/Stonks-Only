import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { TrainingSession } from "../types/mobile";

type TrainingScreenProps = {
  session: TrainingSession;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

const STATUS_LABEL_MAP: Record<TrainingSession["status"], string> = {
  active: "进行中",
  paused: "已暂停",
  completed: "已完成",
};

export function TrainingScreen({
  session,
  refreshing,
  onRefresh,
  t,
}: TrainingScreenProps) {
  const remaining = Math.max(0, session.barsTotal - session.barsDone);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        <Text style={styles.title}>{t("menu.training", "训练")}</Text>
        <Text style={styles.subtitle}>
          移动端负责查看训练节奏、执行状态和关键信息，不承载桌面端的复杂图表交互。
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>当前会话</Text>
          <Text style={styles.cardText}>
            {session.symbol} / {session.timeframe} / {session.strategy}
          </Text>
          <Text style={styles.cardText}>
            状态 {STATUS_LABEL_MAP[session.status]} · 胜率 {session.winRate}%
          </Text>
          <Text style={styles.cardText}>
            进度 {Math.round(session.progress * 100)}% · {session.barsDone}/
            {session.barsTotal} 根
          </Text>
          <Text style={styles.cardText}>
            浮动收益 {session.pnlPercent >= 0 ? "+" : ""}
            {session.pnlPercent.toFixed(2)}%
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>训练控制</Text>
          <Text style={styles.cardText}>
            移动端用于查看会话状态并拉取最新云端数据，不替代桌面端图表工作台。
          </Text>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.primaryButton, refreshing && styles.disabledButton]}
              onPress={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator color="#041018" />
              ) : (
                <Text style={styles.primaryButtonText}>刷新云端会话</Text>
              )}
            </Pressable>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>前往桌面端深度训练</Text>
            </Pressable>
          </View>
          <Text style={styles.smallHint}>剩余 {remaining} 根可训练 K 线</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>继续保留在桌面端的能力</Text>
          <Text style={styles.cardText}>
            多指标联动、画线分析、深度复盘、复杂模拟交易和长时间训练操作台。
          </Text>
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
  title: {
    color: "#f8fbff",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: "#93a4bd",
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    marginTop: 16,
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
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  primaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5eead4",
  },
  primaryButtonText: {
    color: "#041018",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.22)",
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
  secondaryButtonText: {
    color: "#dbe7f6",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    textAlign: "center",
  },
  smallHint: {
    marginTop: 10,
    color: "#93a4bd",
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.72,
  },
});
