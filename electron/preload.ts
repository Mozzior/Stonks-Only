import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

const env = ipcRenderer.sendSync("env:getSync");

contextBridge.exposeInMainWorld("env", env);

contextBridge.exposeInMainWorld("db", {
  run: (sql: string, params: any[] = []) =>
    ipcRenderer.invoke("db:run", sql, params),
  get: (sql: string, params: any[] = []) =>
    ipcRenderer.invoke("db:get", sql, params),
  all: (sql: string, params: any[] = []) =>
    ipcRenderer.invoke("db:all", sql, params),
  storage: {
    set: (key: string, value: any) =>
      ipcRenderer.invoke("storage:set", key, value),
    get: (key: string) => ipcRenderer.invoke("storage:get", key),
    delete: (key: string) => ipcRenderer.invoke("storage:delete", key),
    getAll: () => ipcRenderer.invoke("storage:getAll"),
  },
});
