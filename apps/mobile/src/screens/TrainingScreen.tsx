import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type TrainingScreenProps = {
  t: (key: string, fallback?: string) => string;
};

export function TrainingScreen({ t }: TrainingScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("menu.training", "训练")}</Text>
        <Text style={styles.subtitle}>
          移动端负责查看训练节奏、执行状态和关键信息，不承载桌面端的复杂图表交互。
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>当前会话</Text>
          <Text style={styles.cardText}>AAPL / 日线 / 趋势跟踪</Text>
          <Text style={styles.cardText}>胜率 62%，当前浮盈 +1.24%</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>适合放到 RN 手机端的能力</Text>
          <Text style={styles.cardText}>
            会话状态、排行榜、收益提醒、账户信息、轻量订单确认、推送通知。
          </Text>
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
});
