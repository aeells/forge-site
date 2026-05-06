(() => {
  function hasInitializedMarquee() {
    return Boolean(document.querySelector(".marquee3k.is-init"));
  }

  function initOrRefresh() {
    // Marquee3k is a global from `vendor/marquee3k.js`.
    if (!window.Marquee3k) return;

    // Marquee3k.init() is not idempotent (it will wrap/clone again), so only
    // init once and refresh thereafter.
    if (hasInitializedMarquee()) window.Marquee3k.refreshAll();
    else window.Marquee3k.init({ selector: "marquee3k" });
  }

  async function initAfterFonts() {
    // Fix inconsistent gaps caused by init-before-font-load measurements.
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch {
      // ignore
    }
    initOrRefresh();
  }

  // Initial load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAfterFonts, { once: true });
  } else {
    void initAfterFonts();
  }

  // Turbo navigations (site uses Turbo)
  document.addEventListener("turbo:load", () => void initAfterFonts());

  // Safety net for late-loading fonts/assets.
  window.addEventListener("load", initOrRefresh, { once: true });
})();

