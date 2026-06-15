(function () {
  var toggle = document.getElementById("pricing-billing-toggle");
  if (!toggle) return;

  var STRIPE = {
    builder: {
      monthly: "https://buy.stripe.com/5kQ28q5gBbjPgxX0vXaMU04",
      annual: "https://buy.stripe.com/8x29AS9wRbjP0yZceFaMU05",
      monthlyPrice: 499,
      annualTotal: 5090,
    },
    scale: {
      monthly: "https://buy.stripe.com/cNi9AScJ3fA52H7diJaMU01",
      annual: "https://buy.stripe.com/7sYeVc7oJgE93Lb5QhaMU03",
      monthlyPrice: 1199,
      annualTotal: 12230,
    },
  };

  function effectiveMonthly(annualTotal) {
    return Math.round(annualTotal / 12);
  }

  function formatMoney(n) {
    return n.toLocaleString("en-US");
  }

  function sync() {
    var annual = toggle.checked;
    var tier;

    for (tier in STRIPE) {
      if (!Object.prototype.hasOwnProperty.call(STRIPE, tier)) continue;
      var cfg = STRIPE[tier];
      var amountEl = document.querySelector('[data-pricing-amount="' + tier + '"]');
      var noteEl = document.querySelector('[data-pricing-annual-note="' + tier + '"]');
      var linkEl = document.querySelector('[data-pricing-checkout="' + tier + '"]');

      if (amountEl) {
        amountEl.textContent = annual
          ? String(effectiveMonthly(cfg.annualTotal))
          : String(cfg.monthlyPrice);
      }
      if (noteEl) {
        if (annual) {
          noteEl.textContent = "Billed $" + formatMoney(cfg.annualTotal) + " annually";
          noteEl.classList.remove("invisible");
        } else {
          noteEl.textContent = "";
          noteEl.classList.add("invisible");
        }
      }
      if (linkEl) {
        linkEl.setAttribute("href", annual ? cfg.annual : cfg.monthly);
      }
    }

    var labelMonthly = document.querySelector('[data-pricing-label="monthly"]');
    var labelAnnual = document.querySelector('[data-pricing-label="annual"]');
    if (labelMonthly) {
      labelMonthly.classList.toggle("text-white", !annual);
      labelMonthly.classList.toggle("text-neutral-400", annual);
    }
    if (labelAnnual) {
      labelAnnual.classList.toggle("text-white", annual);
      labelAnnual.classList.toggle("text-neutral-400", !annual);
    }
  }

  toggle.addEventListener("change", sync);
  sync();
})();
