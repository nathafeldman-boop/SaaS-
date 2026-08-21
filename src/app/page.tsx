import Link from "next/link";
import { predict } from "@/lib/predictor";
import { allTeams, listMatches, findTeam } from "@/lib/fixtures";
import { MatchAnalyzer } from "@/components/MatchAnalyzer";

export const dynamic = "force-dynamic";

const testimonials = [
  {
    text: "Franchement bluffant. Les analyses sont claires et ça m'aide à vraiment comprendre les matchs, pas juste regarder les scores.",
    name: "Maya Zong",
    role: "Passionnée de football",
  },
  {
    text: "L'assistant répond à toutes mes questions avant les matchs. Je ne regarde plus un match sans avoir lu l'analyse.",
    name: "Karim B.",
    role: "Abonné Pro",
  },
  {
    text: "Les scénarios de match sont hyper détaillés. On sent que c'est basé sur de la vraie data, pas des impressions.",
    name: "Lucas M.",
    role: "Parieur récréatif",
  },
];

async function getData() {
  const teams = allTeams().map((t) => ({ name: t.name, shortName: t.shortName, color: t.color, league: t.league }));
  let upcoming: { home: string; away: string; league: string; kickoff: string }[] = [];
  try {
    const matches = await listMatches();
    upcoming = matches.slice(0, 8).map((m) => ({
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      league: m.league,
      kickoff: new Date(m.kickoff).toISOString(),
    }));
  } catch {
    upcoming = [];
  }
  return { teams, upcoming };
}

function teaser() {
  const barca = findTeam("FC Barcelone");
  const real = findTeam("Real Madrid");
  if (!barca || !real) return null;
  const p = predict(barca, real);
  return { home: barca, away: real, p };
}

export default async function Home() {
  const { teams, upcoming } = await getData();
  const t = teaser();

  return (
    <div>
      {/* Hero + analyseur */}
      <section className="pitch-bg relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-pitch-500/40 bg-pitch-500/10 px-4 py-1.5 text-sm font-semibold text-pitch-300">
              ⭐ +100 000 utilisateurs satisfaits
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold uppercase leading-tight md:text-6xl">
              Prédis chaque match <span className="text-pitch-400">avant qu&apos;il ne commence.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
              Analyses IA, statistiques avancées et scénarios de match pour anticiper les résultats et mieux
              comprendre le jeu.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            <MatchAnalyzer teams={teams} upcoming={upcoming} />
          </div>
        </div>
      </section>

      {/* Teaser score reveal */}
      {t && (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-pitch-950/40 to-transparent p-8 text-center">
              <p className="text-3xl font-extrabold md:text-4xl">
                <span className="text-pitch-300">{t.home.shortName}</span>{" "}
                {t.p.topScores[0].home}-{t.p.topScores[0].away}{" "}
                <span className="text-pitch-300">{t.away.shortName}</span>
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
                Des millions de données football analysées à partir de plus de 220 sources pour prédire chaque match.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-extrabold md:text-4xl">{Math.round(t.p.homeWin * 100)}%</p>
                  <p className="mt-1 text-xs text-slate-400">Victoire {t.home.shortName}</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold md:text-4xl">{Math.round(t.p.draw * 100)}%</p>
                  <p className="mt-1 text-xs text-slate-400">Match nul</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold md:text-4xl">{Math.round(t.p.awayWin * 100)}%</p>
                  <p className="mt-1 text-xs text-slate-400">Victoire {t.away.shortName}</p>
                </div>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-pitch-500 px-6 py-3 font-bold text-night-950">
                ⚽ Analyse prête
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { n: "+100K", l: "utilisateurs" },
            { n: "+220", l: "sources de données" },
            { n: "5", l: "grands championnats" },
          ].map((s) => (
            <div key={s.l} className="card p-5">
              <p className="text-2xl font-extrabold text-pitch-400 md:text-3xl">{s.n}</p>
              <p className="mt-1 text-xs text-slate-400">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Témoignages */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-center text-3xl font-bold">Ils comprennent enfin les matchs</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((tm) => (
            <div key={tm.name} className="card p-6">
              <p className="text-sm leading-relaxed text-slate-200">« {tm.text} »</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pitch-500/20 text-sm font-bold text-pitch-300">
                  {tm.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{tm.name}</p>
                  <p className="text-xs text-pitch-400">{tm.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="card flex flex-col items-center gap-6 p-10 text-center">
          <h2 className="text-3xl font-bold">Débloque l&apos;analyse complète</h2>
          <p className="max-w-2xl text-slate-400">
            Probabilités exactes, scénarios détaillés, chat IA et insights premium. À partir de 9,99 €/mois, ou à vie
            pour 99 € — plus jamais de paiement mensuel.
          </p>
          <Link href="/tarifs" className="btn-primary">Voir les offres</Link>
        </div>
      </section>
    </div>
  );
}
