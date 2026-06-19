async function fetchText(url) {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return await res.text();
}

function initMobileMenu(root = document) {
  const openBtn = root.getElementById("open-menu");
  const closeBtn = root.getElementById("close-menu");
  const menu = root.getElementById("mobile-menu");
  if (!openBtn || !closeBtn || !menu) return;

  const open = () => {
    menu.classList.remove("hidden");
    openBtn.classList.add("hidden");
    closeBtn.classList.remove("hidden");
  };
  const close = () => {
    menu.classList.add("hidden");
    closeBtn.classList.add("hidden");
    openBtn.classList.remove("hidden");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  menu.addEventListener("click", (e) => {
    const link = e.target instanceof Element ? e.target.closest("a") : null;
    if (link) close();
  });
}

function markActiveHeaderLink(root = document) {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  root.querySelectorAll("#navbar a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("/")) return;
    const normalized = href.replace(/#.*$/, "").replace(/\/$/, "") || "/";
    if (normalized === path) a.classList.add("text-white");
  });
}

const DEMO_STATUS_GREEN = "/assets/images/social/status-green-4e79760e.svg#root";
const DEMO_STATUS_RED = "/assets/images/social/status-red-e5484d.svg#root";

async function initDemoStatus(root = document) {
  const links = root.querySelectorAll(".js-demo-site-link");
  if (links.length === 0) return;

  let status;
  try {
    const res = await fetch("/assets/demo-status.json", { credentials: "same-origin" });
    if (!res.ok) return;
    status = await res.json();
  } catch {
    return;
  }

  const online = status.online === true;
  const iconHref = online ? DEMO_STATUS_GREEN : DEMO_STATUS_RED;
  const label = online
    ? "Demo environment online — opens int.forgeplatform.software"
    : "Demo environment offline — opens holding page at int.forgeplatform.software";

  links.forEach((link) => {
    link.setAttribute("aria-label", label);
    link.setAttribute("title", label);
    const icon = link.querySelector(".js-demo-site-status use");
    if (icon) icon.setAttribute("href", iconHref);
  });
}

function initObfuscatedPhones(root = document) {
  root.querySelectorAll(".js-obfuscated-phone").forEach((el) => {
    if (el.dataset.phoneInitialized === "true") return;
    const c = el.getAttribute("data-phone-country") || "";
    const a = el.getAttribute("data-phone-area") || "";
    const p = el.getAttribute("data-phone-prefix") || "";
    const l = el.getAttribute("data-phone-line") || "";
    if (!c || !a || !p || !l) return;

    const e164 = `+${c}${a}${p}${l}`;
    const display = `+${c} (${a}) ${p}-${l}`;

    el.textContent = display;
    el.setAttribute("href", `tel:${e164}`);
    el.dataset.phoneInitialized = "true";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initObfuscatedPhones(document);
  initDemoStatus(document);
});
document.addEventListener("turbo:load", () => {
  initObfuscatedPhones(document);
  initDemoStatus(document);
});
document.addEventListener("turbo:frame-load", (event) => {
  initObfuscatedPhones(event.target);
  initDemoStatus(event.target);
});

async function boot() {
  const headerHost = document.getElementById("site-header");
  const footerHost = document.getElementById("site-footer");
  if (!headerHost || !footerHost) return;

  const [headerHtml, footerHtml] = await Promise.all([
    fetchText("/partials/header.html"),
    fetchText("/partials/footer.html"),
  ]);

  headerHost.innerHTML = headerHtml;
  footerHost.innerHTML = footerHtml;

  initMobileMenu(document);
  markActiveHeaderLink(document);
  initObfuscatedPhones(document);
  initDemoStatus(document);
}

boot();

