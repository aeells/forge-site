(() => {
  const scrollEl = document.querySelector("[data-compare-scroll]");
  if (!scrollEl) return;

  const prevBtn = document.querySelector("[data-compare-prev]");
  const nextBtn = document.querySelector("[data-compare-next]");
  const fadeRight = document.querySelector("[data-compare-fade-right]");
  const stepPx = 240;

  const maxScrollLeft = () => Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);

  const updateUi = () => {
    const left = scrollEl.scrollLeft;
    const max = maxScrollLeft();
    const atStart = left <= 2;
    const atEnd = left >= max - 2;

    if (prevBtn) prevBtn.disabled = atStart;
    if (nextBtn) nextBtn.disabled = atEnd || max <= 0;

    if (fadeRight) {
      fadeRight.hidden = atEnd || max <= 0;
      fadeRight.disabled = atEnd || max <= 0;
    }
  };

  const scrollByStep = (direction) => {
    scrollEl.scrollBy({ left: direction * stepPx, behavior: "smooth" });
  };

  prevBtn?.addEventListener("click", () => scrollByStep(-1));
  nextBtn?.addEventListener("click", () => scrollByStep(1));
  fadeRight?.addEventListener("click", () => scrollByStep(1));

  scrollEl.addEventListener("scroll", updateUi, { passive: true });
  window.addEventListener("resize", updateUi);

  updateUi();
})();
