export type PlanId = "FREE" | "STARTER" | "PRO_MONTHLY" | "LIFETIME";

export interface Plan {
  id: PlanId;
  label: string;
  price: string;
  priceDetail: string;
  /** Analyses de matchs par jour ; null = illimité */
  analysesPerDay: number | null;
  /** Questions à l'assistant IA par jour ; null = illimité */
  assistantPerDay: number | null;
  /** Mode de paiement Stripe */
  mode: "free" | "subscription" | "payment";
  features: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: "FREE",
    label: "Découverte",
    price: "0 €",
    priceDetail: "pour toujours",
    analysesPerDay: 3,
    assistantPerDay: 5,
    mode: "free",
    features: [
      "Aperçu de l'analyse (forme, résumé, scénario)",
      "3 aperçus de matchs par jour",
      "Assistant IA (5 questions/jour)",
    ],
  },
  STARTER: {
    id: "STARTER",
    label: "Starter",
    price: "9,99 €",
    priceDetail: "par mois",
    analysesPerDay: 1,
    assistantPerDay: 5,
    mode: "subscription",
    features: [
      "1 analyse complète par jour",
      "Probabilités exactes 1×/jour",
      "Stats clés",
      "Scénarios de match",
    ],
  },
  PRO_MONTHLY: {
    id: "PRO_MONTHLY",
    label: "Pro",
    price: "19 €",
    priceDetail: "par mois",
    analysesPerDay: null,
    assistantPerDay: null,
    mode: "subscription",
    highlight: true,
    features: [
      "Analyses complètes illimitées",
      "Probabilités exactes & scores détaillés",
      "Scénarios IA avancés",
      "Stats avancées + actualités",
      "Chat IA illimité",
    ],
  },
  LIFETIME: {
    id: "LIFETIME",
    label: "Lifetime",
    price: "99 €",
    priceDetail: "une fois — à vie",
    analysesPerDay: null,
    assistantPerDay: null,
    mode: "payment",
    features: [
      "Tout le plan Pro, à vie",
      "Plus jamais de paiement mensuel",
      "Économise +100 €/an",
      "Accès prioritaire aux nouvelles ligues",
    ],
  },
};

/** Un plan payant débloque l'analyse premium complète. */
export function isPro(plan: string | null | undefined): boolean {
  return plan === "STARTER" || plan === "PRO_MONTHLY" || plan === "LIFETIME" || plan === "PRO_YEARLY";
}

export function getPlan(plan: string | null | undefined): Plan {
  if (plan && plan in PLANS) return PLANS[plan as PlanId];
  return PLANS.FREE;
}
