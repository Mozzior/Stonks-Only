import {
  Account,
  Client,
  Databases,
  Functions,
  Storage,
  ID,
  Query,
} from "appwrite";

function normalizeEnvValue(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function readEnvValue(key: keyof ImportMetaEnv & keyof Window["env"]) {
  const rendererValue = import.meta.env[key];
  const preloadValue = window.env?.[key];
  return normalizeEnvValue(rendererValue || preloadValue);
}

// Ensure the keys are present in ImportMetaEnv (vite-env.d.ts)
const endpoint = readEnvValue("VITE_APPWRITE_ENDPOINT");
const projectId = readEnvValue("VITE_APPWRITE_PROJECT_ID");
const databaseId = readEnvValue("VITE_APPWRITE_DATABASE_ID");
const avatarBucketId = readEnvValue("VITE_APPWRITE_AVATAR_BUCKET_ID");
const userProfileCollectionId = readEnvValue(
  "VITE_APPWRITE_USER_PROFILE_COLLECTION_ID",
);
const trainingBalanceLedgerCollectionId = readEnvValue(
  "VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID",
);
const trainingSessionCollectionId = readEnvValue(
  "VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID",
);
const trainingTradeLogCollectionId = readEnvValue(
  "VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID",
);
const stockInfoCollectionId = readEnvValue(
  "VITE_APPWRITE_STOCK_INFO_COLLECTION_ID",
);
const stockKlineCollectionId = readEnvValue(
  "VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID",
);
const membershipPlansCollectionId = readEnvValue(
  "VITE_APPWRITE_MEMBERSHIP_PLANS_COLLECTION_ID",
);
const userAchievementsCollectionId = readEnvValue(
  "VITE_APPWRITE_USER_ACHIEVEMENTS_COLLECTION_ID",
);
const reviewSnapshotsCollectionId = readEnvValue(
  "VITE_APPWRITE_REVIEW_SNAPSHOTS_COLLECTION_ID",
);

const appwriteClient = new Client();
const hasAppwriteCoreConfig = Boolean(endpoint && projectId);
const appwriteCoreConfigError =
  "Missing Appwrite endpoint/project configuration. Please check .env files.";

if (hasAppwriteCoreConfig) {
  appwriteClient.setEndpoint(endpoint!).setProject(projectId!);
} else {
  console.warn(appwriteCoreConfigError);
}

export const appwrite = {
  client: appwriteClient,
  account: new Account(appwriteClient),
  databases: new Databases(appwriteClient),
  storage: new Storage(appwriteClient),
  functions: new Functions(appwriteClient),
};

export const appwriteConfig = {
  endpoint,
  projectId,
  databaseId,
  avatarBucketId,
  userProfileCollectionId,
  trainingBalanceLedgerCollectionId,
  trainingSessionCollectionId,
  trainingTradeLogCollectionId,
  stockInfoCollectionId,
  stockKlineCollectionId,
  membershipPlansCollectionId,
  userAchievementsCollectionId,
  reviewSnapshotsCollectionId,
};

if (import.meta.env.DEV) {
  (window as Window & { __appwriteConfig?: typeof appwriteConfig }).__appwriteConfig =
    appwriteConfig;
  console.info("Appwrite config", appwriteConfig);
}

export function assertAppwriteCoreConfigured() {
  if (!hasAppwriteCoreConfig) {
    throw new Error(appwriteCoreConfigError);
  }
}

export function assertAppwriteDatabaseConfigured() {
  if (!databaseId) {
    throw new Error("Missing Appwrite database configuration. Please check .env files.");
  }
}

export { ID, Query };
