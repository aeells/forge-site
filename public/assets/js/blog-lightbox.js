// Initialise GLightbox for any .glightbox anchors on blog pages.
// Loaded after vendor/glightbox.min.js (both deferred).
(function initBlogLightbox() {
  function start() {
    if (typeof GLightbox === "undefined") return;
    if (!document.querySelector(".glightbox")) return;
    GLightbox({
      selector: ".glightbox",
      touchNavigation: true,
      loop: false,
      zoomable: true,
      openEffect: "fade",
      closeEffect: "fade",
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
