(() => {
  function hasInitializedMarquee() {
    return Boolean(document.querySelector(".marquee3k.is-init"));
  }

  function canHoverPause() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function initOrRefresh() {
    // Marquee3k is a global from `vendor/marquee3k.js`.
    if (!window.Marquee3k) return;

    // Marquee3k.init() is not idempotent (it will wrap/clone again), so only
    // init once and refresh thereafter.
    if (hasInitializedMarquee()) window.Marquee3k.refreshAll();
    else window.Marquee3k.init({ selector: "marquee3k" });

    // iOS synthesizes mouseenter on tap and often never mouseleave, which leaves
    // data-pausable marquees stuck paused. Only allow pause on fine pointers.
    if (!canHoverPause() && window.Marquee3k.playAll) {
      window.Marquee3k.playAll();
    }
  }

  async function initAfterFonts() {
    // Fix inconsistent gaps caused by init-before-font-load measurements.
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch {
      // ignore
    }
    initOrRefresh();
    // Re-measure after layout/scale settles (important on mobile + scaled wrappers).
    requestAnimationFrame(() => {
      if (window.Marquee3k?.refreshAll) window.Marquee3k.refreshAll();
      if (!canHoverPause() && window.Marquee3k?.playAll) window.Marquee3k.playAll();
    });
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

