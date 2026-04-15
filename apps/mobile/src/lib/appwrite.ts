import "react-native-url-polyfill/auto";
import Constants from "expo-constants";
import {
  Account,
  Client,
  Databases,
  Functions,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
import { buildMobileAppwriteConfig } from "@stonks-only/shared/app-config";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
export const appwriteConfig = buildMobileAppwriteConfig({
  EXPO_PUBLIC_APPWRITE_ENDPOINT: extra.appwriteEndpoint,
  EXPO_PUBLIC_APPWRITE_PROJECT_ID: extra.appwriteProjectId,
  EXPO_PUBLIC_APPWRITE_DATABASE_ID: extra.appwriteDatabaseId,
  EXPO_PUBLIC_APPWRITE_PLATFORM_ID: extra.appwritePlatformId,
  EXPO_PUBLIC_APPWRITE_USER_PROFILE_COLLECTION_ID:
    extra.appwriteUserProfileCollectionId,
  EXPO_PUBLIC_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID:
    extra.appwriteTrainingBalanceLedgerCollectionId,
  EXPO_PUBLIC_APPWRITE_TRAINING_SESSION_COLLECTION_ID:
    extra.appwriteTrainingSessionCollectionId,
  EXPO_PUBLIC_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID:
    extra.appwriteTrainingTradeLogCollectionId,
  EXPO_PUBLIC_APPWRITE_FN_WALLET_RECHARGE_ID:
    extra.appwriteWalletRechargeFunctionId,
  EXPO_PUBLIC_APPWRITE_FN_MEMBERSHIP_UPGRADE_ID:
    extra.appwriteMembershipUpgradeFunctionId,
  EXPO_PUBLIC_APPWRITE_FN_TRAINING_SESSION_CREATE_ID:
    extra.appwriteTrainingSessionCreateFunctionId,
  EXPO_PUBLIC_APPWRITE_FN_TRAINING_ORDER_EXEC_ID:
    extra.appwriteTrainingOrderExecFunctionId,
  EXPO_PUBLIC_APPWRITE_FN_TRAINING_SETTLEMENT_ID:
    extra.appwriteTrainingSettlementFunctionId,
});

const { endpoint, projectId, platformId } = appwriteConfig;
const databaseId = appwriteConfig.databaseId;

if (!appwriteConfig.userProfileCollectionId) {
  appwriteConfig.userProfileCollectionId = "user_profile";
}
if (!appwriteConfig.trainingBalanceLedgerCollectionId) {
  appwriteConfig.trainingBalanceLedgerCollectionId = "training_balance_ledger";
}
if (!appwriteConfig.trainingSessionCollectionId) {
  appwriteConfig.trainingSessionCollectionId = "training_session";
}
if (!appwriteConfig.trainingTradeLogCollectionId) {
  appwriteConfig.trainingTradeLogCollectionId = "training_trade_log";
}
if (!appwriteConfig.walletRechargeFunctionId) {
  appwriteConfig.walletRechargeFunctionId = "fn-wallet-recharge";
}
if (!appwriteConfig.membershipUpgradeFunctionId) {
  appwriteConfig.membershipUpgradeFunctionId = "fn-membership-upgrade";
}
if (!appwriteConfig.trainingSessionCreateFunctionId) {
  appwriteConfig.trainingSessionCreateFunctionId = "fn-training-session-create";
}
if (!appwriteConfig.trainingOrderExecFunctionId) {
  appwriteConfig.trainingOrderExecFunctionId = "fn-training-order-exec";
}
if (!appwriteConfig.trainingSettlementFunctionId) {
  appwriteConfig.trainingSettlementFunctionId = "fn-training-settlement";
}

const client = new Client();

export const hasAppwriteCoreConfig = Boolean(endpoint && projectId);
export const hasAppwriteDataConfig = Boolean(
  appwriteConfig.databaseId &&
    appwriteConfig.userProfileCollectionId &&
    appwriteConfig.trainingBalanceLedgerCollectionId &&
    appwriteConfig.trainingSessionCollectionId &&
    appwriteConfig.trainingTradeLogCollectionId,
);

if (hasAppwriteCoreConfig) {
  client.setEndpoint(endpoint!).setProject(projectId!);

  if (platformId) {
    client.setPlatform(platformId);
  }
}

export const appwriteMobile = {
  client,
  account: new Account(client),
  databases: new Databases(client),
  storage: new Storage(client),
  functions: new Functions(client),
};

export { ID, Query };
