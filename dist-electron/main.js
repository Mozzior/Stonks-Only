import { app as h, BrowserWindow as O } from "electron";
import { fileURLToPath as P } from "node:url";
import f from "node:path";
import L from "node:fs";
import k from "fs";
import x from "path";
import j from "os";
import K from "crypto";
function Y(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var d = { exports: {} };
const S = "16.6.1", U = {
  version: S
}, m = k, g = x, C = j, q = K, B = U, y = B.version, F = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function M(e) {
  const r = {};
  let n = e.toString();
  n = n.replace(/\r\n?/mg, `
`);
  let o;
  for (; (o = F.exec(n)) != null; ) {
    const i = o[1];
    let t = o[2] || "";
    t = t.trim();
    const s = t[0];
    t = t.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), s === '"' && (t = t.replace(/\\n/g, `
`), t = t.replace(/\\r/g, "\r")), r[i] = t;
  }
  return r;
}
function W(e) {
  e = e || {};
  const r = I(e);
  e.path = r;
  const n = a.configDotenv(e);
  if (!n.parsed) {
    const s = new Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);
    throw s.code = "MISSING_DATA", s;
  }
  const o = w(e).split(","), i = o.length;
  let t;
  for (let s = 0; s < i; s++)
    try {
      const c = o[s].trim(), u = J(n, c);
      t = a.decrypt(u.ciphertext, u.key);
      break;
    } catch (c) {
      if (s + 1 >= i)
        throw c;
    }
  return a.parse(t);
}
function G(e) {
  console.log(`[dotenv@${y}][WARN] ${e}`);
}
function v(e) {
  console.log(`[dotenv@${y}][DEBUG] ${e}`);
}
function T(e) {
  console.log(`[dotenv@${y}] ${e}`);
}
function w(e) {
  return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function J(e, r) {
  let n;
  try {
    n = new URL(r);
  } catch (c) {
    if (c.code === "ERR_INVALID_URL") {
      const u = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw u.code = "INVALID_DOTENV_KEY", u;
    }
    throw c;
  }
  const o = n.password;
  if (!o) {
    const c = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw c.code = "INVALID_DOTENV_KEY", c;
  }
  const i = n.searchParams.get("environment");
  if (!i) {
    const c = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw c.code = "INVALID_DOTENV_KEY", c;
  }
  const t = `DOTENV_VAULT_${i.toUpperCase()}`, s = e.parsed[t];
  if (!s) {
    const c = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${t} in your .env.vault file.`);
    throw c.code = "NOT_FOUND_DOTENV_ENVIRONMENT", c;
  }
  return { ciphertext: s, key: o };
}
function I(e) {
  let r = null;
  if (e && e.path && e.path.length > 0)
    if (Array.isArray(e.path))
      for (const n of e.path)
        m.existsSync(n) && (r = n.endsWith(".vault") ? n : `${n}.vault`);
    else
      r = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
  else
    r = g.resolve(process.cwd(), ".env.vault");
  return m.existsSync(r) ? r : null;
}
function N(e) {
  return e[0] === "~" ? g.join(C.homedir(), e.slice(1)) : e;
}
function Q(e) {
  const r = !!(e && e.debug), n = e && "quiet" in e ? e.quiet : !0;
  (r || !n) && T("Loading env from encrypted .env.vault");
  const o = a._parseVault(e);
  let i = process.env;
  return e && e.processEnv != null && (i = e.processEnv), a.populate(i, o, e), { parsed: o };
}
function H(e) {
  const r = g.resolve(process.cwd(), ".env");
  let n = "utf8";
  const o = !!(e && e.debug), i = e && "quiet" in e ? e.quiet : !0;
  e && e.encoding ? n = e.encoding : o && v("No encoding is specified. UTF-8 is used by default");
  let t = [r];
  if (e && e.path)
    if (!Array.isArray(e.path))
      t = [N(e.path)];
    else {
      t = [];
      for (const p of e.path)
        t.push(N(p));
    }
  let s;
  const c = {};
  for (const p of t)
    try {
      const l = a.parse(m.readFileSync(p, { encoding: n }));
      a.populate(c, l, e);
    } catch (l) {
      o && v(`Failed to load ${p} ${l.message}`), s = l;
    }
  let u = process.env;
  if (e && e.processEnv != null && (u = e.processEnv), a.populate(u, c, e), o || !i) {
    const p = Object.keys(c).length, l = [];
    for (const V of t)
      try {
        const _ = g.relative(process.cwd(), V);
        l.push(_);
      } catch (_) {
        o && v(`Failed to load ${V} ${_.message}`), s = _;
      }
    T(`injecting env (${p}) from ${l.join(",")}`);
  }
  return s ? { parsed: c, error: s } : { parsed: c };
}
function z(e) {
  if (w(e).length === 0)
    return a.configDotenv(e);
  const r = I(e);
  return r ? a._configVault(e) : (G(`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`), a.configDotenv(e));
}
function X(e, r) {
  const n = Buffer.from(r.slice(-64), "hex");
  let o = Buffer.from(e, "base64");
  const i = o.subarray(0, 12), t = o.subarray(-16);
  o = o.subarray(12, -16);
  try {
    const s = q.createDecipheriv("aes-256-gcm", n, i);
    return s.setAuthTag(t), `${s.update(o)}${s.final()}`;
  } catch (s) {
    const c = s instanceof RangeError, u = s.message === "Invalid key length", p = s.message === "Unsupported state or unable to authenticate data";
    if (c || u) {
      const l = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw l.code = "INVALID_DOTENV_KEY", l;
    } else if (p) {
      const l = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw l.code = "DECRYPTION_FAILED", l;
    } else
      throw s;
  }
}
function Z(e, r, n = {}) {
  const o = !!(n && n.debug), i = !!(n && n.override);
  if (typeof r != "object") {
    const t = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw t.code = "OBJECT_REQUIRED", t;
  }
  for (const t of Object.keys(r))
    Object.prototype.hasOwnProperty.call(e, t) ? (i === !0 && (e[t] = r[t]), o && v(i === !0 ? `"${t}" is already defined and WAS overwritten` : `"${t}" is already defined and was NOT overwritten`)) : e[t] = r[t];
}
const a = {
  configDotenv: H,
  _configVault: Q,
  _parseVault: W,
  config: z,
  decrypt: X,
  parse: M,
  populate: Z
};
d.exports.configDotenv = a.configDotenv;
d.exports._configVault = a._configVault;
d.exports._parseVault = a._parseVault;
d.exports.config = a.config;
d.exports.decrypt = a.decrypt;
d.exports.parse = a.parse;
d.exports.populate = a.populate;
d.exports = a;
var ee = d.exports;
const te = /* @__PURE__ */ Y(ee), $ = f.dirname(P(import.meta.url)), R = f.join($, "..");
{
  const e = process.env.NODE_ENV || (process.env.VITE_DEV_SERVER_URL ? "development" : "production"), r = [`.env.${e}.local`, `.env.${e}`, ".env.local", ".env"];
  for (const n of r) {
    const o = f.join(R, n);
    L.existsSync(o) && te.config({ path: o });
  }
}
process.env.APP_ROOT = R;
const D = process.env.VITE_DEV_SERVER_URL, ue = f.join(process.env.APP_ROOT, "dist-electron"), A = f.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = D ? f.join(process.env.APP_ROOT, "public") : A;
let E;
function b() {
  E = new O({
    title: process.env.APP_NAME || "Stocks Only Pro",
    icon: f.join(process.env.VITE_PUBLIC, "app-icon.png"),
    webPreferences: {
      preload: f.join($, "preload.mjs")
    }
  }), E.webContents.on("did-finish-load", () => {
    E == null || E.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), D ? E.loadURL(D) : E.loadFile(f.join(A, "index.html"));
}
h.on("window-all-closed", () => {
  process.platform !== "darwin" && (h.quit(), E = null);
});
h.on("activate", () => {
  O.getAllWindows().length === 0 && b();
});
h.whenReady().then(b);
export {
  ue as MAIN_DIST,
  A as RENDERER_DIST,
  D as VITE_DEV_SERVER_URL
};
