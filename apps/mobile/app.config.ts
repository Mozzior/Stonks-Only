import type { ConfigContext, ExpoConfig } from "expo/config";

const MOBILE_APPWRITE_ENV_KEYS = {
  endpoint: "EXPO_PUBLIC_APPWRITE_ENDPOINT",
  projectId: "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
  databaseId: "EXPO_PUBLIC_APPWRITE_DATABASE_ID",
  platformId: "EXPO_PUBLIC_APPWRITE_PLATFORM_ID",
  userProfileCollectionId: "EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID",
  trainingBalanceLedgerCollectionId:
    "EXPO_PUBLIC_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID",
  trainingSessionCollectionId:
    "EXPO_PUBLIC_APPWRITE_TRAINING_SESSION_COLLECTION_ID",
  trainingTradeLogCollectionId:
    "EXPO_PUBLIC_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID",
  walletRechargeFunctionId: "EXPO_PUBLIC_APPWRITE_FN_WALLET_RECHARGE_ID",
  membershipUpgradeFunctionId: "EXPO_PUBLIC_APPWRITE_FN_MEMBERSHIP_UPGRADE_ID",
  trainingSessionCreateFunctionId:
    "EXPO_PUBLIC_APPWRITE_FN_TRAINING_SESSION_CREATE_ID",
  trainingOrderExecFunctionId: "EXPO_PUBLIC_APPWRITE_FN_TRAINING_ORDER_EXEC_ID",
  trainingSettlementFunctionId: "EXPO_PUBLIC_APPWRITE_FN_TRAINING_SETTLEMENT_ID",
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
    appwriteUserProfileCollectionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.userProfileCollectionId],
    appwriteTrainingBalanceLedgerCollectionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.trainingBalanceLedgerCollectionId],
    appwriteTrainingSessionCollectionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.trainingSessionCollectionId],
    appwriteTrainingTradeLogCollectionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.trainingTradeLogCollectionId],
    appwriteWalletRechargeFunctionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.walletRechargeFunctionId],
    appwriteMembershipUpgradeFunctionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.membershipUpgradeFunctionId],
    appwriteTrainingSessionCreateFunctionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.trainingSessionCreateFunctionId],
    appwriteTrainingOrderExecFunctionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.trainingOrderExecFunctionId],
    appwriteTrainingSettlementFunctionId:
      process.env[MOBILE_APPWRITE_ENV_KEYS.trainingSettlementFunctionId],
  },
});
