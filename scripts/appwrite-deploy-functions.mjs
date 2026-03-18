import "dotenv/config";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
let manifestPath = process.env.APPWRITE_FUNCTIONS_MANIFEST
  ? path.resolve(process.cwd(), process.env.APPWRITE_FUNCTIONS_MANIFEST)
  : path.resolve(root, "appwrite/functions/functions.manifest.json");

const endpoint = process.env.APPWRITE_ENDPOINT || "http://localhost/v1";
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const execRole = process.env.APPWRITE_FUNCTION_EXECUTE_ROLE || "any";
const runtime = process.env.APPWRITE_FUNCTION_RUNTIME || "node-20.0";

function normalizeExecuteRoles(input) {
  if (!input) return ["any"];
  const allowed = new Set(["any", "users", "guests"]);
  const tokens = String(input)
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .map((t) => {
      if (t.startsWith("role:")) {
        if (t === "role:all") return "any";
        if (t === "role:users") return "users";
        if (t === "role:guests") return "guests";
        return "";
      }
      return t;
    })
    .filter((t) => allowed.has(t));
  return tokens.length ? Array.from(new Set(tokens)) : ["any"];
}

if (!projectId || !apiKey) {
  console.error("Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY");
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  const alt1 = path.resolve(
    process.cwd(),
    "appwrite/functions/functions.manifest.json",
  );
  const alt2 = path.resolve(root, "scripts/functions/functions.manifest.json");
  if (fs.existsSync(alt1)) {
    manifestPath = alt1;
  } else if (fs.existsSync(alt2)) {
    manifestPath = alt2;
  } else {
    console.error("Missing functions.manifest.json");
    console.error("Tried:", manifestPath);
    console.error("Also tried:", alt1);
    console.error("Also tried:", alt2);
    process.exit(1);
  }
}

let codeDir = process.env.APPWRITE_FUNCTIONS_DIR
  ? path.resolve(process.cwd(), process.env.APPWRITE_FUNCTIONS_DIR)
  : path.dirname(manifestPath);

const clientInit = spawnSync(
  "appwrite",
  [
    "client",
    "--endpoint",
    endpoint,
    "--self-signed",
    "true",
    "--project-id",
    projectId,
    "--key",
    apiKey,
  ],
  { stdio: "inherit" },
);
if (clientInit.status !== 0) {
  process.exit(clientInit.status || 1);
}

const projectCheck = spawnSync("appwrite", ["databases", "list"], {
  stdio: "ignore",
});
if (projectCheck.status !== 0) {
  console.error(
    "Project validation failed. Verify APPWRITE_PROJECT_ID and APPWRITE_API_KEY belong to a LOCAL project.",
  );
  console.error(
    "Tip: In Console create a project, then create an API Key with Functions/Deployments scopes.",
  );
  console.error(
    "You can also run: appwrite projects list (requires `appwrite login`) to confirm your project exists.",
  );
  process.exit(1);
}

