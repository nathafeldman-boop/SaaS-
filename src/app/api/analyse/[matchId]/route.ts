import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { predict } from "@/lib/predictor";
import { consumeQuota } from "@/lib/quota";
import { getPlan } from "@/lib/plans";

export async function POST(_req: Request, { params }: { params: { matchId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connectez-vous pour lancer une analyse", code: "AUTH" }, { status: 401 });
  }

  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match) {
    return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
  }

  const quota = await consumeQuota(session.user.id, "analysis");
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: `Quota atteint : ${quota.limit} analyses par jour avec votre plan. Passez Pro pour des analyses illimitées.`,
        code: "QUOTA",
        used: quota.used,
        limit: quota.limit,
      },
      { status: 402 }
    );
  }

  const prediction = predict(match.homeTeam, match.awayTeam);
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const plan = getPlan(user?.plan);

  return NextResponse.json({
    match: {
      id: match.id,
      league: match.league,
      kickoff: match.kickoff,
      home: { name: match.homeTeam.name, shortName: match.homeTeam.shortName, color: match.homeTeam.color, form: match.homeTeam.form },
      away: { name: match.awayTeam.name, shortName: match.awayTeam.shortName, color: match.awayTeam.color, form: match.awayTeam.form },
    },
    prediction,
    quota: { used: quota.used, limit: quota.limit, plan: plan.id },
  });
}
