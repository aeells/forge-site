#!/usr/bin/env node
/**
 * Sync stripe/catalogue.yml → Stripe Products, Prices, and Payment Links.
 *
 * Idempotent: finds objects by metadata.backbone_key.
 * Prices are immutable for amount/currency/interval — a catalogue change
 * archives the old Price and creates a new one (and a new Payment Link).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npm run stripe:sync           # dry-run
 *   STRIPE_SECRET_KEY=sk_test_... npm run stripe:sync -- --apply
 *   STRIPE_SECRET_KEY=sk_live_... npm run stripe:sync -- --apply --live
 *
 * --apply   Create/update in Stripe and write stripe/state.json
 * --live    Require a live key (sk_live_). Refuses test keys.
 * --site    After apply, patch Payment Link URLs into public/assets/js/pricing.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse as parseYaml } from "yaml";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const cataloguePath = path.join(root, "stripe", "catalogue.yml");
const statePath = path.join(root, "stripe", "state.json");
const pricingJsPath = path.join(root, "public", "assets", "js", "pricing.js");

const META_KEY = "backbone_key";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const REQUIRE_LIVE = args.has("--live");
const UPDATE_SITE = args.has("--site") || APPLY;

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function money(cents, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function priceKey(productKey, intervalKey) {
  return `${productKey}_${intervalKey}`;
}

function paymentLinkKey(productKey, intervalKey) {
  return `plink_${productKey}_${intervalKey}`;
}

async function listAll(fetchPage) {
  const out = [];
  let starting_after;
  for (;;) {
    const page = await fetchPage(starting_after);
    out.push(...page.data);
    if (!page.has_more || page.data.length === 0) break;
    starting_after = page.data[page.data.length - 1].id;
  }
  return out;
}

function pageOpts(extra, starting_after) {
  return starting_after ? { ...extra, starting_after } : extra;
}

async function findByMeta(stripe, type, key) {
  if (type === "product") {
    const products = await listAll((starting_after) =>
      stripe.products.list(pageOpts({ limit: 100, active: true }, starting_after)),
    );
    return products.find((p) => p.metadata?.[META_KEY] === key) || null;
  }
  if (type === "price") {
    const prices = await listAll((starting_after) =>
      stripe.prices.list(pageOpts({ limit: 100, active: true }, starting_after)),
    );
    return prices.find((p) => p.metadata?.[META_KEY] === key) || null;
  }
  if (type === "payment_link") {
    const links = await listAll((starting_after) =>
      stripe.paymentLinks.list(
        pageOpts({ limit: 100, active: true, expand: ["data.line_items"] }, starting_after),
      ),
    );
    return links.find((l) => l.metadata?.[META_KEY] === key) || null;
  }
  throw new Error(`unknown type ${type}`);
}

function priceMatches(existing, desired, currency) {
  return (
    existing.currency === currency &&
    existing.unit_amount === desired.unit_amount &&
    existing.recurring?.interval === desired.interval &&
    (existing.recurring?.interval_count || 1) === 1
  );
}

async function ensureProduct(stripe, key, spec, currency, dryRun) {
  const existing = await findByMeta(stripe, "product", key);
  const payload = {
    name: spec.name,
    description: spec.description || undefined,
    metadata: {
      ...(spec.metadata || {}),
      [META_KEY]: key,
    },
  };

  if (existing) {
    const needsUpdate =
      existing.name !== payload.name ||
      (existing.description || "") !== (payload.description || "") ||
      Object.entries(payload.metadata).some(([k, v]) => existing.metadata?.[k] !== String(v));

    if (!needsUpdate) {
      console.log(`  product ${key}: ok (${existing.id})`);
      return existing;
    }
    console.log(`  product ${key}: update ${existing.id}`);
    if (dryRun) return existing;
    return stripe.products.update(existing.id, payload);
  }

  console.log(`  product ${key}: create "${spec.name}"`);
  if (dryRun) return { id: `dry_prod_${key}`, metadata: payload.metadata };
  return stripe.products.create(payload);
}

async function ensurePrice(stripe, key, productId, spec, currency, dryRun) {
  const existing = await findByMeta(stripe, "price", key);
  const desired = {
    unit_amount: spec.unit_amount,
    interval: spec.interval,
  };

  if (existing && priceMatches(existing, desired, currency)) {
    if (spec.nickname && existing.nickname !== spec.nickname && !dryRun) {
      await stripe.prices.update(existing.id, { nickname: spec.nickname });
    }
    console.log(
      `  price ${key}: ok (${existing.id}) ${money(spec.unit_amount, currency)}/${spec.interval}`,
    );
    return existing;
  }

  if (existing) {
    console.log(
      `  price ${key}: archive ${existing.id} (amount/interval changed) → create new`,
    );
    if (!dryRun) await stripe.prices.update(existing.id, { active: false });
  } else {
    console.log(
      `  price ${key}: create ${money(spec.unit_amount, currency)}/${spec.interval}`,
    );
  }

  if (dryRun) return { id: `dry_price_${key}` };

  return stripe.prices.create({
    product: productId,
    currency,
    unit_amount: spec.unit_amount,
    nickname: spec.nickname || undefined,
    recurring: { interval: spec.interval, interval_count: 1 },
    metadata: { [META_KEY]: key },
  });
}

async function ensurePaymentLink(stripe, key, priceId, defaults, dryRun) {
  const existing = await findByMeta(stripe, "payment_link", key);
  if (existing) {
    const linePrice = existing.line_items?.data?.[0]?.price;
    const linePriceId = typeof linePrice === "string" ? linePrice : linePrice?.id;
    if (linePriceId === priceId) {
      console.log(`  payment_link ${key}: ok (${existing.id}) ${existing.url}`);
      return existing;
    }
    console.log(`  payment_link ${key}: deactivate ${existing.id} (price changed) → create new`);
    if (!dryRun) await stripe.paymentLinks.update(existing.id, { active: false });
  } else {
    console.log(`  payment_link ${key}: create`);
  }

  if (dryRun) {
    return { id: `dry_plink_${key}`, url: `https://buy.stripe.com/dry_${key}` };
  }

  const pl = defaults.payment_link || {};
  return stripe.paymentLinks.create({
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { [META_KEY]: key },
    allow_promotion_codes: !!pl.allow_promotion_codes,
    billing_address_collection: pl.billing_address_collection || "auto",
    phone_number_collection: { enabled: !!pl.phone_number_collection },
    tax_id_collection: { enabled: !!pl.tax_id_collection },
    automatic_tax: { enabled: !!pl.automatic_tax },
    after_completion: {
      type: "hosted_confirmation",
      hosted_confirmation: {
        custom_message: "Thanks — we'll be in touch shortly to kick off Backbone.",
      },
    },
  });
}

function patchPricingJs(state, catalogue) {
  let src = fs.readFileSync(pricingJsPath, "utf8");
  const currency = catalogue.currency;

  for (const [productKey, spec] of Object.entries(catalogue.products)) {
    if (!spec.site_key || spec.invoice_only) continue;
    const siteKey = spec.site_key;
    const monthly = state.products[productKey]?.prices?.monthly;
    const annual = state.products[productKey]?.prices?.annual;
    if (!monthly?.payment_link_url || !annual?.payment_link_url) {
      console.warn(`  skip site patch for ${siteKey}: missing payment link URLs`);
      continue;
    }

    const blockRe = new RegExp(
      `(${siteKey}:\\s*\\{[\\s\\S]*?monthly:\\s*")[^"]+("\\s*,\\s*annual:\\s*")[^"]+("\\s*,\\s*monthlyPrice:\\s*)\\d+(\\s*,\\s*annualTotal:\\s*)\\d+`,
      "m",
    );
    if (!blockRe.test(src)) {
      console.warn(`  skip site patch for ${siteKey}: block not found in pricing.js`);
      continue;
    }
    src = src.replace(
      blockRe,
      `$1${monthly.payment_link_url}$2${annual.payment_link_url}$3${monthly.unit_amount / 100}$4${annual.unit_amount / 100}`,
    );
    console.log(`  pricing.js: updated ${siteKey} (${currency.toUpperCase()})`);
  }

  fs.writeFileSync(pricingJsPath, src, "utf8");
}

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) die("Set STRIPE_SECRET_KEY (sk_test_... or sk_live_...).");

  if (REQUIRE_LIVE && !secret.startsWith("sk_live_")) {
    die("--live requires STRIPE_SECRET_KEY to start with sk_live_.");
  }
  if (!REQUIRE_LIVE && secret.startsWith("sk_live_") && APPLY) {
    die("Refusing to --apply with a live key unless you also pass --live.");
  }

  const catalogue = parseYaml(fs.readFileSync(cataloguePath, "utf8"));
  const currency = catalogue.currency;
  if (currency !== "usd") {
    console.warn(`Warning: catalogue currency is "${currency}" (expected usd).`);
  }

  const stripe = new Stripe(secret);
  const dryRun = !APPLY;
  const mode = secret.startsWith("sk_live_") ? "live" : "test";

  console.log(`Stripe catalogue sync (${dryRun ? "dry-run" : "APPLY"} / ${mode})`);
  console.log(`Catalogue: ${path.relative(root, cataloguePath)}\n`);

  const state = {
    synced_at: new Date().toISOString(),
    mode,
    currency,
    dry_run: dryRun,
    products: {},
  };

  for (const [productKey, spec] of Object.entries(catalogue.products)) {
    console.log(`${productKey}`);
    const product = await ensureProduct(stripe, productKey, spec, currency, dryRun);
    state.products[productKey] = {
      id: product.id,
      name: spec.name,
      site_key: spec.site_key || null,
      invoice_only: !!spec.invoice_only,
      prices: {},
    };

    if (spec.invoice_only || !spec.prices) {
      console.log(`  (invoice-only — no list Prices / Payment Links)\n`);
      continue;
    }

    for (const [intervalKey, priceSpec] of Object.entries(spec.prices)) {
      const pKey = priceKey(productKey, intervalKey);
      const price = await ensurePrice(
        stripe,
        pKey,
        product.id,
        priceSpec,
        currency,
        dryRun,
      );

      let paymentLink = null;
      if (spec.create_payment_links) {
        const plKey = paymentLinkKey(productKey, intervalKey);
        paymentLink = await ensurePaymentLink(
          stripe,
          plKey,
          price.id,
          catalogue.defaults || {},
          dryRun,
        );
      }

      state.products[productKey].prices[intervalKey] = {
        id: price.id,
        unit_amount: priceSpec.unit_amount,
        interval: priceSpec.interval,
        payment_link_id: paymentLink?.id || null,
        payment_link_url: paymentLink?.url || null,
      };
    }
    console.log("");
  }

  if (dryRun) {
    console.log("Dry-run only. Re-run with --apply to create/update Stripe objects.");
    console.log(JSON.stringify(state, null, 2));
    return;
  }

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
  console.log(`Wrote ${path.relative(root, statePath)}`);

  if (UPDATE_SITE) {
    console.log("Patching site checkout URLs…");
    patchPricingJs(state, catalogue);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
