import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type LoginScreenProps = {
  hasConfig: boolean;
  message: string;
  onLogin: (email: string, password: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

export function LoginScreen({
  hasConfig,
  message,
  onLogin,
  t,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      await onLogin(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SO</Text>
          </View>
          <Text style={styles.title}>Stocks Only Mobile</Text>
          <Text style={styles.subtitle}>
            手机端现已切换为 React Native + Expo，更适合后续真机运行与上架。
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {hasConfig ? "已检测到 Appwrite 配置" : "缺少云端配置，无法读取移动端数据"}
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>{t("auth.login.email", "邮箱")}</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="name@example.com"
            placeholderTextColor="#7c8aa5"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>{t("auth.login.password", "密码")}</Text>
          <TextInput
            secureTextEntry
            placeholder="********"
            placeholderTextColor="#7c8aa5"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[
              styles.primaryButton,
              (submitting || !canSubmit) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !canSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#041018" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {t("auth.login.signIn", "登录")}
              </Text>
            )}
          </Pressable>

          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
    gap: 16,
    backgroundColor: "#0b1220",
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#5eead4",
  },
  logoText: {
    color: "#041018",
    fontWeight: "800",
    fontSize: 18,
  },
  title: {
    color: "#f8fbff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#93a4bd",
    fontSize: 14,
    lineHeight: 22,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(94, 234, 212, 0.12)",
  },
  badgeText: {
    color: "#5eead4",
    fontSize: 12,
    fontWeight: "600",
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#121b2e",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  label: {
    color: "#93a4bd",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#0f1728",
    color: "#f8fbff",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5eead4",
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#041018",
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    marginTop: 14,
    color: "#93a4bd",
    fontSize: 13,
    lineHeight: 20,
  },
});
