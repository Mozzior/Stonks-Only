import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>关于软件</Text>
        <Text style={styles.subtitle}>与桌面端同名模块，保持品牌与版本信息一致。</Text>

        <View style={styles.card}>
          <Text style={styles.name}>Stocks Only Mobile</Text>
          <Text style={styles.version}>Version 0.1.0</Text>
          <Text style={styles.desc}>
            面向交易训练的移动伴随端，和桌面端共享账号与云端数据。
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
  name: { color: "#f8fbff", fontSize: 20, fontWeight: "700" },
  version: { marginTop: 8, color: "#5eead4", fontSize: 14, fontWeight: "600" },
  desc: { marginTop: 10, color: "#93a4bd", fontSize: 14, lineHeight: 22 },
});
