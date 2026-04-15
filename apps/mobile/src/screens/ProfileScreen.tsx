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
import type { WalletSummary } from "../types/mobile";

type ProfileScreenProps = {
  hasConfig: boolean;
  localeLabel: string;
  profileText: string;
  unreadAlerts: number;
  wallet: WalletSummary;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

export function ProfileScreen({
  hasConfig,
  localeLabel,
  profileText,
  unreadAlerts,
  wallet,
  refreshing,
  onRefresh,
  onLogout,
  t,
}: ProfileScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        <Text style={styles.title}>{t("menu.profile", "我的")}</Text>
        <Text style={styles.subtitle}>桌面端与移动端共用账号、语言和后端配置。</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>当前状态</Text>
          <Text style={styles.cardText}>{profileText}</Text>
          <View style={styles.inlineBadge}>
            <Text style={styles.inlineBadgeText}>
              {hasConfig ? "Synced" : "Config Missing"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>默认语言</Text>
          <Text style={styles.cardText}>{localeLabel}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>账户资产</Text>
          <View style={styles.statRow}>
            <Text style={styles.cardText}>现金</Text>
            <Text style={styles.statValue}>${wallet.cash.toFixed(2)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.cardText}>持仓市值</Text>
            <Text style={styles.statValue}>${wallet.equity.toFixed(2)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.cardText}>累计盈亏</Text>
            <Text style={[styles.statValue, wallet.totalPnl >= 0 ? styles.positive : styles.negative]}>
              {wallet.totalPnl >= 0 ? "+" : ""}${wallet.totalPnl.toFixed(2)}
            </Text>
          </View>
          <View style={styles.inlineBadge}>
            <Text style={styles.inlineBadgeText}>未读提醒 {unreadAlerts} 条</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.secondaryButton, refreshing && styles.disabledButton]}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#dbe7f6" />
            ) : (
              <Text style={styles.secondaryButtonText}>刷新会话</Text>
            )}
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
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.12)",
  },
  statValue: {
    color: "#f8fbff",
    fontSize: 14,
    fontWeight: "700",
  },
  positive: {
    color: "#34d399",
  },
  negative: {
    color: "#fb7185",
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
