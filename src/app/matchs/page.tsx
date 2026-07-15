import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Matchs à venir — AvantMatch",
};

export default async function MatchsPage({ searchParams }: { searchParams: { ligue?: string } }) {
  const matches = await prisma.match.findMany({
    where: {
      kickoff: { gte: new Date() },
      ...(searchParams.ligue ? { league: searchParams.ligue } : {}),
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoff: "asc" },
  });

  const leagues = ["Ligue 1", "Premier League", "LaLiga", "Serie A", "Bundesliga"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Matchs à venir</h1>
      <p className="mt-2 text-slate-400">Choisissez un match pour lancer son analyse statistique complète.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/matchs"
          className={`rounded-full px-4 py-2 text-sm ${!searchParams.ligue ? "bg-pitch-500 text-night-950 font-semibold" : "border border-white/15 text-slate-300 hover:bg-white/5"}`}
        >
          Tous
        </Link>
        {leagues.map((l) => (
          <Link
            key={l}
            href={`/matchs?ligue=${encodeURIComponent(l)}`}
            className={`rounded-full px-4 py-2 text-sm ${searchParams.ligue === l ? "bg-pitch-500 text-night-950 font-semibold" : "border border-white/15 text-slate-300 hover:bg-white/5"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {matches.map((m) => (
          <Link key={m.id} href={`/matchs/${m.id}`} className="card group p-5 transition hover:border-pitch-500/50">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{m.league}</span>
              <span>
                {new Date(m.kickoff).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}{" "}
                {new Date(m.kickoff).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: m.homeTeam.color }}
                >
                  {m.homeTeam.shortName.slice(0, 3)}
                </span>
                <span className="font-semibold">{m.homeTeam.name}</span>
              </div>
              <span className="text-slate-500">—</span>
              <div className="flex items-center gap-3">
                <span className="text-right font-semibold">{m.awayTeam.name}</span>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: m.awayTeam.color }}
                >
                  {m.awayTeam.shortName.slice(0, 3)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-pitch-400 opacity-0 transition group-hover:opacity-100">
              Analyser ce match →
            </p>
          </Link>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="card mt-8 p-10 text-center text-slate-400">
          Aucun match à venir pour ce filtre. Lancez <code className="text-pitch-400">npm run db:seed</code> pour
          générer le calendrier de démonstration.
        </div>
      )}
    </div>
  );
}
