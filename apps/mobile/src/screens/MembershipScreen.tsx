import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { MembershipStatus } from "../services/api";

type MembershipScreenProps = {
  profileText: string;
  membership: MembershipStatus | null;
  onUpgrade: () => Promise<void>;
};

export function MembershipScreen({
  profileText,
  membership,
  onUpgrade,
}: MembershipScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>会员成就</Text>
        <Text style={styles.subtitle}>与桌面端同名模块，查看会员等级与成就入口。</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>当前账号</Text>
          <Text style={styles.cardText}>{profileText}</Text>
          <Text style={styles.cardText}>
            等级 {membership?.tier || "free"} · 状态 {membership?.status || "inactive"}
          </Text>
          <Text style={styles.cardText}>
            到期 {membership?.expiresAt || "未设置"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>移动端说明</Text>
          <Text style={styles.cardText}>
            会员升级与成就细节在桌面端保持完整交互，手机端用于同步查看状态与提醒。
          </Text>
        </View>

        <Pressable style={styles.button} onPress={onUpgrade}>
          <Text style={styles.buttonText}>升级会员（调用云函数）</Text>
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
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(94, 234, 212, 0.14)",
  },
  buttonText: { color: "#5eead4", fontSize: 13, fontWeight: "700" },
});
