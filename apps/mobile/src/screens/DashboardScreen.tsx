import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type DashboardScreenProps = {
  hasConfig: boolean;
  sessionText: string;
  onGoTraining: () => void;
  t: (key: string, fallback?: string) => string;
};

export function DashboardScreen({
  hasConfig,
  sessionText,
  onGoTraining,
  t,
}: DashboardScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>React Native Companion</Text>
          </View>
          <Text style={styles.title}>{t("menu.home", "首页")}</Text>
          <Text style={styles.subtitle}>随时查看训练进度、资产概览与提醒。</Text>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>今日收益</Text>
            <Text style={styles.metricValue}>+3.86%</Text>
            <Text style={styles.metricHint}>同步桌面端训练表现</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>训练状态</Text>
            <Text style={styles.metricValue}>进行中</Text>
            <Text style={styles.metricHint}>AAPL / 日线 / 第 142 根</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>云端账号</Text>
          <Text style={styles.cardText}>{sessionText}</Text>
          <View style={styles.inlineBadge}>
            <Text style={styles.inlineBadgeText}>
              {hasConfig ? "Cloud Ready" : "Demo"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>手机端定位</Text>
          <Text style={styles.cardText}>
            手机端更适合查看会话状态、收益提醒、排行榜、账户信息和轻量操作。
          </Text>
          <Pressable style={styles.primaryButton} onPress={onGoTraining}>
            <Text style={styles.primaryButtonText}>
              {t("menu.training", "训练")}
            </Text>
          </Pressable>
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
    height: 52,
    borderRadius: 16,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5eead4",
  },
  primaryButtonText: {
    color: "#041018",
    fontSize: 16,
    fontWeight: "700",
  },
});
