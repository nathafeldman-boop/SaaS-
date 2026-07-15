export type PlanId = "FREE" | "PRO_MONTHLY" | "PRO_YEARLY";

export interface Plan {
  id: PlanId;
  label: string;
  price: string;
  priceDetail: string;
  /** Analyses de matchs par jour ; null = illimité */
  analysesPerDay: number | null;
  /** Questions à l'assistant IA par jour ; null = illimité */
  assistantPerDay: number | null;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: "FREE",
    label: "Découverte",
    price: "0 €",
    priceDetail: "pour toujours",
    analysesPerDay: 3,
    assistantPerDay: 5,
    features: [
      "3 analyses de matchs par jour",
      "Probabilités 1N2 et scores exacts",
      "5 questions à l'assistant IA par jour",
      "Les 5 grands championnats",
    ],
  },
  PRO_MONTHLY: {
    id: "PRO_MONTHLY",
    label: "Pro",
    price: "14,99 €",
    priceDetail: "par mois, sans engagement",
    analysesPerDay: null,
    assistantPerDay: null,
    features: [
      "Analyses illimitées",
      "Assistant IA illimité",
      "Statistiques avancées (xG, forme, dépendance des scores)",
      "Indice de confiance sur chaque match",
      "Alertes avant coup d'envoi",
    ],
  },
  PRO_YEARLY: {
    id: "PRO_YEARLY",
    label: "Pro Annuel",
    price: "9,99 €",
    priceDetail: "par mois, facturé 119,88 € par an",
    analysesPerDay: null,
    assistantPerDay: null,
    features: [
      "Tout le plan Pro",
      "2 mois offerts (-33 %)",
      "Accès prioritaire aux nouvelles ligues",
      "Export des analyses (CSV)",
    ],
  },
};

export function isPro(plan: string | null | undefined): boolean {
  return plan === "PRO_MONTHLY" || plan === "PRO_YEARLY";
}

export function getPlan(plan: string | null | undefined): Plan {
  if (plan && plan in PLANS) return PLANS[plan as PlanId];
  return PLANS.FREE;
}
