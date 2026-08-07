#!/usr/bin/env node
/**
 * Removes files under public/assets/ that are not referenced by the static site.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicRoot = path.join(root, "public");

function diskUrl(urlPath) {
  return path.join(publicRoot, urlPath.replace(/^\//, ""));
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function readImportMap() {
  const html = fs.readFileSync(path.join(publicRoot, "index.html"), "utf8");
  const m = html.match(/<script type="importmap"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("importmap not found");
  return JSON.parse(m[1]).imports;
}

function bfsJsFiles(importMap) {
  const entrySpecs = [
    "common/aos",
    "common/lazy",
    "common/railsSetup",
    "common_controllers",
    "site/menu",
    "common/site_settings_bootstrap",
    "common/site_settings_panel",
  ];

  const eagerCommon = Object.keys(importMap).filter((k) => /^common_controllers\/.+_controller$/.test(k));

  const queue = [...new Set([...entrySpecs, ...eagerCommon, "@hotwired/stimulus", "@hotwired/stimulus-loading"])];
  const visited = new Set();
  const files = new Set();

  function resolveSpec(spec) {
    if (importMap[spec]) return importMap[spec];
    const prefixes = Object.keys(importMap)
      .filter((k) => k.endsWith("/") && spec.startsWith(k))
      .sort((a, b) => b.length - a.length);
    for (const p of prefixes) {
      return importMap[p] + spec.slice(p.length);
    }
    return null;
  }

  function extractImports(src) {
    const out = [];
    const re = /\bfrom\s+["']([^"']+)["']|\bimport\s+["']([^"']+)["']/g;
    let m;
    while ((m = re.exec(src))) {
      const s = m[1] || m[2];
      if (s && !s.startsWith(".")) out.push(s);
    }
    return out;
  }

  while (queue.length) {
    const spec = queue.shift();
    if (visited.has(spec)) continue;
    visited.add(spec);
    const urlPath = resolveSpec(spec);
    if (!urlPath || !urlPath.startsWith("/assets/")) continue;
    const disk = diskUrl(urlPath);
    if (!fs.existsSync(disk)) continue;
    files.add(urlPath);
    const src = fs.readFileSync(disk, "utf8");
    for (const imp of extractImports(src)) {
      if (!visited.has(imp)) queue.push(imp);
    }
  }

  [
    "/assets/js/vendor/es-module-shims.js",
    "/assets/js/img-data-src.js",
    "/assets/js/formspree.js",
    "/assets/css/main.css",
    "/assets/css/blog.css",
    "/assets/js/homepage-imports.js",
    "/assets/js/layout-shell.js",
    "/assets/js/pricing.js",
  ].forEach((f) => files.add(f));

  return files;
}

function collectHtmlAssetRefs() {
  const assetRef = /\/assets\/[^"' )\]}>]*/g;
  const htmlRefs = new Set();
  const files = [
    "index.html",
    "partials/header.html",
    "partials/footer.html",
    "partials/page-pulse.html",
    "faq/index.html",
  ];
  // Generated blog pages bake in their own asset references.
  const blogDir = path.join(publicRoot, "blog");
  if (fs.existsSync(blogDir)) {
    for (const p of walk(blogDir)) {
      if (p.endsWith(".html")) files.push(path.relative(publicRoot, p));
    }
  }
  for (const f of files) {
    const fp = path.join(publicRoot, f);
    if (!fs.existsSync(fp)) continue;
    let t = fs.readFileSync(fp, "utf8");
    t = t.replace(/<script type="importmap"[^>]*>[\s\S]*?<\/script>/g, "");
    let m;
    while ((m = assetRef.exec(t))) {
      let u = m[0].replace(/["']$/, "");
      htmlRefs.add(u.split("#")[0].split("?")[0]);
    }
  }
  return htmlRefs;
}

function collectCssUrls() {
  const cssDir = path.join(publicRoot, "assets/css");
  const css = fs.readFileSync(path.join(cssDir, "main.css"), "utf8");
  const cssUrls = new Set();
  const urlRe = /url\(\s*["']?([^"')]+)/g;
  let m;
  while ((m = urlRe.exec(css))) {
    let u = m[1].trim();
    if (u.startsWith("data:") || u.startsWith("javascript:")) continue;
    if (u.startsWith("/assets/")) cssUrls.add(u.split("#")[0]);
    else if (u.startsWith("./")) cssUrls.add("/assets/" + u.slice(2));
    else if (u.startsWith("../")) {
      const resolved = path.normalize(path.join(cssDir, u));
      const rel = path.relative(publicRoot, resolved).replace(/\\/g, "/");
      if (!rel.startsWith("..")) cssUrls.add("/" + rel.split("#")[0]);
    }
  }
  return cssUrls;
}

const importMap = readImportMap();
const jsFiles = bfsJsFiles(importMap);
const keep = new Set([...jsFiles, ...collectHtmlAssetRefs(), ...collectCssUrls()]);

const assetsDir = path.join(publicRoot, "assets");
const allFiles = walk(assetsDir).map((p) => "/" + path.relative(publicRoot, p).replace(/\\/g, "/"));

const toDelete = allFiles.filter((f) => !keep.has(f));

console.log(`Keep ${keep.size} paths, delete ${toDelete.length} files under public/assets/`);

for (const rel of toDelete) {
  const fp = diskUrl(rel);
  try {
    fs.unlinkSync(fp);
  } catch (e) {
    console.error("Failed to delete", rel, e.message);
  }
}

function emptyDirs(dir) {
  const subs = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of subs) {
    if (ent.isDirectory()) emptyDirs(path.join(dir, ent.name));
  }
  try {
    const left = fs.readdirSync(dir);
    if (left.length === 0 && dir !== assetsDir) fs.rmdirSync(dir);
  } catch {
    /* ignore */
  }
}
emptyDirs(assetsDir);

console.log("Done.");
