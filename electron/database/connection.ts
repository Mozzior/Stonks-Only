import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron";
import fs from "node:fs";

let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDB() first.");
  }
  return db;
}

export function initDB(): Database.Database {
  if (db) return db;

  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "database.sqlite");

  // Ensure the directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log(`Initializing database at: ${dbPath}`);

  try {
    db = new Database(dbPath, { verbose: console.log });
    db.pragma("journal_mode = WAL"); // Better performance and concurrency
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}
