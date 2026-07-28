# Stripe catalogue runbook

# Edit list prices / products, then dry-run against test or live
# (set STRIPE_SECRET_KEY in the shell; never commit it)
STRIPE_SECRET_KEY=sk_test_... npm run stripe:sync

# Create/update Products, Prices, Payment Links in test + patch pricing.js
STRIPE_SECRET_KEY=sk_test_... npm run stripe:sync -- --apply

# Same for live (both flags required)
STRIPE_SECRET_KEY=sk_live_... npm run stripe:sync -- --apply --live

# After enabling Stripe Tax in the Dashboard, set automatic_tax: true in catalogue.yml and re-apply
# (sync updates existing Payment Links when tax/settings drift — URLs stay the same)
# Product tax_code (txcd_10202003) is set on sync; change defaults.tax_code in catalogue.yml if needed
# Then commit catalogue.yml, state.json, pricing.js, and index.html fallback hrefs
