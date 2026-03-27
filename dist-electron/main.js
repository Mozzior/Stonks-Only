import Ut, { app as xn, BrowserWindow as Tl, ipcMain as pn } from "electron";
import { fileURLToPath as Yf } from "node:url";
import rt from "node:path";
import zf from "node:fs";
import it from "fs";
import te from "path";
import qr from "os";
import sr from "crypto";
import Xf from "constants";
import Vr from "stream";
import Io from "util";
import Al from "assert";
import Kn from "child_process";
import Cl from "events";
import Sl from "tty";
import wt from "url";
import Il from "zlib";
import Kf from "http";
var Se = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Jf(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ot = { exports: {} };
const Qf = "16.6.1", Zf = {
  version: Qf
}, so = it, Un = te, ed = qr, td = sr, rd = Zf, bo = rd.version, nd = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function id(e) {
  const t = {};
  let r = e.toString();
  r = r.replace(/\r\n?/mg, `
`);
  let n;
  for (; (n = nd.exec(r)) != null; ) {
    const i = n[1];
    let o = n[2] || "";
    o = o.trim();
    const a = o[0];
    o = o.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), a === '"' && (o = o.replace(/\\n/g, `
`), o = o.replace(/\\r/g, "\r")), t[i] = o;
  }
  return t;
}
function od(e) {
  e = e || {};
  const t = Rl(e);
  e.path = t;
  const r = ue.configDotenv(e);
  if (!r.parsed) {
    const a = new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);
    throw a.code = "MISSING_DATA", a;
  }
  const n = Ol(e).split(","), i = n.length;
  let o;
  for (let a = 0; a < i; a++)
    try {
      const s = n[a].trim(), l = sd(r, s);
      o = ue.decrypt(l.ciphertext, l.key);
      break;
    } catch (s) {
      if (a + 1 >= i)
        throw s;
    }
  return ue.parse(o);
}
function ad(e) {
  console.log(`[dotenv@${bo}][WARN] ${e}`);
}
function Cr(e) {
  console.log(`[dotenv@${bo}][DEBUG] ${e}`);
}
function bl(e) {
  console.log(`[dotenv@${bo}] ${e}`);
}
function Ol(e) {
  return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function sd(e, t) {
  let r;
  try {
    r = new URL(t);
  } catch (s) {
    if (s.code === "ERR_INVALID_URL") {
      const l = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw l.code = "INVALID_DOTENV_KEY", l;
    }
    throw s;
  }
  const n = r.password;
  if (!n) {
    const s = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw s.code = "INVALID_DOTENV_KEY", s;
  }
  const i = r.searchParams.get("environment");
  if (!i) {
    const s = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw s.code = "INVALID_DOTENV_KEY", s;
  }
  const o = `DOTENV_VAULT_${i.toUpperCase()}`, a = e.parsed[o];
  if (!a) {
    const s = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);
    throw s.code = "NOT_FOUND_DOTENV_ENVIRONMENT", s;
  }
  return { ciphertext: a, key: n };
}
function Rl(e) {
  let t = null;
  if (e && e.path && e.path.length > 0)
    if (Array.isArray(e.path))
      for (const r of e.path)
        so.existsSync(r) && (t = r.endsWith(".vault") ? r : `${r}.vault`);
    else
      t = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
  else
    t = Un.resolve(process.cwd(), ".env.vault");
  return so.existsSync(t) ? t : null;
}
function Ia(e) {
  return e[0] === "~" ? Un.join(ed.homedir(), e.slice(1)) : e;
}
function ld(e) {
  const t = !!(e && e.debug), r = e && "quiet" in e ? e.quiet : !0;
  (t || !r) && bl("Loading env from encrypted .env.vault");
  const n = ue._parseVault(e);
  let i = process.env;
  return e && e.processEnv != null && (i = e.processEnv), ue.populate(i, n, e), { parsed: n };
}
function cd(e) {
  const t = Un.resolve(process.cwd(), ".env");
  let r = "utf8";
  const n = !!(e && e.debug), i = e && "quiet" in e ? e.quiet : !0;
  e && e.encoding ? r = e.encoding : n && Cr("No encoding is specified. UTF-8 is used by default");
  let o = [t];
  if (e && e.path)
    if (!Array.isArray(e.path))
      o = [Ia(e.path)];
    else {
      o = [];
      for (const p of e.path)
        o.push(Ia(p));
    }
  let a;
  const s = {};
  for (const p of o)
    try {
      const c = ue.parse(so.readFileSync(p, { encoding: r }));
      ue.populate(s, c, e);
    } catch (c) {
      n && Cr(`Failed to load ${p} ${c.message}`), a = c;
    }
  let l = process.env;
  if (e && e.processEnv != null && (l = e.processEnv), ue.populate(l, s, e), n || !i) {
    const p = Object.keys(s).length, c = [];
    for (const f of o)
      try {
        const d = Un.relative(process.cwd(), f);
        c.push(d);
      } catch (d) {
        n && Cr(`Failed to load ${f} ${d.message}`), a = d;
      }
    bl(`injecting env (${p}) from ${c.join(",")}`);
  }
  return a ? { parsed: s, error: a } : { parsed: s };
}
function ud(e) {
  if (Ol(e).length === 0)
    return ue.configDotenv(e);
  const t = Rl(e);
  return t ? ue._configVault(e) : (ad(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`), ue.configDotenv(e));
}
function fd(e, t) {
  const r = Buffer.from(t.slice(-64), "hex");
  let n = Buffer.from(e, "base64");
  const i = n.subarray(0, 12), o = n.subarray(-16);
  n = n.subarray(12, -16);
  try {
    const a = td.createDecipheriv("aes-256-gcm", r, i);
    return a.setAuthTag(o), `${a.update(n)}${a.final()}`;
  } catch (a) {
    const s = a instanceof RangeError, l = a.message === "Invalid key length", p = a.message === "Unsupported state or unable to authenticate data";
    if (s || l) {
      const c = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw c.code = "INVALID_DOTENV_KEY", c;
    } else if (p) {
      const c = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw c.code = "DECRYPTION_FAILED", c;
    } else
      throw a;
  }
}
function dd(e, t, r = {}) {
  const n = !!(r && r.debug), i = !!(r && r.override);
  if (typeof t != "object") {
    const o = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw o.code = "OBJECT_REQUIRED", o;
  }
  for (const o of Object.keys(t))
    Object.prototype.hasOwnProperty.call(e, o) ? (i === !0 && (e[o] = t[o]), n && Cr(i === !0 ? `"${o}" is already defined and WAS overwritten` : `"${o}" is already defined and was NOT overwritten`)) : e[o] = t[o];
}
const ue = {
  configDotenv: cd,
  _configVault: ld,
  _parseVault: od,
  config: ud,
  decrypt: fd,
  parse: id,
  populate: dd
};
ot.exports.configDotenv = ue.configDotenv;
ot.exports._configVault = ue._configVault;
ot.exports._parseVault = ue._parseVault;
ot.exports.config = ue.config;
ot.exports.decrypt = ue.decrypt;
ot.exports.parse = ue.parse;
ot.exports.populate = ue.populate;
ot.exports = ue;
var hd = ot.exports;
const pd = /* @__PURE__ */ Jf(hd);
var ke = {}, Mt = {}, Oe = {};
Oe.fromCallback = function(e) {
  return Object.defineProperty(function(...t) {
    if (typeof t[t.length - 1] == "function") e.apply(this, t);
    else
      return new Promise((r, n) => {
        t.push((i, o) => i != null ? n(i) : r(o)), e.apply(this, t);
      });
  }, "name", { value: e.name });
};
Oe.fromPromise = function(e) {
  return Object.defineProperty(function(...t) {
    const r = t[t.length - 1];
    if (typeof r != "function") return e.apply(this, t);
    t.pop(), e.apply(this, t).then((n) => r(null, n), r);
  }, "name", { value: e.name });
};
var ut = Xf, md = process.cwd, Dn = null, gd = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return Dn || (Dn = md.call(process)), Dn;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var ba = process.chdir;
  process.chdir = function(e) {
    Dn = null, ba.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, ba);
}
var Ed = yd;
function yd(e) {
  ut.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && t(e), e.lutimes || r(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = n(e.chmod), e.fchmod = n(e.fchmod), e.lchmod = n(e.lchmod), e.chownSync = a(e.chownSync), e.fchownSync = a(e.fchownSync), e.lchownSync = a(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = s(e.stat), e.fstat = s(e.fstat), e.lstat = s(e.lstat), e.statSync = l(e.statSync), e.fstatSync = l(e.fstatSync), e.lstatSync = l(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(c, f, d) {
    d && process.nextTick(d);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(c, f, d, g) {
    g && process.nextTick(g);
  }, e.lchownSync = function() {
  }), gd === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(c) {
    function f(d, g, v) {
      var y = Date.now(), T = 0;
      c(d, g, function C(A) {
        if (A && (A.code === "EACCES" || A.code === "EPERM" || A.code === "EBUSY") && Date.now() - y < 6e4) {
          setTimeout(function() {
            e.stat(g, function(D, L) {
              D && D.code === "ENOENT" ? c(d, g, C) : v(A);
            });
          }, T), T < 100 && (T += 10);
          return;
        }
        v && v(A);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, c), f;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(c) {
    function f(d, g, v, y, T, C) {
      var A;
      if (C && typeof C == "function") {
        var D = 0;
        A = function(L, ee, ae) {
          if (L && L.code === "EAGAIN" && D < 10)
            return D++, c.call(e, d, g, v, y, T, A);
          C.apply(this, arguments);
        };
      }
      return c.call(e, d, g, v, y, T, A);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, c), f;
  }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(c) {
    return function(f, d, g, v, y) {
      for (var T = 0; ; )
        try {
          return c.call(e, f, d, g, v, y);
        } catch (C) {
          if (C.code === "EAGAIN" && T < 10) {
            T++;
            continue;
          }
          throw C;
        }
    };
  }(e.readSync);
  function t(c) {
    c.lchmod = function(f, d, g) {
      c.open(
        f,
        ut.O_WRONLY | ut.O_SYMLINK,
        d,
        function(v, y) {
          if (v) {
            g && g(v);
            return;
          }
          c.fchmod(y, d, function(T) {
            c.close(y, function(C) {
              g && g(T || C);
            });
          });
        }
      );
    }, c.lchmodSync = function(f, d) {
      var g = c.openSync(f, ut.O_WRONLY | ut.O_SYMLINK, d), v = !0, y;
      try {
        y = c.fchmodSync(g, d), v = !1;
      } finally {
        if (v)
          try {
            c.closeSync(g);
          } catch {
          }
        else
          c.closeSync(g);
      }
      return y;
    };
  }
  function r(c) {
    ut.hasOwnProperty("O_SYMLINK") && c.futimes ? (c.lutimes = function(f, d, g, v) {
      c.open(f, ut.O_SYMLINK, function(y, T) {
        if (y) {
          v && v(y);
          return;
        }
        c.futimes(T, d, g, function(C) {
          c.close(T, function(A) {
            v && v(C || A);
          });
        });
      });
    }, c.lutimesSync = function(f, d, g) {
      var v = c.openSync(f, ut.O_SYMLINK), y, T = !0;
      try {
        y = c.futimesSync(v, d, g), T = !1;
      } finally {
        if (T)
          try {
            c.closeSync(v);
          } catch {
          }
        else
          c.closeSync(v);
      }
      return y;
    }) : c.futimes && (c.lutimes = function(f, d, g, v) {
      v && process.nextTick(v);
    }, c.lutimesSync = function() {
    });
  }
  function n(c) {
    return c && function(f, d, g) {
      return c.call(e, f, d, function(v) {
        p(v) && (v = null), g && g.apply(this, arguments);
      });
    };
  }
  function i(c) {
    return c && function(f, d) {
      try {
        return c.call(e, f, d);
      } catch (g) {
        if (!p(g)) throw g;
      }
    };
  }
  function o(c) {
    return c && function(f, d, g, v) {
      return c.call(e, f, d, g, function(y) {
        p(y) && (y = null), v && v.apply(this, arguments);
      });
    };
  }
  function a(c) {
    return c && function(f, d, g) {
      try {
        return c.call(e, f, d, g);
      } catch (v) {
        if (!p(v)) throw v;
      }
    };
  }
  function s(c) {
    return c && function(f, d, g) {
      typeof d == "function" && (g = d, d = null);
      function v(y, T) {
        T && (T.uid < 0 && (T.uid += 4294967296), T.gid < 0 && (T.gid += 4294967296)), g && g.apply(this, arguments);
      }
      return d ? c.call(e, f, d, v) : c.call(e, f, v);
    };
  }
  function l(c) {
    return c && function(f, d) {
      var g = d ? c.call(e, f, d) : c.call(e, f);
      return g && (g.uid < 0 && (g.uid += 4294967296), g.gid < 0 && (g.gid += 4294967296)), g;
    };
  }
  function p(c) {
    if (!c || c.code === "ENOSYS")
      return !0;
    var f = !process.getuid || process.getuid() !== 0;
    return !!(f && (c.code === "EINVAL" || c.code === "EPERM"));
  }
}
var Oa = Vr.Stream, vd = _d;
function _d(e) {
  return {
    ReadStream: t,
    WriteStream: r
  };
  function t(n, i) {
    if (!(this instanceof t)) return new t(n, i);
    Oa.call(this);
    var o = this;
    this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
    for (var a = Object.keys(i), s = 0, l = a.length; s < l; s++) {
      var p = a[s];
      this[p] = i[p];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        o._read();
      });
      return;
    }
    e.open(this.path, this.flags, this.mode, function(c, f) {
      if (c) {
        o.emit("error", c), o.readable = !1;
        return;
      }
      o.fd = f, o.emit("open", f), o._read();
    });
  }
  function r(n, i) {
    if (!(this instanceof r)) return new r(n, i);
    Oa.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
    for (var o = Object.keys(i), a = 0, s = o.length; a < s; a++) {
      var l = o[a];
      this[l] = i[l];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = e.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var wd = Ad, Td = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function Ad(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var t = { __proto__: Td(e) };
  else
    var t = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(r) {
    Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(e, r));
  }), t;
}
var ne = it, Cd = Ed, Sd = vd, Id = wd, mn = Io, Ee, kn;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (Ee = Symbol.for("graceful-fs.queue"), kn = Symbol.for("graceful-fs.previous")) : (Ee = "___graceful-fs.queue", kn = "___graceful-fs.previous");
function bd() {
}
function Nl(e, t) {
  Object.defineProperty(e, Ee, {
    get: function() {
      return t;
    }
  });
}
var Lt = bd;
mn.debuglog ? Lt = mn.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Lt = function() {
  var e = mn.format.apply(mn, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!ne[Ee]) {
  var Od = Se[Ee] || [];
  Nl(ne, Od), ne.close = function(e) {
    function t(r, n) {
      return e.call(ne, r, function(i) {
        i || Ra(), typeof n == "function" && n.apply(this, arguments);
      });
    }
    return Object.defineProperty(t, kn, {
      value: e
    }), t;
  }(ne.close), ne.closeSync = function(e) {
    function t(r) {
      e.apply(ne, arguments), Ra();
    }
    return Object.defineProperty(t, kn, {
      value: e
    }), t;
  }(ne.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    Lt(ne[Ee]), Al.equal(ne[Ee].length, 0);
  });
}
Se[Ee] || Nl(Se, ne[Ee]);
var Re = Oo(Id(ne));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !ne.__patched && (Re = Oo(ne), ne.__patched = !0);
function Oo(e) {
  Cd(e), e.gracefulify = Oo, e.createReadStream = ee, e.createWriteStream = ae;
  var t = e.readFile;
  e.readFile = r;
  function r(E, G, B) {
    return typeof G == "function" && (B = G, G = null), M(E, G, B);
    function M(z, R, b, P) {
      return t(z, R, function(I) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? qt([M, [z, R, b], I, P || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var n = e.writeFile;
  e.writeFile = i;
  function i(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), z(E, G, B, M);
    function z(R, b, P, I, $) {
      return n(R, b, P, function(N) {
        N && (N.code === "EMFILE" || N.code === "ENFILE") ? qt([z, [R, b, P, I], N, $ || Date.now(), Date.now()]) : typeof I == "function" && I.apply(this, arguments);
      });
    }
  }
  var o = e.appendFile;
  o && (e.appendFile = a);
  function a(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), z(E, G, B, M);
    function z(R, b, P, I, $) {
      return o(R, b, P, function(N) {
        N && (N.code === "EMFILE" || N.code === "ENFILE") ? qt([z, [R, b, P, I], N, $ || Date.now(), Date.now()]) : typeof I == "function" && I.apply(this, arguments);
      });
    }
  }
  var s = e.copyFile;
  s && (e.copyFile = l);
  function l(E, G, B, M) {
    return typeof B == "function" && (M = B, B = 0), z(E, G, B, M);
    function z(R, b, P, I, $) {
      return s(R, b, P, function(N) {
        N && (N.code === "EMFILE" || N.code === "ENFILE") ? qt([z, [R, b, P, I], N, $ || Date.now(), Date.now()]) : typeof I == "function" && I.apply(this, arguments);
      });
    }
  }
  var p = e.readdir;
  e.readdir = f;
  var c = /^v[0-5]\./;
  function f(E, G, B) {
    typeof G == "function" && (B = G, G = null);
    var M = c.test(process.version) ? function(b, P, I, $) {
      return p(b, z(
        b,
        P,
        I,
        $
      ));
    } : function(b, P, I, $) {
      return p(b, P, z(
        b,
        P,
        I,
        $
      ));
    };
    return M(E, G, B);
    function z(R, b, P, I) {
      return function($, N) {
        $ && ($.code === "EMFILE" || $.code === "ENFILE") ? qt([
          M,
          [R, b, P],
          $,
          I || Date.now(),
          Date.now()
        ]) : (N && N.sort && N.sort(), typeof P == "function" && P.call(this, $, N));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var d = Sd(e);
    C = d.ReadStream, D = d.WriteStream;
  }
  var g = e.ReadStream;
  g && (C.prototype = Object.create(g.prototype), C.prototype.open = A);
  var v = e.WriteStream;
  v && (D.prototype = Object.create(v.prototype), D.prototype.open = L), Object.defineProperty(e, "ReadStream", {
    get: function() {
      return C;
    },
    set: function(E) {
      C = E;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "WriteStream", {
    get: function() {
      return D;
    },
    set: function(E) {
      D = E;
    },
    enumerable: !0,
    configurable: !0
  });
  var y = C;
  Object.defineProperty(e, "FileReadStream", {
    get: function() {
      return y;
    },
    set: function(E) {
      y = E;
    },
    enumerable: !0,
    configurable: !0
  });
  var T = D;
  Object.defineProperty(e, "FileWriteStream", {
    get: function() {
      return T;
    },
    set: function(E) {
      T = E;
    },
    enumerable: !0,
    configurable: !0
  });
  function C(E, G) {
    return this instanceof C ? (g.apply(this, arguments), this) : C.apply(Object.create(C.prototype), arguments);
  }
  function A() {
    var E = this;
    Fe(E.path, E.flags, E.mode, function(G, B) {
      G ? (E.autoClose && E.destroy(), E.emit("error", G)) : (E.fd = B, E.emit("open", B), E.read());
    });
  }
  function D(E, G) {
    return this instanceof D ? (v.apply(this, arguments), this) : D.apply(Object.create(D.prototype), arguments);
  }
  function L() {
    var E = this;
    Fe(E.path, E.flags, E.mode, function(G, B) {
      G ? (E.destroy(), E.emit("error", G)) : (E.fd = B, E.emit("open", B));
    });
  }
  function ee(E, G) {
    return new e.ReadStream(E, G);
  }
  function ae(E, G) {
    return new e.WriteStream(E, G);
  }
  var W = e.open;
  e.open = Fe;
  function Fe(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), z(E, G, B, M);
    function z(R, b, P, I, $) {
      return W(R, b, P, function(N, k) {
        N && (N.code === "EMFILE" || N.code === "ENFILE") ? qt([z, [R, b, P, I], N, $ || Date.now(), Date.now()]) : typeof I == "function" && I.apply(this, arguments);
      });
    }
  }
  return e;
}
function qt(e) {
  Lt("ENQUEUE", e[0].name, e[1]), ne[Ee].push(e), Ro();
}
var gn;
function Ra() {
  for (var e = Date.now(), t = 0; t < ne[Ee].length; ++t)
    ne[Ee][t].length > 2 && (ne[Ee][t][3] = e, ne[Ee][t][4] = e);
  Ro();
}
function Ro() {
  if (clearTimeout(gn), gn = void 0, ne[Ee].length !== 0) {
    var e = ne[Ee].shift(), t = e[0], r = e[1], n = e[2], i = e[3], o = e[4];
    if (i === void 0)
      Lt("RETRY", t.name, r), t.apply(null, r);
    else if (Date.now() - i >= 6e4) {
      Lt("TIMEOUT", t.name, r);
      var a = r.pop();
      typeof a == "function" && a.call(null, n);
    } else {
      var s = Date.now() - o, l = Math.max(o - i, 1), p = Math.min(l * 1.2, 100);
      s >= p ? (Lt("RETRY", t.name, r), t.apply(null, r.concat([i]))) : ne[Ee].push(e);
    }
    gn === void 0 && (gn = setTimeout(Ro, 0));
  }
}
(function(e) {
  const t = Oe.fromCallback, r = Re, n = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((i) => typeof r[i] == "function");
  Object.assign(e, r), n.forEach((i) => {
    e[i] = t(r[i]);
  }), e.exists = function(i, o) {
    return typeof o == "function" ? r.exists(i, o) : new Promise((a) => r.exists(i, a));
  }, e.read = function(i, o, a, s, l, p) {
    return typeof p == "function" ? r.read(i, o, a, s, l, p) : new Promise((c, f) => {
      r.read(i, o, a, s, l, (d, g, v) => {
        if (d) return f(d);
        c({ bytesRead: g, buffer: v });
      });
    });
  }, e.write = function(i, o, ...a) {
    return typeof a[a.length - 1] == "function" ? r.write(i, o, ...a) : new Promise((s, l) => {
      r.write(i, o, ...a, (p, c, f) => {
        if (p) return l(p);
        s({ bytesWritten: c, buffer: f });
      });
    });
  }, typeof r.writev == "function" && (e.writev = function(i, o, ...a) {
    return typeof a[a.length - 1] == "function" ? r.writev(i, o, ...a) : new Promise((s, l) => {
      r.writev(i, o, ...a, (p, c, f) => {
        if (p) return l(p);
        s({ bytesWritten: c, buffers: f });
      });
    });
  }), typeof r.realpath.native == "function" ? e.realpath.native = t(r.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(Mt);
var No = {}, Pl = {};
const Rd = te;
Pl.checkPath = function(t) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(t.replace(Rd.parse(t).root, ""))) {
    const n = new Error(`Path contains invalid characters: ${t}`);
    throw n.code = "EINVAL", n;
  }
};
const Dl = Mt, { checkPath: $l } = Pl, Fl = (e) => {
  const t = { mode: 511 };
  return typeof e == "number" ? e : { ...t, ...e }.mode;
};
No.makeDir = async (e, t) => ($l(e), Dl.mkdir(e, {
  mode: Fl(t),
  recursive: !0
}));
No.makeDirSync = (e, t) => ($l(e), Dl.mkdirSync(e, {
  mode: Fl(t),
  recursive: !0
}));
const Nd = Oe.fromPromise, { makeDir: Pd, makeDirSync: bi } = No, Oi = Nd(Pd);
var Qe = {
  mkdirs: Oi,
  mkdirsSync: bi,
  // alias
  mkdirp: Oi,
  mkdirpSync: bi,
  ensureDir: Oi,
  ensureDirSync: bi
};
const Dd = Oe.fromPromise, Ll = Mt;
function $d(e) {
  return Ll.access(e).then(() => !0).catch(() => !1);
}
var Bt = {
  pathExists: Dd($d),
  pathExistsSync: Ll.existsSync
};
const tr = Re;
function Fd(e, t, r, n) {
  tr.open(e, "r+", (i, o) => {
    if (i) return n(i);
    tr.futimes(o, t, r, (a) => {
      tr.close(o, (s) => {
        n && n(a || s);
      });
    });
  });
}
function Ld(e, t, r) {
  const n = tr.openSync(e, "r+");
  return tr.futimesSync(n, t, r), tr.closeSync(n);
}
var xl = {
  utimesMillis: Fd,
  utimesMillisSync: Ld
};
const nr = Mt, pe = te, xd = Io;
function Ud(e, t, r) {
  const n = r.dereference ? (i) => nr.stat(i, { bigint: !0 }) : (i) => nr.lstat(i, { bigint: !0 });
  return Promise.all([
    n(e),
    n(t).catch((i) => {
      if (i.code === "ENOENT") return null;
      throw i;
    })
  ]).then(([i, o]) => ({ srcStat: i, destStat: o }));
}
function kd(e, t, r) {
  let n;
  const i = r.dereference ? (a) => nr.statSync(a, { bigint: !0 }) : (a) => nr.lstatSync(a, { bigint: !0 }), o = i(e);
  try {
    n = i(t);
  } catch (a) {
    if (a.code === "ENOENT") return { srcStat: o, destStat: null };
    throw a;
  }
  return { srcStat: o, destStat: n };
}
function Md(e, t, r, n, i) {
  xd.callbackify(Ud)(e, t, n, (o, a) => {
    if (o) return i(o);
    const { srcStat: s, destStat: l } = a;
    if (l) {
      if (Wr(s, l)) {
        const p = pe.basename(e), c = pe.basename(t);
        return r === "move" && p !== c && p.toLowerCase() === c.toLowerCase() ? i(null, { srcStat: s, destStat: l, isChangingCase: !0 }) : i(new Error("Source and destination must not be the same."));
      }
      if (s.isDirectory() && !l.isDirectory())
        return i(new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`));
      if (!s.isDirectory() && l.isDirectory())
        return i(new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`));
    }
    return s.isDirectory() && Po(e, t) ? i(new Error(Jn(e, t, r))) : i(null, { srcStat: s, destStat: l });
  });
}
function Bd(e, t, r, n) {
  const { srcStat: i, destStat: o } = kd(e, t, n);
  if (o) {
    if (Wr(i, o)) {
      const a = pe.basename(e), s = pe.basename(t);
      if (r === "move" && a !== s && a.toLowerCase() === s.toLowerCase())
        return { srcStat: i, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!i.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && Po(e, t))
    throw new Error(Jn(e, t, r));
  return { srcStat: i, destStat: o };
}
function Ul(e, t, r, n, i) {
  const o = pe.resolve(pe.dirname(e)), a = pe.resolve(pe.dirname(r));
  if (a === o || a === pe.parse(a).root) return i();
  nr.stat(a, { bigint: !0 }, (s, l) => s ? s.code === "ENOENT" ? i() : i(s) : Wr(t, l) ? i(new Error(Jn(e, r, n))) : Ul(e, t, a, n, i));
}
function kl(e, t, r, n) {
  const i = pe.resolve(pe.dirname(e)), o = pe.resolve(pe.dirname(r));
  if (o === i || o === pe.parse(o).root) return;
  let a;
  try {
    a = nr.statSync(o, { bigint: !0 });
  } catch (s) {
    if (s.code === "ENOENT") return;
    throw s;
  }
  if (Wr(t, a))
    throw new Error(Jn(e, r, n));
  return kl(e, t, o, n);
}
function Wr(e, t) {
  return t.ino && t.dev && t.ino === e.ino && t.dev === e.dev;
}
function Po(e, t) {
  const r = pe.resolve(e).split(pe.sep).filter((i) => i), n = pe.resolve(t).split(pe.sep).filter((i) => i);
  return r.reduce((i, o, a) => i && n[a] === o, !0);
}
function Jn(e, t, r) {
  return `Cannot ${r} '${e}' to a subdirectory of itself, '${t}'.`;
}
var lr = {
  checkPaths: Md,
  checkPathsSync: Bd,
  checkParentPaths: Ul,
  checkParentPathsSync: kl,
  isSrcSubdir: Po,
  areIdentical: Wr
};
const De = Re, Rr = te, jd = Qe.mkdirs, Hd = Bt.pathExists, Gd = xl.utimesMillis, Nr = lr;
function qd(e, t, r, n) {
  typeof r == "function" && !n ? (n = r, r = {}) : typeof r == "function" && (r = { filter: r }), n = n || function() {
  }, r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), Nr.checkPaths(e, t, "copy", r, (i, o) => {
    if (i) return n(i);
    const { srcStat: a, destStat: s } = o;
    Nr.checkParentPaths(e, a, t, "copy", (l) => l ? n(l) : r.filter ? Ml(Na, s, e, t, r, n) : Na(s, e, t, r, n));
  });
}
function Na(e, t, r, n, i) {
  const o = Rr.dirname(r);
  Hd(o, (a, s) => {
    if (a) return i(a);
    if (s) return Mn(e, t, r, n, i);
    jd(o, (l) => l ? i(l) : Mn(e, t, r, n, i));
  });
}
function Ml(e, t, r, n, i, o) {
  Promise.resolve(i.filter(r, n)).then((a) => a ? e(t, r, n, i, o) : o(), (a) => o(a));
}
function Vd(e, t, r, n, i) {
  return n.filter ? Ml(Mn, e, t, r, n, i) : Mn(e, t, r, n, i);
}
function Mn(e, t, r, n, i) {
  (n.dereference ? De.stat : De.lstat)(t, (a, s) => a ? i(a) : s.isDirectory() ? Qd(s, e, t, r, n, i) : s.isFile() || s.isCharacterDevice() || s.isBlockDevice() ? Wd(s, e, t, r, n, i) : s.isSymbolicLink() ? th(e, t, r, n, i) : s.isSocket() ? i(new Error(`Cannot copy a socket file: ${t}`)) : s.isFIFO() ? i(new Error(`Cannot copy a FIFO pipe: ${t}`)) : i(new Error(`Unknown file: ${t}`)));
}
function Wd(e, t, r, n, i, o) {
  return t ? Yd(e, r, n, i, o) : Bl(e, r, n, i, o);
}
function Yd(e, t, r, n, i) {
  if (n.overwrite)
    De.unlink(r, (o) => o ? i(o) : Bl(e, t, r, n, i));
  else return n.errorOnExist ? i(new Error(`'${r}' already exists`)) : i();
}
function Bl(e, t, r, n, i) {
  De.copyFile(t, r, (o) => o ? i(o) : n.preserveTimestamps ? zd(e.mode, t, r, i) : Qn(r, e.mode, i));
}
function zd(e, t, r, n) {
  return Xd(e) ? Kd(r, e, (i) => i ? n(i) : Pa(e, t, r, n)) : Pa(e, t, r, n);
}
function Xd(e) {
  return (e & 128) === 0;
}
function Kd(e, t, r) {
  return Qn(e, t | 128, r);
}
function Pa(e, t, r, n) {
  Jd(t, r, (i) => i ? n(i) : Qn(r, e, n));
}
function Qn(e, t, r) {
  return De.chmod(e, t, r);
}
function Jd(e, t, r) {
  De.stat(e, (n, i) => n ? r(n) : Gd(t, i.atime, i.mtime, r));
}
function Qd(e, t, r, n, i, o) {
  return t ? jl(r, n, i, o) : Zd(e.mode, r, n, i, o);
}
function Zd(e, t, r, n, i) {
  De.mkdir(r, (o) => {
    if (o) return i(o);
    jl(t, r, n, (a) => a ? i(a) : Qn(r, e, i));
  });
}
function jl(e, t, r, n) {
  De.readdir(e, (i, o) => i ? n(i) : Hl(o, e, t, r, n));
}
function Hl(e, t, r, n, i) {
  const o = e.pop();
  return o ? eh(e, o, t, r, n, i) : i();
}
function eh(e, t, r, n, i, o) {
  const a = Rr.join(r, t), s = Rr.join(n, t);
  Nr.checkPaths(a, s, "copy", i, (l, p) => {
    if (l) return o(l);
    const { destStat: c } = p;
    Vd(c, a, s, i, (f) => f ? o(f) : Hl(e, r, n, i, o));
  });
}
function th(e, t, r, n, i) {
  De.readlink(t, (o, a) => {
    if (o) return i(o);
    if (n.dereference && (a = Rr.resolve(process.cwd(), a)), e)
      De.readlink(r, (s, l) => s ? s.code === "EINVAL" || s.code === "UNKNOWN" ? De.symlink(a, r, i) : i(s) : (n.dereference && (l = Rr.resolve(process.cwd(), l)), Nr.isSrcSubdir(a, l) ? i(new Error(`Cannot copy '${a}' to a subdirectory of itself, '${l}'.`)) : e.isDirectory() && Nr.isSrcSubdir(l, a) ? i(new Error(`Cannot overwrite '${l}' with '${a}'.`)) : rh(a, r, i)));
    else
      return De.symlink(a, r, i);
  });
}
function rh(e, t, r) {
  De.unlink(t, (n) => n ? r(n) : De.symlink(e, t, r));
}
var nh = qd;
const we = Re, Pr = te, ih = Qe.mkdirsSync, oh = xl.utimesMillisSync, Dr = lr;
function ah(e, t, r) {
  typeof r == "function" && (r = { filter: r }), r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: n, destStat: i } = Dr.checkPathsSync(e, t, "copy", r);
  return Dr.checkParentPathsSync(e, n, t, "copy"), sh(i, e, t, r);
}
function sh(e, t, r, n) {
  if (n.filter && !n.filter(t, r)) return;
  const i = Pr.dirname(r);
  return we.existsSync(i) || ih(i), Gl(e, t, r, n);
}
function lh(e, t, r, n) {
  if (!(n.filter && !n.filter(t, r)))
    return Gl(e, t, r, n);
}
function Gl(e, t, r, n) {
  const o = (n.dereference ? we.statSync : we.lstatSync)(t);
  if (o.isDirectory()) return mh(o, e, t, r, n);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return ch(o, e, t, r, n);
  if (o.isSymbolicLink()) return yh(e, t, r, n);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
function ch(e, t, r, n, i) {
  return t ? uh(e, r, n, i) : ql(e, r, n, i);
}
function uh(e, t, r, n) {
  if (n.overwrite)
    return we.unlinkSync(r), ql(e, t, r, n);
  if (n.errorOnExist)
    throw new Error(`'${r}' already exists`);
}
function ql(e, t, r, n) {
  return we.copyFileSync(t, r), n.preserveTimestamps && fh(e.mode, t, r), Do(r, e.mode);
}
function fh(e, t, r) {
  return dh(e) && hh(r, e), ph(t, r);
}
function dh(e) {
  return (e & 128) === 0;
}
function hh(e, t) {
  return Do(e, t | 128);
}
function Do(e, t) {
  return we.chmodSync(e, t);
}
function ph(e, t) {
  const r = we.statSync(e);
  return oh(t, r.atime, r.mtime);
}
function mh(e, t, r, n, i) {
  return t ? Vl(r, n, i) : gh(e.mode, r, n, i);
}
function gh(e, t, r, n) {
  return we.mkdirSync(r), Vl(t, r, n), Do(r, e);
}
function Vl(e, t, r) {
  we.readdirSync(e).forEach((n) => Eh(n, e, t, r));
}
function Eh(e, t, r, n) {
  const i = Pr.join(t, e), o = Pr.join(r, e), { destStat: a } = Dr.checkPathsSync(i, o, "copy", n);
  return lh(a, i, o, n);
}
function yh(e, t, r, n) {
  let i = we.readlinkSync(t);
  if (n.dereference && (i = Pr.resolve(process.cwd(), i)), e) {
    let o;
    try {
      o = we.readlinkSync(r);
    } catch (a) {
      if (a.code === "EINVAL" || a.code === "UNKNOWN") return we.symlinkSync(i, r);
      throw a;
    }
    if (n.dereference && (o = Pr.resolve(process.cwd(), o)), Dr.isSrcSubdir(i, o))
      throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${o}'.`);
    if (we.statSync(r).isDirectory() && Dr.isSrcSubdir(o, i))
      throw new Error(`Cannot overwrite '${o}' with '${i}'.`);
    return vh(i, r);
  } else
    return we.symlinkSync(i, r);
}
function vh(e, t) {
  return we.unlinkSync(t), we.symlinkSync(e, t);
}
var _h = ah;
const wh = Oe.fromCallback;
var $o = {
  copy: wh(nh),
  copySync: _h
};
const Da = Re, Wl = te, K = Al, $r = process.platform === "win32";
function Yl(e) {
  [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((r) => {
    e[r] = e[r] || Da[r], r = r + "Sync", e[r] = e[r] || Da[r];
  }), e.maxBusyTries = e.maxBusyTries || 3;
}
function Fo(e, t, r) {
  let n = 0;
  typeof t == "function" && (r = t, t = {}), K(e, "rimraf: missing path"), K.strictEqual(typeof e, "string", "rimraf: path should be a string"), K.strictEqual(typeof r, "function", "rimraf: callback function required"), K(t, "rimraf: invalid options argument provided"), K.strictEqual(typeof t, "object", "rimraf: options should be object"), Yl(t), $a(e, t, function i(o) {
    if (o) {
      if ((o.code === "EBUSY" || o.code === "ENOTEMPTY" || o.code === "EPERM") && n < t.maxBusyTries) {
        n++;
        const a = n * 100;
        return setTimeout(() => $a(e, t, i), a);
      }
      o.code === "ENOENT" && (o = null);
    }
    r(o);
  });
}
function $a(e, t, r) {
  K(e), K(t), K(typeof r == "function"), t.lstat(e, (n, i) => {
    if (n && n.code === "ENOENT")
      return r(null);
    if (n && n.code === "EPERM" && $r)
      return Fa(e, t, n, r);
    if (i && i.isDirectory())
      return $n(e, t, n, r);
    t.unlink(e, (o) => {
      if (o) {
        if (o.code === "ENOENT")
          return r(null);
        if (o.code === "EPERM")
          return $r ? Fa(e, t, o, r) : $n(e, t, o, r);
        if (o.code === "EISDIR")
          return $n(e, t, o, r);
      }
      return r(o);
    });
  });
}
function Fa(e, t, r, n) {
  K(e), K(t), K(typeof n == "function"), t.chmod(e, 438, (i) => {
    i ? n(i.code === "ENOENT" ? null : r) : t.stat(e, (o, a) => {
      o ? n(o.code === "ENOENT" ? null : r) : a.isDirectory() ? $n(e, t, r, n) : t.unlink(e, n);
    });
  });
}
function La(e, t, r) {
  let n;
  K(e), K(t);
  try {
    t.chmodSync(e, 438);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  try {
    n = t.statSync(e);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  n.isDirectory() ? Fn(e, t, r) : t.unlinkSync(e);
}
function $n(e, t, r, n) {
  K(e), K(t), K(typeof n == "function"), t.rmdir(e, (i) => {
    i && (i.code === "ENOTEMPTY" || i.code === "EEXIST" || i.code === "EPERM") ? Th(e, t, n) : i && i.code === "ENOTDIR" ? n(r) : n(i);
  });
}
function Th(e, t, r) {
  K(e), K(t), K(typeof r == "function"), t.readdir(e, (n, i) => {
    if (n) return r(n);
    let o = i.length, a;
    if (o === 0) return t.rmdir(e, r);
    i.forEach((s) => {
      Fo(Wl.join(e, s), t, (l) => {
        if (!a) {
          if (l) return r(a = l);
          --o === 0 && t.rmdir(e, r);
        }
      });
    });
  });
}
function zl(e, t) {
  let r;
  t = t || {}, Yl(t), K(e, "rimraf: missing path"), K.strictEqual(typeof e, "string", "rimraf: path should be a string"), K(t, "rimraf: missing options"), K.strictEqual(typeof t, "object", "rimraf: options should be object");
  try {
    r = t.lstatSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    n.code === "EPERM" && $r && La(e, t, n);
  }
  try {
    r && r.isDirectory() ? Fn(e, t, null) : t.unlinkSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    if (n.code === "EPERM")
      return $r ? La(e, t, n) : Fn(e, t, n);
    if (n.code !== "EISDIR")
      throw n;
    Fn(e, t, n);
  }
}
function Fn(e, t, r) {
  K(e), K(t);
  try {
    t.rmdirSync(e);
  } catch (n) {
    if (n.code === "ENOTDIR")
      throw r;
    if (n.code === "ENOTEMPTY" || n.code === "EEXIST" || n.code === "EPERM")
      Ah(e, t);
    else if (n.code !== "ENOENT")
      throw n;
  }
}
function Ah(e, t) {
  if (K(e), K(t), t.readdirSync(e).forEach((r) => zl(Wl.join(e, r), t)), $r) {
    const r = Date.now();
    do
      try {
        return t.rmdirSync(e, t);
      } catch {
      }
    while (Date.now() - r < 500);
  } else
    return t.rmdirSync(e, t);
}
var Ch = Fo;
Fo.sync = zl;
const Bn = Re, Sh = Oe.fromCallback, Xl = Ch;
function Ih(e, t) {
  if (Bn.rm) return Bn.rm(e, { recursive: !0, force: !0 }, t);
  Xl(e, t);
}
function bh(e) {
  if (Bn.rmSync) return Bn.rmSync(e, { recursive: !0, force: !0 });
  Xl.sync(e);
}
var Zn = {
  remove: Sh(Ih),
  removeSync: bh
};
const Oh = Oe.fromPromise, Kl = Mt, Jl = te, Ql = Qe, Zl = Zn, xa = Oh(async function(t) {
  let r;
  try {
    r = await Kl.readdir(t);
  } catch {
    return Ql.mkdirs(t);
  }
  return Promise.all(r.map((n) => Zl.remove(Jl.join(t, n))));
});
function Ua(e) {
  let t;
  try {
    t = Kl.readdirSync(e);
  } catch {
    return Ql.mkdirsSync(e);
  }
  t.forEach((r) => {
    r = Jl.join(e, r), Zl.removeSync(r);
  });
}
var Rh = {
  emptyDirSync: Ua,
  emptydirSync: Ua,
  emptyDir: xa,
  emptydir: xa
};
const Nh = Oe.fromCallback, ec = te, ht = Re, tc = Qe;
function Ph(e, t) {
  function r() {
    ht.writeFile(e, "", (n) => {
      if (n) return t(n);
      t();
    });
  }
  ht.stat(e, (n, i) => {
    if (!n && i.isFile()) return t();
    const o = ec.dirname(e);
    ht.stat(o, (a, s) => {
      if (a)
        return a.code === "ENOENT" ? tc.mkdirs(o, (l) => {
          if (l) return t(l);
          r();
        }) : t(a);
      s.isDirectory() ? r() : ht.readdir(o, (l) => {
        if (l) return t(l);
      });
    });
  });
}
function Dh(e) {
  let t;
  try {
    t = ht.statSync(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const r = ec.dirname(e);
  try {
    ht.statSync(r).isDirectory() || ht.readdirSync(r);
  } catch (n) {
    if (n && n.code === "ENOENT") tc.mkdirsSync(r);
    else throw n;
  }
  ht.writeFileSync(e, "");
}
var $h = {
  createFile: Nh(Ph),
  createFileSync: Dh
};
const Fh = Oe.fromCallback, rc = te, dt = Re, nc = Qe, Lh = Bt.pathExists, { areIdentical: ic } = lr;
function xh(e, t, r) {
  function n(i, o) {
    dt.link(i, o, (a) => {
      if (a) return r(a);
      r(null);
    });
  }
  dt.lstat(t, (i, o) => {
    dt.lstat(e, (a, s) => {
      if (a)
        return a.message = a.message.replace("lstat", "ensureLink"), r(a);
      if (o && ic(s, o)) return r(null);
      const l = rc.dirname(t);
      Lh(l, (p, c) => {
        if (p) return r(p);
        if (c) return n(e, t);
        nc.mkdirs(l, (f) => {
          if (f) return r(f);
          n(e, t);
        });
      });
    });
  });
}
function Uh(e, t) {
  let r;
  try {
    r = dt.lstatSync(t);
  } catch {
  }
  try {
    const o = dt.lstatSync(e);
    if (r && ic(o, r)) return;
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  const n = rc.dirname(t);
  return dt.existsSync(n) || nc.mkdirsSync(n), dt.linkSync(e, t);
}
var kh = {
  createLink: Fh(xh),
  createLinkSync: Uh
};
const pt = te, Sr = Re, Mh = Bt.pathExists;
function Bh(e, t, r) {
  if (pt.isAbsolute(e))
    return Sr.lstat(e, (n) => n ? (n.message = n.message.replace("lstat", "ensureSymlink"), r(n)) : r(null, {
      toCwd: e,
      toDst: e
    }));
  {
    const n = pt.dirname(t), i = pt.join(n, e);
    return Mh(i, (o, a) => o ? r(o) : a ? r(null, {
      toCwd: i,
      toDst: e
    }) : Sr.lstat(e, (s) => s ? (s.message = s.message.replace("lstat", "ensureSymlink"), r(s)) : r(null, {
      toCwd: e,
      toDst: pt.relative(n, e)
    })));
  }
}
function jh(e, t) {
  let r;
  if (pt.isAbsolute(e)) {
    if (r = Sr.existsSync(e), !r) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  } else {
    const n = pt.dirname(t), i = pt.join(n, e);
    if (r = Sr.existsSync(i), r)
      return {
        toCwd: i,
        toDst: e
      };
    if (r = Sr.existsSync(e), !r) throw new Error("relative srcpath does not exist");
    return {
      toCwd: e,
      toDst: pt.relative(n, e)
    };
  }
}
var Hh = {
  symlinkPaths: Bh,
  symlinkPathsSync: jh
};
const oc = Re;
function Gh(e, t, r) {
  if (r = typeof t == "function" ? t : r, t = typeof t == "function" ? !1 : t, t) return r(null, t);
  oc.lstat(e, (n, i) => {
    if (n) return r(null, "file");
    t = i && i.isDirectory() ? "dir" : "file", r(null, t);
  });
}
function qh(e, t) {
  let r;
  if (t) return t;
  try {
    r = oc.lstatSync(e);
  } catch {
    return "file";
  }
  return r && r.isDirectory() ? "dir" : "file";
}
var Vh = {
  symlinkType: Gh,
  symlinkTypeSync: qh
};
const Wh = Oe.fromCallback, ac = te, Ge = Mt, sc = Qe, Yh = sc.mkdirs, zh = sc.mkdirsSync, lc = Hh, Xh = lc.symlinkPaths, Kh = lc.symlinkPathsSync, cc = Vh, Jh = cc.symlinkType, Qh = cc.symlinkTypeSync, Zh = Bt.pathExists, { areIdentical: uc } = lr;
function ep(e, t, r, n) {
  n = typeof r == "function" ? r : n, r = typeof r == "function" ? !1 : r, Ge.lstat(t, (i, o) => {
    !i && o.isSymbolicLink() ? Promise.all([
      Ge.stat(e),
      Ge.stat(t)
    ]).then(([a, s]) => {
      if (uc(a, s)) return n(null);
      ka(e, t, r, n);
    }) : ka(e, t, r, n);
  });
}
function ka(e, t, r, n) {
  Xh(e, t, (i, o) => {
    if (i) return n(i);
    e = o.toDst, Jh(o.toCwd, r, (a, s) => {
      if (a) return n(a);
      const l = ac.dirname(t);
      Zh(l, (p, c) => {
        if (p) return n(p);
        if (c) return Ge.symlink(e, t, s, n);
        Yh(l, (f) => {
          if (f) return n(f);
          Ge.symlink(e, t, s, n);
        });
      });
    });
  });
}
function tp(e, t, r) {
  let n;
  try {
    n = Ge.lstatSync(t);
  } catch {
  }
  if (n && n.isSymbolicLink()) {
    const s = Ge.statSync(e), l = Ge.statSync(t);
    if (uc(s, l)) return;
  }
  const i = Kh(e, t);
  e = i.toDst, r = Qh(i.toCwd, r);
  const o = ac.dirname(t);
  return Ge.existsSync(o) || zh(o), Ge.symlinkSync(e, t, r);
}
var rp = {
  createSymlink: Wh(ep),
  createSymlinkSync: tp
};
const { createFile: Ma, createFileSync: Ba } = $h, { createLink: ja, createLinkSync: Ha } = kh, { createSymlink: Ga, createSymlinkSync: qa } = rp;
var np = {
  // file
  createFile: Ma,
  createFileSync: Ba,
  ensureFile: Ma,
  ensureFileSync: Ba,
  // link
  createLink: ja,
  createLinkSync: Ha,
  ensureLink: ja,
  ensureLinkSync: Ha,
  // symlink
  createSymlink: Ga,
  createSymlinkSync: qa,
  ensureSymlink: Ga,
  ensureSymlinkSync: qa
};
function ip(e, { EOL: t = `
`, finalEOL: r = !0, replacer: n = null, spaces: i } = {}) {
  const o = r ? t : "";
  return JSON.stringify(e, n, i).replace(/\n/g, t) + o;
}
function op(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var Lo = { stringify: ip, stripBom: op };
let ir;
try {
  ir = Re;
} catch {
  ir = it;
}
const ei = Oe, { stringify: fc, stripBom: dc } = Lo;
async function ap(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || ir, n = "throws" in t ? t.throws : !0;
  let i = await ei.fromCallback(r.readFile)(e, t);
  i = dc(i);
  let o;
  try {
    o = JSON.parse(i, t ? t.reviver : null);
  } catch (a) {
    if (n)
      throw a.message = `${e}: ${a.message}`, a;
    return null;
  }
  return o;
}
const sp = ei.fromPromise(ap);
function lp(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || ir, n = "throws" in t ? t.throws : !0;
  try {
    let i = r.readFileSync(e, t);
    return i = dc(i), JSON.parse(i, t.reviver);
  } catch (i) {
    if (n)
      throw i.message = `${e}: ${i.message}`, i;
    return null;
  }
}
async function cp(e, t, r = {}) {
  const n = r.fs || ir, i = fc(t, r);
  await ei.fromCallback(n.writeFile)(e, i, r);
}
const up = ei.fromPromise(cp);
function fp(e, t, r = {}) {
  const n = r.fs || ir, i = fc(t, r);
  return n.writeFileSync(e, i, r);
}
var dp = {
  readFile: sp,
  readFileSync: lp,
  writeFile: up,
  writeFileSync: fp
};
const En = dp;
var hp = {
  // jsonfile exports
  readJson: En.readFile,
  readJsonSync: En.readFileSync,
  writeJson: En.writeFile,
  writeJsonSync: En.writeFileSync
};
const pp = Oe.fromCallback, Ir = Re, hc = te, pc = Qe, mp = Bt.pathExists;
function gp(e, t, r, n) {
  typeof r == "function" && (n = r, r = "utf8");
  const i = hc.dirname(e);
  mp(i, (o, a) => {
    if (o) return n(o);
    if (a) return Ir.writeFile(e, t, r, n);
    pc.mkdirs(i, (s) => {
      if (s) return n(s);
      Ir.writeFile(e, t, r, n);
    });
  });
}
function Ep(e, ...t) {
  const r = hc.dirname(e);
  if (Ir.existsSync(r))
    return Ir.writeFileSync(e, ...t);
  pc.mkdirsSync(r), Ir.writeFileSync(e, ...t);
}
var xo = {
  outputFile: pp(gp),
  outputFileSync: Ep
};
const { stringify: yp } = Lo, { outputFile: vp } = xo;
async function _p(e, t, r = {}) {
  const n = yp(t, r);
  await vp(e, n, r);
}
var wp = _p;
const { stringify: Tp } = Lo, { outputFileSync: Ap } = xo;
function Cp(e, t, r) {
  const n = Tp(t, r);
  Ap(e, n, r);
}
var Sp = Cp;
const Ip = Oe.fromPromise, be = hp;
be.outputJson = Ip(wp);
be.outputJsonSync = Sp;
be.outputJSON = be.outputJson;
be.outputJSONSync = be.outputJsonSync;
be.writeJSON = be.writeJson;
be.writeJSONSync = be.writeJsonSync;
be.readJSON = be.readJson;
be.readJSONSync = be.readJsonSync;
var bp = be;
const Op = Re, lo = te, Rp = $o.copy, mc = Zn.remove, Np = Qe.mkdirp, Pp = Bt.pathExists, Va = lr;
function Dp(e, t, r, n) {
  typeof r == "function" && (n = r, r = {}), r = r || {};
  const i = r.overwrite || r.clobber || !1;
  Va.checkPaths(e, t, "move", r, (o, a) => {
    if (o) return n(o);
    const { srcStat: s, isChangingCase: l = !1 } = a;
    Va.checkParentPaths(e, s, t, "move", (p) => {
      if (p) return n(p);
      if ($p(t)) return Wa(e, t, i, l, n);
      Np(lo.dirname(t), (c) => c ? n(c) : Wa(e, t, i, l, n));
    });
  });
}
function $p(e) {
  const t = lo.dirname(e);
  return lo.parse(t).root === t;
}
function Wa(e, t, r, n, i) {
  if (n) return Ri(e, t, r, i);
  if (r)
    return mc(t, (o) => o ? i(o) : Ri(e, t, r, i));
  Pp(t, (o, a) => o ? i(o) : a ? i(new Error("dest already exists.")) : Ri(e, t, r, i));
}
function Ri(e, t, r, n) {
  Op.rename(e, t, (i) => i ? i.code !== "EXDEV" ? n(i) : Fp(e, t, r, n) : n());
}
function Fp(e, t, r, n) {
  Rp(e, t, {
    overwrite: r,
    errorOnExist: !0
  }, (o) => o ? n(o) : mc(e, n));
}
var Lp = Dp;
const gc = Re, co = te, xp = $o.copySync, Ec = Zn.removeSync, Up = Qe.mkdirpSync, Ya = lr;
function kp(e, t, r) {
  r = r || {};
  const n = r.overwrite || r.clobber || !1, { srcStat: i, isChangingCase: o = !1 } = Ya.checkPathsSync(e, t, "move", r);
  return Ya.checkParentPathsSync(e, i, t, "move"), Mp(t) || Up(co.dirname(t)), Bp(e, t, n, o);
}
function Mp(e) {
  const t = co.dirname(e);
  return co.parse(t).root === t;
}
function Bp(e, t, r, n) {
  if (n) return Ni(e, t, r);
  if (r)
    return Ec(t), Ni(e, t, r);
  if (gc.existsSync(t)) throw new Error("dest already exists.");
  return Ni(e, t, r);
}
function Ni(e, t, r) {
  try {
    gc.renameSync(e, t);
  } catch (n) {
    if (n.code !== "EXDEV") throw n;
    return jp(e, t, r);
  }
}
function jp(e, t, r) {
  return xp(e, t, {
    overwrite: r,
    errorOnExist: !0
  }), Ec(e);
}
var Hp = kp;
const Gp = Oe.fromCallback;
var qp = {
  move: Gp(Lp),
  moveSync: Hp
}, Tt = {
  // Export promiseified graceful-fs:
  ...Mt,
  // Export extra methods:
  ...$o,
  ...Rh,
  ...np,
  ...bp,
  ...Qe,
  ...qp,
  ...xo,
  ...Bt,
  ...Zn
}, jt = {}, gt = {}, fe = {}, Et = {};
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.CancellationError = Et.CancellationToken = void 0;
const Vp = Cl;
class Wp extends Vp.EventEmitter {
  get cancelled() {
    return this._cancelled || this._parent != null && this._parent.cancelled;
  }
  set parent(t) {
    this.removeParentCancelHandler(), this._parent = t, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
  }
  // babel cannot compile ... correctly for super calls
  constructor(t) {
    super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, t != null && (this.parent = t);
  }
  cancel() {
    this._cancelled = !0, this.emit("cancel");
  }
  onCancel(t) {
    this.cancelled ? t() : this.once("cancel", t);
  }
  createPromise(t) {
    if (this.cancelled)
      return Promise.reject(new uo());
    const r = () => {
      if (n != null)
        try {
          this.removeListener("cancel", n), n = null;
        } catch {
        }
    };
    let n = null;
    return new Promise((i, o) => {
      let a = null;
      if (n = () => {
        try {
          a != null && (a(), a = null);
        } finally {
          o(new uo());
        }
      }, this.cancelled) {
        n();
        return;
      }
      this.onCancel(n), t(i, o, (s) => {
        a = s;
      });
    }).then((i) => (r(), i)).catch((i) => {
      throw r(), i;
    });
  }
  removeParentCancelHandler() {
    const t = this._parent;
    t != null && this.parentCancelHandler != null && (t.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
  }
  dispose() {
    try {
      this.removeParentCancelHandler();
    } finally {
      this.removeAllListeners(), this._parent = null;
    }
  }
}
Et.CancellationToken = Wp;
class uo extends Error {
  constructor() {
    super("cancelled");
  }
}
Et.CancellationError = uo;
var cr = {};
Object.defineProperty(cr, "__esModule", { value: !0 });
cr.newError = Yp;
function Yp(e, t) {
  const r = new Error(e);
  return r.code = t, r;
}
var Ie = {}, fo = { exports: {} }, yn = { exports: {} }, Pi, za;
function zp() {
  if (za) return Pi;
  za = 1;
  var e = 1e3, t = e * 60, r = t * 60, n = r * 24, i = n * 7, o = n * 365.25;
  Pi = function(c, f) {
    f = f || {};
    var d = typeof c;
    if (d === "string" && c.length > 0)
      return a(c);
    if (d === "number" && isFinite(c))
      return f.long ? l(c) : s(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function a(c) {
    if (c = String(c), !(c.length > 100)) {
      var f = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (f) {
        var d = parseFloat(f[1]), g = (f[2] || "ms").toLowerCase();
        switch (g) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return d * o;
          case "weeks":
          case "week":
          case "w":
            return d * i;
          case "days":
          case "day":
          case "d":
            return d * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return d * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return d * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return d * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return d;
          default:
            return;
        }
      }
    }
  }
  function s(c) {
    var f = Math.abs(c);
    return f >= n ? Math.round(c / n) + "d" : f >= r ? Math.round(c / r) + "h" : f >= t ? Math.round(c / t) + "m" : f >= e ? Math.round(c / e) + "s" : c + "ms";
  }
  function l(c) {
    var f = Math.abs(c);
    return f >= n ? p(c, f, n, "day") : f >= r ? p(c, f, r, "hour") : f >= t ? p(c, f, t, "minute") : f >= e ? p(c, f, e, "second") : c + " ms";
  }
  function p(c, f, d, g) {
    var v = f >= d * 1.5;
    return Math.round(c / d) + " " + g + (v ? "s" : "");
  }
  return Pi;
}
var Di, Xa;
function yc() {
  if (Xa) return Di;
  Xa = 1;
  function e(t) {
    n.debug = n, n.default = n, n.coerce = p, n.disable = s, n.enable = o, n.enabled = l, n.humanize = zp(), n.destroy = c, Object.keys(t).forEach((f) => {
      n[f] = t[f];
    }), n.names = [], n.skips = [], n.formatters = {};
    function r(f) {
      let d = 0;
      for (let g = 0; g < f.length; g++)
        d = (d << 5) - d + f.charCodeAt(g), d |= 0;
      return n.colors[Math.abs(d) % n.colors.length];
    }
    n.selectColor = r;
    function n(f) {
      let d, g = null, v, y;
      function T(...C) {
        if (!T.enabled)
          return;
        const A = T, D = Number(/* @__PURE__ */ new Date()), L = D - (d || D);
        A.diff = L, A.prev = d, A.curr = D, d = D, C[0] = n.coerce(C[0]), typeof C[0] != "string" && C.unshift("%O");
        let ee = 0;
        C[0] = C[0].replace(/%([a-zA-Z%])/g, (W, Fe) => {
          if (W === "%%")
            return "%";
          ee++;
          const E = n.formatters[Fe];
          if (typeof E == "function") {
            const G = C[ee];
            W = E.call(A, G), C.splice(ee, 1), ee--;
          }
          return W;
        }), n.formatArgs.call(A, C), (A.log || n.log).apply(A, C);
      }
      return T.namespace = f, T.useColors = n.useColors(), T.color = n.selectColor(f), T.extend = i, T.destroy = n.destroy, Object.defineProperty(T, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => g !== null ? g : (v !== n.namespaces && (v = n.namespaces, y = n.enabled(f)), y),
        set: (C) => {
          g = C;
        }
      }), typeof n.init == "function" && n.init(T), T;
    }
    function i(f, d) {
      const g = n(this.namespace + (typeof d > "u" ? ":" : d) + f);
      return g.log = this.log, g;
    }
    function o(f) {
      n.save(f), n.namespaces = f, n.names = [], n.skips = [];
      const d = (typeof f == "string" ? f : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const g of d)
        g[0] === "-" ? n.skips.push(g.slice(1)) : n.names.push(g);
    }
    function a(f, d) {
      let g = 0, v = 0, y = -1, T = 0;
      for (; g < f.length; )
        if (v < d.length && (d[v] === f[g] || d[v] === "*"))
          d[v] === "*" ? (y = v, T = g, v++) : (g++, v++);
        else if (y !== -1)
          v = y + 1, T++, g = T;
        else
          return !1;
      for (; v < d.length && d[v] === "*"; )
        v++;
      return v === d.length;
    }
    function s() {
      const f = [
        ...n.names,
        ...n.skips.map((d) => "-" + d)
      ].join(",");
      return n.enable(""), f;
    }
    function l(f) {
      for (const d of n.skips)
        if (a(f, d))
          return !1;
      for (const d of n.names)
        if (a(f, d))
          return !0;
      return !1;
    }
    function p(f) {
      return f instanceof Error ? f.stack || f.message : f;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return n.enable(n.load()), n;
  }
  return Di = e, Di;
}
var Ka;
function Xp() {
  return Ka || (Ka = 1, function(e, t) {
    t.formatArgs = n, t.save = i, t.load = o, t.useColors = r, t.storage = a(), t.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function r() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function n(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const p = "color: " + this.color;
      l.splice(1, 0, p, "color: inherit");
      let c = 0, f = 0;
      l[0].replace(/%[a-zA-Z%]/g, (d) => {
        d !== "%%" && (c++, d === "%c" && (f = c));
      }), l.splice(f, 0, p);
    }
    t.log = console.debug || console.log || (() => {
    });
    function i(l) {
      try {
        l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function o() {
      let l;
      try {
        l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function a() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = yc()(t);
    const { formatters: s } = e.exports;
    s.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (p) {
        return "[UnexpectedJSONParseError]: " + p.message;
      }
    };
  }(yn, yn.exports)), yn.exports;
}
var vn = { exports: {} }, $i, Ja;
function Kp() {
  return Ja || (Ja = 1, $i = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(r + e), i = t.indexOf("--");
    return n !== -1 && (i === -1 || n < i);
  }), $i;
}
var Fi, Qa;
function Jp() {
  if (Qa) return Fi;
  Qa = 1;
  const e = qr, t = Sl, r = Kp(), { env: n } = process;
  let i;
  r("no-color") || r("no-colors") || r("color=false") || r("color=never") ? i = 0 : (r("color") || r("colors") || r("color=true") || r("color=always")) && (i = 1), "FORCE_COLOR" in n && (n.FORCE_COLOR === "true" ? i = 1 : n.FORCE_COLOR === "false" ? i = 0 : i = n.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(n.FORCE_COLOR, 10), 3));
  function o(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function a(l, p) {
    if (i === 0)
      return 0;
    if (r("color=16m") || r("color=full") || r("color=truecolor"))
      return 3;
    if (r("color=256"))
      return 2;
    if (l && !p && i === void 0)
      return 0;
    const c = i || 0;
    if (n.TERM === "dumb")
      return c;
    if (process.platform === "win32") {
      const f = e.release().split(".");
      return Number(f[0]) >= 10 && Number(f[2]) >= 10586 ? Number(f[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in n)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((f) => f in n) || n.CI_NAME === "codeship" ? 1 : c;
    if ("TEAMCITY_VERSION" in n)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(n.TEAMCITY_VERSION) ? 1 : 0;
    if (n.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in n) {
      const f = parseInt((n.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (n.TERM_PROGRAM) {
        case "iTerm.app":
          return f >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(n.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM) || "COLORTERM" in n ? 1 : c;
  }
  function s(l) {
    const p = a(l, l && l.isTTY);
    return o(p);
  }
  return Fi = {
    supportsColor: s,
    stdout: o(a(!0, t.isatty(1))),
    stderr: o(a(!0, t.isatty(2)))
  }, Fi;
}
var Za;
function Qp() {
  return Za || (Za = 1, function(e, t) {
    const r = Sl, n = Io;
    t.init = c, t.log = s, t.formatArgs = o, t.save = l, t.load = p, t.useColors = i, t.destroy = n.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const d = Jp();
      d && (d.stderr || d).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((d) => /^debug_/i.test(d)).reduce((d, g) => {
      const v = g.substring(6).toLowerCase().replace(/_([a-z])/g, (T, C) => C.toUpperCase());
      let y = process.env[g];
      return /^(yes|on|true|enabled)$/i.test(y) ? y = !0 : /^(no|off|false|disabled)$/i.test(y) ? y = !1 : y === "null" ? y = null : y = Number(y), d[v] = y, d;
    }, {});
    function i() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : r.isatty(process.stderr.fd);
    }
    function o(d) {
      const { namespace: g, useColors: v } = this;
      if (v) {
        const y = this.color, T = "\x1B[3" + (y < 8 ? y : "8;5;" + y), C = `  ${T};1m${g} \x1B[0m`;
        d[0] = C + d[0].split(`
`).join(`
` + C), d.push(T + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        d[0] = a() + g + " " + d[0];
    }
    function a() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function s(...d) {
      return process.stderr.write(n.formatWithOptions(t.inspectOpts, ...d) + `
`);
    }
    function l(d) {
      d ? process.env.DEBUG = d : delete process.env.DEBUG;
    }
    function p() {
      return process.env.DEBUG;
    }
    function c(d) {
      d.inspectOpts = {};
      const g = Object.keys(t.inspectOpts);
      for (let v = 0; v < g.length; v++)
        d.inspectOpts[g[v]] = t.inspectOpts[g[v]];
    }
    e.exports = yc()(t);
    const { formatters: f } = e.exports;
    f.o = function(d) {
      return this.inspectOpts.colors = this.useColors, n.inspect(d, this.inspectOpts).split(`
`).map((g) => g.trim()).join(" ");
    }, f.O = function(d) {
      return this.inspectOpts.colors = this.useColors, n.inspect(d, this.inspectOpts);
    };
  }(vn, vn.exports)), vn.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? fo.exports = Xp() : fo.exports = Qp();
var Zp = fo.exports, Yr = {};
Object.defineProperty(Yr, "__esModule", { value: !0 });
Yr.ProgressCallbackTransform = void 0;
const em = Vr;
class tm extends em.Transform {
  constructor(t, r, n) {
    super(), this.total = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.total * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), n(null, t);
  }
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.total,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, t(null);
  }
}
Yr.ProgressCallbackTransform = tm;
Object.defineProperty(Ie, "__esModule", { value: !0 });
Ie.DigestTransform = Ie.HttpExecutor = Ie.HttpError = void 0;
Ie.createHttpError = po;
Ie.parseJson = cm;
Ie.configureRequestOptionsFromUrl = _c;
Ie.configureRequestUrl = ko;
Ie.safeGetHeader = rr;
Ie.configureRequestOptions = jn;
Ie.safeStringifyJson = Hn;
const rm = sr, nm = Zp, im = it, om = Vr, ho = wt, am = Et, es = cr, sm = Yr, Rt = (0, nm.default)("electron-builder");
function po(e, t = null) {
  return new Uo(e.statusCode || -1, `${e.statusCode} ${e.statusMessage}` + (t == null ? "" : `
` + JSON.stringify(t, null, "  ")) + `
Headers: ` + Hn(e.headers), t);
}
const lm = /* @__PURE__ */ new Map([
  [429, "Too many requests"],
  [400, "Bad request"],
  [403, "Forbidden"],
  [404, "Not found"],
  [405, "Method not allowed"],
  [406, "Not acceptable"],
  [408, "Request timeout"],
  [413, "Request entity too large"],
  [500, "Internal server error"],
  [502, "Bad gateway"],
  [503, "Service unavailable"],
  [504, "Gateway timeout"],
  [505, "HTTP version not supported"]
]);
class Uo extends Error {
  constructor(t, r = `HTTP error: ${lm.get(t) || t}`, n = null) {
    super(r), this.statusCode = t, this.description = n, this.name = "HttpError", this.code = `HTTP_ERROR_${t}`;
  }
  isServerError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
}
Ie.HttpError = Uo;
function cm(e) {
  return e.then((t) => t == null || t.length === 0 ? null : JSON.parse(t));
}
class Kt {
  constructor() {
    this.maxRedirects = 10;
  }
  request(t, r = new am.CancellationToken(), n) {
    jn(t);
    const i = n == null ? void 0 : JSON.stringify(n), o = i ? Buffer.from(i) : void 0;
    if (o != null) {
      Rt(i);
      const { headers: a, ...s } = t;
      t = {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": o.length,
          ...a
        },
        ...s
      };
    }
    return this.doApiRequest(t, r, (a) => a.end(o));
  }
  doApiRequest(t, r, n, i = 0) {
    return Rt.enabled && Rt(`Request: ${Hn(t)}`), r.createPromise((o, a, s) => {
      const l = this.createRequest(t, (p) => {
        try {
          this.handleResponse(p, t, r, o, a, i, n);
        } catch (c) {
          a(c);
        }
      });
      this.addErrorAndTimeoutHandlers(l, a, t.timeout), this.addRedirectHandlers(l, t, a, i, (p) => {
        this.doApiRequest(p, r, n, i).then(o).catch(a);
      }), n(l, a), s(() => l.abort());
    });
  }
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line
  addRedirectHandlers(t, r, n, i, o) {
  }
  addErrorAndTimeoutHandlers(t, r, n = 60 * 1e3) {
    this.addTimeOutHandler(t, r, n), t.on("error", r), t.on("aborted", () => {
      r(new Error("Request has been aborted by the server"));
    });
  }
  handleResponse(t, r, n, i, o, a, s) {
    var l;
    if (Rt.enabled && Rt(`Response: ${t.statusCode} ${t.statusMessage}, request options: ${Hn(r)}`), t.statusCode === 404) {
      o(po(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
      return;
    } else if (t.statusCode === 204) {
      i();
      return;
    }
    const p = (l = t.statusCode) !== null && l !== void 0 ? l : 0, c = p >= 300 && p < 400, f = rr(t, "location");
    if (c && f != null) {
      if (a > this.maxRedirects) {
        o(this.createMaxRedirectError());
        return;
      }
      this.doApiRequest(Kt.prepareRedirectUrlOptions(f, r), n, s, a).then(i).catch(o);
      return;
    }
    t.setEncoding("utf8");
    let d = "";
    t.on("error", o), t.on("data", (g) => d += g), t.on("end", () => {
      try {
        if (t.statusCode != null && t.statusCode >= 400) {
          const g = rr(t, "content-type"), v = g != null && (Array.isArray(g) ? g.find((y) => y.includes("json")) != null : g.includes("json"));
          o(po(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

          Data:
          ${v ? JSON.stringify(JSON.parse(d)) : d}
          `));
        } else
          i(d.length === 0 ? null : d);
      } catch (g) {
        o(g);
      }
    });
  }
  async downloadToBuffer(t, r) {
    return await r.cancellationToken.createPromise((n, i, o) => {
      const a = [], s = {
        headers: r.headers || void 0,
        // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
        redirect: "manual"
      };
      ko(t, s), jn(s), this.doDownload(s, {
        destination: null,
        options: r,
        onCancel: o,
        callback: (l) => {
          l == null ? n(Buffer.concat(a)) : i(l);
        },
        responseHandler: (l, p) => {
          let c = 0;
          l.on("data", (f) => {
            if (c += f.length, c > 524288e3) {
              p(new Error("Maximum allowed size is 500 MB"));
              return;
            }
            a.push(f);
          }), l.on("end", () => {
            p(null);
          });
        }
      }, 0);
    });
  }
  doDownload(t, r, n) {
    const i = this.createRequest(t, (o) => {
      if (o.statusCode >= 400) {
        r.callback(new Error(`Cannot download "${t.protocol || "https:"}//${t.hostname}${t.path}", status ${o.statusCode}: ${o.statusMessage}`));
        return;
      }
      o.on("error", r.callback);
      const a = rr(o, "location");
      if (a != null) {
        n < this.maxRedirects ? this.doDownload(Kt.prepareRedirectUrlOptions(a, t), r, n++) : r.callback(this.createMaxRedirectError());
        return;
      }
      r.responseHandler == null ? fm(r, o) : r.responseHandler(o, r.callback);
    });
    this.addErrorAndTimeoutHandlers(i, r.callback, t.timeout), this.addRedirectHandlers(i, t, r.callback, n, (o) => {
      this.doDownload(o, r, n++);
    }), i.end();
  }
  createMaxRedirectError() {
    return new Error(`Too many redirects (> ${this.maxRedirects})`);
  }
  addTimeOutHandler(t, r, n) {
    t.on("socket", (i) => {
      i.setTimeout(n, () => {
        t.abort(), r(new Error("Request timed out"));
      });
    });
  }
  static prepareRedirectUrlOptions(t, r) {
    const n = _c(t, { ...r }), i = n.headers;
    if (i != null && i.authorization) {
      const o = Kt.reconstructOriginalUrl(r), a = vc(t, r);
      Kt.isCrossOriginRedirect(o, a) && (Rt.enabled && Rt(`Given the cross-origin redirect (from ${o.host} to ${a.host}), the Authorization header will be stripped out.`), delete i.authorization);
    }
    return n;
  }
  static reconstructOriginalUrl(t) {
    const r = t.protocol || "https:";
    if (!t.hostname)
      throw new Error("Missing hostname in request options");
    const n = t.hostname, i = t.port ? `:${t.port}` : "", o = t.path || "/";
    return new ho.URL(`${r}//${n}${i}${o}`);
  }
  static isCrossOriginRedirect(t, r) {
    if (t.hostname.toLowerCase() !== r.hostname.toLowerCase())
      return !0;
    if (t.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
    ["80", ""].includes(t.port) && r.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
    ["443", ""].includes(r.port))
      return !1;
    if (t.protocol !== r.protocol)
      return !0;
    const n = t.port, i = r.port;
    return n !== i;
  }
  static retryOnServerError(t, r = 3) {
    for (let n = 0; ; n++)
      try {
        return t();
      } catch (i) {
        if (n < r && (i instanceof Uo && i.isServerError() || i.code === "EPIPE"))
          continue;
        throw i;
      }
  }
}
Ie.HttpExecutor = Kt;
function vc(e, t) {
  try {
    return new ho.URL(e);
  } catch {
    const r = t.hostname, n = t.protocol || "https:", i = t.port ? `:${t.port}` : "", o = `${n}//${r}${i}`;
    return new ho.URL(e, o);
  }
}
function _c(e, t) {
  const r = jn(t), n = vc(e, t);
  return ko(n, r), r;
}
function ko(e, t) {
  t.protocol = e.protocol, t.hostname = e.hostname, e.port ? t.port = e.port : t.port && delete t.port, t.path = e.pathname + e.search;
}
class mo extends om.Transform {
  // noinspection JSUnusedGlobalSymbols
  get actual() {
    return this._actual;
  }
  constructor(t, r = "sha512", n = "base64") {
    super(), this.expected = t, this.algorithm = r, this.encoding = n, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, rm.createHash)(r);
  }
  // noinspection JSUnusedGlobalSymbols
  _transform(t, r, n) {
    this.digester.update(t), n(null, t);
  }
  // noinspection JSUnusedGlobalSymbols
  _flush(t) {
    if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
      try {
        this.validate();
      } catch (r) {
        t(r);
        return;
      }
    t(null);
  }
  validate() {
    if (this._actual == null)
      throw (0, es.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
    if (this._actual !== this.expected)
      throw (0, es.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
    return null;
  }
}
Ie.DigestTransform = mo;
function um(e, t, r) {
  return e != null && t != null && e !== t ? (r(new Error(`checksum mismatch: expected ${t} but got ${e} (X-Checksum-Sha2 header)`)), !1) : !0;
}
function rr(e, t) {
  const r = e.headers[t];
  return r == null ? null : Array.isArray(r) ? r.length === 0 ? null : r[r.length - 1] : r;
}
function fm(e, t) {
  if (!um(rr(t, "X-Checksum-Sha2"), e.options.sha2, e.callback))
    return;
  const r = [];
  if (e.options.onProgress != null) {
    const a = rr(t, "content-length");
    a != null && r.push(new sm.ProgressCallbackTransform(parseInt(a, 10), e.options.cancellationToken, e.options.onProgress));
  }
  const n = e.options.sha512;
  n != null ? r.push(new mo(n, "sha512", n.length === 128 && !n.includes("+") && !n.includes("Z") && !n.includes("=") ? "hex" : "base64")) : e.options.sha2 != null && r.push(new mo(e.options.sha2, "sha256", "hex"));
  const i = (0, im.createWriteStream)(e.destination);
  r.push(i);
  let o = t;
  for (const a of r)
    a.on("error", (s) => {
      i.close(), e.options.cancellationToken.cancelled || e.callback(s);
    }), o = o.pipe(a);
  i.on("finish", () => {
    i.close(e.callback);
  });
}
function jn(e, t, r) {
  r != null && (e.method = r), e.headers = { ...e.headers };
  const n = e.headers;
  return t != null && (n.authorization = t.startsWith("Basic") || t.startsWith("Bearer") ? t : `token ${t}`), n["User-Agent"] == null && (n["User-Agent"] = "electron-builder"), (r == null || r === "GET" || n["Cache-Control"] == null) && (n["Cache-Control"] = "no-cache"), e.protocol == null && process.versions.electron != null && (e.protocol = "https:"), e;
}
function Hn(e, t) {
  return JSON.stringify(e, (r, n) => r.endsWith("Authorization") || r.endsWith("authorization") || r.endsWith("Password") || r.endsWith("PASSWORD") || r.endsWith("Token") || r.includes("password") || r.includes("token") || t != null && t.has(r) ? "<stripped sensitive data>" : n, 2);
}
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
ti.MemoLazy = void 0;
class dm {
  constructor(t, r) {
    this.selector = t, this.creator = r, this.selected = void 0, this._value = void 0;
  }
  get hasValue() {
    return this._value !== void 0;
  }
  get value() {
    const t = this.selector();
    if (this._value !== void 0 && wc(this.selected, t))
      return this._value;
    this.selected = t;
    const r = this.creator(t);
    return this.value = r, r;
  }
  set value(t) {
    this._value = t;
  }
}
ti.MemoLazy = dm;
function wc(e, t) {
  if (typeof e == "object" && e !== null && (typeof t == "object" && t !== null)) {
    const i = Object.keys(e), o = Object.keys(t);
    return i.length === o.length && i.every((a) => wc(e[a], t[a]));
  }
  return e === t;
}
var zr = {};
Object.defineProperty(zr, "__esModule", { value: !0 });
zr.githubUrl = hm;
zr.githubTagPrefix = pm;
zr.getS3LikeProviderBaseUrl = mm;
function hm(e, t = "github.com") {
  return `${e.protocol || "https"}://${e.host || t}`;
}
function pm(e) {
  var t;
  return e.tagNamePrefix ? e.tagNamePrefix : !((t = e.vPrefixedTagName) !== null && t !== void 0) || t ? "v" : "";
}
function mm(e) {
  const t = e.provider;
  if (t === "s3")
    return gm(e);
  if (t === "spaces")
    return Em(e);
  throw new Error(`Not supported provider: ${t}`);
}
function gm(e) {
  let t;
  if (e.accelerate == !0)
    t = `https://${e.bucket}.s3-accelerate.amazonaws.com`;
  else if (e.endpoint != null)
    t = `${e.endpoint}/${e.bucket}`;
  else if (e.bucket.includes(".")) {
    if (e.region == null)
      throw new Error(`Bucket name "${e.bucket}" includes a dot, but S3 region is missing`);
    e.region === "us-east-1" ? t = `https://s3.amazonaws.com/${e.bucket}` : t = `https://s3-${e.region}.amazonaws.com/${e.bucket}`;
  } else e.region === "cn-north-1" ? t = `https://${e.bucket}.s3.${e.region}.amazonaws.com.cn` : t = `https://${e.bucket}.s3.amazonaws.com`;
  return Tc(t, e.path);
}
function Tc(e, t) {
  return t != null && t.length > 0 && (t.startsWith("/") || (e += "/"), e += t), e;
}
function Em(e) {
  if (e.name == null)
    throw new Error("name is missing");
  if (e.region == null)
    throw new Error("region is missing");
  return Tc(`https://${e.name}.${e.region}.digitaloceanspaces.com`, e.path);
}
var Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
Mo.retry = Ac;
const ym = Et;
async function Ac(e, t) {
  var r;
  const { retries: n, interval: i, backoff: o = 0, attempt: a = 0, shouldRetry: s, cancellationToken: l = new ym.CancellationToken() } = t;
  try {
    return await e();
  } catch (p) {
    if (await Promise.resolve((r = s == null ? void 0 : s(p)) !== null && r !== void 0 ? r : !0) && n > 0 && !l.cancelled)
      return await new Promise((c) => setTimeout(c, i + o * a)), await Ac(e, { ...t, retries: n - 1, attempt: a + 1 });
    throw p;
  }
}
var Bo = {};
Object.defineProperty(Bo, "__esModule", { value: !0 });
Bo.parseDn = vm;
function vm(e) {
  let t = !1, r = null, n = "", i = 0;
  e = e.trim();
  const o = /* @__PURE__ */ new Map();
  for (let a = 0; a <= e.length; a++) {
    if (a === e.length) {
      r !== null && o.set(r, n);
      break;
    }
    const s = e[a];
    if (t) {
      if (s === '"') {
        t = !1;
        continue;
      }
    } else {
      if (s === '"') {
        t = !0;
        continue;
      }
      if (s === "\\") {
        a++;
        const l = parseInt(e.slice(a, a + 2), 16);
        Number.isNaN(l) ? n += e[a] : (a++, n += String.fromCharCode(l));
        continue;
      }
      if (r === null && s === "=") {
        r = n, n = "";
        continue;
      }
      if (s === "," || s === ";" || s === "+") {
        r !== null && o.set(r, n), r = null, n = "";
        continue;
      }
    }
    if (s === " " && !t) {
      if (n.length === 0)
        continue;
      if (a > i) {
        let l = a;
        for (; e[l] === " "; )
          l++;
        i = l;
      }
      if (i >= e.length || e[i] === "," || e[i] === ";" || r === null && e[i] === "=" || r !== null && e[i] === "+") {
        a = i - 1;
        continue;
      }
    }
    n += s;
  }
  return o;
}
var or = {};
Object.defineProperty(or, "__esModule", { value: !0 });
or.nil = or.UUID = void 0;
const Cc = sr, Sc = cr, _m = "options.name must be either a string or a Buffer", ts = (0, Cc.randomBytes)(16);
ts[0] = ts[0] | 1;
const Ln = {}, V = [];
for (let e = 0; e < 256; e++) {
  const t = (e + 256).toString(16).substr(1);
  Ln[t] = e, V[e] = t;
}
class kt {
  constructor(t) {
    this.ascii = null, this.binary = null;
    const r = kt.check(t);
    if (!r)
      throw new Error("not a UUID");
    this.version = r.version, r.format === "ascii" ? this.ascii = t : this.binary = t;
  }
  static v5(t, r) {
    return wm(t, "sha1", 80, r);
  }
  toString() {
    return this.ascii == null && (this.ascii = Tm(this.binary)), this.ascii;
  }
  inspect() {
    return `UUID v${this.version} ${this.toString()}`;
  }
  static check(t, r = 0) {
    if (typeof t == "string")
      return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
        version: (Ln[t[14] + t[15]] & 240) >> 4,
        variant: rs((Ln[t[19] + t[20]] & 224) >> 5),
        format: "ascii"
      } : !1;
    if (Buffer.isBuffer(t)) {
      if (t.length < r + 16)
        return !1;
      let n = 0;
      for (; n < 16 && t[r + n] === 0; n++)
        ;
      return n === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
        version: (t[r + 6] & 240) >> 4,
        variant: rs((t[r + 8] & 224) >> 5),
        format: "binary"
      };
    }
    throw (0, Sc.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
  }
  // read stringified uuid into a Buffer
  static parse(t) {
    const r = Buffer.allocUnsafe(16);
    let n = 0;
    for (let i = 0; i < 16; i++)
      r[i] = Ln[t[n++] + t[n++]], (i === 3 || i === 5 || i === 7 || i === 9) && (n += 1);
    return r;
  }
}
or.UUID = kt;
kt.OID = kt.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
function rs(e) {
  switch (e) {
    case 0:
    case 1:
    case 3:
      return "ncs";
    case 4:
    case 5:
      return "rfc4122";
    case 6:
      return "microsoft";
    default:
      return "future";
  }
}
var br;
(function(e) {
  e[e.ASCII = 0] = "ASCII", e[e.BINARY = 1] = "BINARY", e[e.OBJECT = 2] = "OBJECT";
})(br || (br = {}));
function wm(e, t, r, n, i = br.ASCII) {
  const o = (0, Cc.createHash)(t);
  if (typeof e != "string" && !Buffer.isBuffer(e))
    throw (0, Sc.newError)(_m, "ERR_INVALID_UUID_NAME");
  o.update(n), o.update(e);
  const s = o.digest();
  let l;
  switch (i) {
    case br.BINARY:
      s[6] = s[6] & 15 | r, s[8] = s[8] & 63 | 128, l = s;
      break;
    case br.OBJECT:
      s[6] = s[6] & 15 | r, s[8] = s[8] & 63 | 128, l = new kt(s);
      break;
    default:
      l = V[s[0]] + V[s[1]] + V[s[2]] + V[s[3]] + "-" + V[s[4]] + V[s[5]] + "-" + V[s[6] & 15 | r] + V[s[7]] + "-" + V[s[8] & 63 | 128] + V[s[9]] + "-" + V[s[10]] + V[s[11]] + V[s[12]] + V[s[13]] + V[s[14]] + V[s[15]];
      break;
  }
  return l;
}
function Tm(e) {
  return V[e[0]] + V[e[1]] + V[e[2]] + V[e[3]] + "-" + V[e[4]] + V[e[5]] + "-" + V[e[6]] + V[e[7]] + "-" + V[e[8]] + V[e[9]] + "-" + V[e[10]] + V[e[11]] + V[e[12]] + V[e[13]] + V[e[14]] + V[e[15]];
}
or.nil = new kt("00000000-0000-0000-0000-000000000000");
var Xr = {}, Ic = {};
(function(e) {
  (function(t) {
    t.parser = function(h, u) {
      return new n(h, u);
    }, t.SAXParser = n, t.SAXStream = c, t.createStream = p, t.MAX_BUFFER_LENGTH = 64 * 1024;
    var r = [
      "comment",
      "sgmlDecl",
      "textNode",
      "tagName",
      "doctype",
      "procInstName",
      "procInstBody",
      "entity",
      "attribName",
      "attribValue",
      "cdata",
      "script"
    ];
    t.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace"
    ];
    function n(h, u) {
      if (!(this instanceof n))
        return new n(h, u);
      var S = this;
      o(S), S.q = S.c = "", S.bufferCheckPosition = t.MAX_BUFFER_LENGTH, S.opt = u || {}, S.opt.lowercase = S.opt.lowercase || S.opt.lowercasetags, S.looseCase = S.opt.lowercase ? "toLowerCase" : "toUpperCase", S.opt.maxEntityCount = S.opt.maxEntityCount || 512, S.opt.maxEntityDepth = S.opt.maxEntityDepth || 4, S.entityCount = S.entityDepth = 0, S.tags = [], S.closed = S.closedRoot = S.sawRoot = !1, S.tag = S.error = null, S.strict = !!h, S.noscript = !!(h || S.opt.noscript), S.state = E.BEGIN, S.strictEntities = S.opt.strictEntities, S.ENTITIES = S.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), S.attribList = [], S.opt.xmlns && (S.ns = Object.create(y)), S.opt.unquotedAttributeValues === void 0 && (S.opt.unquotedAttributeValues = !h), S.trackPosition = S.opt.position !== !1, S.trackPosition && (S.position = S.line = S.column = 0), B(S, "onready");
    }
    Object.create || (Object.create = function(h) {
      function u() {
      }
      u.prototype = h;
      var S = new u();
      return S;
    }), Object.keys || (Object.keys = function(h) {
      var u = [];
      for (var S in h) h.hasOwnProperty(S) && u.push(S);
      return u;
    });
    function i(h) {
      for (var u = Math.max(t.MAX_BUFFER_LENGTH, 10), S = 0, w = 0, Y = r.length; w < Y; w++) {
        var Q = h[r[w]].length;
        if (Q > u)
          switch (r[w]) {
            case "textNode":
              z(h);
              break;
            case "cdata":
              M(h, "oncdata", h.cdata), h.cdata = "";
              break;
            case "script":
              M(h, "onscript", h.script), h.script = "";
              break;
            default:
              b(h, "Max buffer length exceeded: " + r[w]);
          }
        S = Math.max(S, Q);
      }
      var ie = t.MAX_BUFFER_LENGTH - S;
      h.bufferCheckPosition = ie + h.position;
    }
    function o(h) {
      for (var u = 0, S = r.length; u < S; u++)
        h[r[u]] = "";
    }
    function a(h) {
      z(h), h.cdata !== "" && (M(h, "oncdata", h.cdata), h.cdata = ""), h.script !== "" && (M(h, "onscript", h.script), h.script = "");
    }
    n.prototype = {
      end: function() {
        P(this);
      },
      write: ze,
      resume: function() {
        return this.error = null, this;
      },
      close: function() {
        return this.write(null);
      },
      flush: function() {
        a(this);
      }
    };
    var s;
    try {
      s = require("stream").Stream;
    } catch {
      s = function() {
      };
    }
    s || (s = function() {
    });
    var l = t.EVENTS.filter(function(h) {
      return h !== "error" && h !== "end";
    });
    function p(h, u) {
      return new c(h, u);
    }
    function c(h, u) {
      if (!(this instanceof c))
        return new c(h, u);
      s.apply(this), this._parser = new n(h, u), this.writable = !0, this.readable = !0;
      var S = this;
      this._parser.onend = function() {
        S.emit("end");
      }, this._parser.onerror = function(w) {
        S.emit("error", w), S._parser.error = null;
      }, this._decoder = null, l.forEach(function(w) {
        Object.defineProperty(S, "on" + w, {
          get: function() {
            return S._parser["on" + w];
          },
          set: function(Y) {
            if (!Y)
              return S.removeAllListeners(w), S._parser["on" + w] = Y, Y;
            S.on(w, Y);
          },
          enumerable: !0,
          configurable: !1
        });
      });
    }
    c.prototype = Object.create(s.prototype, {
      constructor: {
        value: c
      }
    }), c.prototype.write = function(h) {
      return typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(h) && (this._decoder || (this._decoder = new TextDecoder("utf8")), h = this._decoder.decode(h, { stream: !0 })), this._parser.write(h.toString()), this.emit("data", h), !0;
    }, c.prototype.end = function(h) {
      if (h && h.length && this.write(h), this._decoder) {
        var u = this._decoder.decode();
        u && (this._parser.write(u), this.emit("data", u));
      }
      return this._parser.end(), !0;
    }, c.prototype.on = function(h, u) {
      var S = this;
      return !S._parser["on" + h] && l.indexOf(h) !== -1 && (S._parser["on" + h] = function() {
        var w = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        w.splice(0, 0, h), S.emit.apply(S, w);
      }), s.prototype.on.call(S, h, u);
    };
    var f = "[CDATA[", d = "DOCTYPE", g = "http://www.w3.org/XML/1998/namespace", v = "http://www.w3.org/2000/xmlns/", y = { xml: g, xmlns: v }, T = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, C = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, A = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, D = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function L(h) {
      return h === " " || h === `
` || h === "\r" || h === "	";
    }
    function ee(h) {
      return h === '"' || h === "'";
    }
    function ae(h) {
      return h === ">" || L(h);
    }
    function W(h, u) {
      return h.test(u);
    }
    function Fe(h, u) {
      return !W(h, u);
    }
    var E = 0;
    t.STATE = {
      BEGIN: E++,
      // leading byte order mark or whitespace
      BEGIN_WHITESPACE: E++,
      // leading whitespace
      TEXT: E++,
      // general stuff
      TEXT_ENTITY: E++,
      // &amp and such.
      OPEN_WAKA: E++,
      // <
      SGML_DECL: E++,
      // <!BLARG
      SGML_DECL_QUOTED: E++,
      // <!BLARG foo "bar
      DOCTYPE: E++,
      // <!DOCTYPE
      DOCTYPE_QUOTED: E++,
      // <!DOCTYPE "//blah
      DOCTYPE_DTD: E++,
      // <!DOCTYPE "//blah" [ ...
      DOCTYPE_DTD_QUOTED: E++,
      // <!DOCTYPE "//blah" [ "foo
      COMMENT_STARTING: E++,
      // <!-
      COMMENT: E++,
      // <!--
      COMMENT_ENDING: E++,
      // <!-- blah -
      COMMENT_ENDED: E++,
      // <!-- blah --
      CDATA: E++,
      // <![CDATA[ something
      CDATA_ENDING: E++,
      // ]
      CDATA_ENDING_2: E++,
      // ]]
      PROC_INST: E++,
      // <?hi
      PROC_INST_BODY: E++,
      // <?hi there
      PROC_INST_ENDING: E++,
      // <?hi "there" ?
      OPEN_TAG: E++,
      // <strong
      OPEN_TAG_SLASH: E++,
      // <strong /
      ATTRIB: E++,
      // <a
      ATTRIB_NAME: E++,
      // <a foo
      ATTRIB_NAME_SAW_WHITE: E++,
      // <a foo _
      ATTRIB_VALUE: E++,
      // <a foo=
      ATTRIB_VALUE_QUOTED: E++,
      // <a foo="bar
      ATTRIB_VALUE_CLOSED: E++,
      // <a foo="bar"
      ATTRIB_VALUE_UNQUOTED: E++,
      // <a foo=bar
      ATTRIB_VALUE_ENTITY_Q: E++,
      // <foo bar="&quot;"
      ATTRIB_VALUE_ENTITY_U: E++,
      // <foo bar=&quot
      CLOSE_TAG: E++,
      // </a
      CLOSE_TAG_SAW_WHITE: E++,
      // </a   >
      SCRIPT: E++,
      // <script> ...
      SCRIPT_ENDING: E++
      // <script> ... <
    }, t.XML_ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'"
    }, t.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830
    }, Object.keys(t.ENTITIES).forEach(function(h) {
      var u = t.ENTITIES[h], S = typeof u == "number" ? String.fromCharCode(u) : u;
      t.ENTITIES[h] = S;
    });
    for (var G in t.STATE)
      t.STATE[t.STATE[G]] = G;
    E = t.STATE;
    function B(h, u, S) {
      h[u] && h[u](S);
    }
    function M(h, u, S) {
      h.textNode && z(h), B(h, u, S);
    }
    function z(h) {
      h.textNode = R(h.opt, h.textNode), h.textNode && B(h, "ontext", h.textNode), h.textNode = "";
    }
    function R(h, u) {
      return h.trim && (u = u.trim()), h.normalize && (u = u.replace(/\s+/g, " ")), u;
    }
    function b(h, u) {
      return z(h), h.trackPosition && (u += `
Line: ` + h.line + `
Column: ` + h.column + `
Char: ` + h.c), u = new Error(u), h.error = u, B(h, "onerror", u), h;
    }
    function P(h) {
      return h.sawRoot && !h.closedRoot && I(h, "Unclosed root tag"), h.state !== E.BEGIN && h.state !== E.BEGIN_WHITESPACE && h.state !== E.TEXT && b(h, "Unexpected end"), z(h), h.c = "", h.closed = !0, B(h, "onend"), n.call(h, h.strict, h.opt), h;
    }
    function I(h, u) {
      if (typeof h != "object" || !(h instanceof n))
        throw new Error("bad call to strictFail");
      h.strict && b(h, u);
    }
    function $(h) {
      h.strict || (h.tagName = h.tagName[h.looseCase]());
      var u = h.tags[h.tags.length - 1] || h, S = h.tag = { name: h.tagName, attributes: {} };
      h.opt.xmlns && (S.ns = u.ns), h.attribList.length = 0, M(h, "onopentagstart", S);
    }
    function N(h, u) {
      var S = h.indexOf(":"), w = S < 0 ? ["", h] : h.split(":"), Y = w[0], Q = w[1];
      return u && h === "xmlns" && (Y = "xmlns", Q = ""), { prefix: Y, local: Q };
    }
    function k(h) {
      if (h.strict || (h.attribName = h.attribName[h.looseCase]()), h.attribList.indexOf(h.attribName) !== -1 || h.tag.attributes.hasOwnProperty(h.attribName)) {
        h.attribName = h.attribValue = "";
        return;
      }
      if (h.opt.xmlns) {
        var u = N(h.attribName, !0), S = u.prefix, w = u.local;
        if (S === "xmlns")
          if (w === "xml" && h.attribValue !== g)
            I(
              h,
              "xml: prefix must be bound to " + g + `
Actual: ` + h.attribValue
            );
          else if (w === "xmlns" && h.attribValue !== v)
            I(
              h,
              "xmlns: prefix must be bound to " + v + `
Actual: ` + h.attribValue
            );
          else {
            var Y = h.tag, Q = h.tags[h.tags.length - 1] || h;
            Y.ns === Q.ns && (Y.ns = Object.create(Q.ns)), Y.ns[w] = h.attribValue;
          }
        h.attribList.push([h.attribName, h.attribValue]);
      } else
        h.tag.attributes[h.attribName] = h.attribValue, M(h, "onattribute", {
          name: h.attribName,
          value: h.attribValue
        });
      h.attribName = h.attribValue = "";
    }
    function q(h, u) {
      if (h.opt.xmlns) {
        var S = h.tag, w = N(h.tagName);
        S.prefix = w.prefix, S.local = w.local, S.uri = S.ns[w.prefix] || "", S.prefix && !S.uri && (I(
          h,
          "Unbound namespace prefix: " + JSON.stringify(h.tagName)
        ), S.uri = w.prefix);
        var Y = h.tags[h.tags.length - 1] || h;
        S.ns && Y.ns !== S.ns && Object.keys(S.ns).forEach(function(on) {
          M(h, "onopennamespace", {
            prefix: on,
            uri: S.ns[on]
          });
        });
        for (var Q = 0, ie = h.attribList.length; Q < ie; Q++) {
          var me = h.attribList[Q], ve = me[0], at = me[1], ce = N(ve, !0), Me = ce.prefix, vi = ce.local, nn = Me === "" ? "" : S.ns[Me] || "", hr = {
            name: ve,
            value: at,
            prefix: Me,
            local: vi,
            uri: nn
          };
          Me && Me !== "xmlns" && !nn && (I(
            h,
            "Unbound namespace prefix: " + JSON.stringify(Me)
          ), hr.uri = Me), h.tag.attributes[ve] = hr, M(h, "onattribute", hr);
        }
        h.attribList.length = 0;
      }
      h.tag.isSelfClosing = !!u, h.sawRoot = !0, h.tags.push(h.tag), M(h, "onopentag", h.tag), u || (!h.noscript && h.tagName.toLowerCase() === "script" ? h.state = E.SCRIPT : h.state = E.TEXT, h.tag = null, h.tagName = ""), h.attribName = h.attribValue = "", h.attribList.length = 0;
    }
    function j(h) {
      if (!h.tagName) {
        I(h, "Weird empty close tag."), h.textNode += "</>", h.state = E.TEXT;
        return;
      }
      if (h.script) {
        if (h.tagName !== "script") {
          h.script += "</" + h.tagName + ">", h.tagName = "", h.state = E.SCRIPT;
          return;
        }
        M(h, "onscript", h.script), h.script = "";
      }
      var u = h.tags.length, S = h.tagName;
      h.strict || (S = S[h.looseCase]());
      for (var w = S; u--; ) {
        var Y = h.tags[u];
        if (Y.name !== w)
          I(h, "Unexpected close tag");
        else
          break;
      }
      if (u < 0) {
        I(h, "Unmatched closing tag: " + h.tagName), h.textNode += "</" + h.tagName + ">", h.state = E.TEXT;
        return;
      }
      h.tagName = S;
      for (var Q = h.tags.length; Q-- > u; ) {
        var ie = h.tag = h.tags.pop();
        h.tagName = h.tag.name, M(h, "onclosetag", h.tagName);
        var me = {};
        for (var ve in ie.ns)
          me[ve] = ie.ns[ve];
        var at = h.tags[h.tags.length - 1] || h;
        h.opt.xmlns && ie.ns !== at.ns && Object.keys(ie.ns).forEach(function(ce) {
          var Me = ie.ns[ce];
          M(h, "onclosenamespace", { prefix: ce, uri: Me });
        });
      }
      u === 0 && (h.closedRoot = !0), h.tagName = h.attribValue = h.attribName = "", h.attribList.length = 0, h.state = E.TEXT;
    }
    function X(h) {
      var u = h.entity, S = u.toLowerCase(), w, Y = "";
      return h.ENTITIES[u] ? h.ENTITIES[u] : h.ENTITIES[S] ? h.ENTITIES[S] : (u = S, u.charAt(0) === "#" && (u.charAt(1) === "x" ? (u = u.slice(2), w = parseInt(u, 16), Y = w.toString(16)) : (u = u.slice(1), w = parseInt(u, 10), Y = w.toString(10))), u = u.replace(/^0+/, ""), isNaN(w) || Y.toLowerCase() !== u || w < 0 || w > 1114111 ? (I(h, "Invalid character entity"), "&" + h.entity + ";") : String.fromCodePoint(w));
    }
    function de(h, u) {
      u === "<" ? (h.state = E.OPEN_WAKA, h.startTagPosition = h.position) : L(u) || (I(h, "Non-whitespace before first tag."), h.textNode = u, h.state = E.TEXT);
    }
    function U(h, u) {
      var S = "";
      return u < h.length && (S = h.charAt(u)), S;
    }
    function ze(h) {
      var u = this;
      if (this.error)
        throw this.error;
      if (u.closed)
        return b(
          u,
          "Cannot write after close. Assign an onready handler."
        );
      if (h === null)
        return P(u);
      typeof h == "object" && (h = h.toString());
      for (var S = 0, w = ""; w = U(h, S++), u.c = w, !!w; )
        switch (u.trackPosition && (u.position++, w === `
` ? (u.line++, u.column = 0) : u.column++), u.state) {
          case E.BEGIN:
            if (u.state = E.BEGIN_WHITESPACE, w === "\uFEFF")
              continue;
            de(u, w);
            continue;
          case E.BEGIN_WHITESPACE:
            de(u, w);
            continue;
          case E.TEXT:
            if (u.sawRoot && !u.closedRoot) {
              for (var Q = S - 1; w && w !== "<" && w !== "&"; )
                w = U(h, S++), w && u.trackPosition && (u.position++, w === `
` ? (u.line++, u.column = 0) : u.column++);
              u.textNode += h.substring(Q, S - 1);
            }
            w === "<" && !(u.sawRoot && u.closedRoot && !u.strict) ? (u.state = E.OPEN_WAKA, u.startTagPosition = u.position) : (!L(w) && (!u.sawRoot || u.closedRoot) && I(u, "Text data outside of root node."), w === "&" ? u.state = E.TEXT_ENTITY : u.textNode += w);
            continue;
          case E.SCRIPT:
            w === "<" ? u.state = E.SCRIPT_ENDING : u.script += w;
            continue;
          case E.SCRIPT_ENDING:
            w === "/" ? u.state = E.CLOSE_TAG : (u.script += "<" + w, u.state = E.SCRIPT);
            continue;
          case E.OPEN_WAKA:
            if (w === "!")
              u.state = E.SGML_DECL, u.sgmlDecl = "";
            else if (!L(w)) if (W(T, w))
              u.state = E.OPEN_TAG, u.tagName = w;
            else if (w === "/")
              u.state = E.CLOSE_TAG, u.tagName = "";
            else if (w === "?")
              u.state = E.PROC_INST, u.procInstName = u.procInstBody = "";
            else {
              if (I(u, "Unencoded <"), u.startTagPosition + 1 < u.position) {
                var Y = u.position - u.startTagPosition;
                w = new Array(Y).join(" ") + w;
              }
              u.textNode += "<" + w, u.state = E.TEXT;
            }
            continue;
          case E.SGML_DECL:
            if (u.sgmlDecl + w === "--") {
              u.state = E.COMMENT, u.comment = "", u.sgmlDecl = "";
              continue;
            }
            u.doctype && u.doctype !== !0 && u.sgmlDecl ? (u.state = E.DOCTYPE_DTD, u.doctype += "<!" + u.sgmlDecl + w, u.sgmlDecl = "") : (u.sgmlDecl + w).toUpperCase() === f ? (M(u, "onopencdata"), u.state = E.CDATA, u.sgmlDecl = "", u.cdata = "") : (u.sgmlDecl + w).toUpperCase() === d ? (u.state = E.DOCTYPE, (u.doctype || u.sawRoot) && I(
              u,
              "Inappropriately located doctype declaration"
            ), u.doctype = "", u.sgmlDecl = "") : w === ">" ? (M(u, "onsgmldeclaration", u.sgmlDecl), u.sgmlDecl = "", u.state = E.TEXT) : (ee(w) && (u.state = E.SGML_DECL_QUOTED), u.sgmlDecl += w);
            continue;
          case E.SGML_DECL_QUOTED:
            w === u.q && (u.state = E.SGML_DECL, u.q = ""), u.sgmlDecl += w;
            continue;
          case E.DOCTYPE:
            w === ">" ? (u.state = E.TEXT, M(u, "ondoctype", u.doctype), u.doctype = !0) : (u.doctype += w, w === "[" ? u.state = E.DOCTYPE_DTD : ee(w) && (u.state = E.DOCTYPE_QUOTED, u.q = w));
            continue;
          case E.DOCTYPE_QUOTED:
            u.doctype += w, w === u.q && (u.q = "", u.state = E.DOCTYPE);
            continue;
          case E.DOCTYPE_DTD:
            w === "]" ? (u.doctype += w, u.state = E.DOCTYPE) : w === "<" ? (u.state = E.OPEN_WAKA, u.startTagPosition = u.position) : ee(w) ? (u.doctype += w, u.state = E.DOCTYPE_DTD_QUOTED, u.q = w) : u.doctype += w;
            continue;
          case E.DOCTYPE_DTD_QUOTED:
            u.doctype += w, w === u.q && (u.state = E.DOCTYPE_DTD, u.q = "");
            continue;
          case E.COMMENT:
            w === "-" ? u.state = E.COMMENT_ENDING : u.comment += w;
            continue;
          case E.COMMENT_ENDING:
            w === "-" ? (u.state = E.COMMENT_ENDED, u.comment = R(u.opt, u.comment), u.comment && M(u, "oncomment", u.comment), u.comment = "") : (u.comment += "-" + w, u.state = E.COMMENT);
            continue;
          case E.COMMENT_ENDED:
            w !== ">" ? (I(u, "Malformed comment"), u.comment += "--" + w, u.state = E.COMMENT) : u.doctype && u.doctype !== !0 ? u.state = E.DOCTYPE_DTD : u.state = E.TEXT;
            continue;
          case E.CDATA:
            for (var Q = S - 1; w && w !== "]"; )
              w = U(h, S++), w && u.trackPosition && (u.position++, w === `
` ? (u.line++, u.column = 0) : u.column++);
            u.cdata += h.substring(Q, S - 1), w === "]" && (u.state = E.CDATA_ENDING);
            continue;
          case E.CDATA_ENDING:
            w === "]" ? u.state = E.CDATA_ENDING_2 : (u.cdata += "]" + w, u.state = E.CDATA);
            continue;
          case E.CDATA_ENDING_2:
            w === ">" ? (u.cdata && M(u, "oncdata", u.cdata), M(u, "onclosecdata"), u.cdata = "", u.state = E.TEXT) : w === "]" ? u.cdata += "]" : (u.cdata += "]]" + w, u.state = E.CDATA);
            continue;
          case E.PROC_INST:
            w === "?" ? u.state = E.PROC_INST_ENDING : L(w) ? u.state = E.PROC_INST_BODY : u.procInstName += w;
            continue;
          case E.PROC_INST_BODY:
            if (!u.procInstBody && L(w))
              continue;
            w === "?" ? u.state = E.PROC_INST_ENDING : u.procInstBody += w;
            continue;
          case E.PROC_INST_ENDING:
            w === ">" ? (M(u, "onprocessinginstruction", {
              name: u.procInstName,
              body: u.procInstBody
            }), u.procInstName = u.procInstBody = "", u.state = E.TEXT) : (u.procInstBody += "?" + w, u.state = E.PROC_INST_BODY);
            continue;
          case E.OPEN_TAG:
            W(C, w) ? u.tagName += w : ($(u), w === ">" ? q(u) : w === "/" ? u.state = E.OPEN_TAG_SLASH : (L(w) || I(u, "Invalid character in tag name"), u.state = E.ATTRIB));
            continue;
          case E.OPEN_TAG_SLASH:
            w === ">" ? (q(u, !0), j(u)) : (I(
              u,
              "Forward-slash in opening tag not followed by >"
            ), u.state = E.ATTRIB);
            continue;
          case E.ATTRIB:
            if (L(w))
              continue;
            w === ">" ? q(u) : w === "/" ? u.state = E.OPEN_TAG_SLASH : W(T, w) ? (u.attribName = w, u.attribValue = "", u.state = E.ATTRIB_NAME) : I(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_NAME:
            w === "=" ? u.state = E.ATTRIB_VALUE : w === ">" ? (I(u, "Attribute without value"), u.attribValue = u.attribName, k(u), q(u)) : L(w) ? u.state = E.ATTRIB_NAME_SAW_WHITE : W(C, w) ? u.attribName += w : I(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_NAME_SAW_WHITE:
            if (w === "=")
              u.state = E.ATTRIB_VALUE;
            else {
              if (L(w))
                continue;
              I(u, "Attribute without value"), u.tag.attributes[u.attribName] = "", u.attribValue = "", M(u, "onattribute", {
                name: u.attribName,
                value: ""
              }), u.attribName = "", w === ">" ? q(u) : W(T, w) ? (u.attribName = w, u.state = E.ATTRIB_NAME) : (I(u, "Invalid attribute name"), u.state = E.ATTRIB);
            }
            continue;
          case E.ATTRIB_VALUE:
            if (L(w))
              continue;
            ee(w) ? (u.q = w, u.state = E.ATTRIB_VALUE_QUOTED) : (u.opt.unquotedAttributeValues || b(u, "Unquoted attribute value"), u.state = E.ATTRIB_VALUE_UNQUOTED, u.attribValue = w);
            continue;
          case E.ATTRIB_VALUE_QUOTED:
            if (w !== u.q) {
              w === "&" ? u.state = E.ATTRIB_VALUE_ENTITY_Q : u.attribValue += w;
              continue;
            }
            k(u), u.q = "", u.state = E.ATTRIB_VALUE_CLOSED;
            continue;
          case E.ATTRIB_VALUE_CLOSED:
            L(w) ? u.state = E.ATTRIB : w === ">" ? q(u) : w === "/" ? u.state = E.OPEN_TAG_SLASH : W(T, w) ? (I(u, "No whitespace between attributes"), u.attribName = w, u.attribValue = "", u.state = E.ATTRIB_NAME) : I(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_VALUE_UNQUOTED:
            if (!ae(w)) {
              w === "&" ? u.state = E.ATTRIB_VALUE_ENTITY_U : u.attribValue += w;
              continue;
            }
            k(u), w === ">" ? q(u) : u.state = E.ATTRIB;
            continue;
          case E.CLOSE_TAG:
            if (u.tagName)
              w === ">" ? j(u) : W(C, w) ? u.tagName += w : u.script ? (u.script += "</" + u.tagName + w, u.tagName = "", u.state = E.SCRIPT) : (L(w) || I(u, "Invalid tagname in closing tag"), u.state = E.CLOSE_TAG_SAW_WHITE);
            else {
              if (L(w))
                continue;
              Fe(T, w) ? u.script ? (u.script += "</" + w, u.state = E.SCRIPT) : I(u, "Invalid tagname in closing tag.") : u.tagName = w;
            }
            continue;
          case E.CLOSE_TAG_SAW_WHITE:
            if (L(w))
              continue;
            w === ">" ? j(u) : I(u, "Invalid characters in closing tag");
            continue;
          case E.TEXT_ENTITY:
          case E.ATTRIB_VALUE_ENTITY_Q:
          case E.ATTRIB_VALUE_ENTITY_U:
            var ie, me;
            switch (u.state) {
              case E.TEXT_ENTITY:
                ie = E.TEXT, me = "textNode";
                break;
              case E.ATTRIB_VALUE_ENTITY_Q:
                ie = E.ATTRIB_VALUE_QUOTED, me = "attribValue";
                break;
              case E.ATTRIB_VALUE_ENTITY_U:
                ie = E.ATTRIB_VALUE_UNQUOTED, me = "attribValue";
                break;
            }
            if (w === ";") {
              var ve = X(u);
              u.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(ve) ? ((u.entityCount += 1) > u.opt.maxEntityCount && b(
                u,
                "Parsed entity count exceeds max entity count"
              ), (u.entityDepth += 1) > u.opt.maxEntityDepth && b(
                u,
                "Parsed entity depth exceeds max entity depth"
              ), u.entity = "", u.state = ie, u.write(ve), u.entityDepth -= 1) : (u[me] += ve, u.entity = "", u.state = ie);
            } else W(u.entity.length ? D : A, w) ? u.entity += w : (I(u, "Invalid character in entity name"), u[me] += "&" + u.entity + w, u.entity = "", u.state = ie);
            continue;
          default:
            throw new Error(u, "Unknown state: " + u.state);
        }
      return u.position >= u.bufferCheckPosition && i(u), u;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    String.fromCodePoint || function() {
      var h = String.fromCharCode, u = Math.floor, S = function() {
        var w = 16384, Y = [], Q, ie, me = -1, ve = arguments.length;
        if (!ve)
          return "";
        for (var at = ""; ++me < ve; ) {
          var ce = Number(arguments[me]);
          if (!isFinite(ce) || // `NaN`, `+Infinity`, or `-Infinity`
          ce < 0 || // not a valid Unicode code point
          ce > 1114111 || // not a valid Unicode code point
          u(ce) !== ce)
            throw RangeError("Invalid code point: " + ce);
          ce <= 65535 ? Y.push(ce) : (ce -= 65536, Q = (ce >> 10) + 55296, ie = ce % 1024 + 56320, Y.push(Q, ie)), (me + 1 === ve || Y.length > w) && (at += h.apply(null, Y), Y.length = 0);
        }
        return at;
      };
      Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
        value: S,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = S;
    }();
  })(e);
})(Ic);
Object.defineProperty(Xr, "__esModule", { value: !0 });
Xr.XElement = void 0;
Xr.parseXml = Im;
const Am = Ic, _n = cr;
class bc {
  constructor(t) {
    if (this.name = t, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !t)
      throw (0, _n.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
    if (!Sm(t))
      throw (0, _n.newError)(`Invalid element name: ${t}`, "ERR_XML_ELEMENT_INVALID_NAME");
  }
  attribute(t) {
    const r = this.attributes === null ? null : this.attributes[t];
    if (r == null)
      throw (0, _n.newError)(`No attribute "${t}"`, "ERR_XML_MISSED_ATTRIBUTE");
    return r;
  }
  removeAttribute(t) {
    this.attributes !== null && delete this.attributes[t];
  }
  element(t, r = !1, n = null) {
    const i = this.elementOrNull(t, r);
    if (i === null)
      throw (0, _n.newError)(n || `No element "${t}"`, "ERR_XML_MISSED_ELEMENT");
    return i;
  }
  elementOrNull(t, r = !1) {
    if (this.elements === null)
      return null;
    for (const n of this.elements)
      if (ns(n, t, r))
        return n;
    return null;
  }
  getElements(t, r = !1) {
    return this.elements === null ? [] : this.elements.filter((n) => ns(n, t, r));
  }
  elementValueOrEmpty(t, r = !1) {
    const n = this.elementOrNull(t, r);
    return n === null ? "" : n.value;
  }
}
Xr.XElement = bc;
const Cm = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
function Sm(e) {
  return Cm.test(e);
}
function ns(e, t, r) {
  const n = e.name;
  return n === t || r === !0 && n.length === t.length && n.toLowerCase() === t.toLowerCase();
}
function Im(e) {
  let t = null;
  const r = Am.parser(!0, {}), n = [];
  return r.onopentag = (i) => {
    const o = new bc(i.name);
    if (o.attributes = i.attributes, t === null)
      t = o;
    else {
      const a = n[n.length - 1];
      a.elements == null && (a.elements = []), a.elements.push(o);
    }
    n.push(o);
  }, r.onclosetag = () => {
    n.pop();
  }, r.ontext = (i) => {
    n.length > 0 && (n[n.length - 1].value = i);
  }, r.oncdata = (i) => {
    const o = n[n.length - 1];
    o.value = i, o.isCData = !0;
  }, r.onerror = (i) => {
    throw i;
  }, r.write(e), t;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = f;
  var t = Et;
  Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
    return t.CancellationError;
  } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } });
  var r = cr;
  Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
    return r.newError;
  } });
  var n = Ie;
  Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
    return n.configureRequestOptions;
  } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
    return n.configureRequestOptionsFromUrl;
  } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
    return n.configureRequestUrl;
  } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
    return n.createHttpError;
  } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
    return n.DigestTransform;
  } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
    return n.HttpError;
  } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
    return n.HttpExecutor;
  } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
    return n.parseJson;
  } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
    return n.safeGetHeader;
  } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
    return n.safeStringifyJson;
  } });
  var i = ti;
  Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
    return i.MemoLazy;
  } });
  var o = Yr;
  Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
    return o.ProgressCallbackTransform;
  } });
  var a = zr;
  Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
    return a.getS3LikeProviderBaseUrl;
  } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
    return a.githubUrl;
  } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
    return a.githubTagPrefix;
  } });
  var s = Mo;
  Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
    return s.retry;
  } });
  var l = Bo;
  Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
    return l.parseDn;
  } });
  var p = or;
  Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
    return p.UUID;
  } });
  var c = Xr;
  Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
    return c.parseXml;
  } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
    return c.XElement;
  } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
  function f(d) {
    return d == null ? [] : Array.isArray(d) ? d : [d];
  }
})(fe);
var ye = {}, jo = {}, qe = {};
function Oc(e) {
  return typeof e > "u" || e === null;
}
function bm(e) {
  return typeof e == "object" && e !== null;
}
function Om(e) {
  return Array.isArray(e) ? e : Oc(e) ? [] : [e];
}
function Rm(e, t) {
  var r, n, i, o;
  if (t)
    for (o = Object.keys(t), r = 0, n = o.length; r < n; r += 1)
      i = o[r], e[i] = t[i];
  return e;
}
function Nm(e, t) {
  var r = "", n;
  for (n = 0; n < t; n += 1)
    r += e;
  return r;
}
function Pm(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
qe.isNothing = Oc;
qe.isObject = bm;
qe.toArray = Om;
qe.repeat = Nm;
qe.isNegativeZero = Pm;
qe.extend = Rm;
function Rc(e, t) {
  var r = "", n = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (r += 'in "' + e.mark.name + '" '), r += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (r += `

` + e.mark.snippet), n + " " + r) : n;
}
function Fr(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Rc(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Fr.prototype = Object.create(Error.prototype);
Fr.prototype.constructor = Fr;
Fr.prototype.toString = function(t) {
  return this.name + ": " + Rc(this, t);
};
var Kr = Fr, Tr = qe;
function Li(e, t, r, n, i) {
  var o = "", a = "", s = Math.floor(i / 2) - 1;
  return n - t > s && (o = " ... ", t = n - s + o.length), r - n > s && (a = " ...", r = n + s - a.length), {
    str: o + e.slice(t, r).replace(/\t/g, "→") + a,
    pos: n - t + o.length
    // relative position
  };
}
function xi(e, t) {
  return Tr.repeat(" ", t - e.length) + e;
}
function Dm(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var r = /\r?\n|\r|\0/g, n = [0], i = [], o, a = -1; o = r.exec(e.buffer); )
    i.push(o.index), n.push(o.index + o[0].length), e.position <= o.index && a < 0 && (a = n.length - 2);
  a < 0 && (a = n.length - 1);
  var s = "", l, p, c = Math.min(e.line + t.linesAfter, i.length).toString().length, f = t.maxLength - (t.indent + c + 3);
  for (l = 1; l <= t.linesBefore && !(a - l < 0); l++)
    p = Li(
      e.buffer,
      n[a - l],
      i[a - l],
      e.position - (n[a] - n[a - l]),
      f
    ), s = Tr.repeat(" ", t.indent) + xi((e.line - l + 1).toString(), c) + " | " + p.str + `
` + s;
  for (p = Li(e.buffer, n[a], i[a], e.position, f), s += Tr.repeat(" ", t.indent) + xi((e.line + 1).toString(), c) + " | " + p.str + `
`, s += Tr.repeat("-", t.indent + c + 3 + p.pos) + `^
`, l = 1; l <= t.linesAfter && !(a + l >= i.length); l++)
    p = Li(
      e.buffer,
      n[a + l],
      i[a + l],
      e.position - (n[a] - n[a + l]),
      f
    ), s += Tr.repeat(" ", t.indent) + xi((e.line + l + 1).toString(), c) + " | " + p.str + `
`;
  return s.replace(/\n$/, "");
}
var $m = Dm, is = Kr, Fm = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
], Lm = [
  "scalar",
  "sequence",
  "mapping"
];
function xm(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(r) {
    e[r].forEach(function(n) {
      t[String(n)] = r;
    });
  }), t;
}
function Um(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(r) {
    if (Fm.indexOf(r) === -1)
      throw new is('Unknown option "' + r + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(r) {
    return r;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = xm(t.styleAliases || null), Lm.indexOf(this.kind) === -1)
    throw new is('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var Ne = Um, yr = Kr, Ui = Ne;
function os(e, t) {
  var r = [];
  return e[t].forEach(function(n) {
    var i = r.length;
    r.forEach(function(o, a) {
      o.tag === n.tag && o.kind === n.kind && o.multi === n.multi && (i = a);
    }), r[i] = n;
  }), r;
}
function km() {
  var e = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, t, r;
  function n(i) {
    i.multi ? (e.multi[i.kind].push(i), e.multi.fallback.push(i)) : e[i.kind][i.tag] = e.fallback[i.tag] = i;
  }
  for (t = 0, r = arguments.length; t < r; t += 1)
    arguments[t].forEach(n);
  return e;
}
function go(e) {
  return this.extend(e);
}
go.prototype.extend = function(t) {
  var r = [], n = [];
  if (t instanceof Ui)
    n.push(t);
  else if (Array.isArray(t))
    n = n.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (r = r.concat(t.implicit)), t.explicit && (n = n.concat(t.explicit));
  else
    throw new yr("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  r.forEach(function(o) {
    if (!(o instanceof Ui))
      throw new yr("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new yr("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new yr("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), n.forEach(function(o) {
    if (!(o instanceof Ui))
      throw new yr("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var i = Object.create(go.prototype);
  return i.implicit = (this.implicit || []).concat(r), i.explicit = (this.explicit || []).concat(n), i.compiledImplicit = os(i, "implicit"), i.compiledExplicit = os(i, "explicit"), i.compiledTypeMap = km(i.compiledImplicit, i.compiledExplicit), i;
};
var Nc = go, Mm = Ne, Pc = new Mm("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), Bm = Ne, Dc = new Bm("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), jm = Ne, $c = new jm("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), Hm = Nc, Fc = new Hm({
  explicit: [
    Pc,
    Dc,
    $c
  ]
}), Gm = Ne;
function qm(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Vm() {
  return null;
}
function Wm(e) {
  return e === null;
}
var Lc = new Gm("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: qm,
  construct: Vm,
  predicate: Wm,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
}), Ym = Ne;
function zm(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function Xm(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Km(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var xc = new Ym("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: zm,
  construct: Xm,
  predicate: Km,
  represent: {
    lowercase: function(e) {
      return e ? "true" : "false";
    },
    uppercase: function(e) {
      return e ? "TRUE" : "FALSE";
    },
    camelcase: function(e) {
      return e ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
}), Jm = qe, Qm = Ne;
function Zm(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function eg(e) {
  return 48 <= e && e <= 55;
}
function tg(e) {
  return 48 <= e && e <= 57;
}
function rg(e) {
  if (e === null) return !1;
  var t = e.length, r = 0, n = !1, i;
  if (!t) return !1;
  if (i = e[r], (i === "-" || i === "+") && (i = e[++r]), i === "0") {
    if (r + 1 === t) return !0;
    if (i = e[++r], i === "b") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (i !== "0" && i !== "1") return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "x") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Zm(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "o") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!eg(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
  }
  if (i === "_") return !1;
  for (; r < t; r++)
    if (i = e[r], i !== "_") {
      if (!tg(e.charCodeAt(r)))
        return !1;
      n = !0;
    }
  return !(!n || i === "_");
}
function ng(e) {
  var t = e, r = 1, n;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), n = t[0], (n === "-" || n === "+") && (n === "-" && (r = -1), t = t.slice(1), n = t[0]), t === "0") return 0;
  if (n === "0") {
    if (t[1] === "b") return r * parseInt(t.slice(2), 2);
    if (t[1] === "x") return r * parseInt(t.slice(2), 16);
    if (t[1] === "o") return r * parseInt(t.slice(2), 8);
  }
  return r * parseInt(t, 10);
}
function ig(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !Jm.isNegativeZero(e);
}
var Uc = new Qm("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: rg,
  construct: ng,
  predicate: ig,
  represent: {
    binary: function(e) {
      return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
    },
    octal: function(e) {
      return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
    },
    decimal: function(e) {
      return e.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(e) {
      return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
}), kc = qe, og = Ne, ag = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function sg(e) {
  return !(e === null || !ag.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function lg(e) {
  var t, r;
  return t = e.replace(/_/g, "").toLowerCase(), r = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? r === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : r * parseFloat(t, 10);
}
var cg = /^[-+]?[0-9]+e/;
function ug(e, t) {
  var r;
  if (isNaN(e))
    switch (t) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  else if (Number.POSITIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  else if (Number.NEGATIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  else if (kc.isNegativeZero(e))
    return "-0.0";
  return r = e.toString(10), cg.test(r) ? r.replace("e", ".e") : r;
}
function fg(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || kc.isNegativeZero(e));
}
var Mc = new og("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: sg,
  construct: lg,
  predicate: fg,
  represent: ug,
  defaultStyle: "lowercase"
}), Bc = Fc.extend({
  implicit: [
    Lc,
    xc,
    Uc,
    Mc
  ]
}), jc = Bc, dg = Ne, Hc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Gc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function hg(e) {
  return e === null ? !1 : Hc.exec(e) !== null || Gc.exec(e) !== null;
}
function pg(e) {
  var t, r, n, i, o, a, s, l = 0, p = null, c, f, d;
  if (t = Hc.exec(e), t === null && (t = Gc.exec(e)), t === null) throw new Error("Date resolve error");
  if (r = +t[1], n = +t[2] - 1, i = +t[3], !t[4])
    return new Date(Date.UTC(r, n, i));
  if (o = +t[4], a = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (c = +t[10], f = +(t[11] || 0), p = (c * 60 + f) * 6e4, t[9] === "-" && (p = -p)), d = new Date(Date.UTC(r, n, i, o, a, s, l)), p && d.setTime(d.getTime() - p), d;
}
function mg(e) {
  return e.toISOString();
}
var qc = new dg("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: hg,
  construct: pg,
  instanceOf: Date,
  represent: mg
}), gg = Ne;
function Eg(e) {
  return e === "<<" || e === null;
}
var Vc = new gg("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: Eg
}), yg = Ne, Ho = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function vg(e) {
  if (e === null) return !1;
  var t, r, n = 0, i = e.length, o = Ho;
  for (r = 0; r < i; r++)
    if (t = o.indexOf(e.charAt(r)), !(t > 64)) {
      if (t < 0) return !1;
      n += 6;
    }
  return n % 8 === 0;
}
function _g(e) {
  var t, r, n = e.replace(/[\r\n=]/g, ""), i = n.length, o = Ho, a = 0, s = [];
  for (t = 0; t < i; t++)
    t % 4 === 0 && t && (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)), a = a << 6 | o.indexOf(n.charAt(t));
  return r = i % 4 * 6, r === 0 ? (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)) : r === 18 ? (s.push(a >> 10 & 255), s.push(a >> 2 & 255)) : r === 12 && s.push(a >> 4 & 255), new Uint8Array(s);
}
function wg(e) {
  var t = "", r = 0, n, i, o = e.length, a = Ho;
  for (n = 0; n < o; n++)
    n % 3 === 0 && n && (t += a[r >> 18 & 63], t += a[r >> 12 & 63], t += a[r >> 6 & 63], t += a[r & 63]), r = (r << 8) + e[n];
  return i = o % 3, i === 0 ? (t += a[r >> 18 & 63], t += a[r >> 12 & 63], t += a[r >> 6 & 63], t += a[r & 63]) : i === 2 ? (t += a[r >> 10 & 63], t += a[r >> 4 & 63], t += a[r << 2 & 63], t += a[64]) : i === 1 && (t += a[r >> 2 & 63], t += a[r << 4 & 63], t += a[64], t += a[64]), t;
}
function Tg(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var Wc = new yg("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: vg,
  construct: _g,
  predicate: Tg,
  represent: wg
}), Ag = Ne, Cg = Object.prototype.hasOwnProperty, Sg = Object.prototype.toString;
function Ig(e) {
  if (e === null) return !0;
  var t = [], r, n, i, o, a, s = e;
  for (r = 0, n = s.length; r < n; r += 1) {
    if (i = s[r], a = !1, Sg.call(i) !== "[object Object]") return !1;
    for (o in i)
      if (Cg.call(i, o))
        if (!a) a = !0;
        else return !1;
    if (!a) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function bg(e) {
  return e !== null ? e : [];
}
var Yc = new Ag("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Ig,
  construct: bg
}), Og = Ne, Rg = Object.prototype.toString;
function Ng(e) {
  if (e === null) return !0;
  var t, r, n, i, o, a = e;
  for (o = new Array(a.length), t = 0, r = a.length; t < r; t += 1) {
    if (n = a[t], Rg.call(n) !== "[object Object]" || (i = Object.keys(n), i.length !== 1)) return !1;
    o[t] = [i[0], n[i[0]]];
  }
  return !0;
}
function Pg(e) {
  if (e === null) return [];
  var t, r, n, i, o, a = e;
  for (o = new Array(a.length), t = 0, r = a.length; t < r; t += 1)
    n = a[t], i = Object.keys(n), o[t] = [i[0], n[i[0]]];
  return o;
}
var zc = new Og("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: Ng,
  construct: Pg
}), Dg = Ne, $g = Object.prototype.hasOwnProperty;
function Fg(e) {
  if (e === null) return !0;
  var t, r = e;
  for (t in r)
    if ($g.call(r, t) && r[t] !== null)
      return !1;
  return !0;
}
function Lg(e) {
  return e !== null ? e : {};
}
var Xc = new Dg("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: Fg,
  construct: Lg
}), Go = jc.extend({
  implicit: [
    qc,
    Vc
  ],
  explicit: [
    Wc,
    Yc,
    zc,
    Xc
  ]
}), Dt = qe, Kc = Kr, xg = $m, Ug = Go, yt = Object.prototype.hasOwnProperty, Gn = 1, Jc = 2, Qc = 3, qn = 4, ki = 1, kg = 2, as = 3, Mg = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Bg = /[\x85\u2028\u2029]/, jg = /[,\[\]\{\}]/, Zc = /^(?:!|!!|![a-z\-]+!)$/i, eu = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function ss(e) {
  return Object.prototype.toString.call(e);
}
function Je(e) {
  return e === 10 || e === 13;
}
function xt(e) {
  return e === 9 || e === 32;
}
function $e(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function Jt(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Hg(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function Gg(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function qg(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function ls(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function Vg(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function tu(e, t, r) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: r
  }) : e[t] = r;
}
var ru = new Array(256), nu = new Array(256);
for (var Vt = 0; Vt < 256; Vt++)
  ru[Vt] = ls(Vt) ? 1 : 0, nu[Vt] = ls(Vt);
function Wg(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || Ug, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function iu(e, t) {
  var r = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return r.snippet = xg(r), new Kc(t, r);
}
function x(e, t) {
  throw iu(e, t);
}
function Vn(e, t) {
  e.onWarning && e.onWarning.call(null, iu(e, t));
}
var cs = {
  YAML: function(t, r, n) {
    var i, o, a;
    t.version !== null && x(t, "duplication of %YAML directive"), n.length !== 1 && x(t, "YAML directive accepts exactly one argument"), i = /^([0-9]+)\.([0-9]+)$/.exec(n[0]), i === null && x(t, "ill-formed argument of the YAML directive"), o = parseInt(i[1], 10), a = parseInt(i[2], 10), o !== 1 && x(t, "unacceptable YAML version of the document"), t.version = n[0], t.checkLineBreaks = a < 2, a !== 1 && a !== 2 && Vn(t, "unsupported YAML version of the document");
  },
  TAG: function(t, r, n) {
    var i, o;
    n.length !== 2 && x(t, "TAG directive accepts exactly two arguments"), i = n[0], o = n[1], Zc.test(i) || x(t, "ill-formed tag handle (first argument) of the TAG directive"), yt.call(t.tagMap, i) && x(t, 'there is a previously declared suffix for "' + i + '" tag handle'), eu.test(o) || x(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      o = decodeURIComponent(o);
    } catch {
      x(t, "tag prefix is malformed: " + o);
    }
    t.tagMap[i] = o;
  }
};
function mt(e, t, r, n) {
  var i, o, a, s;
  if (t < r) {
    if (s = e.input.slice(t, r), n)
      for (i = 0, o = s.length; i < o; i += 1)
        a = s.charCodeAt(i), a === 9 || 32 <= a && a <= 1114111 || x(e, "expected valid JSON character");
    else Mg.test(s) && x(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function us(e, t, r, n) {
  var i, o, a, s;
  for (Dt.isObject(r) || x(e, "cannot merge mappings; the provided source object is unacceptable"), i = Object.keys(r), a = 0, s = i.length; a < s; a += 1)
    o = i[a], yt.call(t, o) || (tu(t, o, r[o]), n[o] = !0);
}
function Qt(e, t, r, n, i, o, a, s, l) {
  var p, c;
  if (Array.isArray(i))
    for (i = Array.prototype.slice.call(i), p = 0, c = i.length; p < c; p += 1)
      Array.isArray(i[p]) && x(e, "nested arrays are not supported inside keys"), typeof i == "object" && ss(i[p]) === "[object Object]" && (i[p] = "[object Object]");
  if (typeof i == "object" && ss(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), n === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (p = 0, c = o.length; p < c; p += 1)
        us(e, t, o[p], r);
    else
      us(e, t, o, r);
  else
    !e.json && !yt.call(r, i) && yt.call(t, i) && (e.line = a || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, x(e, "duplicated mapping key")), tu(t, i, o), delete r[i];
  return t;
}
function qo(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : x(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function se(e, t, r) {
  for (var n = 0, i = e.input.charCodeAt(e.position); i !== 0; ) {
    for (; xt(i); )
      i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
    if (t && i === 35)
      do
        i = e.input.charCodeAt(++e.position);
      while (i !== 10 && i !== 13 && i !== 0);
    if (Je(i))
      for (qo(e), i = e.input.charCodeAt(e.position), n++, e.lineIndent = 0; i === 32; )
        e.lineIndent++, i = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return r !== -1 && n !== 0 && e.lineIndent < r && Vn(e, "deficient indentation"), n;
}
function ri(e) {
  var t = e.position, r;
  return r = e.input.charCodeAt(t), !!((r === 45 || r === 46) && r === e.input.charCodeAt(t + 1) && r === e.input.charCodeAt(t + 2) && (t += 3, r = e.input.charCodeAt(t), r === 0 || $e(r)));
}
function Vo(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += Dt.repeat(`
`, t - 1));
}
function Yg(e, t, r) {
  var n, i, o, a, s, l, p, c, f = e.kind, d = e.result, g;
  if (g = e.input.charCodeAt(e.position), $e(g) || Jt(g) || g === 35 || g === 38 || g === 42 || g === 33 || g === 124 || g === 62 || g === 39 || g === 34 || g === 37 || g === 64 || g === 96 || (g === 63 || g === 45) && (i = e.input.charCodeAt(e.position + 1), $e(i) || r && Jt(i)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = a = e.position, s = !1; g !== 0; ) {
    if (g === 58) {
      if (i = e.input.charCodeAt(e.position + 1), $e(i) || r && Jt(i))
        break;
    } else if (g === 35) {
      if (n = e.input.charCodeAt(e.position - 1), $e(n))
        break;
    } else {
      if (e.position === e.lineStart && ri(e) || r && Jt(g))
        break;
      if (Je(g))
        if (l = e.line, p = e.lineStart, c = e.lineIndent, se(e, !1, -1), e.lineIndent >= t) {
          s = !0, g = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = a, e.line = l, e.lineStart = p, e.lineIndent = c;
          break;
        }
    }
    s && (mt(e, o, a, !1), Vo(e, e.line - l), o = a = e.position, s = !1), xt(g) || (a = e.position + 1), g = e.input.charCodeAt(++e.position);
  }
  return mt(e, o, a, !1), e.result ? !0 : (e.kind = f, e.result = d, !1);
}
function zg(e, t) {
  var r, n, i;
  if (r = e.input.charCodeAt(e.position), r !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (r = e.input.charCodeAt(e.position)) !== 0; )
    if (r === 39)
      if (mt(e, n, e.position, !0), r = e.input.charCodeAt(++e.position), r === 39)
        n = e.position, e.position++, i = e.position;
      else
        return !0;
    else Je(r) ? (mt(e, n, i, !0), Vo(e, se(e, !1, t)), n = i = e.position) : e.position === e.lineStart && ri(e) ? x(e, "unexpected end of the document within a single quoted scalar") : (e.position++, i = e.position);
  x(e, "unexpected end of the stream within a single quoted scalar");
}
function Xg(e, t) {
  var r, n, i, o, a, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, r = n = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return mt(e, r, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (mt(e, r, e.position, !0), s = e.input.charCodeAt(++e.position), Je(s))
        se(e, !1, t);
      else if (s < 256 && ru[s])
        e.result += nu[s], e.position++;
      else if ((a = Gg(s)) > 0) {
        for (i = a, o = 0; i > 0; i--)
          s = e.input.charCodeAt(++e.position), (a = Hg(s)) >= 0 ? o = (o << 4) + a : x(e, "expected hexadecimal character");
        e.result += Vg(o), e.position++;
      } else
        x(e, "unknown escape sequence");
      r = n = e.position;
    } else Je(s) ? (mt(e, r, n, !0), Vo(e, se(e, !1, t)), r = n = e.position) : e.position === e.lineStart && ri(e) ? x(e, "unexpected end of the document within a double quoted scalar") : (e.position++, n = e.position);
  }
  x(e, "unexpected end of the stream within a double quoted scalar");
}
function Kg(e, t) {
  var r = !0, n, i, o, a = e.tag, s, l = e.anchor, p, c, f, d, g, v = /* @__PURE__ */ Object.create(null), y, T, C, A;
  if (A = e.input.charCodeAt(e.position), A === 91)
    c = 93, g = !1, s = [];
  else if (A === 123)
    c = 125, g = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), A = e.input.charCodeAt(++e.position); A !== 0; ) {
    if (se(e, !0, t), A = e.input.charCodeAt(e.position), A === c)
      return e.position++, e.tag = a, e.anchor = l, e.kind = g ? "mapping" : "sequence", e.result = s, !0;
    r ? A === 44 && x(e, "expected the node content, but found ','") : x(e, "missed comma between flow collection entries"), T = y = C = null, f = d = !1, A === 63 && (p = e.input.charCodeAt(e.position + 1), $e(p) && (f = d = !0, e.position++, se(e, !0, t))), n = e.line, i = e.lineStart, o = e.position, ar(e, t, Gn, !1, !0), T = e.tag, y = e.result, se(e, !0, t), A = e.input.charCodeAt(e.position), (d || e.line === n) && A === 58 && (f = !0, A = e.input.charCodeAt(++e.position), se(e, !0, t), ar(e, t, Gn, !1, !0), C = e.result), g ? Qt(e, s, v, T, y, C, n, i, o) : f ? s.push(Qt(e, null, v, T, y, C, n, i, o)) : s.push(y), se(e, !0, t), A = e.input.charCodeAt(e.position), A === 44 ? (r = !0, A = e.input.charCodeAt(++e.position)) : r = !1;
  }
  x(e, "unexpected end of the stream within a flow collection");
}
function Jg(e, t) {
  var r, n, i = ki, o = !1, a = !1, s = t, l = 0, p = !1, c, f;
  if (f = e.input.charCodeAt(e.position), f === 124)
    n = !1;
  else if (f === 62)
    n = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; f !== 0; )
    if (f = e.input.charCodeAt(++e.position), f === 43 || f === 45)
      ki === i ? i = f === 43 ? as : kg : x(e, "repeat of a chomping mode identifier");
    else if ((c = qg(f)) >= 0)
      c === 0 ? x(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : a ? x(e, "repeat of an indentation width identifier") : (s = t + c - 1, a = !0);
    else
      break;
  if (xt(f)) {
    do
      f = e.input.charCodeAt(++e.position);
    while (xt(f));
    if (f === 35)
      do
        f = e.input.charCodeAt(++e.position);
      while (!Je(f) && f !== 0);
  }
  for (; f !== 0; ) {
    for (qo(e), e.lineIndent = 0, f = e.input.charCodeAt(e.position); (!a || e.lineIndent < s) && f === 32; )
      e.lineIndent++, f = e.input.charCodeAt(++e.position);
    if (!a && e.lineIndent > s && (s = e.lineIndent), Je(f)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      i === as ? e.result += Dt.repeat(`
`, o ? 1 + l : l) : i === ki && o && (e.result += `
`);
      break;
    }
    for (n ? xt(f) ? (p = !0, e.result += Dt.repeat(`
`, o ? 1 + l : l)) : p ? (p = !1, e.result += Dt.repeat(`
`, l + 1)) : l === 0 ? o && (e.result += " ") : e.result += Dt.repeat(`
`, l) : e.result += Dt.repeat(`
`, o ? 1 + l : l), o = !0, a = !0, l = 0, r = e.position; !Je(f) && f !== 0; )
      f = e.input.charCodeAt(++e.position);
    mt(e, r, e.position, !1);
  }
  return !0;
}
function fs(e, t) {
  var r, n = e.tag, i = e.anchor, o = [], a, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, x(e, "tab characters must not be used in indentation")), !(l !== 45 || (a = e.input.charCodeAt(e.position + 1), !$e(a)))); ) {
    if (s = !0, e.position++, se(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (r = e.line, ar(e, t, Qc, !1, !0), o.push(e.result), se(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === r || e.lineIndent > t) && l !== 0)
      x(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = n, e.anchor = i, e.kind = "sequence", e.result = o, !0) : !1;
}
function Qg(e, t, r) {
  var n, i, o, a, s, l, p = e.tag, c = e.anchor, f = {}, d = /* @__PURE__ */ Object.create(null), g = null, v = null, y = null, T = !1, C = !1, A;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = f), A = e.input.charCodeAt(e.position); A !== 0; ) {
    if (!T && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, x(e, "tab characters must not be used in indentation")), n = e.input.charCodeAt(e.position + 1), o = e.line, (A === 63 || A === 58) && $e(n))
      A === 63 ? (T && (Qt(e, f, d, g, v, null, a, s, l), g = v = y = null), C = !0, T = !0, i = !0) : T ? (T = !1, i = !0) : x(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, A = n;
    else {
      if (a = e.line, s = e.lineStart, l = e.position, !ar(e, r, Jc, !1, !0))
        break;
      if (e.line === o) {
        for (A = e.input.charCodeAt(e.position); xt(A); )
          A = e.input.charCodeAt(++e.position);
        if (A === 58)
          A = e.input.charCodeAt(++e.position), $e(A) || x(e, "a whitespace character is expected after the key-value separator within a block mapping"), T && (Qt(e, f, d, g, v, null, a, s, l), g = v = y = null), C = !0, T = !1, i = !1, g = e.tag, v = e.result;
        else if (C)
          x(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = p, e.anchor = c, !0;
      } else if (C)
        x(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = p, e.anchor = c, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (T && (a = e.line, s = e.lineStart, l = e.position), ar(e, t, qn, !0, i) && (T ? v = e.result : y = e.result), T || (Qt(e, f, d, g, v, y, a, s, l), g = v = y = null), se(e, !0, -1), A = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && A !== 0)
      x(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return T && Qt(e, f, d, g, v, null, a, s, l), C && (e.tag = p, e.anchor = c, e.kind = "mapping", e.result = f), C;
}
function Zg(e) {
  var t, r = !1, n = !1, i, o, a;
  if (a = e.input.charCodeAt(e.position), a !== 33) return !1;
  if (e.tag !== null && x(e, "duplication of a tag property"), a = e.input.charCodeAt(++e.position), a === 60 ? (r = !0, a = e.input.charCodeAt(++e.position)) : a === 33 ? (n = !0, i = "!!", a = e.input.charCodeAt(++e.position)) : i = "!", t = e.position, r) {
    do
      a = e.input.charCodeAt(++e.position);
    while (a !== 0 && a !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), a = e.input.charCodeAt(++e.position)) : x(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; a !== 0 && !$e(a); )
      a === 33 && (n ? x(e, "tag suffix cannot contain exclamation marks") : (i = e.input.slice(t - 1, e.position + 1), Zc.test(i) || x(e, "named tag handle cannot contain such characters"), n = !0, t = e.position + 1)), a = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), jg.test(o) && x(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !eu.test(o) && x(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    x(e, "tag name is malformed: " + o);
  }
  return r ? e.tag = o : yt.call(e.tagMap, i) ? e.tag = e.tagMap[i] + o : i === "!" ? e.tag = "!" + o : i === "!!" ? e.tag = "tag:yaml.org,2002:" + o : x(e, 'undeclared tag handle "' + i + '"'), !0;
}
function e0(e) {
  var t, r;
  if (r = e.input.charCodeAt(e.position), r !== 38) return !1;
  for (e.anchor !== null && x(e, "duplication of an anchor property"), r = e.input.charCodeAt(++e.position), t = e.position; r !== 0 && !$e(r) && !Jt(r); )
    r = e.input.charCodeAt(++e.position);
  return e.position === t && x(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function t0(e) {
  var t, r, n;
  if (n = e.input.charCodeAt(e.position), n !== 42) return !1;
  for (n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !$e(n) && !Jt(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && x(e, "name of an alias node must contain at least one character"), r = e.input.slice(t, e.position), yt.call(e.anchorMap, r) || x(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], se(e, !0, -1), !0;
}
function ar(e, t, r, n, i) {
  var o, a, s, l = 1, p = !1, c = !1, f, d, g, v, y, T;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = a = s = qn === r || Qc === r, n && se(e, !0, -1) && (p = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; Zg(e) || e0(e); )
      se(e, !0, -1) ? (p = !0, s = o, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = p || i), (l === 1 || qn === r) && (Gn === r || Jc === r ? y = t : y = t + 1, T = e.position - e.lineStart, l === 1 ? s && (fs(e, T) || Qg(e, T, y)) || Kg(e, y) ? c = !0 : (a && Jg(e, y) || zg(e, y) || Xg(e, y) ? c = !0 : t0(e) ? (c = !0, (e.tag !== null || e.anchor !== null) && x(e, "alias node should not have any properties")) : Yg(e, y, Gn === r) && (c = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (c = s && fs(e, T))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && x(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), f = 0, d = e.implicitTypes.length; f < d; f += 1)
      if (v = e.implicitTypes[f], v.resolve(e.result)) {
        e.result = v.construct(e.result), e.tag = v.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (yt.call(e.typeMap[e.kind || "fallback"], e.tag))
      v = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (v = null, g = e.typeMap.multi[e.kind || "fallback"], f = 0, d = g.length; f < d; f += 1)
        if (e.tag.slice(0, g[f].tag.length) === g[f].tag) {
          v = g[f];
          break;
        }
    v || x(e, "unknown tag !<" + e.tag + ">"), e.result !== null && v.kind !== e.kind && x(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + v.kind + '", not "' + e.kind + '"'), v.resolve(e.result, e.tag) ? (e.result = v.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : x(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || c;
}
function r0(e) {
  var t = e.position, r, n, i, o = !1, a;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (a = e.input.charCodeAt(e.position)) !== 0 && (se(e, !0, -1), a = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || a !== 37)); ) {
    for (o = !0, a = e.input.charCodeAt(++e.position), r = e.position; a !== 0 && !$e(a); )
      a = e.input.charCodeAt(++e.position);
    for (n = e.input.slice(r, e.position), i = [], n.length < 1 && x(e, "directive name must not be less than one character in length"); a !== 0; ) {
      for (; xt(a); )
        a = e.input.charCodeAt(++e.position);
      if (a === 35) {
        do
          a = e.input.charCodeAt(++e.position);
        while (a !== 0 && !Je(a));
        break;
      }
      if (Je(a)) break;
      for (r = e.position; a !== 0 && !$e(a); )
        a = e.input.charCodeAt(++e.position);
      i.push(e.input.slice(r, e.position));
    }
    a !== 0 && qo(e), yt.call(cs, n) ? cs[n](e, n, i) : Vn(e, 'unknown document directive "' + n + '"');
  }
  if (se(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, se(e, !0, -1)) : o && x(e, "directives end mark is expected"), ar(e, e.lineIndent - 1, qn, !1, !0), se(e, !0, -1), e.checkLineBreaks && Bg.test(e.input.slice(t, e.position)) && Vn(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && ri(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, se(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    x(e, "end of the stream or a document separator is expected");
  else
    return;
}
function ou(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var r = new Wg(e, t), n = e.indexOf("\0");
  for (n !== -1 && (r.position = n, x(r, "null byte is not allowed in input")), r.input += "\0"; r.input.charCodeAt(r.position) === 32; )
    r.lineIndent += 1, r.position += 1;
  for (; r.position < r.length - 1; )
    r0(r);
  return r.documents;
}
function n0(e, t, r) {
  t !== null && typeof t == "object" && typeof r > "u" && (r = t, t = null);
  var n = ou(e, r);
  if (typeof t != "function")
    return n;
  for (var i = 0, o = n.length; i < o; i += 1)
    t(n[i]);
}
function i0(e, t) {
  var r = ou(e, t);
  if (r.length !== 0) {
    if (r.length === 1)
      return r[0];
    throw new Kc("expected a single document in the stream, but found more");
  }
}
jo.loadAll = n0;
jo.load = i0;
var au = {}, ni = qe, Jr = Kr, o0 = Go, su = Object.prototype.toString, lu = Object.prototype.hasOwnProperty, Wo = 65279, a0 = 9, Lr = 10, s0 = 13, l0 = 32, c0 = 33, u0 = 34, Eo = 35, f0 = 37, d0 = 38, h0 = 39, p0 = 42, cu = 44, m0 = 45, Wn = 58, g0 = 61, E0 = 62, y0 = 63, v0 = 64, uu = 91, fu = 93, _0 = 96, du = 123, w0 = 124, hu = 125, Te = {};
Te[0] = "\\0";
Te[7] = "\\a";
Te[8] = "\\b";
Te[9] = "\\t";
Te[10] = "\\n";
Te[11] = "\\v";
Te[12] = "\\f";
Te[13] = "\\r";
Te[27] = "\\e";
Te[34] = '\\"';
Te[92] = "\\\\";
Te[133] = "\\N";
Te[160] = "\\_";
Te[8232] = "\\L";
Te[8233] = "\\P";
var T0 = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
], A0 = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function C0(e, t) {
  var r, n, i, o, a, s, l;
  if (t === null) return {};
  for (r = {}, n = Object.keys(t), i = 0, o = n.length; i < o; i += 1)
    a = n[i], s = String(t[a]), a.slice(0, 2) === "!!" && (a = "tag:yaml.org,2002:" + a.slice(2)), l = e.compiledTypeMap.fallback[a], l && lu.call(l.styleAliases, s) && (s = l.styleAliases[s]), r[a] = s;
  return r;
}
function S0(e) {
  var t, r, n;
  if (t = e.toString(16).toUpperCase(), e <= 255)
    r = "x", n = 2;
  else if (e <= 65535)
    r = "u", n = 4;
  else if (e <= 4294967295)
    r = "U", n = 8;
  else
    throw new Jr("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + r + ni.repeat("0", n - t.length) + t;
}
var I0 = 1, xr = 2;
function b0(e) {
  this.schema = e.schema || o0, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = ni.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = C0(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? xr : I0, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
function ds(e, t) {
  for (var r = ni.repeat(" ", t), n = 0, i = -1, o = "", a, s = e.length; n < s; )
    i = e.indexOf(`
`, n), i === -1 ? (a = e.slice(n), n = s) : (a = e.slice(n, i + 1), n = i + 1), a.length && a !== `
` && (o += r), o += a;
  return o;
}
function yo(e, t) {
  return `
` + ni.repeat(" ", e.indent * t);
}
function O0(e, t) {
  var r, n, i;
  for (r = 0, n = e.implicitTypes.length; r < n; r += 1)
    if (i = e.implicitTypes[r], i.resolve(t))
      return !0;
  return !1;
}
function Yn(e) {
  return e === l0 || e === a0;
}
function Ur(e) {
  return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && e !== 8232 && e !== 8233 || 57344 <= e && e <= 65533 && e !== Wo || 65536 <= e && e <= 1114111;
}
function hs(e) {
  return Ur(e) && e !== Wo && e !== s0 && e !== Lr;
}
function ps(e, t, r) {
  var n = hs(e), i = n && !Yn(e);
  return (
    // ns-plain-safe
    (r ? (
      // c = flow-in
      n
    ) : n && e !== cu && e !== uu && e !== fu && e !== du && e !== hu) && e !== Eo && !(t === Wn && !i) || hs(t) && !Yn(t) && e === Eo || t === Wn && i
  );
}
function R0(e) {
  return Ur(e) && e !== Wo && !Yn(e) && e !== m0 && e !== y0 && e !== Wn && e !== cu && e !== uu && e !== fu && e !== du && e !== hu && e !== Eo && e !== d0 && e !== p0 && e !== c0 && e !== w0 && e !== g0 && e !== E0 && e !== h0 && e !== u0 && e !== f0 && e !== v0 && e !== _0;
}
function N0(e) {
  return !Yn(e) && e !== Wn;
}
function Ar(e, t) {
  var r = e.charCodeAt(t), n;
  return r >= 55296 && r <= 56319 && t + 1 < e.length && (n = e.charCodeAt(t + 1), n >= 56320 && n <= 57343) ? (r - 55296) * 1024 + n - 56320 + 65536 : r;
}
function pu(e) {
  var t = /^\n* /;
  return t.test(e);
}
var mu = 1, vo = 2, gu = 3, Eu = 4, Xt = 5;
function P0(e, t, r, n, i, o, a, s) {
  var l, p = 0, c = null, f = !1, d = !1, g = n !== -1, v = -1, y = R0(Ar(e, 0)) && N0(Ar(e, e.length - 1));
  if (t || a)
    for (l = 0; l < e.length; p >= 65536 ? l += 2 : l++) {
      if (p = Ar(e, l), !Ur(p))
        return Xt;
      y = y && ps(p, c, s), c = p;
    }
  else {
    for (l = 0; l < e.length; p >= 65536 ? l += 2 : l++) {
      if (p = Ar(e, l), p === Lr)
        f = !0, g && (d = d || // Foldable line = too long, and not more-indented.
        l - v - 1 > n && e[v + 1] !== " ", v = l);
      else if (!Ur(p))
        return Xt;
      y = y && ps(p, c, s), c = p;
    }
    d = d || g && l - v - 1 > n && e[v + 1] !== " ";
  }
  return !f && !d ? y && !a && !i(e) ? mu : o === xr ? Xt : vo : r > 9 && pu(e) ? Xt : a ? o === xr ? Xt : vo : d ? Eu : gu;
}
function D0(e, t, r, n, i) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === xr ? '""' : "''";
    if (!e.noCompatMode && (T0.indexOf(t) !== -1 || A0.test(t)))
      return e.quotingType === xr ? '"' + t + '"' : "'" + t + "'";
    var o = e.indent * Math.max(1, r), a = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o), s = n || e.flowLevel > -1 && r >= e.flowLevel;
    function l(p) {
      return O0(e, p);
    }
    switch (P0(
      t,
      s,
      e.indent,
      a,
      l,
      e.quotingType,
      e.forceQuotes && !n,
      i
    )) {
      case mu:
        return t;
      case vo:
        return "'" + t.replace(/'/g, "''") + "'";
      case gu:
        return "|" + ms(t, e.indent) + gs(ds(t, o));
      case Eu:
        return ">" + ms(t, e.indent) + gs(ds($0(t, a), o));
      case Xt:
        return '"' + F0(t) + '"';
      default:
        throw new Jr("impossible error: invalid scalar style");
    }
  }();
}
function ms(e, t) {
  var r = pu(e) ? String(t) : "", n = e[e.length - 1] === `
`, i = n && (e[e.length - 2] === `
` || e === `
`), o = i ? "+" : n ? "" : "-";
  return r + o + `
`;
}
function gs(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
function $0(e, t) {
  for (var r = /(\n+)([^\n]*)/g, n = function() {
    var p = e.indexOf(`
`);
    return p = p !== -1 ? p : e.length, r.lastIndex = p, Es(e.slice(0, p), t);
  }(), i = e[0] === `
` || e[0] === " ", o, a; a = r.exec(e); ) {
    var s = a[1], l = a[2];
    o = l[0] === " ", n += s + (!i && !o && l !== "" ? `
` : "") + Es(l, t), i = o;
  }
  return n;
}
function Es(e, t) {
  if (e === "" || e[0] === " ") return e;
  for (var r = / [^ ]/g, n, i = 0, o, a = 0, s = 0, l = ""; n = r.exec(e); )
    s = n.index, s - i > t && (o = a > i ? a : s, l += `
` + e.slice(i, o), i = o + 1), a = s;
  return l += `
`, e.length - i > t && a > i ? l += e.slice(i, a) + `
` + e.slice(a + 1) : l += e.slice(i), l.slice(1);
}
function F0(e) {
  for (var t = "", r = 0, n, i = 0; i < e.length; r >= 65536 ? i += 2 : i++)
    r = Ar(e, i), n = Te[r], !n && Ur(r) ? (t += e[i], r >= 65536 && (t += e[i + 1])) : t += n || S0(r);
  return t;
}
function L0(e, t, r) {
  var n = "", i = e.tag, o, a, s;
  for (o = 0, a = r.length; o < a; o += 1)
    s = r[o], e.replacer && (s = e.replacer.call(r, String(o), s)), (nt(e, t, s, !1, !1) || typeof s > "u" && nt(e, t, null, !1, !1)) && (n !== "" && (n += "," + (e.condenseFlow ? "" : " ")), n += e.dump);
  e.tag = i, e.dump = "[" + n + "]";
}
function ys(e, t, r, n) {
  var i = "", o = e.tag, a, s, l;
  for (a = 0, s = r.length; a < s; a += 1)
    l = r[a], e.replacer && (l = e.replacer.call(r, String(a), l)), (nt(e, t + 1, l, !0, !0, !1, !0) || typeof l > "u" && nt(e, t + 1, null, !0, !0, !1, !0)) && ((!n || i !== "") && (i += yo(e, t)), e.dump && Lr === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
  e.tag = o, e.dump = i || "[]";
}
function x0(e, t, r) {
  var n = "", i = e.tag, o = Object.keys(r), a, s, l, p, c;
  for (a = 0, s = o.length; a < s; a += 1)
    c = "", n !== "" && (c += ", "), e.condenseFlow && (c += '"'), l = o[a], p = r[l], e.replacer && (p = e.replacer.call(r, l, p)), nt(e, t, l, !1, !1) && (e.dump.length > 1024 && (c += "? "), c += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), nt(e, t, p, !1, !1) && (c += e.dump, n += c));
  e.tag = i, e.dump = "{" + n + "}";
}
function U0(e, t, r, n) {
  var i = "", o = e.tag, a = Object.keys(r), s, l, p, c, f, d;
  if (e.sortKeys === !0)
    a.sort();
  else if (typeof e.sortKeys == "function")
    a.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new Jr("sortKeys must be a boolean or a function");
  for (s = 0, l = a.length; s < l; s += 1)
    d = "", (!n || i !== "") && (d += yo(e, t)), p = a[s], c = r[p], e.replacer && (c = e.replacer.call(r, p, c)), nt(e, t + 1, p, !0, !0, !0) && (f = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024, f && (e.dump && Lr === e.dump.charCodeAt(0) ? d += "?" : d += "? "), d += e.dump, f && (d += yo(e, t)), nt(e, t + 1, c, !0, f) && (e.dump && Lr === e.dump.charCodeAt(0) ? d += ":" : d += ": ", d += e.dump, i += d));
  e.tag = o, e.dump = i || "{}";
}
function vs(e, t, r) {
  var n, i, o, a, s, l;
  for (i = r ? e.explicitTypes : e.implicitTypes, o = 0, a = i.length; o < a; o += 1)
    if (s = i[o], (s.instanceOf || s.predicate) && (!s.instanceOf || typeof t == "object" && t instanceof s.instanceOf) && (!s.predicate || s.predicate(t))) {
      if (r ? s.multi && s.representName ? e.tag = s.representName(t) : e.tag = s.tag : e.tag = "?", s.represent) {
        if (l = e.styleMap[s.tag] || s.defaultStyle, su.call(s.represent) === "[object Function]")
          n = s.represent(t, l);
        else if (lu.call(s.represent, l))
          n = s.represent[l](t, l);
        else
          throw new Jr("!<" + s.tag + '> tag resolver accepts not "' + l + '" style');
        e.dump = n;
      }
      return !0;
    }
  return !1;
}
function nt(e, t, r, n, i, o, a) {
  e.tag = null, e.dump = r, vs(e, r, !1) || vs(e, r, !0);
  var s = su.call(e.dump), l = n, p;
  n && (n = e.flowLevel < 0 || e.flowLevel > t);
  var c = s === "[object Object]" || s === "[object Array]", f, d;
  if (c && (f = e.duplicates.indexOf(r), d = f !== -1), (e.tag !== null && e.tag !== "?" || d || e.indent !== 2 && t > 0) && (i = !1), d && e.usedDuplicates[f])
    e.dump = "*ref_" + f;
  else {
    if (c && d && !e.usedDuplicates[f] && (e.usedDuplicates[f] = !0), s === "[object Object]")
      n && Object.keys(e.dump).length !== 0 ? (U0(e, t, e.dump, i), d && (e.dump = "&ref_" + f + e.dump)) : (x0(e, t, e.dump), d && (e.dump = "&ref_" + f + " " + e.dump));
    else if (s === "[object Array]")
      n && e.dump.length !== 0 ? (e.noArrayIndent && !a && t > 0 ? ys(e, t - 1, e.dump, i) : ys(e, t, e.dump, i), d && (e.dump = "&ref_" + f + e.dump)) : (L0(e, t, e.dump), d && (e.dump = "&ref_" + f + " " + e.dump));
    else if (s === "[object String]")
      e.tag !== "?" && D0(e, e.dump, t, o, l);
    else {
      if (s === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new Jr("unacceptable kind of an object to dump " + s);
    }
    e.tag !== null && e.tag !== "?" && (p = encodeURI(
      e.tag[0] === "!" ? e.tag.slice(1) : e.tag
    ).replace(/!/g, "%21"), e.tag[0] === "!" ? p = "!" + p : p.slice(0, 18) === "tag:yaml.org,2002:" ? p = "!!" + p.slice(18) : p = "!<" + p + ">", e.dump = p + " " + e.dump);
  }
  return !0;
}
function k0(e, t) {
  var r = [], n = [], i, o;
  for (_o(e, r, n), i = 0, o = n.length; i < o; i += 1)
    t.duplicates.push(r[n[i]]);
  t.usedDuplicates = new Array(o);
}
function _o(e, t, r) {
  var n, i, o;
  if (e !== null && typeof e == "object")
    if (i = t.indexOf(e), i !== -1)
      r.indexOf(i) === -1 && r.push(i);
    else if (t.push(e), Array.isArray(e))
      for (i = 0, o = e.length; i < o; i += 1)
        _o(e[i], t, r);
    else
      for (n = Object.keys(e), i = 0, o = n.length; i < o; i += 1)
        _o(e[n[i]], t, r);
}
function M0(e, t) {
  t = t || {};
  var r = new b0(t);
  r.noRefs || k0(e, r);
  var n = e;
  return r.replacer && (n = r.replacer.call({ "": n }, "", n)), nt(r, 0, n, !0, !0) ? r.dump + `
` : "";
}
au.dump = M0;
var yu = jo, B0 = au;
function Yo(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
ye.Type = Ne;
ye.Schema = Nc;
ye.FAILSAFE_SCHEMA = Fc;
ye.JSON_SCHEMA = Bc;
ye.CORE_SCHEMA = jc;
ye.DEFAULT_SCHEMA = Go;
ye.load = yu.load;
ye.loadAll = yu.loadAll;
ye.dump = B0.dump;
ye.YAMLException = Kr;
ye.types = {
  binary: Wc,
  float: Mc,
  map: $c,
  null: Lc,
  pairs: zc,
  set: Xc,
  timestamp: qc,
  bool: xc,
  int: Uc,
  merge: Vc,
  omap: Yc,
  seq: Dc,
  str: Pc
};
ye.safeLoad = Yo("safeLoad", "load");
ye.safeLoadAll = Yo("safeLoadAll", "loadAll");
ye.safeDump = Yo("safeDump", "dump");
var ii = {};
Object.defineProperty(ii, "__esModule", { value: !0 });
ii.Lazy = void 0;
class j0 {
  constructor(t) {
    this._value = null, this.creator = t;
  }
  get hasValue() {
    return this.creator == null;
  }
  get value() {
    if (this.creator == null)
      return this._value;
    const t = this.creator();
    return this.value = t, t;
  }
  set value(t) {
    this._value = t, this.creator = null;
  }
}
ii.Lazy = j0;
var wo = { exports: {} };
const H0 = "2.0.0", vu = 256, G0 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, q0 = 16, V0 = vu - 6, W0 = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var oi = {
  MAX_LENGTH: vu,
  MAX_SAFE_COMPONENT_LENGTH: q0,
  MAX_SAFE_BUILD_LENGTH: V0,
  MAX_SAFE_INTEGER: G0,
  RELEASE_TYPES: W0,
  SEMVER_SPEC_VERSION: H0,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Y0 = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var ai = Y0;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: i
  } = oi, o = ai;
  t = e.exports = {};
  const a = t.re = [], s = t.safeRe = [], l = t.src = [], p = t.safeSrc = [], c = t.t = {};
  let f = 0;
  const d = "[a-zA-Z0-9-]", g = [
    ["\\s", 1],
    ["\\d", i],
    [d, n]
  ], v = (T) => {
    for (const [C, A] of g)
      T = T.split(`${C}*`).join(`${C}{0,${A}}`).split(`${C}+`).join(`${C}{1,${A}}`);
    return T;
  }, y = (T, C, A) => {
    const D = v(C), L = f++;
    o(T, L, C), c[T] = L, l[L] = C, p[L] = D, a[L] = new RegExp(C, A ? "g" : void 0), s[L] = new RegExp(D, A ? "g" : void 0);
  };
  y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), y("MAINVERSION", `(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${l[c.PRERELEASEIDENTIFIER]}(?:\\.${l[c.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${l[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[c.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${d}+`), y("BUILD", `(?:\\+(${l[c.BUILDIDENTIFIER]}(?:\\.${l[c.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${l[c.MAINVERSION]}${l[c.PRERELEASE]}?${l[c.BUILD]}?`), y("FULL", `^${l[c.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${l[c.MAINVERSIONLOOSE]}${l[c.PRERELEASELOOSE]}?${l[c.BUILD]}?`), y("LOOSE", `^${l[c.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${l[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${l[c.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:${l[c.PRERELEASE]})?${l[c.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:${l[c.PRERELEASELOOSE]})?${l[c.BUILD]}?)?)?`), y("XRANGE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${l[c.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", l[c.COERCEPLAIN] + `(?:${l[c.PRERELEASE]})?(?:${l[c.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", l[c.COERCE], !0), y("COERCERTLFULL", l[c.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${l[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${l[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${l[c.LONECARET]}${l[c.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${l[c.LONECARET]}${l[c.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${l[c.GTLT]}\\s*(${l[c.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]}|${l[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${l[c.XRANGEPLAIN]})\\s+-\\s+(${l[c.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${l[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[c.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(wo, wo.exports);
var Qr = wo.exports;
const z0 = Object.freeze({ loose: !0 }), X0 = Object.freeze({}), K0 = (e) => e ? typeof e != "object" ? z0 : e : X0;
var zo = K0;
const _s = /^[0-9]+$/, _u = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const r = _s.test(e), n = _s.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, J0 = (e, t) => _u(t, e);
var wu = {
  compareIdentifiers: _u,
  rcompareIdentifiers: J0
};
const wn = ai, { MAX_LENGTH: ws, MAX_SAFE_INTEGER: Tn } = oi, { safeRe: An, t: Cn } = Qr, Q0 = zo, { compareIdentifiers: Mi } = wu;
let Z0 = class Ke {
  constructor(t, r) {
    if (r = Q0(r), t instanceof Ke) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > ws)
      throw new TypeError(
        `version is longer than ${ws} characters`
      );
    wn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? An[Cn.LOOSE] : An[Cn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > Tn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Tn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Tn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const o = +i;
        if (o >= 0 && o < Tn)
          return o;
      }
      return i;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (wn("SemVer.compare", this.version, this.options, t), !(t instanceof Ke)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new Ke(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof Ke || (t = new Ke(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof Ke || (t = new Ke(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], i = t.prerelease[r];
      if (wn("prerelease compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Mi(n, i);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof Ke || (t = new Ke(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], i = t.build[r];
      if (wn("build compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Mi(n, i);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const i = `-${r}`.match(this.options.loose ? An[Cn.PRERELEASELOOSE] : An[Cn.PRERELEASE]);
        if (!i || i[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const i = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [i];
        else {
          let o = this.prerelease.length;
          for (; --o >= 0; )
            typeof this.prerelease[o] == "number" && (this.prerelease[o]++, o = -2);
          if (o === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(i);
          }
        }
        if (r) {
          let o = [r, i];
          n === !1 && (o = [r]), Mi(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = o) : this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Pe = Z0;
const Ts = Pe, eE = (e, t, r = !1) => {
  if (e instanceof Ts)
    return e;
  try {
    return new Ts(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var ur = eE;
const tE = ur, rE = (e, t) => {
  const r = tE(e, t);
  return r ? r.version : null;
};
var nE = rE;
const iE = ur, oE = (e, t) => {
  const r = iE(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var aE = oE;
const As = Pe, sE = (e, t, r, n, i) => {
  typeof r == "string" && (i = n, n = r, r = void 0);
  try {
    return new As(
      e instanceof As ? e.version : e,
      r
    ).inc(t, n, i).version;
  } catch {
    return null;
  }
};
var lE = sE;
const Cs = ur, cE = (e, t) => {
  const r = Cs(e, null, !0), n = Cs(t, null, !0), i = r.compare(n);
  if (i === 0)
    return null;
  const o = i > 0, a = o ? r : n, s = o ? n : r, l = !!a.prerelease.length;
  if (!!s.prerelease.length && !l) {
    if (!s.patch && !s.minor)
      return "major";
    if (s.compareMain(a) === 0)
      return s.minor && !s.patch ? "minor" : "patch";
  }
  const c = l ? "pre" : "";
  return r.major !== n.major ? c + "major" : r.minor !== n.minor ? c + "minor" : r.patch !== n.patch ? c + "patch" : "prerelease";
};
var uE = cE;
const fE = Pe, dE = (e, t) => new fE(e, t).major;
var hE = dE;
const pE = Pe, mE = (e, t) => new pE(e, t).minor;
var gE = mE;
const EE = Pe, yE = (e, t) => new EE(e, t).patch;
var vE = yE;
const _E = ur, wE = (e, t) => {
  const r = _E(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var TE = wE;
const Ss = Pe, AE = (e, t, r) => new Ss(e, r).compare(new Ss(t, r));
var Ve = AE;
const CE = Ve, SE = (e, t, r) => CE(t, e, r);
var IE = SE;
const bE = Ve, OE = (e, t) => bE(e, t, !0);
var RE = OE;
const Is = Pe, NE = (e, t, r) => {
  const n = new Is(e, r), i = new Is(t, r);
  return n.compare(i) || n.compareBuild(i);
};
var Xo = NE;
const PE = Xo, DE = (e, t) => e.sort((r, n) => PE(r, n, t));
var $E = DE;
const FE = Xo, LE = (e, t) => e.sort((r, n) => FE(n, r, t));
var xE = LE;
const UE = Ve, kE = (e, t, r) => UE(e, t, r) > 0;
var si = kE;
const ME = Ve, BE = (e, t, r) => ME(e, t, r) < 0;
var Ko = BE;
const jE = Ve, HE = (e, t, r) => jE(e, t, r) === 0;
var Tu = HE;
const GE = Ve, qE = (e, t, r) => GE(e, t, r) !== 0;
var Au = qE;
const VE = Ve, WE = (e, t, r) => VE(e, t, r) >= 0;
var Jo = WE;
const YE = Ve, zE = (e, t, r) => YE(e, t, r) <= 0;
var Qo = zE;
const XE = Tu, KE = Au, JE = si, QE = Jo, ZE = Ko, ey = Qo, ty = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return XE(e, r, n);
    case "!=":
      return KE(e, r, n);
    case ">":
      return JE(e, r, n);
    case ">=":
      return QE(e, r, n);
    case "<":
      return ZE(e, r, n);
    case "<=":
      return ey(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Cu = ty;
const ry = Pe, ny = ur, { safeRe: Sn, t: In } = Qr, iy = (e, t) => {
  if (e instanceof ry)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? Sn[In.COERCEFULL] : Sn[In.COERCE]);
  else {
    const l = t.includePrerelease ? Sn[In.COERCERTLFULL] : Sn[In.COERCERTL];
    let p;
    for (; (p = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || p.index + p[0].length !== r.index + r[0].length) && (r = p), l.lastIndex = p.index + p[1].length + p[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], i = r[3] || "0", o = r[4] || "0", a = t.includePrerelease && r[5] ? `-${r[5]}` : "", s = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return ny(`${n}.${i}.${o}${a}${s}`, t);
};
var oy = iy;
class ay {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const i = this.map.keys().next().value;
        this.delete(i);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var sy = ay, Bi, bs;
function We() {
  if (bs) return Bi;
  bs = 1;
  const e = /\s+/g;
  class t {
    constructor(b, P) {
      if (P = i(P), b instanceof t)
        return b.loose === !!P.loose && b.includePrerelease === !!P.includePrerelease ? b : new t(b.raw, P);
      if (b instanceof o)
        return this.raw = b.value, this.set = [[b]], this.formatted = void 0, this;
      if (this.options = P, this.loose = !!P.loose, this.includePrerelease = !!P.includePrerelease, this.raw = b.trim().replace(e, " "), this.set = this.raw.split("||").map((I) => this.parseRange(I.trim())).filter((I) => I.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const I = this.set[0];
        if (this.set = this.set.filter(($) => !y($[0])), this.set.length === 0)
          this.set = [I];
        else if (this.set.length > 1) {
          for (const $ of this.set)
            if ($.length === 1 && T($[0])) {
              this.set = [$];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let b = 0; b < this.set.length; b++) {
          b > 0 && (this.formatted += "||");
          const P = this.set[b];
          for (let I = 0; I < P.length; I++)
            I > 0 && (this.formatted += " "), this.formatted += P[I].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(b) {
      const I = ((this.options.includePrerelease && g) | (this.options.loose && v)) + ":" + b, $ = n.get(I);
      if ($)
        return $;
      const N = this.options.loose, k = N ? l[p.HYPHENRANGELOOSE] : l[p.HYPHENRANGE];
      b = b.replace(k, M(this.options.includePrerelease)), a("hyphen replace", b), b = b.replace(l[p.COMPARATORTRIM], c), a("comparator trim", b), b = b.replace(l[p.TILDETRIM], f), a("tilde trim", b), b = b.replace(l[p.CARETTRIM], d), a("caret trim", b);
      let q = b.split(" ").map((U) => A(U, this.options)).join(" ").split(/\s+/).map((U) => B(U, this.options));
      N && (q = q.filter((U) => (a("loose invalid filter", U, this.options), !!U.match(l[p.COMPARATORLOOSE])))), a("range list", q);
      const j = /* @__PURE__ */ new Map(), X = q.map((U) => new o(U, this.options));
      for (const U of X) {
        if (y(U))
          return [U];
        j.set(U.value, U);
      }
      j.size > 1 && j.has("") && j.delete("");
      const de = [...j.values()];
      return n.set(I, de), de;
    }
    intersects(b, P) {
      if (!(b instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((I) => C(I, P) && b.set.some(($) => C($, P) && I.every((N) => $.every((k) => N.intersects(k, P)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(b) {
      if (!b)
        return !1;
      if (typeof b == "string")
        try {
          b = new s(b, this.options);
        } catch {
          return !1;
        }
      for (let P = 0; P < this.set.length; P++)
        if (z(this.set[P], b, this.options))
          return !0;
      return !1;
    }
  }
  Bi = t;
  const r = sy, n = new r(), i = zo, o = li(), a = ai, s = Pe, {
    safeRe: l,
    t: p,
    comparatorTrimReplace: c,
    tildeTrimReplace: f,
    caretTrimReplace: d
  } = Qr, { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: v } = oi, y = (R) => R.value === "<0.0.0-0", T = (R) => R.value === "", C = (R, b) => {
    let P = !0;
    const I = R.slice();
    let $ = I.pop();
    for (; P && I.length; )
      P = I.every((N) => $.intersects(N, b)), $ = I.pop();
    return P;
  }, A = (R, b) => (R = R.replace(l[p.BUILD], ""), a("comp", R, b), R = ae(R, b), a("caret", R), R = L(R, b), a("tildes", R), R = Fe(R, b), a("xrange", R), R = G(R, b), a("stars", R), R), D = (R) => !R || R.toLowerCase() === "x" || R === "*", L = (R, b) => R.trim().split(/\s+/).map((P) => ee(P, b)).join(" "), ee = (R, b) => {
    const P = b.loose ? l[p.TILDELOOSE] : l[p.TILDE];
    return R.replace(P, (I, $, N, k, q) => {
      a("tilde", R, I, $, N, k, q);
      let j;
      return D($) ? j = "" : D(N) ? j = `>=${$}.0.0 <${+$ + 1}.0.0-0` : D(k) ? j = `>=${$}.${N}.0 <${$}.${+N + 1}.0-0` : q ? (a("replaceTilde pr", q), j = `>=${$}.${N}.${k}-${q} <${$}.${+N + 1}.0-0`) : j = `>=${$}.${N}.${k} <${$}.${+N + 1}.0-0`, a("tilde return", j), j;
    });
  }, ae = (R, b) => R.trim().split(/\s+/).map((P) => W(P, b)).join(" "), W = (R, b) => {
    a("caret", R, b);
    const P = b.loose ? l[p.CARETLOOSE] : l[p.CARET], I = b.includePrerelease ? "-0" : "";
    return R.replace(P, ($, N, k, q, j) => {
      a("caret", R, $, N, k, q, j);
      let X;
      return D(N) ? X = "" : D(k) ? X = `>=${N}.0.0${I} <${+N + 1}.0.0-0` : D(q) ? N === "0" ? X = `>=${N}.${k}.0${I} <${N}.${+k + 1}.0-0` : X = `>=${N}.${k}.0${I} <${+N + 1}.0.0-0` : j ? (a("replaceCaret pr", j), N === "0" ? k === "0" ? X = `>=${N}.${k}.${q}-${j} <${N}.${k}.${+q + 1}-0` : X = `>=${N}.${k}.${q}-${j} <${N}.${+k + 1}.0-0` : X = `>=${N}.${k}.${q}-${j} <${+N + 1}.0.0-0`) : (a("no pr"), N === "0" ? k === "0" ? X = `>=${N}.${k}.${q}${I} <${N}.${k}.${+q + 1}-0` : X = `>=${N}.${k}.${q}${I} <${N}.${+k + 1}.0-0` : X = `>=${N}.${k}.${q} <${+N + 1}.0.0-0`), a("caret return", X), X;
    });
  }, Fe = (R, b) => (a("replaceXRanges", R, b), R.split(/\s+/).map((P) => E(P, b)).join(" ")), E = (R, b) => {
    R = R.trim();
    const P = b.loose ? l[p.XRANGELOOSE] : l[p.XRANGE];
    return R.replace(P, (I, $, N, k, q, j) => {
      a("xRange", R, I, $, N, k, q, j);
      const X = D(N), de = X || D(k), U = de || D(q), ze = U;
      return $ === "=" && ze && ($ = ""), j = b.includePrerelease ? "-0" : "", X ? $ === ">" || $ === "<" ? I = "<0.0.0-0" : I = "*" : $ && ze ? (de && (k = 0), q = 0, $ === ">" ? ($ = ">=", de ? (N = +N + 1, k = 0, q = 0) : (k = +k + 1, q = 0)) : $ === "<=" && ($ = "<", de ? N = +N + 1 : k = +k + 1), $ === "<" && (j = "-0"), I = `${$ + N}.${k}.${q}${j}`) : de ? I = `>=${N}.0.0${j} <${+N + 1}.0.0-0` : U && (I = `>=${N}.${k}.0${j} <${N}.${+k + 1}.0-0`), a("xRange return", I), I;
    });
  }, G = (R, b) => (a("replaceStars", R, b), R.trim().replace(l[p.STAR], "")), B = (R, b) => (a("replaceGTE0", R, b), R.trim().replace(l[b.includePrerelease ? p.GTE0PRE : p.GTE0], "")), M = (R) => (b, P, I, $, N, k, q, j, X, de, U, ze) => (D(I) ? P = "" : D($) ? P = `>=${I}.0.0${R ? "-0" : ""}` : D(N) ? P = `>=${I}.${$}.0${R ? "-0" : ""}` : k ? P = `>=${P}` : P = `>=${P}${R ? "-0" : ""}`, D(X) ? j = "" : D(de) ? j = `<${+X + 1}.0.0-0` : D(U) ? j = `<${X}.${+de + 1}.0-0` : ze ? j = `<=${X}.${de}.${U}-${ze}` : R ? j = `<${X}.${de}.${+U + 1}-0` : j = `<=${j}`, `${P} ${j}`.trim()), z = (R, b, P) => {
    for (let I = 0; I < R.length; I++)
      if (!R[I].test(b))
        return !1;
    if (b.prerelease.length && !P.includePrerelease) {
      for (let I = 0; I < R.length; I++)
        if (a(R[I].semver), R[I].semver !== o.ANY && R[I].semver.prerelease.length > 0) {
          const $ = R[I].semver;
          if ($.major === b.major && $.minor === b.minor && $.patch === b.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Bi;
}
var ji, Os;
function li() {
  if (Os) return ji;
  Os = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, f) {
      if (f = r(f), c instanceof t) {
        if (c.loose === !!f.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), a("comparator", c, f), this.options = f, this.loose = !!f.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, a("comp", this);
    }
    parse(c) {
      const f = this.options.loose ? n[i.COMPARATORLOOSE] : n[i.COMPARATOR], d = c.match(f);
      if (!d)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = d[1] !== void 0 ? d[1] : "", this.operator === "=" && (this.operator = ""), d[2] ? this.semver = new s(d[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (a("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new s(c, this.options);
        } catch {
          return !1;
        }
      return o(c, this.operator, this.semver, this.options);
    }
    intersects(c, f) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(c.value, f).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new l(this.value, f).test(c.semver) : (f = r(f), f.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || o(this.semver, "<", c.semver, f) && this.operator.startsWith(">") && c.operator.startsWith("<") || o(this.semver, ">", c.semver, f) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  ji = t;
  const r = zo, { safeRe: n, t: i } = Qr, o = Cu, a = ai, s = Pe, l = We();
  return ji;
}
const ly = We(), cy = (e, t, r) => {
  try {
    t = new ly(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var ci = cy;
const uy = We(), fy = (e, t) => new uy(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var dy = fy;
const hy = Pe, py = We(), my = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new py(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || i.compare(a) === -1) && (n = a, i = new hy(n, r));
  }), n;
};
var gy = my;
const Ey = Pe, yy = We(), vy = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new yy(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || i.compare(a) === 1) && (n = a, i = new Ey(n, r));
  }), n;
};
var _y = vy;
const Hi = Pe, wy = We(), Rs = si, Ty = (e, t) => {
  e = new wy(e, t);
  let r = new Hi("0.0.0");
  if (e.test(r) || (r = new Hi("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const i = e.set[n];
    let o = null;
    i.forEach((a) => {
      const s = new Hi(a.semver.version);
      switch (a.operator) {
        case ">":
          s.prerelease.length === 0 ? s.patch++ : s.prerelease.push(0), s.raw = s.format();
        case "":
        case ">=":
          (!o || Rs(s, o)) && (o = s);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${a.operator}`);
      }
    }), o && (!r || Rs(r, o)) && (r = o);
  }
  return r && e.test(r) ? r : null;
};
var Ay = Ty;
const Cy = We(), Sy = (e, t) => {
  try {
    return new Cy(e, t).range || "*";
  } catch {
    return null;
  }
};
var Iy = Sy;
const by = Pe, Su = li(), { ANY: Oy } = Su, Ry = We(), Ny = ci, Ns = si, Ps = Ko, Py = Qo, Dy = Jo, $y = (e, t, r, n) => {
  e = new by(e, n), t = new Ry(t, n);
  let i, o, a, s, l;
  switch (r) {
    case ">":
      i = Ns, o = Py, a = Ps, s = ">", l = ">=";
      break;
    case "<":
      i = Ps, o = Dy, a = Ns, s = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Ny(e, t, n))
    return !1;
  for (let p = 0; p < t.set.length; ++p) {
    const c = t.set[p];
    let f = null, d = null;
    if (c.forEach((g) => {
      g.semver === Oy && (g = new Su(">=0.0.0")), f = f || g, d = d || g, i(g.semver, f.semver, n) ? f = g : a(g.semver, d.semver, n) && (d = g);
    }), f.operator === s || f.operator === l || (!d.operator || d.operator === s) && o(e, d.semver))
      return !1;
    if (d.operator === l && a(e, d.semver))
      return !1;
  }
  return !0;
};
var Zo = $y;
const Fy = Zo, Ly = (e, t, r) => Fy(e, t, ">", r);
var xy = Ly;
const Uy = Zo, ky = (e, t, r) => Uy(e, t, "<", r);
var My = ky;
const Ds = We(), By = (e, t, r) => (e = new Ds(e, r), t = new Ds(t, r), e.intersects(t, r));
var jy = By;
const Hy = ci, Gy = Ve;
var qy = (e, t, r) => {
  const n = [];
  let i = null, o = null;
  const a = e.sort((c, f) => Gy(c, f, r));
  for (const c of a)
    Hy(c, t, r) ? (o = c, i || (i = c)) : (o && n.push([i, o]), o = null, i = null);
  i && n.push([i, null]);
  const s = [];
  for (const [c, f] of n)
    c === f ? s.push(c) : !f && c === a[0] ? s.push("*") : f ? c === a[0] ? s.push(`<=${f}`) : s.push(`${c} - ${f}`) : s.push(`>=${c}`);
  const l = s.join(" || "), p = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < p.length ? l : t;
};
const $s = We(), ea = li(), { ANY: Gi } = ea, vr = ci, ta = Ve, Vy = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new $s(e, r), t = new $s(t, r);
  let n = !1;
  e: for (const i of e.set) {
    for (const o of t.set) {
      const a = Yy(i, o, r);
      if (n = n || a !== null, a)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, Wy = [new ea(">=0.0.0-0")], Fs = [new ea(">=0.0.0")], Yy = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Gi) {
    if (t.length === 1 && t[0].semver === Gi)
      return !0;
    r.includePrerelease ? e = Wy : e = Fs;
  }
  if (t.length === 1 && t[0].semver === Gi) {
    if (r.includePrerelease)
      return !0;
    t = Fs;
  }
  const n = /* @__PURE__ */ new Set();
  let i, o;
  for (const g of e)
    g.operator === ">" || g.operator === ">=" ? i = Ls(i, g, r) : g.operator === "<" || g.operator === "<=" ? o = xs(o, g, r) : n.add(g.semver);
  if (n.size > 1)
    return null;
  let a;
  if (i && o) {
    if (a = ta(i.semver, o.semver, r), a > 0)
      return null;
    if (a === 0 && (i.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const g of n) {
    if (i && !vr(g, String(i), r) || o && !vr(g, String(o), r))
      return null;
    for (const v of t)
      if (!vr(g, String(v), r))
        return !1;
    return !0;
  }
  let s, l, p, c, f = o && !r.includePrerelease && o.semver.prerelease.length ? o.semver : !1, d = i && !r.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  f && f.prerelease.length === 1 && o.operator === "<" && f.prerelease[0] === 0 && (f = !1);
  for (const g of t) {
    if (c = c || g.operator === ">" || g.operator === ">=", p = p || g.operator === "<" || g.operator === "<=", i) {
      if (d && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === d.major && g.semver.minor === d.minor && g.semver.patch === d.patch && (d = !1), g.operator === ">" || g.operator === ">=") {
        if (s = Ls(i, g, r), s === g && s !== i)
          return !1;
      } else if (i.operator === ">=" && !vr(i.semver, String(g), r))
        return !1;
    }
    if (o) {
      if (f && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === f.major && g.semver.minor === f.minor && g.semver.patch === f.patch && (f = !1), g.operator === "<" || g.operator === "<=") {
        if (l = xs(o, g, r), l === g && l !== o)
          return !1;
      } else if (o.operator === "<=" && !vr(o.semver, String(g), r))
        return !1;
    }
    if (!g.operator && (o || i) && a !== 0)
      return !1;
  }
  return !(i && p && !o && a !== 0 || o && c && !i && a !== 0 || d || f);
}, Ls = (e, t, r) => {
  if (!e)
    return t;
  const n = ta(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, xs = (e, t, r) => {
  if (!e)
    return t;
  const n = ta(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var zy = Vy;
const qi = Qr, Us = oi, Xy = Pe, ks = wu, Ky = ur, Jy = nE, Qy = aE, Zy = lE, ev = uE, tv = hE, rv = gE, nv = vE, iv = TE, ov = Ve, av = IE, sv = RE, lv = Xo, cv = $E, uv = xE, fv = si, dv = Ko, hv = Tu, pv = Au, mv = Jo, gv = Qo, Ev = Cu, yv = oy, vv = li(), _v = We(), wv = ci, Tv = dy, Av = gy, Cv = _y, Sv = Ay, Iv = Iy, bv = Zo, Ov = xy, Rv = My, Nv = jy, Pv = qy, Dv = zy;
var Iu = {
  parse: Ky,
  valid: Jy,
  clean: Qy,
  inc: Zy,
  diff: ev,
  major: tv,
  minor: rv,
  patch: nv,
  prerelease: iv,
  compare: ov,
  rcompare: av,
  compareLoose: sv,
  compareBuild: lv,
  sort: cv,
  rsort: uv,
  gt: fv,
  lt: dv,
  eq: hv,
  neq: pv,
  gte: mv,
  lte: gv,
  cmp: Ev,
  coerce: yv,
  Comparator: vv,
  Range: _v,
  satisfies: wv,
  toComparators: Tv,
  maxSatisfying: Av,
  minSatisfying: Cv,
  minVersion: Sv,
  validRange: Iv,
  outside: bv,
  gtr: Ov,
  ltr: Rv,
  intersects: Nv,
  simplifyRange: Pv,
  subset: Dv,
  SemVer: Xy,
  re: qi.re,
  src: qi.src,
  tokens: qi.t,
  SEMVER_SPEC_VERSION: Us.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Us.RELEASE_TYPES,
  compareIdentifiers: ks.compareIdentifiers,
  rcompareIdentifiers: ks.rcompareIdentifiers
}, Zr = {}, zn = { exports: {} };
zn.exports;
(function(e, t) {
  var r = 200, n = "__lodash_hash_undefined__", i = 1, o = 2, a = 9007199254740991, s = "[object Arguments]", l = "[object Array]", p = "[object AsyncFunction]", c = "[object Boolean]", f = "[object Date]", d = "[object Error]", g = "[object Function]", v = "[object GeneratorFunction]", y = "[object Map]", T = "[object Number]", C = "[object Null]", A = "[object Object]", D = "[object Promise]", L = "[object Proxy]", ee = "[object RegExp]", ae = "[object Set]", W = "[object String]", Fe = "[object Symbol]", E = "[object Undefined]", G = "[object WeakMap]", B = "[object ArrayBuffer]", M = "[object DataView]", z = "[object Float32Array]", R = "[object Float64Array]", b = "[object Int8Array]", P = "[object Int16Array]", I = "[object Int32Array]", $ = "[object Uint8Array]", N = "[object Uint8ClampedArray]", k = "[object Uint16Array]", q = "[object Uint32Array]", j = /[\\^$.*+?()[\]{}|]/g, X = /^\[object .+?Constructor\]$/, de = /^(?:0|[1-9]\d*)$/, U = {};
  U[z] = U[R] = U[b] = U[P] = U[I] = U[$] = U[N] = U[k] = U[q] = !0, U[s] = U[l] = U[B] = U[c] = U[M] = U[f] = U[d] = U[g] = U[y] = U[T] = U[A] = U[ee] = U[ae] = U[W] = U[G] = !1;
  var ze = typeof Se == "object" && Se && Se.Object === Object && Se, h = typeof self == "object" && self && self.Object === Object && self, u = ze || h || Function("return this")(), S = t && !t.nodeType && t, w = S && !0 && e && !e.nodeType && e, Y = w && w.exports === S, Q = Y && ze.process, ie = function() {
    try {
      return Q && Q.binding && Q.binding("util");
    } catch {
    }
  }(), me = ie && ie.isTypedArray;
  function ve(m, _) {
    for (var O = -1, F = m == null ? 0 : m.length, Z = 0, H = []; ++O < F; ) {
      var oe = m[O];
      _(oe, O, m) && (H[Z++] = oe);
    }
    return H;
  }
  function at(m, _) {
    for (var O = -1, F = _.length, Z = m.length; ++O < F; )
      m[Z + O] = _[O];
    return m;
  }
  function ce(m, _) {
    for (var O = -1, F = m == null ? 0 : m.length; ++O < F; )
      if (_(m[O], O, m))
        return !0;
    return !1;
  }
  function Me(m, _) {
    for (var O = -1, F = Array(m); ++O < m; )
      F[O] = _(O);
    return F;
  }
  function vi(m) {
    return function(_) {
      return m(_);
    };
  }
  function nn(m, _) {
    return m.has(_);
  }
  function hr(m, _) {
    return m == null ? void 0 : m[_];
  }
  function on(m) {
    var _ = -1, O = Array(m.size);
    return m.forEach(function(F, Z) {
      O[++_] = [Z, F];
    }), O;
  }
  function qu(m, _) {
    return function(O) {
      return m(_(O));
    };
  }
  function Vu(m) {
    var _ = -1, O = Array(m.size);
    return m.forEach(function(F) {
      O[++_] = F;
    }), O;
  }
  var Wu = Array.prototype, Yu = Function.prototype, an = Object.prototype, _i = u["__core-js_shared__"], la = Yu.toString, Xe = an.hasOwnProperty, ca = function() {
    var m = /[^.]+$/.exec(_i && _i.keys && _i.keys.IE_PROTO || "");
    return m ? "Symbol(src)_1." + m : "";
  }(), ua = an.toString, zu = RegExp(
    "^" + la.call(Xe).replace(j, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), fa = Y ? u.Buffer : void 0, sn = u.Symbol, da = u.Uint8Array, ha = an.propertyIsEnumerable, Xu = Wu.splice, Ct = sn ? sn.toStringTag : void 0, pa = Object.getOwnPropertySymbols, Ku = fa ? fa.isBuffer : void 0, Ju = qu(Object.keys, Object), wi = Gt(u, "DataView"), pr = Gt(u, "Map"), Ti = Gt(u, "Promise"), Ai = Gt(u, "Set"), Ci = Gt(u, "WeakMap"), mr = Gt(Object, "create"), Qu = bt(wi), Zu = bt(pr), ef = bt(Ti), tf = bt(Ai), rf = bt(Ci), ma = sn ? sn.prototype : void 0, Si = ma ? ma.valueOf : void 0;
  function St(m) {
    var _ = -1, O = m == null ? 0 : m.length;
    for (this.clear(); ++_ < O; ) {
      var F = m[_];
      this.set(F[0], F[1]);
    }
  }
  function nf() {
    this.__data__ = mr ? mr(null) : {}, this.size = 0;
  }
  function of(m) {
    var _ = this.has(m) && delete this.__data__[m];
    return this.size -= _ ? 1 : 0, _;
  }
  function af(m) {
    var _ = this.__data__;
    if (mr) {
      var O = _[m];
      return O === n ? void 0 : O;
    }
    return Xe.call(_, m) ? _[m] : void 0;
  }
  function sf(m) {
    var _ = this.__data__;
    return mr ? _[m] !== void 0 : Xe.call(_, m);
  }
  function lf(m, _) {
    var O = this.__data__;
    return this.size += this.has(m) ? 0 : 1, O[m] = mr && _ === void 0 ? n : _, this;
  }
  St.prototype.clear = nf, St.prototype.delete = of, St.prototype.get = af, St.prototype.has = sf, St.prototype.set = lf;
  function Ze(m) {
    var _ = -1, O = m == null ? 0 : m.length;
    for (this.clear(); ++_ < O; ) {
      var F = m[_];
      this.set(F[0], F[1]);
    }
  }
  function cf() {
    this.__data__ = [], this.size = 0;
  }
  function uf(m) {
    var _ = this.__data__, O = cn(_, m);
    if (O < 0)
      return !1;
    var F = _.length - 1;
    return O == F ? _.pop() : Xu.call(_, O, 1), --this.size, !0;
  }
  function ff(m) {
    var _ = this.__data__, O = cn(_, m);
    return O < 0 ? void 0 : _[O][1];
  }
  function df(m) {
    return cn(this.__data__, m) > -1;
  }
  function hf(m, _) {
    var O = this.__data__, F = cn(O, m);
    return F < 0 ? (++this.size, O.push([m, _])) : O[F][1] = _, this;
  }
  Ze.prototype.clear = cf, Ze.prototype.delete = uf, Ze.prototype.get = ff, Ze.prototype.has = df, Ze.prototype.set = hf;
  function It(m) {
    var _ = -1, O = m == null ? 0 : m.length;
    for (this.clear(); ++_ < O; ) {
      var F = m[_];
      this.set(F[0], F[1]);
    }
  }
  function pf() {
    this.size = 0, this.__data__ = {
      hash: new St(),
      map: new (pr || Ze)(),
      string: new St()
    };
  }
  function mf(m) {
    var _ = un(this, m).delete(m);
    return this.size -= _ ? 1 : 0, _;
  }
  function gf(m) {
    return un(this, m).get(m);
  }
  function Ef(m) {
    return un(this, m).has(m);
  }
  function yf(m, _) {
    var O = un(this, m), F = O.size;
    return O.set(m, _), this.size += O.size == F ? 0 : 1, this;
  }
  It.prototype.clear = pf, It.prototype.delete = mf, It.prototype.get = gf, It.prototype.has = Ef, It.prototype.set = yf;
  function ln(m) {
    var _ = -1, O = m == null ? 0 : m.length;
    for (this.__data__ = new It(); ++_ < O; )
      this.add(m[_]);
  }
  function vf(m) {
    return this.__data__.set(m, n), this;
  }
  function _f(m) {
    return this.__data__.has(m);
  }
  ln.prototype.add = ln.prototype.push = vf, ln.prototype.has = _f;
  function st(m) {
    var _ = this.__data__ = new Ze(m);
    this.size = _.size;
  }
  function wf() {
    this.__data__ = new Ze(), this.size = 0;
  }
  function Tf(m) {
    var _ = this.__data__, O = _.delete(m);
    return this.size = _.size, O;
  }
  function Af(m) {
    return this.__data__.get(m);
  }
  function Cf(m) {
    return this.__data__.has(m);
  }
  function Sf(m, _) {
    var O = this.__data__;
    if (O instanceof Ze) {
      var F = O.__data__;
      if (!pr || F.length < r - 1)
        return F.push([m, _]), this.size = ++O.size, this;
      O = this.__data__ = new It(F);
    }
    return O.set(m, _), this.size = O.size, this;
  }
  st.prototype.clear = wf, st.prototype.delete = Tf, st.prototype.get = Af, st.prototype.has = Cf, st.prototype.set = Sf;
  function If(m, _) {
    var O = fn(m), F = !O && jf(m), Z = !O && !F && Ii(m), H = !O && !F && !Z && Ca(m), oe = O || F || Z || H, he = oe ? Me(m.length, String) : [], ge = he.length;
    for (var re in m)
      Xe.call(m, re) && !(oe && // Safari 9 has enumerable `arguments.length` in strict mode.
      (re == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      Z && (re == "offset" || re == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      H && (re == "buffer" || re == "byteLength" || re == "byteOffset") || // Skip index properties.
      xf(re, ge))) && he.push(re);
    return he;
  }
  function cn(m, _) {
    for (var O = m.length; O--; )
      if (_a(m[O][0], _))
        return O;
    return -1;
  }
  function bf(m, _, O) {
    var F = _(m);
    return fn(m) ? F : at(F, O(m));
  }
  function gr(m) {
    return m == null ? m === void 0 ? E : C : Ct && Ct in Object(m) ? Ff(m) : Bf(m);
  }
  function ga(m) {
    return Er(m) && gr(m) == s;
  }
  function Ea(m, _, O, F, Z) {
    return m === _ ? !0 : m == null || _ == null || !Er(m) && !Er(_) ? m !== m && _ !== _ : Of(m, _, O, F, Ea, Z);
  }
  function Of(m, _, O, F, Z, H) {
    var oe = fn(m), he = fn(_), ge = oe ? l : lt(m), re = he ? l : lt(_);
    ge = ge == s ? A : ge, re = re == s ? A : re;
    var Le = ge == A, Be = re == A, _e = ge == re;
    if (_e && Ii(m)) {
      if (!Ii(_))
        return !1;
      oe = !0, Le = !1;
    }
    if (_e && !Le)
      return H || (H = new st()), oe || Ca(m) ? ya(m, _, O, F, Z, H) : Df(m, _, ge, O, F, Z, H);
    if (!(O & i)) {
      var xe = Le && Xe.call(m, "__wrapped__"), Ue = Be && Xe.call(_, "__wrapped__");
      if (xe || Ue) {
        var ct = xe ? m.value() : m, et = Ue ? _.value() : _;
        return H || (H = new st()), Z(ct, et, O, F, H);
      }
    }
    return _e ? (H || (H = new st()), $f(m, _, O, F, Z, H)) : !1;
  }
  function Rf(m) {
    if (!Aa(m) || kf(m))
      return !1;
    var _ = wa(m) ? zu : X;
    return _.test(bt(m));
  }
  function Nf(m) {
    return Er(m) && Ta(m.length) && !!U[gr(m)];
  }
  function Pf(m) {
    if (!Mf(m))
      return Ju(m);
    var _ = [];
    for (var O in Object(m))
      Xe.call(m, O) && O != "constructor" && _.push(O);
    return _;
  }
  function ya(m, _, O, F, Z, H) {
    var oe = O & i, he = m.length, ge = _.length;
    if (he != ge && !(oe && ge > he))
      return !1;
    var re = H.get(m);
    if (re && H.get(_))
      return re == _;
    var Le = -1, Be = !0, _e = O & o ? new ln() : void 0;
    for (H.set(m, _), H.set(_, m); ++Le < he; ) {
      var xe = m[Le], Ue = _[Le];
      if (F)
        var ct = oe ? F(Ue, xe, Le, _, m, H) : F(xe, Ue, Le, m, _, H);
      if (ct !== void 0) {
        if (ct)
          continue;
        Be = !1;
        break;
      }
      if (_e) {
        if (!ce(_, function(et, Ot) {
          if (!nn(_e, Ot) && (xe === et || Z(xe, et, O, F, H)))
            return _e.push(Ot);
        })) {
          Be = !1;
          break;
        }
      } else if (!(xe === Ue || Z(xe, Ue, O, F, H))) {
        Be = !1;
        break;
      }
    }
    return H.delete(m), H.delete(_), Be;
  }
  function Df(m, _, O, F, Z, H, oe) {
    switch (O) {
      case M:
        if (m.byteLength != _.byteLength || m.byteOffset != _.byteOffset)
          return !1;
        m = m.buffer, _ = _.buffer;
      case B:
        return !(m.byteLength != _.byteLength || !H(new da(m), new da(_)));
      case c:
      case f:
      case T:
        return _a(+m, +_);
      case d:
        return m.name == _.name && m.message == _.message;
      case ee:
      case W:
        return m == _ + "";
      case y:
        var he = on;
      case ae:
        var ge = F & i;
        if (he || (he = Vu), m.size != _.size && !ge)
          return !1;
        var re = oe.get(m);
        if (re)
          return re == _;
        F |= o, oe.set(m, _);
        var Le = ya(he(m), he(_), F, Z, H, oe);
        return oe.delete(m), Le;
      case Fe:
        if (Si)
          return Si.call(m) == Si.call(_);
    }
    return !1;
  }
  function $f(m, _, O, F, Z, H) {
    var oe = O & i, he = va(m), ge = he.length, re = va(_), Le = re.length;
    if (ge != Le && !oe)
      return !1;
    for (var Be = ge; Be--; ) {
      var _e = he[Be];
      if (!(oe ? _e in _ : Xe.call(_, _e)))
        return !1;
    }
    var xe = H.get(m);
    if (xe && H.get(_))
      return xe == _;
    var Ue = !0;
    H.set(m, _), H.set(_, m);
    for (var ct = oe; ++Be < ge; ) {
      _e = he[Be];
      var et = m[_e], Ot = _[_e];
      if (F)
        var Sa = oe ? F(Ot, et, _e, _, m, H) : F(et, Ot, _e, m, _, H);
      if (!(Sa === void 0 ? et === Ot || Z(et, Ot, O, F, H) : Sa)) {
        Ue = !1;
        break;
      }
      ct || (ct = _e == "constructor");
    }
    if (Ue && !ct) {
      var dn = m.constructor, hn = _.constructor;
      dn != hn && "constructor" in m && "constructor" in _ && !(typeof dn == "function" && dn instanceof dn && typeof hn == "function" && hn instanceof hn) && (Ue = !1);
    }
    return H.delete(m), H.delete(_), Ue;
  }
  function va(m) {
    return bf(m, qf, Lf);
  }
  function un(m, _) {
    var O = m.__data__;
    return Uf(_) ? O[typeof _ == "string" ? "string" : "hash"] : O.map;
  }
  function Gt(m, _) {
    var O = hr(m, _);
    return Rf(O) ? O : void 0;
  }
  function Ff(m) {
    var _ = Xe.call(m, Ct), O = m[Ct];
    try {
      m[Ct] = void 0;
      var F = !0;
    } catch {
    }
    var Z = ua.call(m);
    return F && (_ ? m[Ct] = O : delete m[Ct]), Z;
  }
  var Lf = pa ? function(m) {
    return m == null ? [] : (m = Object(m), ve(pa(m), function(_) {
      return ha.call(m, _);
    }));
  } : Vf, lt = gr;
  (wi && lt(new wi(new ArrayBuffer(1))) != M || pr && lt(new pr()) != y || Ti && lt(Ti.resolve()) != D || Ai && lt(new Ai()) != ae || Ci && lt(new Ci()) != G) && (lt = function(m) {
    var _ = gr(m), O = _ == A ? m.constructor : void 0, F = O ? bt(O) : "";
    if (F)
      switch (F) {
        case Qu:
          return M;
        case Zu:
          return y;
        case ef:
          return D;
        case tf:
          return ae;
        case rf:
          return G;
      }
    return _;
  });
  function xf(m, _) {
    return _ = _ ?? a, !!_ && (typeof m == "number" || de.test(m)) && m > -1 && m % 1 == 0 && m < _;
  }
  function Uf(m) {
    var _ = typeof m;
    return _ == "string" || _ == "number" || _ == "symbol" || _ == "boolean" ? m !== "__proto__" : m === null;
  }
  function kf(m) {
    return !!ca && ca in m;
  }
  function Mf(m) {
    var _ = m && m.constructor, O = typeof _ == "function" && _.prototype || an;
    return m === O;
  }
  function Bf(m) {
    return ua.call(m);
  }
  function bt(m) {
    if (m != null) {
      try {
        return la.call(m);
      } catch {
      }
      try {
        return m + "";
      } catch {
      }
    }
    return "";
  }
  function _a(m, _) {
    return m === _ || m !== m && _ !== _;
  }
  var jf = ga(/* @__PURE__ */ function() {
    return arguments;
  }()) ? ga : function(m) {
    return Er(m) && Xe.call(m, "callee") && !ha.call(m, "callee");
  }, fn = Array.isArray;
  function Hf(m) {
    return m != null && Ta(m.length) && !wa(m);
  }
  var Ii = Ku || Wf;
  function Gf(m, _) {
    return Ea(m, _);
  }
  function wa(m) {
    if (!Aa(m))
      return !1;
    var _ = gr(m);
    return _ == g || _ == v || _ == p || _ == L;
  }
  function Ta(m) {
    return typeof m == "number" && m > -1 && m % 1 == 0 && m <= a;
  }
  function Aa(m) {
    var _ = typeof m;
    return m != null && (_ == "object" || _ == "function");
  }
  function Er(m) {
    return m != null && typeof m == "object";
  }
  var Ca = me ? vi(me) : Nf;
  function qf(m) {
    return Hf(m) ? If(m) : Pf(m);
  }
  function Vf() {
    return [];
  }
  function Wf() {
    return !1;
  }
  e.exports = Gf;
})(zn, zn.exports);
var $v = zn.exports;
Object.defineProperty(Zr, "__esModule", { value: !0 });
Zr.DownloadedUpdateHelper = void 0;
Zr.createTempUpdateFile = kv;
const Fv = sr, Lv = it, Ms = $v, Nt = Tt, Or = te;
class xv {
  constructor(t) {
    this.cacheDir = t, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
  }
  get downloadedFileInfo() {
    return this._downloadedFileInfo;
  }
  get file() {
    return this._file;
  }
  get packageFile() {
    return this._packageFile;
  }
  get cacheDirForPendingUpdate() {
    return Or.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(t, r, n, i) {
    if (this.versionInfo != null && this.file === t && this.fileInfo != null)
      return Ms(this.versionInfo, r) && Ms(this.fileInfo.info, n.info) && await (0, Nt.pathExists)(t) ? t : null;
    const o = await this.getValidCachedUpdateFile(n, i);
    return o === null ? null : (i.info(`Update has already been downloaded to ${t}).`), this._file = o, o);
  }
  async setDownloadedFile(t, r, n, i, o, a) {
    this._file = t, this._packageFile = r, this.versionInfo = n, this.fileInfo = i, this._downloadedFileInfo = {
      fileName: o,
      sha512: i.info.sha512,
      isAdminRightsRequired: i.info.isAdminRightsRequired === !0
    }, a && await (0, Nt.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
  }
  async clear() {
    this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, Nt.emptyDir)(this.cacheDirForPendingUpdate);
    } catch {
    }
  }
  /**
   * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
   * @param fileInfo
   * @param logger
   */
  async getValidCachedUpdateFile(t, r) {
    const n = this.getUpdateInfoFile();
    if (!await (0, Nt.pathExists)(n))
      return null;
    let o;
    try {
      o = await (0, Nt.readJson)(n);
    } catch (p) {
      let c = "No cached update info available";
      return p.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), c += ` (error on read: ${p.message})`), r.info(c), null;
    }
    if (!((o == null ? void 0 : o.fileName) !== null))
      return r.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
    if (t.info.sha512 !== o.sha512)
      return r.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${o.sha512}, expected: ${t.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
    const s = Or.join(this.cacheDirForPendingUpdate, o.fileName);
    if (!await (0, Nt.pathExists)(s))
      return r.info("Cached update file doesn't exist"), null;
    const l = await Uv(s);
    return t.info.sha512 !== l ? (r.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${l}, expected: ${t.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = o, s);
  }
  getUpdateInfoFile() {
    return Or.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
Zr.DownloadedUpdateHelper = xv;
function Uv(e, t = "sha512", r = "base64", n) {
  return new Promise((i, o) => {
    const a = (0, Fv.createHash)(t);
    a.on("error", o).setEncoding(r), (0, Lv.createReadStream)(e, {
      ...n,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", o).on("end", () => {
      a.end(), i(a.read());
    }).pipe(a, { end: !1 });
  });
}
async function kv(e, t, r) {
  let n = 0, i = Or.join(t, e);
  for (let o = 0; o < 3; o++)
    try {
      return await (0, Nt.unlink)(i), i;
    } catch (a) {
      if (a.code === "ENOENT")
        return i;
      r.warn(`Error on remove temp update file: ${a}`), i = Or.join(t, `${n++}-${e}`);
    }
  return i;
}
var ui = {}, ra = {};
Object.defineProperty(ra, "__esModule", { value: !0 });
ra.getAppCacheDir = Bv;
const Vi = te, Mv = qr;
function Bv() {
  const e = (0, Mv.homedir)();
  let t;
  return process.platform === "win32" ? t = process.env.LOCALAPPDATA || Vi.join(e, "AppData", "Local") : process.platform === "darwin" ? t = Vi.join(e, "Library", "Caches") : t = process.env.XDG_CACHE_HOME || Vi.join(e, ".cache"), t;
}
Object.defineProperty(ui, "__esModule", { value: !0 });
ui.ElectronAppAdapter = void 0;
const Bs = te, jv = ra;
class Hv {
  constructor(t = Ut.app) {
    this.app = t;
  }
  whenReady() {
    return this.app.whenReady();
  }
  get version() {
    return this.app.getVersion();
  }
  get name() {
    return this.app.getName();
  }
  get isPackaged() {
    return this.app.isPackaged === !0;
  }
  get appUpdateConfigPath() {
    return this.isPackaged ? Bs.join(process.resourcesPath, "app-update.yml") : Bs.join(this.app.getAppPath(), "dev-app-update.yml");
  }
  get userDataPath() {
    return this.app.getPath("userData");
  }
  get baseCachePath() {
    return (0, jv.getAppCacheDir)();
  }
  quit() {
    this.app.quit();
  }
  relaunch() {
    this.app.relaunch();
  }
  onQuit(t) {
    this.app.once("quit", (r, n) => t(n));
  }
}
ui.ElectronAppAdapter = Hv;
var bu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = r;
  const t = fe;
  e.NET_SESSION_NAME = "electron-updater";
  function r() {
    return Ut.session.fromPartition(e.NET_SESSION_NAME, {
      cache: !1
    });
  }
  class n extends t.HttpExecutor {
    constructor(o) {
      super(), this.proxyLoginCallback = o, this.cachedSession = null;
    }
    async download(o, a, s) {
      return await s.cancellationToken.createPromise((l, p, c) => {
        const f = {
          headers: s.headers || void 0,
          redirect: "manual"
        };
        (0, t.configureRequestUrl)(o, f), (0, t.configureRequestOptions)(f), this.doDownload(f, {
          destination: a,
          options: s,
          onCancel: c,
          callback: (d) => {
            d == null ? l(a) : p(d);
          },
          responseHandler: null
        }, 0);
      });
    }
    createRequest(o, a) {
      o.headers && o.headers.Host && (o.host = o.headers.Host, delete o.headers.Host), this.cachedSession == null && (this.cachedSession = r());
      const s = Ut.net.request({
        ...o,
        session: this.cachedSession
      });
      return s.on("response", a), this.proxyLoginCallback != null && s.on("login", this.proxyLoginCallback), s;
    }
    addRedirectHandlers(o, a, s, l, p) {
      o.on("redirect", (c, f, d) => {
        o.abort(), l > this.maxRedirects ? s(this.createMaxRedirectError()) : p(t.HttpExecutor.prepareRedirectUrlOptions(d, a));
      });
    }
  }
  e.ElectronHttpExecutor = n;
})(bu);
var en = {}, Ye = {};
Object.defineProperty(Ye, "__esModule", { value: !0 });
Ye.newBaseUrl = Gv;
Ye.newUrlFromBase = qv;
Ye.getChannelFilename = Vv;
const Ou = wt;
function Gv(e) {
  const t = new Ou.URL(e);
  return t.pathname.endsWith("/") || (t.pathname += "/"), t;
}
function qv(e, t, r = !1) {
  const n = new Ou.URL(e, t), i = t.search;
  return i != null && i.length !== 0 ? n.search = i : r && (n.search = `noCache=${Date.now().toString(32)}`), n;
}
function Vv(e) {
  return `${e}.yml`;
}
var le = {}, Wv = "[object Symbol]", Ru = /[\\^$.*+?()[\]{}|]/g, Yv = RegExp(Ru.source), zv = typeof Se == "object" && Se && Se.Object === Object && Se, Xv = typeof self == "object" && self && self.Object === Object && self, Kv = zv || Xv || Function("return this")(), Jv = Object.prototype, Qv = Jv.toString, js = Kv.Symbol, Hs = js ? js.prototype : void 0, Gs = Hs ? Hs.toString : void 0;
function Zv(e) {
  if (typeof e == "string")
    return e;
  if (t_(e))
    return Gs ? Gs.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function e_(e) {
  return !!e && typeof e == "object";
}
function t_(e) {
  return typeof e == "symbol" || e_(e) && Qv.call(e) == Wv;
}
function r_(e) {
  return e == null ? "" : Zv(e);
}
function n_(e) {
  return e = r_(e), e && Yv.test(e) ? e.replace(Ru, "\\$&") : e;
}
var Nu = n_;
Object.defineProperty(le, "__esModule", { value: !0 });
le.Provider = void 0;
le.findFile = l_;
le.parseUpdateInfo = c_;
le.getFileList = Pu;
le.resolveFiles = u_;
const vt = fe, i_ = ye, o_ = wt, Xn = Ye, a_ = Nu;
class s_ {
  constructor(t) {
    this.runtimeOptions = t, this.requestHeaders = null, this.executor = t.executor;
  }
  // By default, the blockmap file is in the same directory as the main file
  // But some providers may have a different blockmap file, so we need to override this method
  getBlockMapFiles(t, r, n, i = null) {
    const o = (0, Xn.newUrlFromBase)(`${t.pathname}.blockmap`, t);
    return [(0, Xn.newUrlFromBase)(`${t.pathname.replace(new RegExp(a_(n), "g"), r)}.blockmap`, i ? new o_.URL(i) : t), o];
  }
  get isUseMultipleRangeRequest() {
    return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
  }
  getChannelFilePrefix() {
    if (this.runtimeOptions.platform === "linux") {
      const t = process.env.TEST_UPDATER_ARCH || process.arch;
      return "-linux" + (t === "x64" ? "" : `-${t}`);
    } else
      return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
  }
  // due to historical reasons for windows we use channel name without platform specifier
  getDefaultChannelName() {
    return this.getCustomChannelName("latest");
  }
  getCustomChannelName(t) {
    return `${t}${this.getChannelFilePrefix()}`;
  }
  get fileExtraDownloadHeaders() {
    return null;
  }
  setRequestHeaders(t) {
    this.requestHeaders = t;
  }
  /**
   * Method to perform API request only to resolve update info, but not to download update.
   */
  httpRequest(t, r, n) {
    return this.executor.request(this.createRequestOptions(t, r), n);
  }
  createRequestOptions(t, r) {
    const n = {};
    return this.requestHeaders == null ? r != null && (n.headers = r) : n.headers = r == null ? this.requestHeaders : { ...this.requestHeaders, ...r }, (0, vt.configureRequestUrl)(t, n), n;
  }
}
le.Provider = s_;
function l_(e, t, r) {
  var n;
  if (e.length === 0)
    throw (0, vt.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
  const i = e.filter((a) => a.url.pathname.toLowerCase().endsWith(`.${t.toLowerCase()}`)), o = (n = i.find((a) => [a.url.pathname, a.info.url].some((s) => s.includes(process.arch)))) !== null && n !== void 0 ? n : i.shift();
  return o || (r == null ? e[0] : e.find((a) => !r.some((s) => a.url.pathname.toLowerCase().endsWith(`.${s.toLowerCase()}`))));
}
function c_(e, t, r) {
  if (e == null)
    throw (0, vt.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  let n;
  try {
    n = (0, i_.load)(e);
  } catch (i) {
    throw (0, vt.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): ${i.stack || i.message}, rawData: ${e}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  return n;
}
function Pu(e) {
  const t = e.files;
  if (t != null && t.length > 0)
    return t;
  if (e.path != null)
    return [
      {
        url: e.path,
        sha2: e.sha2,
        sha512: e.sha512
      }
    ];
  throw (0, vt.newError)(`No files provided: ${(0, vt.safeStringifyJson)(e)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
}
function u_(e, t, r = (n) => n) {
  const i = Pu(e).map((s) => {
    if (s.sha2 == null && s.sha512 == null)
      throw (0, vt.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, vt.safeStringifyJson)(s)}`, "ERR_UPDATER_NO_CHECKSUM");
    return {
      url: (0, Xn.newUrlFromBase)(r(s.url), t),
      info: s
    };
  }), o = e.packages, a = o == null ? null : o[process.arch] || o.ia32;
  return a != null && (i[0].packageInfo = {
    ...a,
    path: (0, Xn.newUrlFromBase)(r(a.path), t).href
  }), i;
}
Object.defineProperty(en, "__esModule", { value: !0 });
en.GenericProvider = void 0;
const qs = fe, Wi = Ye, Yi = le;
class f_ extends Yi.Provider {
  constructor(t, r, n) {
    super(n), this.configuration = t, this.updater = r, this.baseUrl = (0, Wi.newBaseUrl)(this.configuration.url);
  }
  get channel() {
    const t = this.updater.channel || this.configuration.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = (0, Wi.getChannelFilename)(this.channel), r = (0, Wi.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
    for (let n = 0; ; n++)
      try {
        return (0, Yi.parseUpdateInfo)(await this.httpRequest(r), t, r);
      } catch (i) {
        if (i instanceof qs.HttpError && i.statusCode === 404)
          throw (0, qs.newError)(`Cannot find channel "${t}" update info: ${i.stack || i.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        if (i.code === "ECONNREFUSED" && n < 3) {
          await new Promise((o, a) => {
            try {
              setTimeout(o, 1e3 * n);
            } catch (s) {
              a(s);
            }
          });
          continue;
        }
        throw i;
      }
  }
  resolveFiles(t) {
    return (0, Yi.resolveFiles)(t, this.baseUrl);
  }
}
en.GenericProvider = f_;
var fi = {}, di = {};
Object.defineProperty(di, "__esModule", { value: !0 });
di.BitbucketProvider = void 0;
const Vs = fe, zi = Ye, Xi = le;
class d_ extends Xi.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r;
    const { owner: i, slug: o } = t;
    this.baseUrl = (0, zi.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${i}/${o}/downloads`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "latest";
  }
  async getLatestVersion() {
    const t = new Vs.CancellationToken(), r = (0, zi.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, zi.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, void 0, t);
      return (0, Xi.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Vs.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, Xi.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { owner: t, slug: r } = this.configuration;
    return `Bitbucket (owner: ${t}, slug: ${r}, channel: ${this.channel})`;
  }
}
di.BitbucketProvider = d_;
var _t = {};
Object.defineProperty(_t, "__esModule", { value: !0 });
_t.GitHubProvider = _t.BaseGitHubProvider = void 0;
_t.computeReleaseNotes = $u;
const tt = fe, $t = Iu, h_ = wt, Zt = Ye, To = le, Ki = /\/tag\/([^/]+)$/;
class Du extends To.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      /* because GitHib uses S3 */
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.baseUrl = (0, Zt.newBaseUrl)((0, tt.githubUrl)(t, r));
    const i = r === "github.com" ? "api.github.com" : r;
    this.baseApiUrl = (0, Zt.newBaseUrl)((0, tt.githubUrl)(t, i));
  }
  computeGithubBasePath(t) {
    const r = this.options.host;
    return r && !["github.com", "api.github.com"].includes(r) ? `/api/v3${t}` : t;
  }
}
_t.BaseGitHubProvider = Du;
class p_ extends Du {
  constructor(t, r, n) {
    super(t, "github.com", n), this.options = t, this.updater = r;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    var t, r, n, i, o;
    const a = new tt.CancellationToken(), s = await this.httpRequest((0, Zt.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
      accept: "application/xml, application/atom+xml, text/xml, */*"
    }, a), l = (0, tt.parseXml)(s);
    let p = l.element("entry", !1, "No published versions on GitHub"), c = null;
    try {
      if (this.updater.allowPrerelease) {
        const T = ((t = this.updater) === null || t === void 0 ? void 0 : t.channel) || ((r = $t.prerelease(this.updater.currentVersion)) === null || r === void 0 ? void 0 : r[0]) || null;
        if (T === null)
          c = Ki.exec(p.element("link").attribute("href"))[1];
        else
          for (const C of l.getElements("entry")) {
            const A = Ki.exec(C.element("link").attribute("href"));
            if (A === null)
              continue;
            const D = A[1], L = ((n = $t.prerelease(D)) === null || n === void 0 ? void 0 : n[0]) || null, ee = !T || ["alpha", "beta"].includes(T), ae = L !== null && !["alpha", "beta"].includes(String(L));
            if (ee && !ae && !(T === "beta" && L === "alpha")) {
              c = D;
              break;
            }
            if (L && L === T) {
              c = D;
              break;
            }
          }
      } else {
        c = await this.getLatestTagName(a);
        for (const T of l.getElements("entry"))
          if (Ki.exec(T.element("link").attribute("href"))[1] === c) {
            p = T;
            break;
          }
      }
    } catch (T) {
      throw (0, tt.newError)(`Cannot parse releases feed: ${T.stack || T.message},
XML:
${s}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
    }
    if (c == null)
      throw (0, tt.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let f, d = "", g = "";
    const v = async (T) => {
      d = (0, Zt.getChannelFilename)(T), g = (0, Zt.newUrlFromBase)(this.getBaseDownloadPath(String(c), d), this.baseUrl);
      const C = this.createRequestOptions(g);
      try {
        return await this.executor.request(C, a);
      } catch (A) {
        throw A instanceof tt.HttpError && A.statusCode === 404 ? (0, tt.newError)(`Cannot find ${d} in the latest release artifacts (${g}): ${A.stack || A.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : A;
      }
    };
    try {
      let T = this.channel;
      this.updater.allowPrerelease && (!((i = $t.prerelease(c)) === null || i === void 0) && i[0]) && (T = this.getCustomChannelName(String((o = $t.prerelease(c)) === null || o === void 0 ? void 0 : o[0]))), f = await v(T);
    } catch (T) {
      if (this.updater.allowPrerelease)
        f = await v(this.getDefaultChannelName());
      else
        throw T;
    }
    const y = (0, To.parseUpdateInfo)(f, d, g);
    return y.releaseName == null && (y.releaseName = p.elementValueOrEmpty("title")), y.releaseNotes == null && (y.releaseNotes = $u(this.updater.currentVersion, this.updater.fullChangelog, l, p)), {
      tag: c,
      ...y
    };
  }
  async getLatestTagName(t) {
    const r = this.options, n = r.host == null || r.host === "github.com" ? (0, Zt.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new h_.URL(`${this.computeGithubBasePath(`/repos/${r.owner}/${r.repo}/releases`)}/latest`, this.baseApiUrl);
    try {
      const i = await this.httpRequest(n, { Accept: "application/json" }, t);
      return i == null ? null : JSON.parse(i).tag_name;
    } catch (i) {
      throw (0, tt.newError)(`Unable to find latest version on GitHub (${n}), please ensure a production release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return `/${this.options.owner}/${this.options.repo}/releases`;
  }
  resolveFiles(t) {
    return (0, To.resolveFiles)(t, this.baseUrl, (r) => this.getBaseDownloadPath(t.tag, r.replace(/ /g, "-")));
  }
  getBaseDownloadPath(t, r) {
    return `${this.basePath}/download/${t}/${r}`;
  }
}
_t.GitHubProvider = p_;
function Ws(e) {
  const t = e.elementValueOrEmpty("content");
  return t === "No content." ? "" : t;
}
function $u(e, t, r, n) {
  if (!t)
    return Ws(n);
  const i = [];
  for (const o of r.getElements("entry")) {
    const a = /\/tag\/v?([^/]+)$/.exec(o.element("link").attribute("href"))[1];
    $t.valid(a) && $t.lt(e, a) && i.push({
      version: a,
      note: Ws(o)
    });
  }
  return i.sort((o, a) => $t.rcompare(o.version, a.version));
}
var hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
hi.GitLabProvider = void 0;
const Ae = fe, Ji = wt, m_ = Nu, bn = Ye, Qi = le;
class g_ extends Qi.Provider {
  /**
   * Normalizes filenames by replacing spaces and underscores with dashes.
   *
   * This is a workaround to handle filename formatting differences between tools:
   * - electron-builder formats filenames like "test file.txt" as "test-file.txt"
   * - GitLab may provide asset URLs using underscores, such as "test_file.txt"
   *
   * Because of this mismatch, we can't reliably extract the correct filename from
   * the asset path without normalization. This function ensures consistent matching
   * across different filename formats by converting all spaces and underscores to dashes.
   *
   * @param filename The filename to normalize
   * @returns The normalized filename with spaces and underscores replaced by dashes
   */
  normalizeFilename(t) {
    return t.replace(/ |_/g, "-");
  }
  constructor(t, r, n) {
    super({
      ...n,
      // GitLab might not support multiple range requests efficiently
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.updater = r, this.cachedLatestVersion = null;
    const o = t.host || "gitlab.com";
    this.baseApiUrl = (0, bn.newBaseUrl)(`https://${o}/api/v4`);
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = new Ae.CancellationToken(), r = (0, bn.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl);
    let n;
    try {
      const d = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, g = await this.httpRequest(r, d, t);
      if (!g)
        throw (0, Ae.newError)("No latest release found", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      n = JSON.parse(g);
    } catch (d) {
      throw (0, Ae.newError)(`Unable to find latest release on GitLab (${r}): ${d.stack || d.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    const i = n.tag_name;
    let o = null, a = "", s = null;
    const l = async (d) => {
      a = (0, bn.getChannelFilename)(d);
      const g = n.assets.links.find((y) => y.name === a);
      if (!g)
        throw (0, Ae.newError)(`Cannot find ${a} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      s = new Ji.URL(g.direct_asset_url);
      const v = this.options.token ? { "PRIVATE-TOKEN": this.options.token } : void 0;
      try {
        const y = await this.httpRequest(s, v, t);
        if (!y)
          throw (0, Ae.newError)(`Empty response from ${s}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        return y;
      } catch (y) {
        throw y instanceof Ae.HttpError && y.statusCode === 404 ? (0, Ae.newError)(`Cannot find ${a} in the latest release artifacts (${s}): ${y.stack || y.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : y;
      }
    };
    try {
      o = await l(this.channel);
    } catch (d) {
      if (this.channel !== this.getDefaultChannelName())
        o = await l(this.getDefaultChannelName());
      else
        throw d;
    }
    if (!o)
      throw (0, Ae.newError)(`Unable to parse channel data from ${a}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    const p = (0, Qi.parseUpdateInfo)(o, a, s);
    p.releaseName == null && (p.releaseName = n.name), p.releaseNotes == null && (p.releaseNotes = n.description || null);
    const c = /* @__PURE__ */ new Map();
    for (const d of n.assets.links)
      c.set(this.normalizeFilename(d.name), d.direct_asset_url);
    const f = {
      tag: i,
      assets: c,
      ...p
    };
    return this.cachedLatestVersion = f, f;
  }
  /**
   * Utility function to convert GitlabReleaseAsset to Map<string, string>
   * Maps asset names to their download URLs
   */
  convertAssetsToMap(t) {
    const r = /* @__PURE__ */ new Map();
    for (const n of t.links)
      r.set(this.normalizeFilename(n.name), n.direct_asset_url);
    return r;
  }
  /**
   * Find blockmap file URL in assets map for a specific filename
   */
  findBlockMapInAssets(t, r) {
    const n = [`${r}.blockmap`, `${this.normalizeFilename(r)}.blockmap`];
    for (const i of n) {
      const o = t.get(i);
      if (o)
        return new Ji.URL(o);
    }
    return null;
  }
  async fetchReleaseInfoByVersion(t) {
    const r = new Ae.CancellationToken(), n = [`v${t}`, t];
    for (const i of n) {
      const o = (0, bn.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(i)}`, this.baseApiUrl);
      try {
        const a = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, s = await this.httpRequest(o, a, r);
        if (s)
          return JSON.parse(s);
      } catch (a) {
        if (a instanceof Ae.HttpError && a.statusCode === 404)
          continue;
        throw (0, Ae.newError)(`Unable to find release ${i} on GitLab (${o}): ${a.stack || a.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
      }
    }
    throw (0, Ae.newError)(`Unable to find release with version ${t} (tried: ${n.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
  }
  setAuthHeaderForToken(t) {
    const r = {};
    return t != null && (t.startsWith("Bearer") ? r.authorization = t : r["PRIVATE-TOKEN"] = t), r;
  }
  /**
   * Get version info for blockmap files, using cache when possible
   */
  async getVersionInfoForBlockMap(t) {
    if (this.cachedLatestVersion && this.cachedLatestVersion.version === t)
      return this.cachedLatestVersion.assets;
    const r = await this.fetchReleaseInfoByVersion(t);
    return r && r.assets ? this.convertAssetsToMap(r.assets) : null;
  }
  /**
   * Find blockmap URLs from version assets
   */
  async findBlockMapUrlsFromAssets(t, r, n) {
    let i = null, o = null;
    const a = await this.getVersionInfoForBlockMap(r);
    a && (i = this.findBlockMapInAssets(a, n));
    const s = await this.getVersionInfoForBlockMap(t);
    if (s) {
      const l = n.replace(new RegExp(m_(r), "g"), t);
      o = this.findBlockMapInAssets(s, l);
    }
    return [o, i];
  }
  async getBlockMapFiles(t, r, n, i = null) {
    if (this.options.uploadTarget === "project_upload") {
      const o = t.pathname.split("/").pop() || "", [a, s] = await this.findBlockMapUrlsFromAssets(r, n, o);
      if (!s)
        throw (0, Ae.newError)(`Cannot find blockmap file for ${n} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      if (!a)
        throw (0, Ae.newError)(`Cannot find blockmap file for ${r} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      return [a, s];
    } else
      return super.getBlockMapFiles(t, r, n, i);
  }
  resolveFiles(t) {
    return (0, Qi.getFileList)(t).map((r) => {
      const i = [
        r.url,
        // Original filename
        this.normalizeFilename(r.url)
        // Normalized filename (spaces/underscores → dashes)
      ].find((a) => t.assets.has(a)), o = i ? t.assets.get(i) : void 0;
      if (!o)
        throw (0, Ae.newError)(`Cannot find asset "${r.url}" in GitLab release assets. Available assets: ${Array.from(t.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new Ji.URL(o),
        info: r
      };
    });
  }
  toString() {
    return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
  }
}
hi.GitLabProvider = g_;
var pi = {};
Object.defineProperty(pi, "__esModule", { value: !0 });
pi.KeygenProvider = void 0;
const Ys = fe, Zi = Ye, eo = le;
class E_ extends eo.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r, this.defaultHostname = "api.keygen.sh";
    const i = this.configuration.host || this.defaultHostname;
    this.baseUrl = (0, Zi.newBaseUrl)(`https://${i}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "stable";
  }
  async getLatestVersion() {
    const t = new Ys.CancellationToken(), r = (0, Zi.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, Zi.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, {
        Accept: "application/vnd.api+json",
        "Keygen-Version": "1.1"
      }, t);
      return (0, eo.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Ys.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, eo.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { account: t, product: r, platform: n } = this.configuration;
    return `Keygen (account: ${t}, product: ${r}, platform: ${n}, channel: ${this.channel})`;
  }
}
pi.KeygenProvider = E_;
var mi = {};
Object.defineProperty(mi, "__esModule", { value: !0 });
mi.PrivateGitHubProvider = void 0;
const Wt = fe, y_ = ye, v_ = te, zs = wt, Xs = Ye, __ = _t, w_ = le;
class T_ extends __.BaseGitHubProvider {
  constructor(t, r, n, i) {
    super(t, "api.github.com", i), this.updater = r, this.token = n;
  }
  createRequestOptions(t, r) {
    const n = super.createRequestOptions(t, r);
    return n.redirect = "manual", n;
  }
  async getLatestVersion() {
    const t = new Wt.CancellationToken(), r = (0, Xs.getChannelFilename)(this.getDefaultChannelName()), n = await this.getLatestVersionInfo(t), i = n.assets.find((s) => s.name === r);
    if (i == null)
      throw (0, Wt.newError)(`Cannot find ${r} in the release ${n.html_url || n.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
    const o = new zs.URL(i.url);
    let a;
    try {
      a = (0, y_.load)(await this.httpRequest(o, this.configureHeaders("application/octet-stream"), t));
    } catch (s) {
      throw s instanceof Wt.HttpError && s.statusCode === 404 ? (0, Wt.newError)(`Cannot find ${r} in the latest release artifacts (${o}): ${s.stack || s.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : s;
    }
    return a.assets = n.assets, a;
  }
  get fileExtraDownloadHeaders() {
    return this.configureHeaders("application/octet-stream");
  }
  configureHeaders(t) {
    return {
      accept: t,
      authorization: `token ${this.token}`
    };
  }
  async getLatestVersionInfo(t) {
    const r = this.updater.allowPrerelease;
    let n = this.basePath;
    r || (n = `${n}/latest`);
    const i = (0, Xs.newUrlFromBase)(n, this.baseUrl);
    try {
      const o = JSON.parse(await this.httpRequest(i, this.configureHeaders("application/vnd.github.v3+json"), t));
      return r ? o.find((a) => a.prerelease) || o[0] : o;
    } catch (o) {
      throw (0, Wt.newError)(`Unable to find latest version on GitHub (${i}), please ensure a production release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
  }
  resolveFiles(t) {
    return (0, w_.getFileList)(t).map((r) => {
      const n = v_.posix.basename(r.url).replace(/ /g, "-"), i = t.assets.find((o) => o != null && o.name === n);
      if (i == null)
        throw (0, Wt.newError)(`Cannot find asset "${n}" in: ${JSON.stringify(t.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new zs.URL(i.url),
        info: r
      };
    });
  }
}
mi.PrivateGitHubProvider = T_;
Object.defineProperty(fi, "__esModule", { value: !0 });
fi.isUrlProbablySupportMultiRangeRequests = Fu;
fi.createClient = O_;
const On = fe, A_ = di, Ks = en, C_ = _t, S_ = hi, I_ = pi, b_ = mi;
function Fu(e) {
  return !e.includes("s3.amazonaws.com");
}
function O_(e, t, r) {
  if (typeof e == "string")
    throw (0, On.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
  const n = e.provider;
  switch (n) {
    case "github": {
      const i = e, o = (i.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || i.token;
      return o == null ? new C_.GitHubProvider(i, t, r) : new b_.PrivateGitHubProvider(i, t, o, r);
    }
    case "bitbucket":
      return new A_.BitbucketProvider(e, t, r);
    case "gitlab":
      return new S_.GitLabProvider(e, t, r);
    case "keygen":
      return new I_.KeygenProvider(e, t, r);
    case "s3":
    case "spaces":
      return new Ks.GenericProvider({
        provider: "generic",
        url: (0, On.getS3LikeProviderBaseUrl)(e),
        channel: e.channel || null
      }, t, {
        ...r,
        // https://github.com/minio/minio/issues/5285#issuecomment-350428955
        isUseMultipleRangeRequest: !1
      });
    case "generic": {
      const i = e;
      return new Ks.GenericProvider(i, t, {
        ...r,
        isUseMultipleRangeRequest: i.useMultipleRangeRequest !== !1 && Fu(i.url)
      });
    }
    case "custom": {
      const i = e, o = i.updateProvider;
      if (!o)
        throw (0, On.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
      return new o(i, t, r);
    }
    default:
      throw (0, On.newError)(`Unsupported provider: ${n}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
  }
}
var gi = {}, tn = {}, fr = {}, Ht = {};
Object.defineProperty(Ht, "__esModule", { value: !0 });
Ht.OperationKind = void 0;
Ht.computeOperations = R_;
var Ft;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(Ft || (Ht.OperationKind = Ft = {}));
function R_(e, t, r) {
  const n = Qs(e.files), i = Qs(t.files);
  let o = null;
  const a = t.files[0], s = [], l = a.name, p = n.get(l);
  if (p == null)
    throw new Error(`no file ${l} in old blockmap`);
  const c = i.get(l);
  let f = 0;
  const { checksumToOffset: d, checksumToOldSize: g } = P_(n.get(l), p.offset, r);
  let v = a.offset;
  for (let y = 0; y < c.checksums.length; v += c.sizes[y], y++) {
    const T = c.sizes[y], C = c.checksums[y];
    let A = d.get(C);
    A != null && g.get(C) !== T && (r.warn(`Checksum ("${C}") matches, but size differs (old: ${g.get(C)}, new: ${T})`), A = void 0), A === void 0 ? (f++, o != null && o.kind === Ft.DOWNLOAD && o.end === v ? o.end += T : (o = {
      kind: Ft.DOWNLOAD,
      start: v,
      end: v + T
      // oldBlocks: null,
    }, Js(o, s, C, y))) : o != null && o.kind === Ft.COPY && o.end === A ? o.end += T : (o = {
      kind: Ft.COPY,
      start: A,
      end: A + T
      // oldBlocks: [checksum]
    }, Js(o, s, C, y));
  }
  return f > 0 && r.info(`File${a.name === "file" ? "" : " " + a.name} has ${f} changed blocks`), s;
}
const N_ = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
function Js(e, t, r, n) {
  if (N_ && t.length !== 0) {
    const i = t[t.length - 1];
    if (i.kind === e.kind && e.start < i.end && e.start > i.start) {
      const o = [i.start, i.end, e.start, e.end].reduce((a, s) => a < s ? a : s);
      throw new Error(`operation (block index: ${n}, checksum: ${r}, kind: ${Ft[e.kind]}) overlaps previous operation (checksum: ${r}):
abs: ${i.start} until ${i.end} and ${e.start} until ${e.end}
rel: ${i.start - o} until ${i.end - o} and ${e.start - o} until ${e.end - o}`);
    }
  }
  t.push(e);
}
function P_(e, t, r) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  let o = t;
  for (let a = 0; a < e.checksums.length; a++) {
    const s = e.checksums[a], l = e.sizes[a], p = i.get(s);
    if (p === void 0)
      n.set(s, o), i.set(s, l);
    else if (r.debug != null) {
      const c = p === l ? "(same size)" : `(size: ${p}, this size: ${l})`;
      r.debug(`${s} duplicated in blockmap ${c}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
    }
    o += l;
  }
  return { checksumToOffset: n, checksumToOldSize: i };
}
function Qs(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e)
    t.set(r.name, r);
  return t;
}
Object.defineProperty(fr, "__esModule", { value: !0 });
fr.DataSplitter = void 0;
fr.copyData = Lu;
const Rn = fe, D_ = it, $_ = Vr, F_ = Ht, Zs = Buffer.from(`\r
\r
`);
var ft;
(function(e) {
  e[e.INIT = 0] = "INIT", e[e.HEADER = 1] = "HEADER", e[e.BODY = 2] = "BODY";
})(ft || (ft = {}));
function Lu(e, t, r, n, i) {
  const o = (0, D_.createReadStream)("", {
    fd: r,
    autoClose: !1,
    start: e.start,
    // end is inclusive
    end: e.end - 1
  });
  o.on("error", n), o.once("end", i), o.pipe(t, {
    end: !1
  });
}
class L_ extends $_.Writable {
  constructor(t, r, n, i, o, a, s, l) {
    super(), this.out = t, this.options = r, this.partIndexToTaskIndex = n, this.partIndexToLength = o, this.finishHandler = a, this.grandTotalBytes = s, this.onProgress = l, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = ft.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = i.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
  }
  get isFinished() {
    return this.partIndex === this.partIndexToLength.length;
  }
  // noinspection JSUnusedGlobalSymbols
  _write(t, r, n) {
    if (this.isFinished) {
      console.error(`Trailing ignored data: ${t.length} bytes`);
      return;
    }
    this.handleData(t).then(() => {
      if (this.onProgress) {
        const i = Date.now();
        (i >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (i - this.start) / 1e3 && (this.nextUpdate = i + 1e3, this.onProgress({
          total: this.grandTotalBytes,
          delta: this.delta,
          transferred: this.transferred,
          percent: this.transferred / this.grandTotalBytes * 100,
          bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
        }), this.delta = 0);
      }
      n();
    }).catch(n);
  }
  async handleData(t) {
    let r = 0;
    if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
      throw (0, Rn.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
    if (this.ignoreByteCount > 0) {
      const n = Math.min(this.ignoreByteCount, t.length);
      this.ignoreByteCount -= n, r = n;
    } else if (this.remainingPartDataCount > 0) {
      const n = Math.min(this.remainingPartDataCount, t.length);
      this.remainingPartDataCount -= n, await this.processPartData(t, 0, n), r = n;
    }
    if (r !== t.length) {
      if (this.readState === ft.HEADER) {
        const n = this.searchHeaderListEnd(t, r);
        if (n === -1)
          return;
        r = n, this.readState = ft.BODY, this.headerListBuffer = null;
      }
      for (; ; ) {
        if (this.readState === ft.BODY)
          this.readState = ft.INIT;
        else {
          this.partIndex++;
          let a = this.partIndexToTaskIndex.get(this.partIndex);
          if (a == null)
            if (this.isFinished)
              a = this.options.end;
            else
              throw (0, Rn.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
          const s = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
          if (s < a)
            await this.copyExistingData(s, a);
          else if (s > a)
            throw (0, Rn.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
          if (this.isFinished) {
            this.onPartEnd(), this.finishHandler();
            return;
          }
          if (r = this.searchHeaderListEnd(t, r), r === -1) {
            this.readState = ft.HEADER;
            return;
          }
        }
        const n = this.partIndexToLength[this.partIndex], i = r + n, o = Math.min(i, t.length);
        if (await this.processPartStarted(t, r, o), this.remainingPartDataCount = n - (o - r), this.remainingPartDataCount > 0)
          return;
        if (r = i + this.boundaryLength, r >= t.length) {
          this.ignoreByteCount = this.boundaryLength - (t.length - i);
          return;
        }
      }
    }
  }
  copyExistingData(t, r) {
    return new Promise((n, i) => {
      const o = () => {
        if (t === r) {
          n();
          return;
        }
        const a = this.options.tasks[t];
        if (a.kind !== F_.OperationKind.COPY) {
          i(new Error("Task kind must be COPY"));
          return;
        }
        Lu(a, this.out, this.options.oldFileFd, i, () => {
          t++, o();
        });
      };
      o();
    });
  }
  searchHeaderListEnd(t, r) {
    const n = t.indexOf(Zs, r);
    if (n !== -1)
      return n + Zs.length;
    const i = r === 0 ? t : t.slice(r);
    return this.headerListBuffer == null ? this.headerListBuffer = i : this.headerListBuffer = Buffer.concat([this.headerListBuffer, i]), -1;
  }
  onPartEnd() {
    const t = this.partIndexToLength[this.partIndex - 1];
    if (this.actualPartLength !== t)
      throw (0, Rn.newError)(`Expected length: ${t} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
    this.actualPartLength = 0;
  }
  processPartStarted(t, r, n) {
    return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(t, r, n);
  }
  processPartData(t, r, n) {
    this.actualPartLength += n - r, this.transferred += n - r, this.delta += n - r;
    const i = this.out;
    return i.write(r === 0 && t.length === n ? t : t.slice(r, n)) ? Promise.resolve() : new Promise((o, a) => {
      i.on("error", a), i.once("drain", () => {
        i.removeListener("error", a), o();
      });
    });
  }
}
fr.DataSplitter = L_;
var Ei = {};
Object.defineProperty(Ei, "__esModule", { value: !0 });
Ei.executeTasksUsingMultipleRangeRequests = x_;
Ei.checkIsRangesSupported = Co;
const Ao = fe, el = fr, tl = Ht;
function x_(e, t, r, n, i) {
  const o = (a) => {
    if (a >= t.length) {
      e.fileMetadataBuffer != null && r.write(e.fileMetadataBuffer), r.end();
      return;
    }
    const s = a + 1e3;
    U_(e, {
      tasks: t,
      start: a,
      end: Math.min(t.length, s),
      oldFileFd: n
    }, r, () => o(s), i);
  };
  return o;
}
function U_(e, t, r, n, i) {
  let o = "bytes=", a = 0, s = 0;
  const l = /* @__PURE__ */ new Map(), p = [];
  for (let d = t.start; d < t.end; d++) {
    const g = t.tasks[d];
    g.kind === tl.OperationKind.DOWNLOAD && (o += `${g.start}-${g.end - 1}, `, l.set(a, d), a++, p.push(g.end - g.start), s += g.end - g.start);
  }
  if (a <= 1) {
    const d = (g) => {
      if (g >= t.end) {
        n();
        return;
      }
      const v = t.tasks[g++];
      if (v.kind === tl.OperationKind.COPY)
        (0, el.copyData)(v, r, t.oldFileFd, i, () => d(g));
      else {
        const y = e.createRequestOptions();
        y.headers.Range = `bytes=${v.start}-${v.end - 1}`;
        const T = e.httpExecutor.createRequest(y, (C) => {
          C.on("error", i), Co(C, i) && (C.pipe(r, {
            end: !1
          }), C.once("end", () => d(g)));
        });
        e.httpExecutor.addErrorAndTimeoutHandlers(T, i), T.end();
      }
    };
    d(t.start);
    return;
  }
  const c = e.createRequestOptions();
  c.headers.Range = o.substring(0, o.length - 2);
  const f = e.httpExecutor.createRequest(c, (d) => {
    if (!Co(d, i))
      return;
    const g = (0, Ao.safeGetHeader)(d, "content-type"), v = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(g);
    if (v == null) {
      i(new Error(`Content-Type "multipart/byteranges" is expected, but got "${g}"`));
      return;
    }
    const y = new el.DataSplitter(r, t, l, v[1] || v[2], p, n, s, e.options.onProgress);
    y.on("error", i), d.pipe(y), d.on("end", () => {
      setTimeout(() => {
        f.abort(), i(new Error("Response ends without calling any handlers"));
      }, 1e4);
    });
  });
  e.httpExecutor.addErrorAndTimeoutHandlers(f, i), f.end();
}
function Co(e, t) {
  if (e.statusCode >= 400)
    return t((0, Ao.createHttpError)(e)), !1;
  if (e.statusCode !== 206) {
    const r = (0, Ao.safeGetHeader)(e, "accept-ranges");
    if (r == null || r === "none")
      return t(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)), !1;
  }
  return !0;
}
var yi = {};
Object.defineProperty(yi, "__esModule", { value: !0 });
yi.ProgressDifferentialDownloadCallbackTransform = void 0;
const k_ = Vr;
var er;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(er || (er = {}));
class M_ extends k_.Transform {
  constructor(t, r, n) {
    super(), this.progressDifferentialDownloadInfo = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = er.COPY, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    if (this.operationType == er.COPY) {
      n(null, t);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), n(null, t);
  }
  beginFileCopy() {
    this.operationType = er.COPY;
  }
  beginRangeDownload() {
    this.operationType = er.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
  }
  endRangeDownload() {
    this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    });
  }
  // Called when we are 100% done with the connection/download
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, this.transferred = 0, t(null);
  }
}
yi.ProgressDifferentialDownloadCallbackTransform = M_;
Object.defineProperty(tn, "__esModule", { value: !0 });
tn.DifferentialDownloader = void 0;
const _r = fe, to = Tt, B_ = it, j_ = fr, H_ = wt, Nn = Ht, rl = Ei, G_ = yi;
class q_ {
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(t, r, n) {
    this.blockAwareFileInfo = t, this.httpExecutor = r, this.options = n, this.fileMetadataBuffer = null, this.logger = n.logger;
  }
  createRequestOptions() {
    const t = {
      headers: {
        ...this.options.requestHeaders,
        accept: "*/*"
      }
    };
    return (0, _r.configureRequestUrl)(this.options.newUrl, t), (0, _r.configureRequestOptions)(t), t;
  }
  doDownload(t, r) {
    if (t.version !== r.version)
      throw new Error(`version is different (${t.version} - ${r.version}), full download is required`);
    const n = this.logger, i = (0, Nn.computeOperations)(t, r, n);
    n.debug != null && n.debug(JSON.stringify(i, null, 2));
    let o = 0, a = 0;
    for (const l of i) {
      const p = l.end - l.start;
      l.kind === Nn.OperationKind.DOWNLOAD ? o += p : a += p;
    }
    const s = this.blockAwareFileInfo.size;
    if (o + a + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== s)
      throw new Error(`Internal error, size mismatch: downloadSize: ${o}, copySize: ${a}, newSize: ${s}`);
    return n.info(`Full: ${nl(s)}, To download: ${nl(o)} (${Math.round(o / (s / 100))}%)`), this.downloadFile(i);
  }
  downloadFile(t) {
    const r = [], n = () => Promise.all(r.map((i) => (0, to.close)(i.descriptor).catch((o) => {
      this.logger.error(`cannot close file "${i.path}": ${o}`);
    })));
    return this.doDownloadFile(t, r).then(n).catch((i) => n().catch((o) => {
      try {
        this.logger.error(`cannot close files: ${o}`);
      } catch (a) {
        try {
          console.error(a);
        } catch {
        }
      }
      throw i;
    }).then(() => {
      throw i;
    }));
  }
  async doDownloadFile(t, r) {
    const n = await (0, to.open)(this.options.oldFile, "r");
    r.push({ descriptor: n, path: this.options.oldFile });
    const i = await (0, to.open)(this.options.newFile, "w");
    r.push({ descriptor: i, path: this.options.newFile });
    const o = (0, B_.createWriteStream)(this.options.newFile, { fd: i });
    await new Promise((a, s) => {
      const l = [];
      let p;
      if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
        const C = [];
        let A = 0;
        for (const L of t)
          L.kind === Nn.OperationKind.DOWNLOAD && (C.push(L.end - L.start), A += L.end - L.start);
        const D = {
          expectedByteCounts: C,
          grandTotal: A
        };
        p = new G_.ProgressDifferentialDownloadCallbackTransform(D, this.options.cancellationToken, this.options.onProgress), l.push(p);
      }
      const c = new _r.DigestTransform(this.blockAwareFileInfo.sha512);
      c.isValidateOnEnd = !1, l.push(c), o.on("finish", () => {
        o.close(() => {
          r.splice(1, 1);
          try {
            c.validate();
          } catch (C) {
            s(C);
            return;
          }
          a(void 0);
        });
      }), l.push(o);
      let f = null;
      for (const C of l)
        C.on("error", s), f == null ? f = C : f = f.pipe(C);
      const d = l[0];
      let g;
      if (this.options.isUseMultipleRangeRequest) {
        g = (0, rl.executeTasksUsingMultipleRangeRequests)(this, t, d, n, s), g(0);
        return;
      }
      let v = 0, y = null;
      this.logger.info(`Differential download: ${this.options.newUrl}`);
      const T = this.createRequestOptions();
      T.redirect = "manual", g = (C) => {
        var A, D;
        if (C >= t.length) {
          this.fileMetadataBuffer != null && d.write(this.fileMetadataBuffer), d.end();
          return;
        }
        const L = t[C++];
        if (L.kind === Nn.OperationKind.COPY) {
          p && p.beginFileCopy(), (0, j_.copyData)(L, d, n, s, () => g(C));
          return;
        }
        const ee = `bytes=${L.start}-${L.end - 1}`;
        T.headers.range = ee, (D = (A = this.logger) === null || A === void 0 ? void 0 : A.debug) === null || D === void 0 || D.call(A, `download range: ${ee}`), p && p.beginRangeDownload();
        const ae = this.httpExecutor.createRequest(T, (W) => {
          W.on("error", s), W.on("aborted", () => {
            s(new Error("response has been aborted by the server"));
          }), W.statusCode >= 400 && s((0, _r.createHttpError)(W)), W.pipe(d, {
            end: !1
          }), W.once("end", () => {
            p && p.endRangeDownload(), ++v === 100 ? (v = 0, setTimeout(() => g(C), 1e3)) : g(C);
          });
        });
        ae.on("redirect", (W, Fe, E) => {
          this.logger.info(`Redirect to ${V_(E)}`), y = E, (0, _r.configureRequestUrl)(new H_.URL(y), T), ae.followRedirect();
        }), this.httpExecutor.addErrorAndTimeoutHandlers(ae, s), ae.end();
      }, g(0);
    });
  }
  async readRemoteBytes(t, r) {
    const n = Buffer.allocUnsafe(r + 1 - t), i = this.createRequestOptions();
    i.headers.range = `bytes=${t}-${r}`;
    let o = 0;
    if (await this.request(i, (a) => {
      a.copy(n, o), o += a.length;
    }), o !== n.length)
      throw new Error(`Received data length ${o} is not equal to expected ${n.length}`);
    return n;
  }
  request(t, r) {
    return new Promise((n, i) => {
      const o = this.httpExecutor.createRequest(t, (a) => {
        (0, rl.checkIsRangesSupported)(a, i) && (a.on("error", i), a.on("aborted", () => {
          i(new Error("response has been aborted by the server"));
        }), a.on("data", r), a.on("end", () => n()));
      });
      this.httpExecutor.addErrorAndTimeoutHandlers(o, i), o.end();
    });
  }
}
tn.DifferentialDownloader = q_;
function nl(e, t = " KB") {
  return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
}
function V_(e) {
  const t = e.indexOf("?");
  return t < 0 ? e : e.substring(0, t);
}
Object.defineProperty(gi, "__esModule", { value: !0 });
gi.GenericDifferentialDownloader = void 0;
const W_ = tn;
class Y_ extends W_.DifferentialDownloader {
  download(t, r) {
    return this.doDownload(t, r);
  }
}
gi.GenericDifferentialDownloader = Y_;
var At = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = n;
  const t = fe;
  Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
  class r {
    constructor(o) {
      this.emitter = o;
    }
    /**
     * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
     */
    login(o) {
      n(this.emitter, "login", o);
    }
    progress(o) {
      n(this.emitter, e.DOWNLOAD_PROGRESS, o);
    }
    updateDownloaded(o) {
      n(this.emitter, e.UPDATE_DOWNLOADED, o);
    }
    updateCancelled(o) {
      n(this.emitter, "update-cancelled", o);
    }
  }
  e.UpdaterSignal = r;
  function n(i, o, a) {
    i.on(o, a);
  }
})(At);
Object.defineProperty(gt, "__esModule", { value: !0 });
gt.NoOpLogger = gt.AppUpdater = void 0;
const Ce = fe, z_ = sr, X_ = qr, K_ = Cl, je = Tt, J_ = ye, ro = ii, He = te, Pt = Iu, il = Zr, Q_ = ui, ol = bu, Z_ = en, no = fi, io = Il, ew = gi, Yt = At;
class na extends K_.EventEmitter {
  /**
   * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
   */
  get channel() {
    return this._channel;
  }
  /**
   * Set the update channel. Overrides `channel` in the update configuration.
   *
   * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
   */
  set channel(t) {
    if (this._channel != null) {
      if (typeof t != "string")
        throw (0, Ce.newError)(`Channel must be a string, but got: ${t}`, "ERR_UPDATER_INVALID_CHANNEL");
      if (t.length === 0)
        throw (0, Ce.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
    }
    this._channel = t, this.allowDowngrade = !0;
  }
  /**
   *  Shortcut for explicitly adding auth tokens to request headers
   */
  addAuthHeader(t) {
    this.requestHeaders = Object.assign({}, this.requestHeaders, {
      authorization: t
    });
  }
  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  get netSession() {
    return (0, ol.getNetSession)();
  }
  /**
   * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
   * Set it to `null` if you would like to disable a logging feature.
   */
  get logger() {
    return this._logger;
  }
  set logger(t) {
    this._logger = t ?? new xu();
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * test only
   * @private
   */
  set updateConfigPath(t) {
    this.clientPromise = null, this._appUpdateConfigPath = t, this.configOnDisk = new ro.Lazy(() => this.loadUpdateConfig());
  }
  /**
   * Allows developer to override default logic for determining if an update is supported.
   * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
   */
  get isUpdateSupported() {
    return this._isUpdateSupported;
  }
  set isUpdateSupported(t) {
    t && (this._isUpdateSupported = t);
  }
  /**
   * Allows developer to override default logic for determining if the user is below the rollout threshold.
   * The default logic compares the staging percentage with numerical representation of user ID.
   * An override can define custom logic, or bypass it if needed.
   */
  get isUserWithinRollout() {
    return this._isUserWithinRollout;
  }
  set isUserWithinRollout(t) {
    t && (this._isUserWithinRollout = t);
  }
  constructor(t, r) {
    super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new Yt.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (o) => this.checkIfUpdateSupported(o), this._isUserWithinRollout = (o) => this.isStagingMatch(o), this.clientPromise = null, this.stagingUserIdPromise = new ro.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new ro.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (o) => {
      this._logger.error(`Error: ${o.stack || o.message}`);
    }), r == null ? (this.app = new Q_.ElectronAppAdapter(), this.httpExecutor = new ol.ElectronHttpExecutor((o, a) => this.emit("login", o, a))) : (this.app = r, this.httpExecutor = null);
    const n = this.app.version, i = (0, Pt.parse)(n);
    if (i == null)
      throw (0, Ce.newError)(`App version is not a valid semver version: "${n}"`, "ERR_UPDATER_INVALID_VERSION");
    this.currentVersion = i, this.allowPrerelease = tw(i), t != null && (this.setFeedURL(t), typeof t != "string" && t.requestHeaders && (this.requestHeaders = t.requestHeaders));
  }
  //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  getFeedURL() {
    return "Deprecated. Do not use it.";
  }
  /**
   * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
   * @param options If you want to override configuration in the `app-update.yml`.
   */
  setFeedURL(t) {
    const r = this.createProviderRuntimeOptions();
    let n;
    typeof t == "string" ? n = new Z_.GenericProvider({ provider: "generic", url: t }, this, {
      ...r,
      isUseMultipleRangeRequest: (0, no.isUrlProbablySupportMultiRangeRequests)(t)
    }) : n = (0, no.createClient)(t, this, r), this.clientPromise = Promise.resolve(n);
  }
  /**
   * Asks the server whether there is an update.
   * @returns null if the updater is disabled, otherwise info about the latest version
   */
  checkForUpdates() {
    if (!this.isUpdaterActive())
      return Promise.resolve(null);
    let t = this.checkForUpdatesPromise;
    if (t != null)
      return this._logger.info("Checking for update (already in progress)"), t;
    const r = () => this.checkForUpdatesPromise = null;
    return this._logger.info("Checking for update"), t = this.doCheckForUpdates().then((n) => (r(), n)).catch((n) => {
      throw r(), this.emit("error", n, `Cannot check for updates: ${(n.stack || n).toString()}`), n;
    }), this.checkForUpdatesPromise = t, t;
  }
  isUpdaterActive() {
    return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
  }
  // noinspection JSUnusedGlobalSymbols
  checkForUpdatesAndNotify(t) {
    return this.checkForUpdates().then((r) => r != null && r.downloadPromise ? (r.downloadPromise.then(() => {
      const n = na.formatDownloadNotification(r.updateInfo.version, this.app.name, t);
      new Ut.Notification(n).show();
    }), r) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), r));
  }
  static formatDownloadNotification(t, r, n) {
    return n == null && (n = {
      title: "A new update is ready to install",
      body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
    }), n = {
      title: n.title.replace("{appName}", r).replace("{version}", t),
      body: n.body.replace("{appName}", r).replace("{version}", t)
    }, n;
  }
  async isStagingMatch(t) {
    const r = t.stagingPercentage;
    let n = r;
    if (n == null)
      return !0;
    if (n = parseInt(n, 10), isNaN(n))
      return this._logger.warn(`Staging percentage is NaN: ${r}`), !0;
    n = n / 100;
    const i = await this.stagingUserIdPromise.value, a = Ce.UUID.parse(i).readUInt32BE(12) / 4294967295;
    return this._logger.info(`Staging percentage: ${n}, percentage: ${a}, user id: ${i}`), a < n;
  }
  computeFinalHeaders(t) {
    return this.requestHeaders != null && Object.assign(t, this.requestHeaders), t;
  }
  async isUpdateAvailable(t) {
    const r = (0, Pt.parse)(t.version);
    if (r == null)
      throw (0, Ce.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${t.version}"`, "ERR_UPDATER_INVALID_VERSION");
    const n = this.currentVersion;
    if ((0, Pt.eq)(r, n) || !await Promise.resolve(this.isUpdateSupported(t)) || !await Promise.resolve(this.isUserWithinRollout(t)))
      return !1;
    const o = (0, Pt.gt)(r, n), a = (0, Pt.lt)(r, n);
    return o ? !0 : this.allowDowngrade && a;
  }
  checkIfUpdateSupported(t) {
    const r = t == null ? void 0 : t.minimumSystemVersion, n = (0, X_.release)();
    if (r)
      try {
        if ((0, Pt.lt)(n, r))
          return this._logger.info(`Current OS version ${n} is less than the minimum OS version required ${r} for version ${n}`), !1;
      } catch (i) {
        this._logger.warn(`Failed to compare current OS version(${n}) with minimum OS version(${r}): ${(i.message || i).toString()}`);
      }
    return !0;
  }
  async getUpdateInfoAndProvider() {
    await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((n) => (0, no.createClient)(n, this, this.createProviderRuntimeOptions())));
    const t = await this.clientPromise, r = await this.stagingUserIdPromise.value;
    return t.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": r })), {
      info: await t.getLatestVersion(),
      provider: t
    };
  }
  createProviderRuntimeOptions() {
    return {
      isUseMultipleRangeRequest: !0,
      platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
      executor: this.httpExecutor
    };
  }
  async doCheckForUpdates() {
    this.emit("checking-for-update");
    const t = await this.getUpdateInfoAndProvider(), r = t.info;
    if (!await this.isUpdateAvailable(r))
      return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${r.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", r), {
        isUpdateAvailable: !1,
        versionInfo: r,
        updateInfo: r
      };
    this.updateInfoAndProvider = t, this.onUpdateAvailable(r);
    const n = new Ce.CancellationToken();
    return {
      isUpdateAvailable: !0,
      versionInfo: r,
      updateInfo: r,
      cancellationToken: n,
      downloadPromise: this.autoDownload ? this.downloadUpdate(n) : null
    };
  }
  onUpdateAvailable(t) {
    this._logger.info(`Found version ${t.version} (url: ${(0, Ce.asArray)(t.files).map((r) => r.url).join(", ")})`), this.emit("update-available", t);
  }
  /**
   * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
   * @returns {Promise<Array<string>>} Paths to downloaded files.
   */
  downloadUpdate(t = new Ce.CancellationToken()) {
    const r = this.updateInfoAndProvider;
    if (r == null) {
      const i = new Error("Please check update first");
      return this.dispatchError(i), Promise.reject(i);
    }
    if (this.downloadPromise != null)
      return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
    this._logger.info(`Downloading update from ${(0, Ce.asArray)(r.info.files).map((i) => i.url).join(", ")}`);
    const n = (i) => {
      if (!(i instanceof Ce.CancellationError))
        try {
          this.dispatchError(i);
        } catch (o) {
          this._logger.warn(`Cannot dispatch error event: ${o.stack || o}`);
        }
      return i;
    };
    return this.downloadPromise = this.doDownloadUpdate({
      updateInfoAndProvider: r,
      requestHeaders: this.computeRequestHeaders(r.provider),
      cancellationToken: t,
      disableWebInstaller: this.disableWebInstaller,
      disableDifferentialDownload: this.disableDifferentialDownload
    }).catch((i) => {
      throw n(i);
    }).finally(() => {
      this.downloadPromise = null;
    }), this.downloadPromise;
  }
  dispatchError(t) {
    this.emit("error", t, (t.stack || t).toString());
  }
  dispatchUpdateDownloaded(t) {
    this.emit(Yt.UPDATE_DOWNLOADED, t);
  }
  async loadUpdateConfig() {
    return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, J_.load)(await (0, je.readFile)(this._appUpdateConfigPath, "utf-8"));
  }
  computeRequestHeaders(t) {
    const r = t.fileExtraDownloadHeaders;
    if (r != null) {
      const n = this.requestHeaders;
      return n == null ? r : {
        ...r,
        ...n
      };
    }
    return this.computeFinalHeaders({ accept: "*/*" });
  }
  async getOrCreateStagingUserId() {
    const t = He.join(this.app.userDataPath, ".updaterId");
    try {
      const n = await (0, je.readFile)(t, "utf-8");
      if (Ce.UUID.check(n))
        return n;
      this._logger.warn(`Staging user id file exists, but content was invalid: ${n}`);
    } catch (n) {
      n.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${n}`);
    }
    const r = Ce.UUID.v5((0, z_.randomBytes)(4096), Ce.UUID.OID);
    this._logger.info(`Generated new staging user ID: ${r}`);
    try {
      await (0, je.outputFile)(t, r);
    } catch (n) {
      this._logger.warn(`Couldn't write out staging user ID: ${n}`);
    }
    return r;
  }
  /** @internal */
  get isAddNoCacheQuery() {
    const t = this.requestHeaders;
    if (t == null)
      return !0;
    for (const r of Object.keys(t)) {
      const n = r.toLowerCase();
      if (n === "authorization" || n === "private-token")
        return !1;
    }
    return !0;
  }
  async getOrCreateDownloadHelper() {
    let t = this.downloadedUpdateHelper;
    if (t == null) {
      const r = (await this.configOnDisk.value).updaterCacheDirName, n = this._logger;
      r == null && n.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
      const i = He.join(this.app.baseCachePath, r || this.app.name);
      n.debug != null && n.debug(`updater cache dir: ${i}`), t = new il.DownloadedUpdateHelper(i), this.downloadedUpdateHelper = t;
    }
    return t;
  }
  async executeDownload(t) {
    const r = t.fileInfo, n = {
      headers: t.downloadUpdateOptions.requestHeaders,
      cancellationToken: t.downloadUpdateOptions.cancellationToken,
      sha2: r.info.sha2,
      sha512: r.info.sha512
    };
    this.listenerCount(Yt.DOWNLOAD_PROGRESS) > 0 && (n.onProgress = (A) => this.emit(Yt.DOWNLOAD_PROGRESS, A));
    const i = t.downloadUpdateOptions.updateInfoAndProvider.info, o = i.version, a = r.packageInfo;
    function s() {
      const A = decodeURIComponent(t.fileInfo.url.pathname);
      return A.toLowerCase().endsWith(`.${t.fileExtension.toLowerCase()}`) ? He.basename(A) : t.fileInfo.info.url;
    }
    const l = await this.getOrCreateDownloadHelper(), p = l.cacheDirForPendingUpdate;
    await (0, je.mkdir)(p, { recursive: !0 });
    const c = s();
    let f = He.join(p, c);
    const d = a == null ? null : He.join(p, `package-${o}${He.extname(a.path) || ".7z"}`), g = async (A) => {
      await l.setDownloadedFile(f, d, i, r, c, A), await t.done({
        ...i,
        downloadedFile: f
      });
      const D = He.join(p, "current.blockmap");
      return await (0, je.pathExists)(D) && await (0, je.copyFile)(D, He.join(l.cacheDir, "current.blockmap")), d == null ? [f] : [f, d];
    }, v = this._logger, y = await l.validateDownloadedPath(f, i, r, v);
    if (y != null)
      return f = y, await g(!1);
    const T = async () => (await l.clear().catch(() => {
    }), await (0, je.unlink)(f).catch(() => {
    })), C = await (0, il.createTempUpdateFile)(`temp-${c}`, p, v);
    try {
      await t.task(C, n, d, T), await (0, Ce.retry)(() => (0, je.rename)(C, f), {
        retries: 60,
        interval: 500,
        shouldRetry: (A) => A instanceof Error && /^EBUSY:/.test(A.message) ? !0 : (v.warn(`Cannot rename temp file to final file: ${A.message || A.stack}`), !1)
      });
    } catch (A) {
      throw await T(), A instanceof Ce.CancellationError && (v.info("cancelled"), this.emit("update-cancelled", i)), A;
    }
    return v.info(`New version ${o} has been downloaded to ${f}`), await g(!0);
  }
  async differentialDownloadInstaller(t, r, n, i, o) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
        return !0;
      const a = r.updateInfoAndProvider.provider, s = await a.getBlockMapFiles(t.url, this.app.version, r.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
      this._logger.info(`Download block maps (old: "${s[0]}", new: ${s[1]})`);
      const l = async (v) => {
        const y = await this.httpExecutor.downloadToBuffer(v, {
          headers: r.requestHeaders,
          cancellationToken: r.cancellationToken
        });
        if (y == null || y.length === 0)
          throw new Error(`Blockmap "${v.href}" is empty`);
        try {
          return JSON.parse((0, io.gunzipSync)(y).toString());
        } catch (T) {
          throw new Error(`Cannot parse blockmap "${v.href}", error: ${T}`);
        }
      }, p = {
        newUrl: t.url,
        oldFile: He.join(this.downloadedUpdateHelper.cacheDir, o),
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: a.isUseMultipleRangeRequest,
        requestHeaders: r.requestHeaders,
        cancellationToken: r.cancellationToken
      };
      this.listenerCount(Yt.DOWNLOAD_PROGRESS) > 0 && (p.onProgress = (v) => this.emit(Yt.DOWNLOAD_PROGRESS, v));
      const c = async (v, y) => {
        const T = He.join(y, "current.blockmap");
        await (0, je.outputFile)(T, (0, io.gzipSync)(JSON.stringify(v)));
      }, f = async (v) => {
        const y = He.join(v, "current.blockmap");
        try {
          if (await (0, je.pathExists)(y))
            return JSON.parse((0, io.gunzipSync)(await (0, je.readFile)(y)).toString());
        } catch (T) {
          this._logger.warn(`Cannot parse blockmap "${y}", error: ${T}`);
        }
        return null;
      }, d = await l(s[1]);
      await c(d, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
      let g = await f(this.downloadedUpdateHelper.cacheDir);
      return g == null && (g = await l(s[0])), await new ew.GenericDifferentialDownloader(t.info, this.httpExecutor, p).download(g, d), !1;
    } catch (a) {
      if (this._logger.error(`Cannot download differentially, fallback to full download: ${a.stack || a}`), this._testOnlyOptions != null)
        throw a;
      return !0;
    }
  }
}
gt.AppUpdater = na;
function tw(e) {
  const t = (0, Pt.prerelease)(e);
  return t != null && t.length > 0;
}
class xu {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(t) {
  }
}
gt.NoOpLogger = xu;
Object.defineProperty(jt, "__esModule", { value: !0 });
jt.BaseUpdater = void 0;
const al = Kn, rw = gt;
class nw extends rw.AppUpdater {
  constructor(t, r) {
    super(t, r), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
  }
  quitAndInstall(t = !1, r = !1) {
    this._logger.info("Install on explicit quitAndInstall"), this.install(t, t ? r : this.autoRunAppAfterInstall) ? setImmediate(() => {
      Ut.autoUpdater.emit("before-quit-for-update"), this.app.quit();
    }) : this.quitAndInstallCalled = !1;
  }
  executeDownload(t) {
    return super.executeDownload({
      ...t,
      done: (r) => (this.dispatchUpdateDownloaded(r), this.addQuitHandler(), Promise.resolve())
    });
  }
  get installerPath() {
    return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
  }
  // must be sync (because quit even handler is not async)
  install(t = !1, r = !1) {
    if (this.quitAndInstallCalled)
      return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
    const n = this.downloadedUpdateHelper, i = this.installerPath, o = n == null ? null : n.downloadedFileInfo;
    if (i == null || o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    this.quitAndInstallCalled = !0;
    try {
      return this._logger.info(`Install: isSilent: ${t}, isForceRunAfter: ${r}`), this.doInstall({
        isSilent: t,
        isForceRunAfter: r,
        isAdminRightsRequired: o.isAdminRightsRequired
      });
    } catch (a) {
      return this.dispatchError(a), !1;
    }
  }
  addQuitHandler() {
    this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((t) => {
      if (this.quitAndInstallCalled) {
        this._logger.info("Update installer has already been triggered. Quitting application.");
        return;
      }
      if (!this.autoInstallOnAppQuit) {
        this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
        return;
      }
      if (t !== 0) {
        this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${t}`);
        return;
      }
      this._logger.info("Auto install update on quit"), this.install(!0, !1);
    }));
  }
  spawnSyncLog(t, r = [], n = {}) {
    this._logger.info(`Executing: ${t} with args: ${r}`);
    const i = (0, al.spawnSync)(t, r, {
      env: { ...process.env, ...n },
      encoding: "utf-8",
      shell: !0
    }), { error: o, status: a, stdout: s, stderr: l } = i;
    if (o != null)
      throw this._logger.error(l), o;
    if (a != null && a !== 0)
      throw this._logger.error(l), new Error(`Command ${t} exited with code ${a}`);
    return s.trim();
  }
  /**
   * This handles both node 8 and node 10 way of emitting error when spawning a process
   *   - node 8: Throws the error
   *   - node 10: Emit the error(Need to listen with on)
   */
  // https://github.com/electron-userland/electron-builder/issues/1129
  // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
  async spawnLog(t, r = [], n = void 0, i = "ignore") {
    return this._logger.info(`Executing: ${t} with args: ${r}`), new Promise((o, a) => {
      try {
        const s = { stdio: i, env: n, detached: !0 }, l = (0, al.spawn)(t, r, s);
        l.on("error", (p) => {
          a(p);
        }), l.unref(), l.pid !== void 0 && o(!0);
      } catch (s) {
        a(s);
      }
    });
  }
}
jt.BaseUpdater = nw;
var kr = {}, rn = {};
Object.defineProperty(rn, "__esModule", { value: !0 });
rn.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
const zt = Tt, iw = tn, ow = Il;
class aw extends iw.DifferentialDownloader {
  async download() {
    const t = this.blockAwareFileInfo, r = t.size, n = r - (t.blockMapSize + 4);
    this.fileMetadataBuffer = await this.readRemoteBytes(n, r - 1);
    const i = Uu(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
    await this.doDownload(await sw(this.options.oldFile), i);
  }
}
rn.FileWithEmbeddedBlockMapDifferentialDownloader = aw;
function Uu(e) {
  return JSON.parse((0, ow.inflateRawSync)(e).toString());
}
async function sw(e) {
  const t = await (0, zt.open)(e, "r");
  try {
    const r = (await (0, zt.fstat)(t)).size, n = Buffer.allocUnsafe(4);
    await (0, zt.read)(t, n, 0, n.length, r - n.length);
    const i = Buffer.allocUnsafe(n.readUInt32BE(0));
    return await (0, zt.read)(t, i, 0, i.length, r - n.length - i.length), await (0, zt.close)(t), Uu(i);
  } catch (r) {
    throw await (0, zt.close)(t), r;
  }
}
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.AppImageUpdater = void 0;
const sl = fe, ll = Kn, lw = Tt, cw = it, wr = te, uw = jt, fw = rn, dw = le, cl = At;
class hw extends uw.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  isUpdaterActive() {
    return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, dw.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "AppImage",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        const a = process.env.APPIMAGE;
        if (a == null)
          throw (0, sl.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
        (t.disableDifferentialDownload || await this.downloadDifferential(n, a, i, r, t)) && await this.httpExecutor.download(n.url, i, o), await (0, lw.chmod)(i, 493);
      }
    });
  }
  async downloadDifferential(t, r, n, i, o) {
    try {
      const a = {
        newUrl: t.url,
        oldFile: r,
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        requestHeaders: o.requestHeaders,
        cancellationToken: o.cancellationToken
      };
      return this.listenerCount(cl.DOWNLOAD_PROGRESS) > 0 && (a.onProgress = (s) => this.emit(cl.DOWNLOAD_PROGRESS, s)), await new fw.FileWithEmbeddedBlockMapDifferentialDownloader(t.info, this.httpExecutor, a).download(), !1;
    } catch (a) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${a.stack || a}`), process.platform === "linux";
    }
  }
  doInstall(t) {
    const r = process.env.APPIMAGE;
    if (r == null)
      throw (0, sl.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    (0, cw.unlinkSync)(r);
    let n;
    const i = wr.basename(r), o = this.installerPath;
    if (o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    wr.basename(o) === i || !/\d+\.\d+\.\d+/.test(i) ? n = r : n = wr.join(wr.dirname(r), wr.basename(o)), (0, ll.execFileSync)("mv", ["-f", o, n]), n !== r && this.emit("appimage-filename-updated", n);
    const a = {
      ...process.env,
      APPIMAGE_SILENT_INSTALL: "true"
    };
    return t.isForceRunAfter ? this.spawnLog(n, [], a) : (a.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, ll.execFileSync)(n, [], { env: a })), !0;
  }
}
kr.AppImageUpdater = hw;
var Mr = {}, dr = {};
Object.defineProperty(dr, "__esModule", { value: !0 });
dr.LinuxUpdater = void 0;
const pw = jt;
class mw extends pw.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /**
   * Returns true if the current process is running as root.
   */
  isRunningAsRoot() {
    var t;
    return ((t = process.getuid) === null || t === void 0 ? void 0 : t.call(process)) === 0;
  }
  /**
   * Sanitizies the installer path for using with command line tools.
   */
  get installerPath() {
    var t, r;
    return (r = (t = super.installerPath) === null || t === void 0 ? void 0 : t.replace(/\\/g, "\\\\").replace(/ /g, "\\ ")) !== null && r !== void 0 ? r : null;
  }
  runCommandWithSudoIfNeeded(t) {
    if (this.isRunningAsRoot())
      return this._logger.info("Running as root, no need to use sudo"), this.spawnSyncLog(t[0], t.slice(1));
    const { name: r } = this.app, n = `"${r} would like to update"`, i = this.sudoWithArgs(n);
    this._logger.info(`Running as non-root user, using sudo to install: ${i}`);
    let o = '"';
    return (/pkexec/i.test(i[0]) || i[0] === "sudo") && (o = ""), this.spawnSyncLog(i[0], [...i.length > 1 ? i.slice(1) : [], `${o}/bin/bash`, "-c", `'${t.join(" ")}'${o}`]);
  }
  sudoWithArgs(t) {
    const r = this.determineSudoCommand(), n = [r];
    return /kdesudo/i.test(r) ? (n.push("--comment", t), n.push("-c")) : /gksudo/i.test(r) ? n.push("--message", t) : /pkexec/i.test(r) && n.push("--disable-internal-agent"), n;
  }
  hasCommand(t) {
    try {
      return this.spawnSyncLog("command", ["-v", t]), !0;
    } catch {
      return !1;
    }
  }
  determineSudoCommand() {
    const t = ["gksudo", "kdesudo", "pkexec", "beesu"];
    for (const r of t)
      if (this.hasCommand(r))
        return r;
    return "sudo";
  }
  /**
   * Detects the package manager to use based on the available commands.
   * Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
   * If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
   * Otherwise, it checks for the presence of the specified package manager commands in the order provided.
   * @param pms - An array of package manager commands to check for, in priority order.
   * @returns The detected package manager command or "unknown" if none are found.
   */
  detectPackageManager(t) {
    var r;
    const n = (r = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || r === void 0 ? void 0 : r.trim();
    if (n)
      return n;
    for (const i of t)
      if (this.hasCommand(i))
        return i;
    return this._logger.warn(`No package manager found in the list: ${t.join(", ")}. Defaulting to the first one: ${t[0]}`), t[0];
  }
}
dr.LinuxUpdater = mw;
Object.defineProperty(Mr, "__esModule", { value: !0 });
Mr.DebUpdater = void 0;
const gw = le, ul = At, Ew = dr;
class ia extends Ew.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, gw.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
    return this.executeDownload({
      fileExtension: "deb",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(ul.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(ul.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
      return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
    const n = ["dpkg", "apt"], i = this.detectPackageManager(n);
    try {
      ia.installWithCommandRunner(i, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n, i) {
    var o;
    if (t === "dpkg")
      try {
        n(["dpkg", "-i", r]);
      } catch (a) {
        i.warn((o = a.message) !== null && o !== void 0 ? o : a), i.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), n(["apt-get", "install", "-f", "-y"]);
      }
    else if (t === "apt")
      i.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), n([
        "apt",
        "install",
        "-y",
        "--allow-unauthenticated",
        // needed for unsigned .debs
        "--allow-downgrades",
        // allow lower version installs
        "--allow-change-held-packages",
        r
      ]);
    else
      throw new Error(`Package manager ${t} not supported`);
  }
}
Mr.DebUpdater = ia;
var Br = {};
Object.defineProperty(Br, "__esModule", { value: !0 });
Br.PacmanUpdater = void 0;
const fl = At, yw = le, vw = dr;
class oa extends vw.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, yw.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
    return this.executeDownload({
      fileExtension: "pacman",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(fl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(fl.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    try {
      oa.installWithCommandRunner(r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (n) {
      return this.dispatchError(n), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n) {
    var i;
    try {
      r(["pacman", "-U", "--noconfirm", t]);
    } catch (o) {
      n.warn((i = o.message) !== null && i !== void 0 ? i : o), n.warn("pacman installation failed, attempting to update package database and retry");
      try {
        r(["pacman", "-Sy", "--noconfirm"]), r(["pacman", "-U", "--noconfirm", t]);
      } catch (a) {
        throw n.error("Retry after pacman -Sy failed"), a;
      }
    }
  }
}
Br.PacmanUpdater = oa;
var jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
jr.RpmUpdater = void 0;
const dl = At, _w = le, ww = dr;
class aa extends ww.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, _w.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "rpm",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(dl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(dl.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const n = ["zypper", "dnf", "yum", "rpm"], i = this.detectPackageManager(n);
    try {
      aa.installWithCommandRunner(i, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n, i) {
    if (t === "zypper")
      return n(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", r]);
    if (t === "dnf")
      return n(["dnf", "install", "--nogpgcheck", "-y", r]);
    if (t === "yum")
      return n(["yum", "install", "--nogpgcheck", "-y", r]);
    if (t === "rpm")
      return i.warn("Installing with rpm only (no dependency resolution)."), n(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", r]);
    throw new Error(`Package manager ${t} not supported`);
  }
}
jr.RpmUpdater = aa;
var Hr = {};
Object.defineProperty(Hr, "__esModule", { value: !0 });
Hr.MacUpdater = void 0;
const hl = fe, oo = Tt, Tw = it, pl = te, Aw = Kf, Cw = gt, Sw = le, ml = Kn, gl = sr;
class Iw extends Cw.AppUpdater {
  constructor(t, r) {
    super(t, r), this.nativeUpdater = Ut.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (n) => {
      this._logger.warn(n), this.emit("error", n);
    }), this.nativeUpdater.on("update-downloaded", () => {
      this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
    });
  }
  debug(t) {
    this._logger.debug != null && this._logger.debug(t);
  }
  closeServerIfExists() {
    this.server && (this.debug("Closing proxy server"), this.server.close((t) => {
      t && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
    }));
  }
  async doDownloadUpdate(t) {
    let r = t.updateInfoAndProvider.provider.resolveFiles(t.updateInfoAndProvider.info);
    const n = this._logger, i = "sysctl.proc_translated";
    let o = !1;
    try {
      this.debug("Checking for macOS Rosetta environment"), o = (0, ml.execFileSync)("sysctl", [i], { encoding: "utf8" }).includes(`${i}: 1`), n.info(`Checked for macOS Rosetta environment (isRosetta=${o})`);
    } catch (f) {
      n.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${f}`);
    }
    let a = !1;
    try {
      this.debug("Checking for arm64 in uname");
      const d = (0, ml.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
      n.info(`Checked 'uname -a': arm64=${d}`), a = a || d;
    } catch (f) {
      n.warn(`uname shell command to check for arm64 failed: ${f}`);
    }
    a = a || process.arch === "arm64" || o;
    const s = (f) => {
      var d;
      return f.url.pathname.includes("arm64") || ((d = f.info.url) === null || d === void 0 ? void 0 : d.includes("arm64"));
    };
    a && r.some(s) ? r = r.filter((f) => a === s(f)) : r = r.filter((f) => !s(f));
    const l = (0, Sw.findFile)(r, "zip", ["pkg", "dmg"]);
    if (l == null)
      throw (0, hl.newError)(`ZIP file not provided: ${(0, hl.safeStringifyJson)(r)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    const p = t.updateInfoAndProvider.provider, c = "update.zip";
    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: l,
      downloadUpdateOptions: t,
      task: async (f, d) => {
        const g = pl.join(this.downloadedUpdateHelper.cacheDir, c), v = () => (0, oo.pathExistsSync)(g) ? !t.disableDifferentialDownload : (n.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
        let y = !0;
        v() && (y = await this.differentialDownloadInstaller(l, t, f, p, c)), y && await this.httpExecutor.download(l.url, f, d);
      },
      done: async (f) => {
        if (!t.disableDifferentialDownload)
          try {
            const d = pl.join(this.downloadedUpdateHelper.cacheDir, c);
            await (0, oo.copyFile)(f.downloadedFile, d);
          } catch (d) {
            this._logger.warn(`Unable to copy file for caching for future differential downloads: ${d.message}`);
          }
        return this.updateDownloaded(l, f);
      }
    });
  }
  async updateDownloaded(t, r) {
    var n;
    const i = r.downloadedFile, o = (n = t.info.size) !== null && n !== void 0 ? n : (await (0, oo.stat)(i)).size, a = this._logger, s = `fileToProxy=${t.url.href}`;
    this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${s})`), this.server = (0, Aw.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${s})`), this.server.on("close", () => {
      a.info(`Proxy server for native Squirrel.Mac is closed (${s})`);
    });
    const l = (p) => {
      const c = p.address();
      return typeof c == "string" ? c : `http://127.0.0.1:${c == null ? void 0 : c.port}`;
    };
    return await new Promise((p, c) => {
      const f = (0, gl.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), d = Buffer.from(`autoupdater:${f}`, "ascii"), g = `/${(0, gl.randomBytes)(64).toString("hex")}.zip`;
      this.server.on("request", (v, y) => {
        const T = v.url;
        if (a.info(`${T} requested`), T === "/") {
          if (!v.headers.authorization || v.headers.authorization.indexOf("Basic ") === -1) {
            y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), a.warn("No authenthication info");
            return;
          }
          const D = v.headers.authorization.split(" ")[1], L = Buffer.from(D, "base64").toString("ascii"), [ee, ae] = L.split(":");
          if (ee !== "autoupdater" || ae !== f) {
            y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), a.warn("Invalid authenthication credentials");
            return;
          }
          const W = Buffer.from(`{ "url": "${l(this.server)}${g}" }`);
          y.writeHead(200, { "Content-Type": "application/json", "Content-Length": W.length }), y.end(W);
          return;
        }
        if (!T.startsWith(g)) {
          a.warn(`${T} requested, but not supported`), y.writeHead(404), y.end();
          return;
        }
        a.info(`${g} requested by Squirrel.Mac, pipe ${i}`);
        let C = !1;
        y.on("finish", () => {
          C || (this.nativeUpdater.removeListener("error", c), p([]));
        });
        const A = (0, Tw.createReadStream)(i);
        A.on("error", (D) => {
          try {
            y.end();
          } catch (L) {
            a.warn(`cannot end response: ${L}`);
          }
          C = !0, this.nativeUpdater.removeListener("error", c), c(new Error(`Cannot pipe "${i}": ${D}`));
        }), y.writeHead(200, {
          "Content-Type": "application/zip",
          "Content-Length": o
        }), A.pipe(y);
      }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${s})`), this.server.listen(0, "127.0.0.1", () => {
        this.debug(`Proxy server for native Squirrel.Mac is listening (address=${l(this.server)}, ${s})`), this.nativeUpdater.setFeedURL({
          url: l(this.server),
          headers: {
            "Cache-Control": "no-cache",
            Authorization: `Basic ${d.toString("base64")}`
          }
        }), this.dispatchUpdateDownloaded(r), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", c), this.nativeUpdater.checkForUpdates()) : p([]);
      });
    });
  }
  handleUpdateDownloaded() {
    this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
  }
  quitAndInstall() {
    this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
  }
}
Hr.MacUpdater = Iw;
var Gr = {}, sa = {};
Object.defineProperty(sa, "__esModule", { value: !0 });
sa.verifySignature = Ow;
const El = fe, ku = Kn, bw = qr, yl = te;
function Mu(e, t) {
  return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", e], {
    shell: !0,
    timeout: t
  }];
}
function Ow(e, t, r) {
  return new Promise((n, i) => {
    const o = t.replace(/'/g, "''");
    r.info(`Verifying signature ${o}`), (0, ku.execFile)(...Mu(`"Get-AuthenticodeSignature -LiteralPath '${o}' | ConvertTo-Json -Compress"`, 20 * 1e3), (a, s, l) => {
      var p;
      try {
        if (a != null || l) {
          ao(r, a, l, i), n(null);
          return;
        }
        const c = Rw(s);
        if (c.Status === 0) {
          try {
            const v = yl.normalize(c.Path), y = yl.normalize(t);
            if (r.info(`LiteralPath: ${v}. Update Path: ${y}`), v !== y) {
              ao(r, new Error(`LiteralPath of ${v} is different than ${y}`), l, i), n(null);
              return;
            }
          } catch (v) {
            r.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(p = v.message) !== null && p !== void 0 ? p : v.stack}`);
          }
          const d = (0, El.parseDn)(c.SignerCertificate.Subject);
          let g = !1;
          for (const v of e) {
            const y = (0, El.parseDn)(v);
            if (y.size ? g = Array.from(y.keys()).every((C) => y.get(C) === d.get(C)) : v === d.get("CN") && (r.warn(`Signature validated using only CN ${v}. Please add your full Distinguished Name (DN) to publisherNames configuration`), g = !0), g) {
              n(null);
              return;
            }
          }
        }
        const f = `publisherNames: ${e.join(" | ")}, raw info: ` + JSON.stringify(c, (d, g) => d === "RawData" ? void 0 : g, 2);
        r.warn(`Sign verification failed, installer signed with incorrect certificate: ${f}`), n(f);
      } catch (c) {
        ao(r, c, null, i), n(null);
        return;
      }
    });
  });
}
function Rw(e) {
  const t = JSON.parse(e);
  delete t.PrivateKey, delete t.IsOSBinary, delete t.SignatureType;
  const r = t.SignerCertificate;
  return r != null && (delete r.Archived, delete r.Extensions, delete r.Handle, delete r.HasPrivateKey, delete r.SubjectName), t;
}
function ao(e, t, r, n) {
  if (Nw()) {
    e.warn(`Cannot execute Get-AuthenticodeSignature: ${t || r}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  try {
    (0, ku.execFileSync)(...Mu("ConvertTo-Json test", 10 * 1e3));
  } catch (i) {
    e.warn(`Cannot execute ConvertTo-Json: ${i.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  t != null && n(t), r && n(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${r}. Failing signature validation due to unknown stderr.`));
}
function Nw() {
  const e = bw.release();
  return e.startsWith("6.") && !e.startsWith("6.3");
}
Object.defineProperty(Gr, "__esModule", { value: !0 });
Gr.NsisUpdater = void 0;
const Pn = fe, vl = te, Pw = jt, Dw = rn, _l = At, $w = le, Fw = Tt, Lw = sa, wl = wt;
class xw extends Pw.BaseUpdater {
  constructor(t, r) {
    super(t, r), this._verifyUpdateCodeSignature = (n, i) => (0, Lw.verifySignature)(n, i, this._logger);
  }
  /**
   * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
   * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
   */
  get verifyUpdateCodeSignature() {
    return this._verifyUpdateCodeSignature;
  }
  set verifyUpdateCodeSignature(t) {
    t && (this._verifyUpdateCodeSignature = t);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, $w.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "exe");
    return this.executeDownload({
      fileExtension: "exe",
      downloadUpdateOptions: t,
      fileInfo: n,
      task: async (i, o, a, s) => {
        const l = n.packageInfo, p = l != null && a != null;
        if (p && t.disableWebInstaller)
          throw (0, Pn.newError)(`Unable to download new version ${t.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
        !p && !t.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (p || t.disableDifferentialDownload || await this.differentialDownloadInstaller(n, t, i, r, Pn.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(n.url, i, o);
        const c = await this.verifySignature(i);
        if (c != null)
          throw await s(), (0, Pn.newError)(`New version ${t.updateInfoAndProvider.info.version} is not signed by the application owner: ${c}`, "ERR_UPDATER_INVALID_SIGNATURE");
        if (p && await this.differentialDownloadWebPackage(t, l, a, r))
          try {
            await this.httpExecutor.download(new wl.URL(l.path), a, {
              headers: t.requestHeaders,
              cancellationToken: t.cancellationToken,
              sha512: l.sha512
            });
          } catch (f) {
            try {
              await (0, Fw.unlink)(a);
            } catch {
            }
            throw f;
          }
      }
    });
  }
  // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
  // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
  // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
  async verifySignature(t) {
    let r;
    try {
      if (r = (await this.configOnDisk.value).publisherName, r == null)
        return null;
    } catch (n) {
      if (n.code === "ENOENT")
        return null;
      throw n;
    }
    return await this._verifyUpdateCodeSignature(Array.isArray(r) ? r : [r], t);
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const n = ["--updated"];
    t.isSilent && n.push("/S"), t.isForceRunAfter && n.push("--force-run"), this.installDirectory && n.push(`/D=${this.installDirectory}`);
    const i = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
    i != null && n.push(`--package-file=${i}`);
    const o = () => {
      this.spawnLog(vl.join(process.resourcesPath, "elevate.exe"), [r].concat(n)).catch((a) => this.dispatchError(a));
    };
    return t.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), o(), !0) : (this.spawnLog(r, n).catch((a) => {
      const s = a.code;
      this._logger.info(`Cannot run installer: error code: ${s}, error message: "${a.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), s === "UNKNOWN" || s === "EACCES" ? o() : s === "ENOENT" ? Ut.shell.openPath(r).catch((l) => this.dispatchError(l)) : this.dispatchError(a);
    }), !0);
  }
  async differentialDownloadWebPackage(t, r, n, i) {
    if (r.blockMapSize == null)
      return !0;
    try {
      const o = {
        newUrl: new wl.URL(r.path),
        oldFile: vl.join(this.downloadedUpdateHelper.cacheDir, Pn.CURRENT_APP_PACKAGE_FILE_NAME),
        logger: this._logger,
        newFile: n,
        requestHeaders: this.requestHeaders,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        cancellationToken: t.cancellationToken
      };
      this.listenerCount(_l.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(_l.DOWNLOAD_PROGRESS, a)), await new Dw.FileWithEmbeddedBlockMapDifferentialDownloader(r, this.httpExecutor, o).download();
    } catch (o) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${o.stack || o}`), process.platform === "win32";
    }
    return !1;
  }
}
Gr.NsisUpdater = xw;
(function(e) {
  var t = Se && Se.__createBinding || (Object.create ? function(T, C, A, D) {
    D === void 0 && (D = A);
    var L = Object.getOwnPropertyDescriptor(C, A);
    (!L || ("get" in L ? !C.__esModule : L.writable || L.configurable)) && (L = { enumerable: !0, get: function() {
      return C[A];
    } }), Object.defineProperty(T, D, L);
  } : function(T, C, A, D) {
    D === void 0 && (D = A), T[D] = C[A];
  }), r = Se && Se.__exportStar || function(T, C) {
    for (var A in T) A !== "default" && !Object.prototype.hasOwnProperty.call(C, A) && t(C, T, A);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
  const n = Tt, i = te;
  var o = jt;
  Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
    return o.BaseUpdater;
  } });
  var a = gt;
  Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
    return a.AppUpdater;
  } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
    return a.NoOpLogger;
  } });
  var s = le;
  Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
    return s.Provider;
  } });
  var l = kr;
  Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
    return l.AppImageUpdater;
  } });
  var p = Mr;
  Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
    return p.DebUpdater;
  } });
  var c = Br;
  Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
    return c.PacmanUpdater;
  } });
  var f = jr;
  Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
    return f.RpmUpdater;
  } });
  var d = Hr;
  Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
    return d.MacUpdater;
  } });
  var g = Gr;
  Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
    return g.NsisUpdater;
  } }), r(At, e);
  let v;
  function y() {
    if (process.platform === "win32")
      v = new Gr.NsisUpdater();
    else if (process.platform === "darwin")
      v = new Hr.MacUpdater();
    else {
      v = new kr.AppImageUpdater();
      try {
        const T = i.join(process.resourcesPath, "package-type");
        if (!(0, n.existsSync)(T))
          return v;
        switch ((0, n.readFileSync)(T).toString().trim()) {
          case "deb":
            v = new Mr.DebUpdater();
            break;
          case "rpm":
            v = new jr.RpmUpdater();
            break;
          case "pacman":
            v = new Br.PacmanUpdater();
            break;
          default:
            break;
        }
      } catch (T) {
        console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", T.message);
      }
    }
    return v;
  }
  Object.defineProperty(e, "autoUpdater", {
    enumerable: !0,
    get: () => v || y()
  });
})(ke);
const Bu = rt.dirname(Yf(import.meta.url)), ju = rt.join(Bu, "..");
{
  const e = process.env.NODE_ENV || (process.env.VITE_DEV_SERVER_URL ? "development" : "production"), t = [`.env.${e}.local`, `.env.${e}`, ".env.local", ".env"];
  for (const r of t) {
    const n = rt.join(ju, r);
    zf.existsSync(n) && pd.config({ path: n, override: !0 });
  }
}
process.env.APP_ROOT = ju;
const So = process.env.VITE_DEV_SERVER_URL, tT = rt.join(process.env.APP_ROOT, "dist-electron"), Hu = rt.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = So ? rt.join(process.env.APP_ROOT, "public") : Hu;
let J;
function Gu() {
  J = new Tl({
    title: process.env.APP_NAME || "Stocks Only",
    icon: rt.join(process.env.VITE_PUBLIC, "app-icon.png"),
    width: 1100,
    height: 750,
    minWidth: 1100,
    minHeight: 750,
    center: !0,
    webPreferences: {
      preload: rt.join(Bu, "preload.mjs")
    }
  }), J.webContents.on("did-finish-load", () => {
    J == null || J.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), So ? J.loadURL(So) : J.loadFile(rt.join(Hu, "index.html"));
}
xn.on("window-all-closed", () => {
  process.platform !== "darwin" && (xn.quit(), J = null);
});
xn.on("activate", () => {
  Tl.getAllWindows().length === 0 && Gu();
});
xn.whenReady().then(() => {
  pn.on("env:getSync", (t) => {
    t.returnValue = {
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
  }), ke.autoUpdater.autoDownload = !1;
  const e = process.env.GH_TOKEN;
  e && ke.autoUpdater.addAuthHeader(`Bearer ${e}`), ke.autoUpdater.on("checking-for-update", () => {
    J == null || J.webContents.send("updater:event", { type: "checking-for-update" });
  }), ke.autoUpdater.on("update-available", (t) => {
    J == null || J.webContents.send("updater:event", { type: "update-available", info: t });
  }), ke.autoUpdater.on("update-not-available", (t) => {
    J == null || J.webContents.send("updater:event", {
      type: "update-not-available",
      info: t
    });
  }), ke.autoUpdater.on("error", (t) => {
    J == null || J.webContents.send("updater:event", {
      type: "error",
      error: (t == null ? void 0 : t.message) || "Update error"
    });
  }), ke.autoUpdater.on("download-progress", (t) => {
    J == null || J.webContents.send("updater:event", {
      type: "download-progress",
      progress: t
    });
  }), ke.autoUpdater.on("update-downloaded", (t) => {
    J == null || J.webContents.send("updater:event", { type: "update-downloaded", info: t });
  }), pn.handle("updater:check", () => ke.autoUpdater.checkForUpdates()), pn.handle("updater:download", () => ke.autoUpdater.downloadUpdate()), pn.handle("updater:quitAndInstall", () => ke.autoUpdater.quitAndInstall()), Gu();
});
export {
  tT as MAIN_DIST,
  Hu as RENDERER_DIST,
  So as VITE_DEV_SERVER_URL
};
