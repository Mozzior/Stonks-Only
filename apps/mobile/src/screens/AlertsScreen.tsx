import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { AlertItem } from "../types/mobile";

type AlertsScreenProps = {
  alerts: AlertItem[];
  onToggleRead: (id: string) => void;
  onReadAll: () => void;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
};

const LEVEL_COLOR_MAP = {
  info: "#60a5fa",
  success: "#34d399",
  warning: "#f59e0b",
} as const;

export function AlertsScreen({
  alerts,
  onToggleRead,
  onReadAll,
  refreshing,
  onRefresh,
}: AlertsScreenProps) {
  const unread = alerts.filter((item) => !item.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>提醒中心</Text>
            <Text style={styles.subtitle}>
              未读 {unread} 条，移动端可快速处理训练提醒。
            </Text>
          </View>
          <Pressable style={styles.readAllButton} onPress={onReadAll}>
            <Text style={styles.readAllText}>全部已读</Text>
          </Pressable>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>暂无提醒</Text>
            <Text style={styles.emptyText}>当会话状态变化或成交更新时，这里会出现新提醒。</Text>
          </View>
        ) : (
          alerts.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.card, item.read && styles.readCard]}
              onPress={() => onToggleRead(item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.levelDot,
                    { backgroundColor: LEVEL_COLOR_MAP[item.level] || "#93a4bd" },
                  ]}
                />
              </View>
              <Text style={styles.cardText}>{item.detail}</Text>
              <Text style={styles.cardMeta}>
                {new Date(item.createdAt).toLocaleString()} ·{" "}
                {item.read ? "已读" : "未读"}
              </Text>
            </Pressable>
          ))
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
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
  },
  readAllButton: {
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.22)",
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
  readAllText: {
    color: "#dbe7f6",
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  readCard: {
    opacity: 0.72,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#f8fbff",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  cardText: {
    marginTop: 8,
    color: "#93a4bd",
    fontSize: 13,
    lineHeight: 20,
  },
  cardMeta: {
    marginTop: 10,
    color: "#7687a3",
    fontSize: 12,
  },
  emptyCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  emptyTitle: {
    color: "#f8fbff",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 8,
    color: "#93a4bd",
    fontSize: 13,
    lineHeight: 20,
  },
});
