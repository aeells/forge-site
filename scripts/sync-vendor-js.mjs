#!/usr/bin/env node
/**
 * Copies vendor JS from npm packages into public/assets/js/vendor/
 * and fetches stimulus-loading from hotwired/stimulus-rails (not published on npm).
 *
 * Output uses stable filenames (no content hashes). Run after: npm install
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicJs = path.join(root, "public", "assets", "js");
const vendorDir = path.join(publicJs, "vendor");
const nm = path.join(root, "node_modules");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function copyFromNodeModules(relFromNodeModules, destName) {
  const src = path.join(nm, relFromNodeModules);
  const dest = path.join(vendorDir, destName);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("copied", relFromNodeModules, "->", path.join("vendor", destName));
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.text();
}

async function main() {
  const versions = {
    "@hotwired/turbo-rails": readJson(path.join(nm, "@hotwired/turbo-rails/package.json")).version,
    "@hotwired/stimulus": readJson(path.join(nm, "@hotwired/stimulus/package.json")).version,
    aos: readJson(path.join(nm, "aos/package.json")).version,
    lazysizes: readJson(path.join(nm, "lazysizes/package.json")).version,
    "es-module-shims": readJson(path.join(nm, "es-module-shims/package.json")).version,
    "accordion-js": readJson(path.join(nm, "accordion-js/package.json")).version,
    glightbox: readJson(path.join(nm, "glightbox/package.json")).version,
  };

  fs.mkdirSync(vendorDir, { recursive: true });

  copyFromNodeModules("@hotwired/turbo-rails/app/assets/javascripts/turbo.js", "turbo-rails.js");
  copyFromNodeModules("@hotwired/stimulus/dist/stimulus.js", "stimulus.js");
  copyFromNodeModules("aos/dist/aos.js", "aos.js");
  copyFromNodeModules("lazysizes/lazysizes.min.js", "lazysizes.min.js");
  copyFromNodeModules("es-module-shims/dist/es-module-shims.js", "es-module-shims.js");
  copyFromNodeModules("accordion-js/dist/accordion.min.js", "accordion.min.js");
  copyFromNodeModules("glightbox/dist/js/glightbox.min.js", "glightbox.min.js");

  const vendorCssDir = path.join(root, "public", "assets", "css", "vendor");
  fs.mkdirSync(vendorCssDir, { recursive: true });
  fs.copyFileSync(
    path.join(nm, "accordion-js/dist/accordion.min.css"),
    path.join(vendorCssDir, "accordion.min.css"),
  );
  console.log("copied accordion-js/dist/accordion.min.css -> css/vendor/accordion.min.css");
  fs.copyFileSync(
    path.join(nm, "glightbox/dist/css/glightbox.min.css"),
    path.join(vendorCssDir, "glightbox.min.css"),
  );
  console.log("copied glightbox/dist/css/glightbox.min.css -> css/vendor/glightbox.min.css");

  /** Pin to stimulus-rails release that ships Stimulus importmap helpers. */
  const STIMULUS_RAILS_TAG = "v1.3.4";
  const loadingUrl = `https://raw.githubusercontent.com/hotwired/stimulus-rails/${STIMULUS_RAILS_TAG}/app/assets/javascripts/stimulus-loading.js`;
  const loadingSrc = await fetchText(loadingUrl);
  fs.writeFileSync(path.join(vendorDir, "stimulus-loading.js"), loadingSrc, "utf8");
  console.log("fetched", loadingUrl, "-> vendor/stimulus-loading.js");

  versions["stimulus-rails (stimulus-loading source)"] = STIMULUS_RAILS_TAG;
  console.log("versions:", versions);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
