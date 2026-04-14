import { useEffect, useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { appwriteMobile, hasAppwriteCoreConfig } from "./src/lib/appwrite";
import { createTranslator } from "./src/lib/i18n";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { TrainingScreen } from "./src/screens/TrainingScreen";

type TabKey = "home" | "training" | "profile";

export default function App() {
  const t = useMemo(() => createTranslator("zh-CN"), []);
  const [booting, setBooting] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [message, setMessage] = useState("使用与桌面端相同的账号配置即可实现跨端协同。");
  const [sessionText, setSessionText] = useState("未连接云端账号");
  const [profileText, setProfileText] = useState("演示模式，尚未连接账号。");
  const [refreshingProfile, setRefreshingProfile] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (!hasAppwriteCoreConfig) {
        setMessage("当前未配置云端服务，可直接进入移动端演示环境。");
        setSessionText("未配置 Appwrite，当前展示为移动端演示数据。");
        setBooting(false);
        return;
      }

      const session = await appwriteMobile.account
        .getSession("current")
        .catch(() => null);

      if (session) {
        setIsAuthenticated(true);
        setSessionText(session.providerUid || session.$id || "已连接 Appwrite 会话");
      }

      setBooting(false);
    };

    void bootstrap();
  }, []);

  const refreshProfile = async () => {
    setRefreshingProfile(true);

    try {
      if (!hasAppwriteCoreConfig) {
        setProfileText("当前未接入 Appwrite，移动端用于演示配套结构。");
        return;
      }

      const user = await appwriteMobile.account.get().catch(() => null);
      setProfileText(user?.email || user?.name || "已连接账号");
    } finally {
      setRefreshingProfile(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    if (!hasAppwriteCoreConfig) {
      setMessage("当前未配置云端服务，已直接进入移动端演示环境。");
      setIsAuthenticated(true);
      setProfileText("演示模式账号");
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
      await refreshProfile();
    } catch (error) {
      console.error(error);
      setMessage("登录失败，请检查账号、密码或 Appwrite 配置。");
    }
  };

  const handleDemoEnter = () => {
    setMessage("已进入演示模式，可继续完善 RN 真机能力。");
    setIsAuthenticated(true);
    setProfileText("演示模式账号");
    setSessionText("当前使用本地演示数据");
  };

  const handleLogout = async () => {
    if (hasAppwriteCoreConfig) {
      await appwriteMobile.account.deleteSession("current").catch(() => null);
    }

    setIsAuthenticated(false);
    setActiveTab("home");
    setProfileText("演示模式，尚未连接账号。");
    setSessionText("未连接云端账号");
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
          hasConfig={hasAppwriteCoreConfig}
          message={message}
          onLogin={handleLogin}
          onEnterDemo={handleDemoEnter}
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
            hasConfig={hasAppwriteCoreConfig}
            sessionText={sessionText}
            onGoTraining={() => setActiveTab("training")}
            t={t}
          />
        ) : null}

        {activeTab === "training" ? <TrainingScreen t={t} /> : null}

        {activeTab === "profile" ? (
          <ProfileScreen
            hasConfig={hasAppwriteCoreConfig}
            localeLabel="zh-CN"
            profileText={profileText}
            refreshing={refreshingProfile}
            onRefresh={refreshProfile}
            onLogout={handleLogout}
            t={t}
          />
        ) : null}
      </View>

      <View style={styles.tabBar}>
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
          label={t("menu.profile", "我的")}
          active={activeTab === "profile"}
          onPress={() => setActiveTab("profile")}
        />
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
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "rgba(9, 14, 26, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.16)",
  },
  tabButton: {
    flex: 1,
    height: 48,
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
