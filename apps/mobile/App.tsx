import { useEffect, useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  appwriteMobile,
  hasAppwriteCoreConfig,
  hasAppwriteDataConfig,
} from "./src/lib/appwrite";
import { createTranslator } from "./src/lib/i18n";
import { fetchMobileDashboardData } from "./src/lib/cloud";
import { AboutScreen } from "./src/screens/AboutScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LeaderboardScreen } from "./src/screens/LeaderboardScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MembershipScreen } from "./src/screens/MembershipScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ReviewScreen } from "./src/screens/ReviewScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { TrainingScreen } from "./src/screens/TrainingScreen";
import { WalletScreen } from "./src/screens/WalletScreen";
import type { MobileDashboardData, TabKey, AlertItem } from "./src/types/mobile";
import {
  getMembershipStatus,
  getReviewKpi,
  getLeaderboard,
  patchProfileMe,
  rechargeWallet,
  upgradeMembership,
  type MembershipStatus,
  type ReviewKpi,
} from "./src/services/api";

function createEmptyDashboardData(): MobileDashboardData {
  return {
    session: {
      id: "no-session",
      symbol: "N/A",
      timeframe: "1D",
      strategy: "暂无云端训练会话",
      winRate: 0,
      progress: 0,
      barsDone: 0,
      barsTotal: 0,
      pnlPercent: 0,
      status: "paused",
    },
    wallet: {
      cash: 0,
      equity: 0,
      todayPnl: 0,
      totalPnl: 0,
    },
    holdings: [],
    dailyBrief: {
      date: new Date().toISOString(),
      totalReturnPercent: 0,
      realizedPnl: 0,
      trades: 0,
      winTrades: 0,
    },
    activities: [],
    leaderboard: [],
    alerts: [],
  };
}

function mergeAlertReadState(oldAlerts: AlertItem[], nextAlerts: AlertItem[]) {
  const readMap = new Map(oldAlerts.map((item) => [item.id, item.read]));
  return nextAlerts.map((item) => ({
    ...item,
    read: readMap.get(item.id) ?? item.read,
  }));
}

