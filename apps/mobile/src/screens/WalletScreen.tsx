import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ActivityItem, WalletSummary } from "../types/mobile";

type WalletScreenProps = {
  wallet: WalletSummary;
  activities: ActivityItem[];
  onRecharge: () => Promise<void>;
};

export function WalletScreen({ wallet, activities, onRecharge }: WalletScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>我的钱包</Text>
        <Text style={styles.subtitle}>与桌面端同名入口，查看资金与近期资金活动。</Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>现金</Text>
            <Text style={styles.kpiValue}>${wallet.cash.toFixed(2)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>持仓市值</Text>
            <Text style={styles.kpiValue}>${wallet.equity.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>最近活动</Text>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>暂无资金活动。</Text>
          ) : (
            activities.map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowHint}>{item.detail}</Text>
              </View>
            ))
          )}
        </View>

        <Pressable style={styles.rechargeButton} onPress={onRecharge}>
          <Text style={styles.rechargeText}>模拟充值 +1000（调用云函数）</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0b1220" },
  container: { padding: 18, paddingBottom: 120, backgroundColor: "#0b1220" },
  title: { color: "#f8fbff", fontSize: 28, fontWeight: "700" },
  subtitle: { marginTop: 8, color: "#93a4bd", fontSize: 14, lineHeight: 22 },
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
  kpiValue: { marginTop: 8, color: "#f8fbff", fontSize: 20, fontWeight: "700" },
  card: {
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  cardTitle: { color: "#f8fbff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptyText: { color: "#93a4bd", fontSize: 13 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.12)",
  },
  rowTitle: { color: "#f8fbff", fontSize: 14, fontWeight: "600" },
  rowHint: { marginTop: 4, color: "#93a4bd", fontSize: 12 },
  rechargeButton: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(94, 234, 212, 0.14)",
  },
  rechargeText: { color: "#5eead4", fontSize: 13, fontWeight: "700" },
});
