import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type SettingsScreenProps = {
  darkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
  onSaveNickname: (nickname: string) => Promise<void>;
};

export function SettingsScreen({
  darkMode,
  onToggleDarkMode,
  onSaveNickname,
}: SettingsScreenProps) {
  const [nickname, setNickname] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>系统设置</Text>
        <Text style={styles.subtitle}>与桌面端同名模块，保持设置入口一致。</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>深色模式</Text>
              <Text style={styles.rowHint}>移动端主题显示设置</Text>
            </View>
            <Switch value={darkMode} onValueChange={onToggleDarkMode} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.rowTitle}>昵称设置</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="输入新的 display_name"
            placeholderTextColor="#6c7f9f"
            style={styles.input}
          />
          <Pressable
            style={styles.button}
            onPress={() => void onSaveNickname(nickname)}
            disabled={!nickname.trim()}
          >
            <Text style={styles.buttonText}>保存到云端资料</Text>
          </Pressable>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowTitle: { color: "#f8fbff", fontSize: 15, fontWeight: "700" },
  rowHint: { marginTop: 4, color: "#93a4bd", fontSize: 12 },
  input: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    color: "#f8fbff",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  button: {
    marginTop: 12,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(94, 234, 212, 0.14)",
  },
  buttonText: { color: "#5eead4", fontSize: 13, fontWeight: "700" },
});
