import { getDB, initDB } from './connection';
import type { RunResult, Database } from 'better-sqlite3';

export class DBManager {
  private static db: Database | null = null;

  /**
   * Initialize the database and create tables if they don't exist.
   */
  static init() {
    this.db = initDB();
    this.createTables();
  }

  private static createTables() {
    if (!this.db) return;

    // Example: A simple Key-Value store table for "storing some information"
    const createKVTable = `
      CREATE TABLE IF NOT EXISTS app_storage (
        key TEXT PRIMARY KEY,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    this.db.exec(createKVTable);
  }

  /**
   * Execute a query that does not return data (INSERT, UPDATE, DELETE).
   */
  static run(sql: string, params: any[] = []): RunResult {
    const db = getDB();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }

  /**
   * Execute a query that returns a single row.
   */
  static get<T = any>(sql: string, params: any[] = []): T | undefined {
    const db = getDB();
    const stmt = db.prepare(sql);
    return stmt.get(...params) as T | undefined;
  }

  /**
   * Execute a query that returns multiple rows.
   */
  static all<T = any>(sql: string, params: any[] = []): T[] {
    const db = getDB();
    const stmt = db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  // --- Convenience Methods for App Storage ---

  static setItem(key: string, value: any): RunResult {
    const stringValue = JSON.stringify(value);
    const sql = `
      INSERT INTO app_storage (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at;
    `;
    return this.run(sql, [key, stringValue]);
  }

  static getItem<T = any>(key: string): T | null {
    const sql = `SELECT value FROM app_storage WHERE key = ?`;
    const result = this.get<{ value: string }>(sql, [key]);
    if (result && result.value) {
      try {
        return JSON.parse(result.value) as T;
      } catch (e) {
        console.error(`Error parsing value for key ${key}:`, e);
        return null;
      }
    }
    return null;
  }

  static deleteItem(key: string): RunResult {
    const sql = `DELETE FROM app_storage WHERE key = ?`;
    return this.run(sql, [key]);
  }
  
  static getAllItems(): Record<string, any> {
      const sql = `SELECT key, value FROM app_storage`;
      const rows = this.all<{key: string, value: string}>(sql);
      const result: Record<string, any> = {};
      for (const row of rows) {
          try {
              result[row.key] = JSON.parse(row.value);
          } catch (e) {
              result[row.key] = row.value;
          }
      }
      return result;
  }
}