export default function App() {
  const t = useMemo(() => createTranslator("zh-CN"), []);
  const [dashboardData, setDashboardData] = useState<MobileDashboardData>(() =>
    createEmptyDashboardData(),
  );
  const [booting, setBooting] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [message, setMessage] = useState("请登录后加载云端训练数据。");
  const [sessionText, setSessionText] = useState("未连接云端账号");
  const [profileText, setProfileText] = useState("尚未加载用户资料");
  const [refreshingDashboard, setRefreshingDashboard] = useState(false);
  const [refreshingProfile, setRefreshingProfile] = useState(false);
  const [refreshingTraining, setRefreshingTraining] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [reviewKpi, setReviewKpi] = useState<ReviewKpi | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);

  const hasReadyCloudConfig = hasAppwriteCoreConfig && hasAppwriteDataConfig;

  const hydrateCloudData = async () => {
    const result = await fetchMobileDashboardData();
    setDashboardData((prev) => ({
      ...result.data,
      alerts: mergeAlertReadState(prev.alerts, result.data.alerts),
    }));
    setProfileText(result.user.email || result.user.name || result.user.$id);

    const [kpiResult, membershipResult, leaderboardResult] = await Promise.all([
      getReviewKpi(),
      getMembershipStatus(),
      getLeaderboard(20),
    ]);
    if (kpiResult.ok) setReviewKpi(kpiResult.data);
    if (membershipResult.ok) setMembershipStatus(membershipResult.data);
    if (leaderboardResult.ok) {
      setDashboardData((prev) => ({ ...prev, leaderboard: leaderboardResult.data }));
    }
  };

  const refreshCloudDataWithState = async (
    setRefreshing: (value: boolean) => void,
    successMessage: string,
  ) => {
    setRefreshing(true);
    try {
      await hydrateCloudData();
      setMessage(successMessage);
    } catch (error) {
      console.error(error);
      setMessage("云端数据刷新失败，请检查网络、集合权限与字段配置。");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!hasReadyCloudConfig) {
        setMessage("缺少云端配置，请在 apps/mobile/.env 中补齐 Appwrite 变量后重试。");
        setSessionText("配置不完整，无法连接云端。");
        setBooting(false);
        return;
      }

      const session = await appwriteMobile.account
        .getSession("current")
        .catch(() => null);

      if (session) {
        setIsAuthenticated(true);
        setSessionText(session.providerUid || session.$id || "已连接 Appwrite 会话");
        try {
          await hydrateCloudData();
        } catch (error) {
          console.error(error);
          setMessage("已连接账号，但拉取云端数据失败，请检查集合配置和权限。");
        }
      }

      setBooting(false);
    };

    void bootstrap();
  }, []);

  const refreshProfile = async () => {
    if (!hasReadyCloudConfig) {
      setProfileText("配置缺失，无法刷新用户资料。");
      return;
    }
    await refreshCloudDataWithState(refreshingProfile => setRefreshingProfile(refreshingProfile), "账户资料已刷新。");
  };

  const handleLogin = async (email: string, password: string) => {
    if (!hasReadyCloudConfig) {
      setMessage("当前缺少云端配置，无法登录。请先完善 apps/mobile/.env。");
      return;
    }

    try {
      const session = await appwriteMobile.account.createEmailPasswordSession(
        email,
        password,
      );
      setSessionText(session.providerUid || session.$id || "已连接 Appwrite 会话");
      setMessage("登录成功，正在进入移动端首页。");
      setIsAuthenticated(true);
      setActiveTab("home");
      await hydrateCloudData();
    } catch (error) {
      console.error(error);
      setMessage("登录失败，请检查账号、密码或 Appwrite 配置。");
    }
  };

  const handleLogout = async () => {
    if (hasAppwriteCoreConfig) {
      await appwriteMobile.account.deleteSession("current").catch(() => null);
    }

    setIsAuthenticated(false);
    setActiveTab("home");
    setDashboardData(createEmptyDashboardData());
    setProfileText("尚未加载用户资料");
    setSessionText("未连接云端账号");
  };

  const handleRefreshTraining = async () => {
    await refreshCloudDataWithState(
      (value) => setRefreshingTraining(value),
      "训练数据已从云端刷新。",
    );
  };

  const handleRefreshDashboard = async () => {
    await refreshCloudDataWithState(
      (value) => setRefreshingDashboard(value),
      "首页数据已同步到最新云端状态。",
    );
  };

  const handleRefreshReviewKpi = async () => {
    const result = await getReviewKpi();
    if (result.ok) {
      setReviewKpi(result.data);
      setMessage("复盘指标已刷新。");
      return;
    }
    setMessage(result.error.message);
  };

  const handleRechargeWallet = async () => {
    const result = await rechargeWallet({
      amount: 1000,
      channel: "mobile",
      clientTxnId: `mobile-${Date.now()}`,
    });
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("充值请求已提交，正在同步钱包数据。");
    await handleRefreshDashboard();
  };

  const handleUpgradeMembership = async () => {
    const result = await upgradeMembership({
      planId: "pro",
      paymentMethod: "wallet",
      clientTxnId: `membership-${Date.now()}`,
    });
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("会员升级请求已提交。");
    await handleRefreshDashboard();
  };

  const handleSaveNickname = async (nickname: string) => {
    const value = nickname.trim();
    if (!value) return;

    const result = await patchProfileMe({ display_name: value });
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("昵称已更新。");
    await handleRefreshDashboard();
  };

  if (booting) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#5eead4" />
        <Text style={styles.loadingText}>正在初始化 RN 手机端...</Text>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen
          hasConfig={hasReadyCloudConfig}
          message={message}
          onLogin={handleLogin}
          t={t}
        />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.appShell}>
      <View style={styles.screenArea}>
        {activeTab === "home" ? (
          <DashboardScreen
            hasConfig={hasReadyCloudConfig}
            sessionText={sessionText}
            brief={dashboardData.dailyBrief}
            wallet={dashboardData.wallet}
            holdings={dashboardData.holdings}
            activities={dashboardData.activities}
            leaderboard={dashboardData.leaderboard}
            onGoTraining={() => setActiveTab("training")}
            onGoReview={() => setActiveTab("review")}
            onGoWallet={() => setActiveTab("wallet")}
            refreshing={refreshingDashboard}
            onRefresh={handleRefreshDashboard}
            t={t}
          />
        ) : null}

        {activeTab === "training" ? (
          <TrainingScreen
            session={dashboardData.session}
            refreshing={refreshingTraining}
            onRefresh={handleRefreshTraining}
            t={t}
          />
        ) : null}

        {activeTab === "review" ? (
          <ReviewScreen
            brief={dashboardData.dailyBrief}
            session={dashboardData.session}
            reviewKpi={reviewKpi}
            onRefreshKpi={handleRefreshReviewKpi}
          />
        ) : null}

        {activeTab === "leaderboard" ? (
          <LeaderboardScreen leaderboard={dashboardData.leaderboard} />
        ) : null}

        {activeTab === "wallet" ? (
          <WalletScreen
            wallet={dashboardData.wallet}
            activities={dashboardData.activities}
            onRecharge={handleRechargeWallet}
          />
        ) : null}

        {activeTab === "membership" ? (
          <MembershipScreen
            profileText={profileText}
            membership={membershipStatus}
            onUpgrade={handleUpgradeMembership}
          />
        ) : null}

        {activeTab === "settings" ? (
          <SettingsScreen
            darkMode={darkMode}
            onToggleDarkMode={setDarkMode}
            onSaveNickname={handleSaveNickname}
          />
        ) : null}

        {activeTab === "about" ? <AboutScreen /> : null}

        {activeTab === "profile" ? (
          <ProfileScreen
            hasConfig={hasReadyCloudConfig}
            localeLabel="zh-CN"
            profileText={profileText}
            unreadAlerts={dashboardData.alerts.filter((item) => !item.read).length}
            wallet={dashboardData.wallet}
            refreshing={refreshingProfile}
            onRefresh={refreshProfile}
            onLogout={handleLogout}
            t={t}
          />
        ) : null}
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabScrollContent}>
            <TabButton
              label={t("menu.home", "首页")}
              active={activeTab === "home"}
              onPress={() => setActiveTab("home")}
            />
            <TabButton
              label={t("menu.training", "训练")}
              active={activeTab === "training"}
              onPress={() => setActiveTab("training")}
            />
            <TabButton
              label={t("menu.review", "复盘")}
              active={activeTab === "review"}
              onPress={() => setActiveTab("review")}
            />
            <TabButton
              label={t("menu.leaderboard", "排行榜")}
              active={activeTab === "leaderboard"}
              onPress={() => setActiveTab("leaderboard")}
            />
            <TabButton
              label={t("menu.wallet", "钱包")}
              active={activeTab === "wallet"}
              onPress={() => setActiveTab("wallet")}
            />
            <TabButton
              label={t("menu.membership", "会员")}
              active={activeTab === "membership"}
              onPress={() => setActiveTab("membership")}
            />
            <TabButton
              label={t("menu.profile", "我的")}
              active={activeTab === "profile"}
              onPress={() => setActiveTab("profile")}
            />
            <TabButton
              label={t("menu.settings", "设置")}
              active={activeTab === "settings"}
              onPress={() => setActiveTab("settings")}
            />
            <TabButton
              label={t("menu.about", "关于")}
              active={activeTab === "about"}
              onPress={() => setActiveTab("about")}
            />
          </View>
        </ScrollView>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function TabButton({ label, active, onPress }: TabButtonProps) {
  return (
    <Pressable
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  screenArea: {
    flex: 1,
  },
  tabBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "rgba(9, 14, 26, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.16)",
  },
  tabScrollContent: {
    flexDirection: "row",
    gap: 10,
  },
  tabButton: {
    height: 48,
    minWidth: 82,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "rgba(94, 234, 212, 0.14)",
  },
  tabButtonText: {
    color: "#93a4bd",
    fontSize: 14,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: "#5eead4",
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b1220",
  },
  loadingText: {
    marginTop: 14,
    color: "#93a4bd",
    fontSize: 14,
  },
});
