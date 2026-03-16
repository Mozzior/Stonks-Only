import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { DBManager } from "./database/manager";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const appRoot = path.join(__dirname, "..");
{
  const mode =
    process.env.NODE_ENV ||
    (process.env["VITE_DEV_SERVER_URL"] ? "development" : "production");
  const files = [`.env.${mode}.local`, `.env.${mode}`, `.env.local`, `.env`];
  for (const f of files) {
    const p = path.join(appRoot, f);
    if (fs.existsSync(p)) dotenv.config({ path: p, override: true });
  }
}
process.env.APP_ROOT = appRoot;

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    title: process.env.APP_NAME || "Stocks Only",
    icon: path.join(process.env.VITE_PUBLIC, "app-icon.png"),
    width: 1100,
    height: 750,
    minWidth: 1100,
    minHeight: 750,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  // Initialize Database
  try {
    DBManager.init();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }

  ipcMain.on("env:getSync", (event) => {
    event.returnValue = {
      VITE_APPWRITE_ENDPOINT: process.env.VITE_APPWRITE_ENDPOINT,
      VITE_APPWRITE_PROJECT_ID: process.env.VITE_APPWRITE_PROJECT_ID,
      VITE_APPWRITE_DATABASE_ID: process.env.VITE_APPWRITE_DATABASE_ID,
      VITE_APPWRITE_AVATAR_BUCKET_ID:
        process.env.VITE_APPWRITE_AVATAR_BUCKET_ID,
      VITE_APPWRITE_USER_PROFILE_COLLECTION_ID:
        process.env.VITE_APPWRITE_USER_PROFILE_COLLECTION_ID,
      VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID:
        process.env.VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID,
      VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID:
        process.env.VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID,
      VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID:
        process.env.VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID,
      VITE_APPWRITE_STOCK_INFO_COLLECTION_ID:
        process.env.VITE_APPWRITE_STOCK_INFO_COLLECTION_ID,
      VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID:
        process.env.VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID,
    };
  });

  // Register IPC Handlers
  ipcMain.handle("db:run", (_, sql, params) => DBManager.run(sql, params));
  ipcMain.handle("db:get", (_, sql, params) => DBManager.get(sql, params));
  ipcMain.handle("db:all", (_, sql, params) => DBManager.all(sql, params));

  // Storage helpers
  ipcMain.handle("storage:set", (_, key, value) =>
    DBManager.setItem(key, value),
  );
  ipcMain.handle("storage:get", (_, key) => DBManager.getItem(key));
  ipcMain.handle("storage:delete", (_, key) => DBManager.deleteItem(key));
  ipcMain.handle("storage:getAll", () => DBManager.getAllItems());

  createWindow();
});
