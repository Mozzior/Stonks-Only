import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { LeaderboardItem } from "../types/mobile";

type LeaderboardScreenProps = {
  leaderboard: LeaderboardItem[];
};

export function LeaderboardScreen({ leaderboard }: LeaderboardScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>排行榜</Text>
        <Text style={styles.subtitle}>与桌面端同名模块，按月度表现展示训练排名。</Text>

        <View style={styles.card}>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>暂无排行榜数据。</Text>
          ) : (
            leaderboard.map((item) => (
              <View key={`${item.rank}-${item.nickname}`} style={styles.row}>
                <View>
                  <Text style={styles.name}>
                    #{item.rank} {item.nickname}
                  </Text>
                  <Text style={styles.hint}>胜率 {item.winRate}%</Text>
                </View>
                <Text style={styles.returnText}>+{item.monthlyReturnPercent.toFixed(2)}%</Text>
              </View>
            ))
          )}
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
  emptyText: { color: "#93a4bd", fontSize: 13 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.12)",
  },
  name: { color: "#f8fbff", fontSize: 14, fontWeight: "700" },
  hint: { marginTop: 4, color: "#93a4bd", fontSize: 12 },
  returnText: { color: "#34d399", fontSize: 14, fontWeight: "700" },
});
