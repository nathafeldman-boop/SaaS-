import Link from "next/link";
import { predict } from "@/lib/predictor";
import { firstMatch, DEMO } from "@/lib/fixtures";

export const dynamic = "force-dynamic";

async function getFeaturedMatch() {
  try {
    const match = await firstMatch();
    if (!match) return null;
    return { match, prediction: predict(match.homeTeam, match.awayTeam) };
  } catch {
    return null;
  }
}

const features = [
  {
    title: "Probabilités calculées, pas devinées",
    description:
      "Un modèle de Poisson bivarié (Dixon-Coles) estime les probabilités 1N2, les scores exacts, les +/-2,5 buts et le BTTS pour chaque rencontre.",
    icon: "📊",
  },
  {
    title: "Assistant IA spécialisé football",
    description:
      "Posez vos questions en langage naturel : comparaisons d'équipes, tendances, explications des probabilités. L'assistant s'appuie sur nos données, pas sur des impressions.",
    icon: "🤖",
  },
  {
    title: "Forme et dynamique des équipes",
    description:
      "Forces offensives et défensives, forme sur 5 matchs, avantage du terrain : chaque facteur est quantifié et expliqué en français clair.",
    icon: "📈",
  },
  {
    title: "Les 5 grands championnats",
    description: "Ligue 1, Premier League, LaLiga, Serie A et Bundesliga, avec un indice de confiance sur chaque analyse.",
    icon: "🏆",
  },
];

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-white">{Math.round(value * 100)} %</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full" style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default async function Home() {
  const featured = await getFeaturedMatch();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pitch-950/60 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-4 inline-block rounded-full border border-pitch-500/40 bg-pitch-500/10 px-4 py-1 text-sm text-pitch-300">
                Modèle statistique + IA — 5 grands championnats
              </p>
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                Le match, décrypté <span className="text-pitch-400">avant le coup d&apos;envoi</span>
              </h1>
              <p className="mt-6 text-lg text-slate-300">
                AvantMatch analyse chaque rencontre avec un vrai modèle statistique : probabilités d&apos;issue,
                scores exacts, buts attendus et forme des équipes. Comprenez le match avant qu&apos;il commence.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/matchs" className="btn-primary">
                  {DEMO ? "Tester une analyse" : "Commencer gratuitement"}
                </Link>
                <Link href="/assistant" className="btn-secondary">
                  {DEMO ? "Essayer l'assistant IA" : "Voir les matchs analysés"}
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                {DEMO
                  ? "Démo publique : analyses et assistant ouverts, sans inscription."
                  : "3 analyses gratuites par jour, sans carte bancaire."}
              </p>
            </div>

            {featured && (
              <div className="card p-6">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {featured.match.league} —{" "}
                  {new Date(featured.match.kickoff).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xl font-bold">{featured.match.homeTeam.name}</p>
                  <span className="text-slate-400">vs</span>
                  <p className="text-right text-xl font-bold">{featured.match.awayTeam.name}</p>
                </div>
                <div className="mt-6 space-y-4">
                  <Bar label={`Victoire ${featured.match.homeTeam.shortName}`} value={featured.prediction.homeWin} color="#14bf5b" />
                  <Bar label="Match nul" value={featured.prediction.draw} color="#94a3b8" />
                  <Bar label={`Victoire ${featured.match.awayTeam.shortName}`} value={featured.prediction.awayWin} color="#60a5fa" />
                </div>
                <div className="mt-6 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                  <span className="text-slate-400">Score le plus probable</span>
                  <span className="text-lg font-bold text-pitch-400">
                    {featured.prediction.topScores[0].home} - {featured.prediction.topScores[0].away}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Ce que le score ne vous dit pas encore</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
          Des millions de combinaisons de scores simulées, résumées en quelques chiffres lisibles.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card flex flex-col items-center gap-6 p-10 text-center">
          <h2 className="text-3xl font-bold">
            Analyses illimitées dès <span className="text-pitch-400">9,99 €/mois</span>
          </h2>
          <p className="max-w-2xl text-slate-400">
            Le plan Découverte est gratuit pour toujours. Le plan Pro débloque les analyses et l&apos;assistant IA en
            illimité, les statistiques avancées et les alertes avant coup d&apos;envoi — moins cher que les
            alternatives, sans limite quotidienne.
          </p>
          <Link href="/tarifs" className="btn-primary">
            Comparer les plans
          </Link>
        </div>
      </section>
    </div>
  );
}
