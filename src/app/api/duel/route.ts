import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { consumeQuota } from "@/lib/quota";
import { isPro } from "@/lib/plans";
import { DEMO, findTeam } from "@/lib/fixtures";
import { analyse } from "@/lib/analysis";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const home = findTeam(String(body?.home ?? ""));
  const away = findTeam(String(body?.away ?? ""));
  const unlock = body?.unlock === true;

  if (!home || !away) {
    return NextResponse.json({ error: "Choisissez deux équipes valides." }, { status: 400 });
  }
  if (home.shortName === away.shortName) {
    return NextResponse.json({ error: "Choisissez deux équipes différentes." }, { status: 400 });
  }

  const { free, premium } = analyse(home, away);

  // Mode démo : la partie gratuite est ouverte ; le déblocage révèle la partie premium
  // (aucun paiement) pour laisser tester le produit complet.
  if (DEMO) {
    return NextResponse.json({ free, premium: unlock ? premium : null, locked: !unlock, demo: true });
  }

  // Hors démo : gating réel. Il faut être connecté pour analyser, et Pro pour le premium.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ free, premium: null, locked: true, code: "AUTH" });
  }

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const pro = isPro(user?.plan);

  if (!pro) {
    // Décompte une analyse (quota gratuit) puis renvoie l'aperçu verrouillé.
    await consumeQuota(session.user.id, "analysis");
    return NextResponse.json({ free, premium: null, locked: true, code: "UPGRADE" });
  }

  return NextResponse.json({ free, premium, locked: false });
}
