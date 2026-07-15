import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AnalysisPanel } from "@/components/AnalysisPanel";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: { id: string } }) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm text-slate-400">
        {match.league} —{" "}
        {new Date(match.kickoff).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à{" "}
        {new Date(match.kickoff).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </p>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: match.homeTeam.color }}
          >
            {match.homeTeam.shortName.slice(0, 3)}
          </span>
          <h1 className="text-2xl font-bold md:text-3xl">{match.homeTeam.name}</h1>
        </div>
        <span className="text-2xl font-light text-slate-500">vs</span>
        <div className="flex items-center gap-4">
          <h1 className="text-right text-2xl font-bold md:text-3xl">{match.awayTeam.name}</h1>
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: match.awayTeam.color }}
          >
            {match.awayTeam.shortName.slice(0, 3)}
          </span>
        </div>
      </div>

      <AnalysisPanel matchId={match.id} homeName={match.homeTeam.shortName} awayName={match.awayTeam.shortName} />
    </div>
  );
}
