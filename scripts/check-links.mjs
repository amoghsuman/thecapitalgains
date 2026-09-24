// Link audit for the home page.
//
//   node scripts/check-links.mjs                 # uses a dev server on :3000 if one answers,
//                                                # otherwise starts `next start` on :3123 (run `npm run build` first)
//   node scripts/check-links.mjs --base http://localhost:3000
//
// Fetches /, extracts every href (including the jump dock's #anchors), then:
//   - GETs every internal path and expects 200 (query strings kept, e.g. /courses?group=…)
//   - checks every #anchor against the element ids in the home HTML
//   - HEADs every external link (GET on 405) and expects < 400
//   - checks every course slug referenced under components/home (and the home
//     page) against the course slugs in Sanity
// Prints a table of failures and exits 1 if any internal link or anchor fails.
// External failures and missing courses are reported but do not fail the run.

import { spawn } from "child_process";
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@sanity/client";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(path.join(ROOT, ".env.local"));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const argBase = process.argv.indexOf("--base");
const BASE_ARG = argBase >= 0 ? process.argv[argBase + 1] : null;
const UA = "tcg-link-check/1.0";

async function alive(base) {
  try {
    const r = await fetch(base + "/", { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(5000) });
    return r.ok;
  } catch {
    return false;
  }
}

let server = null;
async function resolveBase() {
  if (BASE_ARG) return BASE_ARG.replace(/\/$/, "");
  if (await alive("http://localhost:3000")) return "http://localhost:3000";
  console.log("No server on :3000; starting `next start -p 3123` (needs a prior `npm run build`)…");
  server = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", "3123"], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "inherit"],
    shell: process.platform === "win32",
  });
  for (let i = 0; i < 60; i++) {
    if (await alive("http://localhost:3123")) return "http://localhost:3123";
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("server on :3123 did not come up");
}

function stopServer() {
  if (!server) return;
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}

// ── Extract links from the home HTML ─────────────────────────────────────────
function extractLinks(html) {
  const hrefs = new Set();
  for (const m of html.matchAll(/\shref="([^"]+)"/g)) hrefs.add(m[1].replace(/&amp;/g, "&"));
  // Client-side anchors the dock scrolls to (data attributes or hrefs) are hrefs too;
  // a jump dock built from a JS array renders them as href="#id" after SSR.
  return Array.from(hrefs);
}

// The jump dock scrolls with document.getElementById(targetId), not hrefs, so
// its targets are read from the component source.
function dockAnchors() {
  const src = readFileSync(path.join(ROOT, "components/home/FloatingJumpDock.tsx"), "utf8");
  return Array.from(src.matchAll(/targetId:\s*"([^"]+)"/g), (m) => "#" + m[1]);
}

function extractIds(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  return ids;
}

// ── Course slugs referenced in the home components ───────────────────────────
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

