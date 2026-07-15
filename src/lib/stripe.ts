import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function priceIdForPlan(plan: "PRO_MONTHLY" | "PRO_YEARLY"): string | undefined {
  return plan === "PRO_MONTHLY"
    ? process.env.STRIPE_PRICE_PRO_MONTHLY
    : process.env.STRIPE_PRICE_PRO_YEARLY;
}
