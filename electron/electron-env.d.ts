/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import("electron").IpcRenderer;
  env: {
    VITE_APPWRITE_ENDPOINT?: string;
    VITE_APPWRITE_PROJECT_ID?: string;
    VITE_APPWRITE_DATABASE_ID?: string;
    VITE_APPWRITE_AVATAR_BUCKET_ID?: string;
    VITE_APPWRITE_USER_PROFILE_COLLECTION_ID?: string;
    VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID?: string;
    VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID?: string;
    VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID?: string;
    VITE_APPWRITE_STOCK_INFO_COLLECTION_ID?: string;
    VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID?: string;
    VITE_APPWRITE_MEMBERSHIP_PLANS_COLLECTION_ID?: string;
    VITE_APPWRITE_USER_ACHIEVEMENTS_COLLECTION_ID?: string;
    VITE_APPWRITE_REVIEW_SNAPSHOTS_COLLECTION_ID?: string;
  };
  db: {
    run: (sql: string, params?: any[]) => Promise<any>;
    get: <T = any>(sql: string, params?: any[]) => Promise<T | undefined>;
    all: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
    storage: {
      set: (key: string, value: any) => Promise<any>;
      get: <T = any>(key: string) => Promise<T | null>;
      delete: (key: string) => Promise<any>;
      getAll: () => Promise<Record<string, any>>;
    };
  };
}
