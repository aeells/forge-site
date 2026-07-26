document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#backbone-faq-accordion");
  if (!root || typeof Accordion === "undefined") return;

  new Accordion(root, {
    duration: 280,
    showMultiple: false,
    openOnInit: [0],
  });
});
