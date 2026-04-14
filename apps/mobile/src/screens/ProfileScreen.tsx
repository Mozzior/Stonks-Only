import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProfileScreenProps = {
  hasConfig: boolean;
  localeLabel: string;
  profileText: string;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

export function ProfileScreen({
  hasConfig,
  localeLabel,
  profileText,
  refreshing,
  onRefresh,
  onLogout,
  t,
}: ProfileScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("menu.profile", "我的")}</Text>
        <Text style={styles.subtitle}>桌面端与移动端共用账号、语言和后端配置。</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>当前状态</Text>
          <Text style={styles.cardText}>{profileText}</Text>
          <View style={styles.inlineBadge}>
            <Text style={styles.inlineBadgeText}>
              {hasConfig ? "Synced" : "Local Demo"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>默认语言</Text>
          <Text style={styles.cardText}>{localeLabel}</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.secondaryButton, refreshing && styles.disabledButton]}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Text style={styles.secondaryButtonText}>
              {refreshing ? "刷新中..." : "刷新会话"}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onLogout}>
            <Text style={styles.secondaryButtonText}>退出登录</Text>
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
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  disabledButton: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    color: "#dbe7f6",
    fontSize: 15,
    fontWeight: "600",
  },
});
