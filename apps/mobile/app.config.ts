import type { ConfigContext, ExpoConfig } from "expo/config";

const MOBILE_APPWRITE_ENV_KEYS = {
  endpoint: "EXPO_PUBLIC_APPWRITE_ENDPOINT",
  projectId: "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
  databaseId: "EXPO_PUBLIC_APPWRITE_DATABASE_ID",
  platformId: "EXPO_PUBLIC_APPWRITE_PLATFORM_ID",
} as const;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Stocks Only Mobile",
  slug: "stocks-only-mobile",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0b1220",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "cc.cavia.app.stp.mobile",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0b1220",
    },
    edgeToEdgeEnabled: true,
    package: "cc.cavia.app.stp.mobile",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    appwriteEndpoint: process.env[MOBILE_APPWRITE_ENV_KEYS.endpoint],
    appwriteProjectId: process.env[MOBILE_APPWRITE_ENV_KEYS.projectId],
    appwriteDatabaseId: process.env[MOBILE_APPWRITE_ENV_KEYS.databaseId],
    appwritePlatformId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.platformId] ||
      "cc.cavia.app.stp.mobile",
  },
});
