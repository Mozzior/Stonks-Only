var k = Object.defineProperty;
var U = (e, t, r) => t in e ? k(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var V = (e, t, r) => U(e, typeof t != "symbol" ? t + "" : t, r);
import { app as h, BrowserWindow as L, ipcMain as T } from "electron";
import { fileURLToPath as x } from "node:url";
import E from "node:path";
import O from "node:fs";
import F from "fs";
import M from "path";
import B from "os";
import j from "crypto";
import q from "better-sqlite3";
function Y(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var d = { exports: {} };
const G = "16.6.1", J = {
  version: G
}, A = F, D = M, z = B, H = j, Q = J, m = Q.version, X = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function Z(e) {
  const t = {};
  let r = e.toString();
  r = r.replace(/\r\n?/mg, `
`);
  let n;
  for (; (n = X.exec(r)) != null; ) {
    const s = n[1];
    let o = n[2] || "";
    o = o.trim();
    const a = o[0];
    o = o.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), a === '"' && (o = o.replace(/\\n/g, `
`), o = o.replace(/\\r/g, "\r")), t[s] = o;
  }
  return t;
}
function ee(e) {
  e = e || {};
  const t = w(e);
  e.path = t;
  const r = l.configDotenv(e);
  if (!r.parsed) {
    const a = new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);
    throw a.code = "MISSING_DATA", a;
  }
  const n = C(e).split(","), s = n.length;
  let o;
  for (let a = 0; a < s; a++)
    try {
      const c = n[a].trim(), u = re(r, c);
      o = l.decrypt(u.ciphertext, u.key);
      break;
    } catch (c) {
      if (a + 1 >= s)
        throw c;
    }
  return l.parse(o);
}
function te(e) {
  console.log(`[dotenv@${m}][WARN] ${e}`);
}
function v(e) {
  console.log(`[dotenv@${m}][DEBUG] ${e}`);
}
function b(e) {
  console.log(`[dotenv@${m}] ${e}`);
}
function C(e) {
  return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function re(e, t) {
  let r;
  try {
    r = new URL(t);
  } catch (c) {
    if (c.code === "ERR_INVALID_URL") {
      const u = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw u.code = "INVALID_DOTENV_KEY", u;
    }
    throw c;
  }
  const n = r.password;
  if (!n) {
    const c = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw c.code = "INVALID_DOTENV_KEY", c;
  }
  const s = r.searchParams.get("environment");
  if (!s) {
    const c = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw c.code = "INVALID_DOTENV_KEY", c;
  }
  const o = `DOTENV_VAULT_${s.toUpperCase()}`, a = e.parsed[o];
  if (!a) {
    const c = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);
    throw c.code = "NOT_FOUND_DOTENV_ENVIRONMENT", c;
  }
  return { ciphertext: a, key: n };
}
function w(e) {
  let t = null;
  if (e && e.path && e.path.length > 0)
    if (Array.isArray(e.path))
      for (const r of e.path)
        A.existsSync(r) && (t = r.endsWith(".vault") ? r : `${r}.vault`);
    else
      t = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
  else
    t = D.resolve(process.cwd(), ".env.vault");
  return A.existsSync(t) ? t : null;
}
function y(e) {
  return e[0] === "~" ? D.join(z.homedir(), e.slice(1)) : e;
}
function ne(e) {
  const t = !!(e && e.debug), r = e && "quiet" in e ? e.quiet : !0;
  (t || !r) && b("Loading env from encrypted .env.vault");
  const n = l._parseVault(e);
  let s = process.env;
  return e && e.processEnv != null && (s = e.processEnv), l.populate(s, n, e), { parsed: n };
}
function oe(e) {
  const t = D.resolve(process.cwd(), ".env");
  let r = "utf8";
  const n = !!(e && e.debug), s = e && "quiet" in e ? e.quiet : !0;
  e && e.encoding ? r = e.encoding : n && v("No encoding is specified. UTF-8 is used by default");
  let o = [t];
  if (e && e.path)
    if (!Array.isArray(e.path))
      o = [y(e.path)];
    else {
      o = [];
      for (const I of e.path)
        o.push(y(I));
    }
  let a;
  const c = {};
  for (const I of o)
    try {
      const i = l.parse(A.readFileSync(I, { encoding: r }));
      l.populate(c, i, e);
    } catch (i) {
      n && v(`Failed to load ${I} ${i.message}`), a = i;
    }
  let u = process.env;
  if (e && e.processEnv != null && (u = e.processEnv), l.populate(u, c, e), n || !s) {
    const I = Object.keys(c).length, i = [];
    for (const P of o)
      try {
        const g = D.relative(process.cwd(), P);
        i.push(g);
      } catch (g) {
        n && v(`Failed to load ${P} ${g.message}`), a = g;
      }
    b(`injecting env (${I}) from ${i.join(",")}`);
  }
  return a ? { parsed: c, error: a } : { parsed: c };
}
function se(e) {
  if (C(e).length === 0)
    return l.configDotenv(e);
  const t = w(e);
  return t ? l._configVault(e) : (te(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`), l.configDotenv(e));
}
function ae(e, t) {
  const r = Buffer.from(t.slice(-64), "hex");
  let n = Buffer.from(e, "base64");
  const s = n.subarray(0, 12), o = n.subarray(-16);
  n = n.subarray(12, -16);
  try {
    const a = H.createDecipheriv("aes-256-gcm", r, s);
    return a.setAuthTag(o), `${a.update(n)}${a.final()}`;
  } catch (a) {
    const c = a instanceof RangeError, u = a.message === "Invalid key length", I = a.message === "Unsupported state or unable to authenticate data";
    if (c || u) {
      const i = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw i.code = "INVALID_DOTENV_KEY", i;
    } else if (I) {
      const i = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw i.code = "DECRYPTION_FAILED", i;
    } else
      throw a;
  }
}
function ce(e, t, r = {}) {
  const n = !!(r && r.debug), s = !!(r && r.override);
  if (typeof t != "object") {
    const o = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw o.code = "OBJECT_REQUIRED", o;
  }
  for (const o of Object.keys(t))
    Object.prototype.hasOwnProperty.call(e, o) ? (s === !0 && (e[o] = t[o]), n && v(s === !0 ? `"${o}" is already defined and WAS overwritten` : `"${o}" is already defined and was NOT overwritten`)) : e[o] = t[o];
}
const l = {
  configDotenv: oe,
  _configVault: ne,
  _parseVault: ee,
  config: se,
  decrypt: ae,
  parse: Z,
  populate: ce
};
d.exports.configDotenv = l.configDotenv;
d.exports._configVault = l._configVault;
d.exports._parseVault = l._parseVault;
d.exports.config = l.config;
d.exports.decrypt = l.decrypt;
d.exports.parse = l.parse;
d.exports.populate = l.populate;
d.exports = l;
var le = d.exports;
const ie = /* @__PURE__ */ Y(le);
let p = null;
function N() {
  if (!p)
    throw new Error("Database not initialized. Call initDB() first.");
  return p;
}
function Ee() {
  if (p) return p;
  const e = h.getPath("userData"), t = E.join(e, "database.sqlite"), r = E.dirname(t);
  O.existsSync(r) || O.mkdirSync(r, { recursive: !0 }), console.log(`Initializing database at: ${t}`);
  try {
    return p = new q(t, { verbose: console.log }), p.pragma("journal_mode = WAL"), p;
  } catch (n) {
    throw console.error("Failed to initialize database:", n), n;
  }
}
class _ {
  /**
   * Initialize the database and create tables if they don't exist.
   */
  static init() {
    this.db = Ee(), this.createTables();
  }
  static createTables() {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS app_storage (
        key TEXT PRIMARY KEY,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  /**
   * Execute a query that does not return data (INSERT, UPDATE, DELETE).
   */
  static run(t, r = []) {
    return N().prepare(t).run(...r);
  }
  /**
   * Execute a query that returns a single row.
   */
  static get(t, r = []) {
    return N().prepare(t).get(...r);
  }
  /**
   * Execute a query that returns multiple rows.
   */
  static all(t, r = []) {
    return N().prepare(t).all(...r);
  }
  // --- Convenience Methods for App Storage ---
  static setItem(t, r) {
    const n = JSON.stringify(r);
    return this.run(`
      INSERT INTO app_storage (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at;
    `, [t, n]);
  }
  static getItem(t) {
    const n = this.get("SELECT value FROM app_storage WHERE key = ?", [t]);
    if (n && n.value)
      try {
        return JSON.parse(n.value);
      } catch (s) {
        return console.error(`Error parsing value for key ${t}:`, s), null;
      }
    return null;
  }
  static deleteItem(t) {
    return this.run("DELETE FROM app_storage WHERE key = ?", [t]);
  }
  static getAllItems() {
    const r = this.all("SELECT key, value FROM app_storage"), n = {};
    for (const s of r)
      try {
        n[s.key] = JSON.parse(s.value);
      } catch {
        n[s.key] = s.value;
      }
    return n;
  }
}
V(_, "db", null);
const S = E.dirname(x(import.meta.url)), $ = E.join(S, "..");
{
  const e = process.env.NODE_ENV || (process.env.VITE_DEV_SERVER_URL ? "development" : "production"), t = [`.env.${e}.local`, `.env.${e}`, ".env.local", ".env"];
  for (const r of t) {
    const n = E.join($, r);
    O.existsSync(n) && ie.config({ path: n, override: !0 });
  }
}
process.env.APP_ROOT = $;
const R = process.env.VITE_DEV_SERVER_URL, De = E.join(process.env.APP_ROOT, "dist-electron"), W = E.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = R ? E.join(process.env.APP_ROOT, "public") : W;
let f;
function K() {
  f = new L({
    title: process.env.APP_NAME || "Stocks Only",
    icon: E.join(process.env.VITE_PUBLIC, "app-icon.png"),
    width: 1100,
    height: 750,
    minWidth: 1100,
    minHeight: 750,
    center: !0,
    webPreferences: {
      preload: E.join(S, "preload.mjs")
    }
  }), f.webContents.on("did-finish-load", () => {
    f == null || f.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), R ? f.loadURL(R) : f.loadFile(E.join(W, "index.html"));
}
h.on("window-all-closed", () => {
  process.platform !== "darwin" && (h.quit(), f = null);
});
h.on("activate", () => {
  L.getAllWindows().length === 0 && K();
});
h.whenReady().then(() => {
  try {
    _.init(), console.log("Database initialized successfully");
  } catch (e) {
    console.error("Failed to initialize database:", e);
  }
  T.on("env:getSync", (e) => {
    e.returnValue = {
      VITE_APPWRITE_ENDPOINT: process.env.VITE_APPWRITE_ENDPOINT,
      VITE_APPWRITE_PROJECT_ID: process.env.VITE_APPWRITE_PROJECT_ID,
      VITE_APPWRITE_DATABASE_ID: process.env.VITE_APPWRITE_DATABASE_ID,
      VITE_APPWRITE_AVATAR_BUCKET_ID: process.env.VITE_APPWRITE_AVATAR_BUCKET_ID,
      VITE_APPWRITE_USER_PROFILE_COLLECTION_ID: process.env.VITE_APPWRITE_USER_PROFILE_COLLECTION_ID,
      VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID: process.env.VITE_APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID,
      VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID: process.env.VITE_APPWRITE_TRAINING_SESSION_COLLECTION_ID,
      VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID: process.env.VITE_APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID,
      VITE_APPWRITE_STOCK_INFO_COLLECTION_ID: process.env.VITE_APPWRITE_STOCK_INFO_COLLECTION_ID,
      VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID: process.env.VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID
    };
  }), T.handle("db:run", (e, t, r) => _.run(t, r)), T.handle("db:get", (e, t, r) => _.get(t, r)), T.handle("db:all", (e, t, r) => _.all(t, r)), T.handle(
    "storage:set",
    (e, t, r) => _.setItem(t, r)
  ), T.handle("storage:get", (e, t) => _.getItem(t)), T.handle("storage:delete", (e, t) => _.deleteItem(t)), T.handle("storage:getAll", () => _.getAllItems()), K();
});
export {
  De as MAIN_DIST,
  W as RENDERER_DIST,
  R as VITE_DEV_SERVER_URL
};
