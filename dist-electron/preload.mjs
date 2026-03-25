"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
const env = electron.ipcRenderer.sendSync("env:getSync");
electron.contextBridge.exposeInMainWorld("env", env);
electron.contextBridge.exposeInMainWorld("db", {
  run: (sql, params = []) => electron.ipcRenderer.invoke("db:run", sql, params),
  get: (sql, params = []) => electron.ipcRenderer.invoke("db:get", sql, params),
  all: (sql, params = []) => electron.ipcRenderer.invoke("db:all", sql, params),
  storage: {
    set: (key, value) => electron.ipcRenderer.invoke("storage:set", key, value),
    get: (key) => electron.ipcRenderer.invoke("storage:get", key),
    delete: (key) => electron.ipcRenderer.invoke("storage:delete", key),
    getAll: () => electron.ipcRenderer.invoke("storage:getAll")
  }
});
electron.contextBridge.exposeInMainWorld("updater", {
  check: () => electron.ipcRenderer.invoke("updater:check"),
  download: () => electron.ipcRenderer.invoke("updater:download"),
  quitAndInstall: () => electron.ipcRenderer.invoke("updater:quitAndInstall"),
  onUpdateEvent: (callback) => {
    electron.ipcRenderer.on("updater:event", callback);
  },
  offUpdateEvent: (callback) => {
    electron.ipcRenderer.off("updater:event", callback);
  }
});
