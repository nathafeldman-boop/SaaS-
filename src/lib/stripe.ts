import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function priceIdForPlan(plan: "STARTER" | "PRO_MONTHLY" | "LIFETIME"): string | undefined {
  if (plan === "STARTER") return process.env.STRIPE_PRICE_STARTER;
  if (plan === "LIFETIME") return process.env.STRIPE_PRICE_LIFETIME;
  return process.env.STRIPE_PRICE_PRO_MONTHLY;
}
