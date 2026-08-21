"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PLANS, type PlanId } from "@/lib/plans";

const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export default function TarifsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: PlanId) {
    if (DEMO) {
      router.push("/matchs");
      return;
    }
    if (plan === "FREE") {
      router.push(status === "authenticated" ? "/matchs" : "/inscription");
      return;
    }
    if (status !== "authenticated") {
      router.push("/inscription");
      return;
    }
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur inattendue");
      } else if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setLoading(null);
    }
  }

  const order: PlanId[] = ["STARTER", "PRO_MONTHLY", "LIFETIME"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-center text-4xl font-bold">Des tarifs simples et honnêtes</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
        Commencez gratuitement, passez Pro quand vous voulez l&apos;illimité. Sans engagement : annulez en deux clics
        depuis votre compte.
      </p>

      {error && (
        <div className="mx-auto mt-6 max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-200">
          {error}
        </div>
      )}

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {order.map((id) => {
          const plan = PLANS[id];
          const highlight = plan.highlight ?? false;
          return (
            <div
              key={id}
              className={`card relative flex flex-col p-8 ${highlight ? "border-pitch-500/60 ring-1 ring-pitch-500/40" : ""}`}
            >
              {highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pitch-500 px-4 py-1 text-xs font-bold text-night-950">
                  ⭐ Populaire
                </span>
              )}
              {id === "LIFETIME" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-night-950">
                  ∞ À vie
                </span>
              )}
              <h2 className="text-lg font-semibold">{plan.label}</h2>
              <p className="mt-4">
                <span className="text-4xl font-extrabold">{plan.price}</span>
              </p>
              <p className="mt-1 text-sm text-slate-400">{plan.priceDetail}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-pitch-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => subscribe(id)}
                disabled={loading !== null}
                className={`mt-8 ${highlight || id === "PRO_MONTHLY" ? "btn-primary" : "btn-secondary"}`}
              >
                {loading === id ? "Redirection…" : id === "FREE" ? "Commencer gratuitement" : "Choisir ce plan"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-center text-2xl font-bold">Questions fréquentes</h2>
        <div className="mt-8 space-y-4">
          {[
            {
              q: "Comment sont calculées les probabilités ?",
              a: "Chaque match est modélisé par une loi de Poisson bivariée (méthode Dixon-Coles) calibrée sur les forces offensives et défensives des équipes, leur forme récente et l'avantage du terrain. C'est la méthode de référence en analyse statistique du football.",
            },
            {
              q: "Est-ce un site de paris ?",
              a: "Non. PrediStart est un outil d'information et d'analyse statistique. Nous ne prenons pas de paris et nous ne garantissons aucun résultat : le football reste imprévisible.",
            },
            {
              q: "Puis-je annuler mon abonnement ?",
              a: "Oui, à tout moment depuis votre compte, en deux clics, via le portail de facturation sécurisé Stripe. Vous conservez l'accès Pro jusqu'à la fin de la période payée.",
            },
            {
              q: "Quels championnats sont couverts ?",
              a: "Ligue 1, Premier League, LaLiga, Serie A et Bundesliga. D'autres compétitions (Ligue des Champions, Ligue 2) arrivent prochainement — en priorité pour les abonnés annuels.",
            },
          ].map((item) => (
            <div key={item.q} className="card p-6">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