function referencedCourseSlugs() {
  const files = [...walk(path.join(ROOT, "components/home")), path.join(ROOT, "app/(site)/page.tsx")];
  const refs = new Map(); // slug -> Set(files)
  const add = (slug, file) => {
    if (!slug || slug.includes("$")) return;
    if (!refs.has(slug)) refs.set(slug, new Set());
    refs.get(slug).add(path.relative(ROOT, file));
  };
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/["'`]\/courses\/([a-z0-9-]+)["'`?#]/g)) add(m[1], file);
    for (const m of src.matchAll(/["'`]\/learn\/([a-z0-9-]+)\//g)) add(m[1], file);
    for (const m of src.matchAll(/(?:courseSlug|targetCourseSlug|relatedCourseSlug|FEATURED_CARD_COURSE_SLUG)\s*[:=]\s*"([a-z0-9-]+)"/g)) add(m[1], file);
  }
  return refs;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const failures = []; // { kind, target, detail }
const report = (kind, target, detail) => failures.push({ kind, target, detail });

const base = await resolveBase();
console.log(`Base: ${base}\n`);
const home = await (await fetch(base + "/", { headers: { "User-Agent": UA } })).text();
const links = extractLinks(home);
const ids = extractIds(home);
const dock = dockAnchors();

const internal = [];
const anchors = [];
const external = [];
for (const href of [...links, ...dock]) {
  if (href.startsWith("#")) anchors.push(href);
  else if (href.startsWith("/") && !href.startsWith("//")) internal.push(href);
  else if (/^https?:\/\//.test(href)) external.push(href);
  else if (/^(mailto|tel):/.test(href)) continue;
  else report("odd-href", href, "not an internal path, anchor or http(s) URL");
}
// Anchors embedded in internal paths ("/#section") count as anchors too.
for (const href of internal) {
  const i = href.indexOf("#");
  if (i >= 0 && (href.slice(0, i) === "/" || href.slice(0, i) === "")) anchors.push(href.slice(i));
}

console.log(`home: ${links.length} hrefs + ${dock.length} dock targets → ${internal.length} internal, ${anchors.length} anchors, ${external.length} external · ${ids.size} element ids`);

// Anchors
for (const a of new Set(anchors)) {
  const id = decodeURIComponent(a.slice(1));
  if (!id) continue;
  if (!ids.has(id)) report("anchor", a, "no element with that id in the home HTML");
}

// Internal pages (concurrency 6)
const uniqueInternal = Array.from(new Set(internal.map((h) => h.split("#")[0]).filter((h) => h && h !== "/")));
async function checkInternal(href) {
  try {
    const r = await fetch(base + href, { headers: { "User-Agent": UA }, redirect: "manual", signal: AbortSignal.timeout(60000) });
    if (r.status >= 300 && r.status < 400) report("internal", href, `${r.status} → ${r.headers.get("location")}`);
    else if (r.status !== 200) report("internal", href, `HTTP ${r.status}`);
  } catch (err) {
    report("internal", href, err instanceof Error ? err.message : String(err));
  }
}
for (let i = 0; i < uniqueInternal.length; i += 6) await Promise.all(uniqueInternal.slice(i, i + 6).map(checkInternal));

// External (HEAD, GET on 405/403)
async function checkExternal(href) {
  try {
    let r = await fetch(href, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0 (link check)" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (r.status === 405 || r.status === 403) r = await fetch(href, { method: "GET", headers: { "User-Agent": "Mozilla/5.0 (link check)" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (r.status >= 400) report("external", href, `HTTP ${r.status}`);
  } catch (err) {
    report("external", href, err instanceof Error ? err.message : String(err));
  }
}
for (let i = 0; i < external.length; i += 6) await Promise.all(external.slice(i, i + 6).map(checkExternal));

// Course slugs vs Sanity
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "xmblxfh8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});
const sanitySlugs = new Set(await sanity.fetch(`*[_type == "course" && !(_id in path("drafts.**"))].slug.current`));
const refs = referencedCourseSlugs();
for (const [slug, files] of refs) {
  if (!sanitySlugs.has(slug)) report("course", slug, `not in Sanity · referenced in ${Array.from(files).join(", ")}`);
}
console.log(`course slugs referenced under components/home + page: ${refs.size} · in Sanity: ${sanitySlugs.size}\n`);

// ── Report ───────────────────────────────────────────────────────────────────
if (failures.length === 0) {
  console.log("No failures.");
} else {
  const w = (s, n) => String(s).padEnd(n).slice(0, n);
  console.log(`${w("kind", 9)} ${w("target", 70)} detail`);
  for (const f of failures.sort((a, b) => a.kind.localeCompare(b.kind) || a.target.localeCompare(b.target))) {
    console.log(`${w(f.kind, 9)} ${w(f.target, 70)} ${f.detail}`);
  }
}
const hard = failures.filter((f) => f.kind === "internal" || f.kind === "anchor" || f.kind === "odd-href");
console.log(`\n${failures.length} finding(s): ${hard.length} internal/anchor failure(s), ${failures.filter((f) => f.kind === "external").length} external, ${failures.filter((f) => f.kind === "course").length} missing course(s).`);
stopServer();
process.exitCode = hard.length > 0 ? 1 : 0;
