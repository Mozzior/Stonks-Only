/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT?: string;
  readonly VITE_APPWRITE_PROJECT_ID?: string;
  readonly VITE_APPWRITE_DATABASE_ID?: string;
  readonly VITE_APPWRITE_AVATAR_BUCKET_ID?: string;
  readonly VITE_APPWRITE_USER_PROFILE_COLLECTION_ID?: string;
  readonly VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID?: string;
  readonly VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID?: string;
  readonly VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID?: string;
  readonly VITE_APPWRITE_STOCK_INFO_COLLECTION_ID?: string;
  readonly VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
