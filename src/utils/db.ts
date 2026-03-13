// Type definitions for the exposed DB API
// These match what we defined in electron/electron-env.d.ts

export const db = {
  /**
   * Execute a raw SQL query (INSERT, UPDATE, DELETE)
   */
  run: (sql: string, params?: any[]) => window.db.run(sql, params),

  /**
   * Get a single row
   */
  get: <T = any>(sql: string, params?: any[]) => window.db.get<T>(sql, params),

  /**
   * Get multiple rows
   */
  all: <T = any>(sql: string, params?: any[]) => window.db.all<T>(sql, params),

  /**
   * Key-Value Storage Utilities
   */
  storage: {
    set: (key: string, value: any) => window.db.storage.set(key, value),
    get: <T = any>(key: string) => window.db.storage.get<T>(key),
    delete: (key: string) => window.db.storage.delete(key),
    getAll: () => window.db.storage.getAll(),
  }
};
