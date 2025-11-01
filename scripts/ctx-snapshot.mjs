// scripts/ctx-snapshot.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const snapshotDir = path.join(root, "docs/ai-context/snapshots");
fs.mkdirSync(snapshotDir, { recursive: true });

const now = new Date();
const stamp = now.toISOString().replace(/[:.]/g, "-");
const outPath = path.join(snapshotDir, `snapshot-${stamp}.md`);

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const nextVer =
  (pkg.dependencies && pkg.dependencies.next) ||
  (pkg.devDependencies && pkg.devDependencies.next) ||
  "unknown";

const nodeVer = process.version;
let branch = "unknown";
try { branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim(); } catch {}

// list routes under /app (page.tsx|page.jsx|route.ts|route.tsx)
const appDir = path.join(root, "app");
const routes = [];
function walk(dir, segs = []) {
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p, segs.concat(e.name));
    } else if (/^(page\.(t|j)sx?)$/.test(e.name)) {
      let r = "/" + segs.join("/");
      if (r === "/page") r = "/";
      routes.push(r);
    } else if (/^route\.(t|j)s$/.test(e.name)) {
      let r = "/" + segs.join("/");
      routes.push(r + "  (API)");
    }
  }
}
if (fs.existsSync(appDir)) walk(appDir);

const hasSharpenAPI = fs.existsSync(path.join(appDir, "api/sharpen/route.ts"));
const hasDocs = ["system-overview.md", "acceptance-criteria.md", "ai-guardrails.md"]
  .map(f => fs.existsSync(path.join(root, "docs/ai-context", f)) ? `✅ ${f}` : `❌ ${f}`)
  .join("\n");

// env vars (mask secrets)
function mask(v){ return v ? v.replace(/.(?=.{4})/g, "*") : ""; }
const env = {
  REPLICATE_API_TOKEN: mask(process.env.REPLICATE_API_TOKEN || ""),
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || ""
};

const md = `# Snapshot @ ${now.toISOString()}

## Stack
- Next.js: ${nextVer}
- Node: ${nodeVer}
- Branch: ${branch}
- Package Manager: ${(pkg.packageManager || "pnpm")}

## Key Files
${hasDocs}

- API /api/sharpen: ${hasSharpenAPI ? "✅ present" : "❌ missing"}

## Routes (from /app)
${routes.length ? routes.map(r => `- ${r}`).join("\n") : "- (none found)"}

## Env (masked)
- REPLICATE_API_TOKEN: ${env.REPLICATE_API_TOKEN || "❌ unset"}
- NEXT_PUBLIC_SITE_URL: ${env.NEXT_PUBLIC_SITE_URL || "❌ unset"}

`;
fs.writeFileSync(outPath, md, "utf8");
console.log(`Wrote ${outPath}`);