const archivePath = path.resolve(
  root,
  `.appwrite-functions-${Date.now()}.tar.gz`,
);
const tarArgs = [
  "-czf",
  archivePath,
  // Exclude large/dev-only files to keep payload tiny for proxies with body limits
  "--exclude",
  "coverage",
  "--exclude",
  "node_modules",
  "--exclude",
  "pnpm-lock.yaml",
  "--exclude",
  "package-lock.json",
  "--exclude",
  "yarn.lock",
  "--exclude",
  "**/*.test.mjs",
  "--exclude",
  "vitest.config.ts",
  "--exclude",
  "**/*.md",
  "--exclude",
  "**/*.map",
  "-C",
  codeDir,
  ".",
];
const packRes = spawnSync("tar", tarArgs, { stdio: "ignore" });
if (packRes.status !== 0) {
  console.error("Failed to package functions directory:", codeDir);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
function getArg(name) {
  const flag = `--${name}`;
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === flag) {
      const v = process.argv[i + 1];
      if (v && !v.startsWith("--")) return v;
    }
    if (a.startsWith(flag + "=")) {
      return a.slice(flag.length + 1);
    }
  }
  return "";
}
function parseList(src) {
  return String(src || "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
const onlyArg = getArg("only") || process.env.APPWRITE_FUNCTIONS_ONLY || "";
const skipArg = getArg("skip") || process.env.APPWRITE_FUNCTIONS_SKIP || "";
const onlySet = new Set(parseList(onlyArg));
const skipSet = new Set(parseList(skipArg));
let targetFunctions = manifest.functions || [];
if (onlySet.size > 0) {
  targetFunctions = targetFunctions.filter((f) => onlySet.has(f.id));
}
if (skipSet.size > 0) {
  targetFunctions = targetFunctions.filter((f) => !skipSet.has(f.id));
}
if (!targetFunctions.length) {
  console.error("No functions selected to deploy");
  process.exit(1);
}
async function detectSupportedRuntime(preferred) {
  const url = `${endpoint.replace(/\/$/, "")}/functions/runtimes`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    const ids = (data?.runtimes || [])
      .map((r) => r.$id || r.id)
      .filter(Boolean);
    const candidates = [
      preferred,
      preferred.replace(/\.0$/, ""),
      "node-20.0",
      "node-22",
    ];
    const found = candidates.find((c) => ids.includes(c));
    return found || preferred;
  } catch {
    return preferred;
  }
}
const resolvedRuntime = await detectSupportedRuntime(runtime);
console.log(`Using runtime: ${resolvedRuntime}`);
const results = [];

for (const f of targetFunctions) {
  const id = f.id;
  const entrypoint = f.entrypoint;
  const isSchedule = f.trigger === "schedule";
  const schedule = f.schedule;

  const spawnCli = (args) =>
    spawnSync("appwrite", args, { stdio: "pipe", encoding: "utf-8" });
  const maxAttempts = Number(process.env.APPWRITE_DEPLOY_MAX_ATTEMPTS || 12);
  const baseDelayMs = Math.max(
    1000,
    Number(process.env.APPWRITE_DEPLOY_RETRY_DELAY_MS || 30000),
  );
  let exists = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = spawnCli(["functions", "get", "--function-id", id]);
    if (res.status === 0) {
      exists = true;
      break;
    }
    const out = (res.stdout || "") + (res.stderr || "");
    if (/Rate limit/i.test(out) || /429/.test(out)) {
      const backoff = Math.floor(
        baseDelayMs * 2 ** (attempt - 1) * (1 + Math.random() * 0.3),
      );
      await new Promise((r) => setTimeout(r, backoff));
      continue;
    }
    break;
  }
  if (!exists) {
    const args = [
      "functions",
      "create",
      "--function-id",
      id,
      "--name",
      id,
      "--runtime",
      resolvedRuntime,
      "--enabled",
      "true",
      "--logging",
      "true",
    ];
    const execRoles = normalizeExecuteRoles(execRole);
    for (const r of execRoles) {
      args.push("--execute", r);
    }
    if (isSchedule && schedule) {
      args.push("--schedule", schedule);
    }
    let created = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res = spawnCli(args);
      const out = (res.stdout || "") + (res.stderr || "");
      if (res.status === 0) {
        process.stdout.write(out);
        created = true;
        break;
      }
      process.stdout.write(out);
      if (/Rate limit/i.test(out) || /429/.test(out)) {
        const backoff = Math.floor(
          baseDelayMs * 2 ** (attempt - 1) * (1 + Math.random() * 0.3),
        );
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      break;
    }
    if (!created) {
      let finalExists = false;
      for (let i = 1; i <= 3; i++) {
        const res = spawnCli(["functions", "get", "--function-id", id]);
        if (res.status === 0) {
          finalExists = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 1000 * i));
      }
      if (!finalExists) {
        results.push({ id, ok: false, step: "create" });
        continue;
      }
    }
  }

  const form = new FormData();
  const buf = fs.readFileSync(archivePath);
  const file = new File([buf], "functions.tar.gz", {
    type: "application/gzip",
  });
  form.append("code", file);
  form.append("activate", "true");
  form.append("entrypoint", entrypoint || "");
  if (f.commands) {
    form.append("commands", f.commands);
  } else {
    form.append("commands", "npm install");
  }
  const url = `${endpoint.replace(/\/$/, "")}/functions/${id}/deployments`;
  let deployed = false;
  let deployStatus = 0;
  let deployErrorText = "";
  for (let attempt = 1; attempt <= maxAttempts && !deployed; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
      },
      body: form,
    });
    if (res.ok) {
      deployed = true;
      break;
    }
    deployStatus = res.status;
    try {
      deployErrorText = await res.text();
    } catch {
      deployErrorText = "";
    }
    if (res.status === 429) {
      const backoff = Math.floor(
        baseDelayMs * 2 ** (attempt - 1) * (1 + Math.random() * 0.3),
      );
      await new Promise((r) => setTimeout(r, backoff));
      continue;
    }
    break;
  }
  if (!deployed) {
    console.error(
      `Deploy failed for ${id}: ${deployStatus} ${deployErrorText || ""}`.trim(),
    );
    results.push({ id, ok: false, step: "deploy", status: deployStatus });
    continue;
  }
  results.push({ id, ok: true });
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error("Deployment finished with errors:", failed);
  process.exit(1);
}
console.log("All functions deployed successfully");
try {
  fs.unlinkSync(archivePath);
} catch {}
