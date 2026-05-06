// Remove noscript elements which break DOMParser (keep this as-is)
document.addEventListener("turbo:before-render", function (event) {
  event.detail.newBody.querySelectorAll("noscript").forEach((e) => e.remove());
});
