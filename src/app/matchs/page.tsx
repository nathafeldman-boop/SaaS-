import Link from "next/link";
import { listMatches } from "@/lib/fixtures";
import { predict } from "@/lib/predictor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Matchs à venir — PrediStart",
};

function Badge({ short, color, size = 40 }: { short: string; color: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-lg ring-2 ring-white/10"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.3 }}
    >
      {short.slice(0, 3)}
    </span>
  );
}

export default async function MatchsPage({ searchParams }: { searchParams: { ligue?: string } }) {
  const matches = await listMatches(searchParams.ligue);
  const leagues = ["Ligue 1", "Premier League", "LaLiga", "Serie A", "Bundesliga"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Matchs à venir</h1>
      <p className="mt-2 text-slate-400">Chaque match est déjà pré-analysé par notre IA. Choisis-en un pour l&apos;analyse complète.</p>

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
        {matches.map((m) => {
          const p = predict(m.homeTeam, m.awayTeam);
          const favHome = p.homeWin >= p.awayWin;
          const fav = favHome ? m.homeTeam : m.awayTeam;
          const favProb = Math.round(Math.max(p.homeWin, p.awayWin) * 100);
          const h = Math.round(p.homeWin * 100);
          const d = Math.round(p.draw * 100);
          const a = Math.round(p.awayWin * 100);
          return (
            <Link key={m.id} href={`/matchs/${m.id}`} className="card group p-5 transition hover:border-pitch-500/50">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{m.league}</span>
                <span>
                  {new Date(m.kickoff).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}{" "}
                  {new Date(m.kickoff).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge short={m.homeTeam.shortName} color={m.homeTeam.color} size={36} />
                  <span className="truncate text-sm font-semibold">{m.homeTeam.shortName}</span>
                </div>
                <span className="shrink-0 text-xs text-slate-500">VS</span>
                <div className="flex min-w-0 items-center justify-end gap-2">
                  <span className="truncate text-right text-sm font-semibold">{m.awayTeam.shortName}</span>
                  <Badge short={m.awayTeam.shortName} color={m.awayTeam.color} size={36} />
                </div>
              </div>

              {/* Mini-barre 1N2 */}
              <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/10">
                <div style={{ width: `${h}%`, backgroundColor: "#14bf5b" }} />
                <div style={{ width: `${d}%`, backgroundColor: "#475569" }} />
                <div style={{ width: `${a}%`, backgroundColor: "#60a5fa" }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                <span>{h}%</span>
                <span>Nul {d}%</span>
                <span>{a}%</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-slate-400">
                  Favori : <span className="font-semibold text-pitch-300">{fav.shortName}</span> ({favProb}%)
                </span>
                <span className="text-sm font-semibold text-pitch-400">Analyser →</span>
              </div>
            </Link>
          );
        })}
      </div>

      {matches.length === 0 && (
        <div className="card mt-8 p-10 text-center text-slate-400">Aucun match à venir pour ce filtre.</div>
      )}
    </div>
  );
}
