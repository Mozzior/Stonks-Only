# SQLite3 Integration Plan

This plan outlines the steps to integrate SQLite3 into the Electron application for local data storage. We will use `better-sqlite3` for its performance and synchronous API, which is well-suited for Electron's main process.

## 1. Dependencies

- [ ] Install `better-sqlite3` as a runtime dependency.
- [ ] Install `@types/better-sqlite3` as a dev dependency for TypeScript support.
- [ ] Ensure `electron-builder` configuration supports native modules (should be automatic if in `dependencies`).

## 2. Configuration

- [ ] Modify `vite.config.ts` to externalize `better-sqlite3`. This prevents Vite from trying to bundle the native C++ module, which would cause errors.

## 3. Backend Implementation (Electron Main Process)

- [ ] Create directory `electron/database`.
- [ ] Create `electron/database/connection.ts`:
    -   Initialize the database connection.
    -   Store the database file in the user's data directory (`app.getPath('userData')`).
    -   Enable WAL mode for better concurrency/performance.
- [ ] Create `electron/database/manager.ts`:
    -   Implement a `DatabaseManager` class to encapsulate DB operations.
    -   Methods for `run` (insert/update/delete), `get` (select one), `all` (select many).
    -   Method to initialize tables (schema migration).
- [ ] Update `electron/main.ts`:
    -   Initialize the database on app launch.
    -   Register IPC handlers (`ipcMain.handle`) to expose database operations to the renderer process.
    -   Example channels: `db:run`, `db:get`, `db:all`.

## 4. Frontend Integration (Vue Renderer Process)

- [ ] Update `electron/preload.ts`:
    -   Expose the IPC methods securely via `contextBridge`.
    -   Define a type-safe API for the renderer.
- [ ] Create `src/utils/db.ts` (or `src/composables/useDatabase.ts`):
    -   A utility wrapper to call the exposed IPC methods.
    -   Provides a clean API for Vue components to use.

## 5. Verification

- [ ] Create a simple test table (e.g., `logs` or `settings`).
- [ ] Verify that data can be written and read from the Vue app.
- [ ] Verify that the database file persists across app restarts.
