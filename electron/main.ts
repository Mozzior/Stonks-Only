import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { autoUpdater } from "electron-updater";

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

  // Auto Updater Setup
  autoUpdater.autoDownload = false;

  // 对于私有仓库，在生产环境中，需要确保有权限访问
  // 这里我们从环境变量或主进程配置中读取 GH_TOKEN
  // 警告: 将 Token 打包进客户端是不安全的。如果您的应用是公开分发给外部用户的，
  // 建议将更新文件存放在您自己的服务器（使用 provider: 'generic'）或将仓库设为 Public。
  // 如果仅供内部使用，可以在打包时将环境变量注入，或者让用户登录后从您的后端获取。
  const ghToken = process.env.GH_TOKEN;
  if (ghToken) {
    autoUpdater.addAuthHeader(`Bearer ${ghToken}`);
  }

  autoUpdater.on("checking-for-update", () => {
    win?.webContents.send("updater:event", { type: "checking-for-update" });
  });
  autoUpdater.on("update-available", (info) => {
    win?.webContents.send("updater:event", { type: "update-available", info });
  });
  autoUpdater.on("update-not-available", (info) => {
    win?.webContents.send("updater:event", {
      type: "update-not-available",
      info,
    });
  });
  autoUpdater.on("error", (err) => {
    win?.webContents.send("updater:event", {
      type: "error",
      error: err?.message || "Update error",
    });
  });
  autoUpdater.on("download-progress", (progressObj) => {
    win?.webContents.send("updater:event", {
      type: "download-progress",
      progress: progressObj,
    });
  });
  autoUpdater.on("update-downloaded", (info) => {
    win?.webContents.send("updater:event", { type: "update-downloaded", info });
  });

  ipcMain.handle("updater:check", () => autoUpdater.checkForUpdates());
  ipcMain.handle("updater:download", () => autoUpdater.downloadUpdate());
  ipcMain.handle("updater:quitAndInstall", () => autoUpdater.quitAndInstall());

  createWindow();
});
