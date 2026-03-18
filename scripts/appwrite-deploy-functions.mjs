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
const runtime = process.env.APPWRITE_FUNCTION_RUNTIME || "node-22.0";

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
const results = [];

for (const f of manifest.functions) {
  const id = f.id;
  const entrypoint = f.entrypoint;
  const isSchedule = f.trigger === "schedule";
  const schedule = f.schedule;

  const getRes = spawnSync(
    "appwrite",
    ["functions", "get", "--function-id", id],
    { stdio: "ignore" },
  );
  if (getRes.status !== 0) {
    const args = [
      "functions",
      "create",
      "--function-id",
      id,
      "--name",
      id,
      "--runtime",
      runtime,
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
    const createRes = spawnSync("appwrite", args, { stdio: "inherit" });
    if (createRes.status !== 0) {
      results.push({ id, ok: false, step: "create" });
      continue;
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
  const url = `${endpoint.replace(/\/$/, "")}/functions/${id}/deployments`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
    },
    body: form,
  });
  if (!res.ok) {
    let errorText = "";
    try {
      errorText = await res.text();
    } catch {}
    console.error(
      `Deploy failed for ${id}: ${res.status} ${res.statusText} ${errorText || ""}`.trim(),
    );
    results.push({ id, ok: false, step: "deploy", status: res.status });
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
