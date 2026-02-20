/**
 * Stripe product and price configuration
 * Define pricing tiers for the micro-services platform
 */

export const PRICING_TIERS = {
  starter: {
    name: "Starter",
    description: "Perfect for small teams and proof-of-concept projects",
    monthlyPriceId: "price_1QvZzLRVQovWbg9nG5X5X5X5",
    annualPriceId: "price_1QvZzLRVQovWbg9nG5X5X5X6",
    monthlyPrice: 49,
    annualPrice: 490, // ~17% discount
    features: [
      "Up to 5 microservices",
      "Basic authentication & authorization",
      "Standard observability dashboard",
      "Community support",
      "99.5% uptime SLA",
    ],
  },
  professional: {
    name: "Professional",
    description: "For growing teams ready to scale production workloads",
    monthlyPriceId: "price_1QvZzLRVQovWbg9nG5X5X5X7",
    annualPriceId: "price_1QvZzLRVQovWbg9nG5X5X5X8",
    monthlyPrice: 199,
    annualPrice: 1990, // ~17% discount
    features: [
      "Unlimited microservices",
      "Advanced zero-trust security",
      "Full observability suite with APM",
      "Operational tooling & automation",
      "Priority email support",
      "99.9% uptime SLA",
    ],
  },
  enterprise: {
    name: "Enterprise",
    description: "Custom solutions for large-scale deployments",
    monthlyPriceId: "price_1QvZzLRVQovWbg9nG5X5X5X9",
    annualPriceId: "price_1QvZzLRVQovWbg9nG5X5X5XA",
    monthlyPrice: 999,
    annualPrice: 9990, // ~17% discount
    features: [
      "Everything in Professional",
      "Dedicated infrastructure",
      "Custom compliance & security policies",
      "24/7 phone & Slack support",
      "Dedicated solutions architect",
      "99.99% uptime SLA",
      "Custom SLA available",
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;
