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
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
  env: {
    VITE_SUPABASE_URL?: string
    VITE_SUPABASE_ANON_KEY?: string
  }
  db: {
    run: (sql: string, params?: any[]) => Promise<any>;
    get: <T = any>(sql: string, params?: any[]) => Promise<T | undefined>;
    all: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
    storage: {
      set: (key: string, value: any) => Promise<any>;
      get: <T = any>(key: string) => Promise<T | null>;
      delete: (key: string) => Promise<any>;
      getAll: () => Promise<Record<string, any>>;
    }
  }
}
