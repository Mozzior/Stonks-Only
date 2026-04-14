export const WEB_APPWRITE_ENV_KEYS = {
  endpoint: "VITE_APPWRITE_ENDPOINT",
  projectId: "VITE_APPWRITE_PROJECT_ID",
  databaseId: "VITE_APPWRITE_DATABASE_ID",
  avatarBucketId: "VITE_APPWRITE_AVATAR_BUCKET_ID",
  userProfileCollectionId: "VITE_APPWRITE_USER_PROFILE_COLLECTION_ID",
  trainingBalanceLedgerCollectionId:
    "VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID",
  trainingSessionCollectionId: "VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID",
  trainingTradeLogCollectionId:
    "VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID",
  stockInfoCollectionId: "VITE_APPWRITE_STOCK_INFO_COLLECTION_ID",
  stockKlineCollectionId: "VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID",
} as const;

export const MOBILE_APPWRITE_ENV_KEYS = {
  endpoint: "EXPO_PUBLIC_APPWRITE_ENDPOINT",
  projectId: "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
  databaseId: "EXPO_PUBLIC_APPWRITE_DATABASE_ID",
  platformId: "EXPO_PUBLIC_APPWRITE_PLATFORM_ID",
} as const;

export type WebAppwriteEnvKey =
  (typeof WEB_APPWRITE_ENV_KEYS)[keyof typeof WEB_APPWRITE_ENV_KEYS];

export type MobileAppwriteEnvKey =
  (typeof MOBILE_APPWRITE_ENV_KEYS)[keyof typeof MOBILE_APPWRITE_ENV_KEYS];

export type AppwriteConfig = {
  endpoint?: string;
  projectId?: string;
  databaseId?: string;
  avatarBucketId?: string;
  userProfileCollectionId?: string;
  trainingBalanceLedgerCollectionId?: string;
  trainingSessionCollectionId?: string;
  trainingTradeLogCollectionId?: string;
  stockInfoCollectionId?: string;
  stockKlineCollectionId?: string;
};

export type MobileAppwriteConfig = {
  endpoint?: string;
  projectId?: string;
  databaseId?: string;
  platformId?: string;
};

export function normalizeConfigValue(value?: string | null) {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed || undefined;
}

export function buildWebAppwriteConfig(
  env: Partial<Record<WebAppwriteEnvKey, string | undefined>>,
) {
  return {
    endpoint: normalizeConfigValue(env[WEB_APPWRITE_ENV_KEYS.endpoint]),
    projectId: normalizeConfigValue(env[WEB_APPWRITE_ENV_KEYS.projectId]),
    databaseId: normalizeConfigValue(env[WEB_APPWRITE_ENV_KEYS.databaseId]),
    avatarBucketId: normalizeConfigValue(
      env[WEB_APPWRITE_ENV_KEYS.avatarBucketId],
    ),
    userProfileCollectionId: normalizeConfigValue(
      env[WEB_APPWRITE_ENV_KEYS.userProfileCollectionId],
    ),
    trainingBalanceLedgerCollectionId: normalizeConfigValue(
      env[WEB_APPWRITE_ENV_KEYS.trainingBalanceLedgerCollectionId],
    ),
    trainingSessionCollectionId: normalizeConfigValue(
      env[WEB_APPWRITE_ENV_KEYS.trainingSessionCollectionId],
    ),
    trainingTradeLogCollectionId: normalizeConfigValue(
      env[WEB_APPWRITE_ENV_KEYS.trainingTradeLogCollectionId],
    ),
    stockInfoCollectionId: normalizeConfigValue(
      env[WEB_APPWRITE_ENV_KEYS.stockInfoCollectionId],
    ),
    stockKlineCollectionId: normalizeConfigValue(
      env[WEB_APPWRITE_ENV_KEYS.stockKlineCollectionId],
    ),
  } satisfies AppwriteConfig;
}

export function buildMobileAppwriteConfig(
  env: Partial<Record<MobileAppwriteEnvKey, string | undefined>>,
) {
  return {
    endpoint: normalizeConfigValue(env[MOBILE_APPWRITE_ENV_KEYS.endpoint]),
    projectId: normalizeConfigValue(env[MOBILE_APPWRITE_ENV_KEYS.projectId]),
    databaseId: normalizeConfigValue(env[MOBILE_APPWRITE_ENV_KEYS.databaseId]),
    platformId: normalizeConfigValue(env[MOBILE_APPWRITE_ENV_KEYS.platformId]),
  } satisfies MobileAppwriteConfig;
}
