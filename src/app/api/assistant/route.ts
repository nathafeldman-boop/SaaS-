import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { predict } from "@/lib/predictor";
import { consumeQuota } from "@/lib/quota";
import { DEMO, listMatches } from "@/lib/fixtures";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Tu es l'assistant football d'PrediStart, une plateforme française d'analyse statistique de matchs.
Tu réponds en français, de façon claire et concise.
Tu t'appuies exclusivement sur les données statistiques fournies dans le contexte (probabilités calculées par notre modèle de Poisson, forces d'attaque/défense, forme récente).
Tu expliques les tendances d'un match, compares les équipes et vulgarises les statistiques.
Tu ne donnes jamais de conseil de pari ni de garantie de résultat : le football reste imprévisible, et tu le rappelles quand c'est pertinent.
Si une question sort du football, redirige poliment vers ton domaine.`;

interface MatchContext {
  label: string;
  detail: string;
}

async function buildContext(question: string): Promise<MatchContext[]> {
  const matches = (await listMatches()).slice(0, 40);

  const q = question.toLowerCase();
  const relevant = matches.filter(
    (m) =>
      q.includes(m.homeTeam.name.toLowerCase()) ||
      q.includes(m.awayTeam.name.toLowerCase()) ||
      q.includes(m.homeTeam.shortName.toLowerCase()) ||
      q.includes(m.awayTeam.shortName.toLowerCase())
  );

  const selected = (relevant.length > 0 ? relevant : matches).slice(0, 5);

  return selected.map((m) => {
    const p = predict(m.homeTeam, m.awayTeam);
    return {
      label: `${m.homeTeam.name} vs ${m.awayTeam.name} (${m.league})`,
      detail:
        `xG ${p.homeXg.toFixed(2)} - ${p.awayXg.toFixed(2)} | ` +
        `1: ${Math.round(p.homeWin * 100)}% N: ${Math.round(p.draw * 100)}% 2: ${Math.round(p.awayWin * 100)}% | ` +
        `+2,5 buts: ${Math.round(p.over25 * 100)}% | BTTS: ${Math.round(p.btts * 100)}% | ` +
        `Score le plus probable: ${p.topScores[0].home}-${p.topScores[0].away} | ` +
        `Forme domicile ${Math.round(m.homeTeam.form * 100)}/100, extérieur ${Math.round(m.awayTeam.form * 100)}/100`,
    };
  });
}

/** Réponse locale déterministe quand aucune clé API n'est configurée. */
function localAnswer(question: string, context: MatchContext[]): string {
  if (context.length === 0) {
    return "Je n'ai pas trouvé de match correspondant à votre question dans les rencontres à venir. Essayez avec le nom d'une équipe des 5 grands championnats.";
  }
  const lines = context.map((c) => `• ${c.label} — ${c.detail}`);
  return (
    `Voici ce que notre modèle statistique indique :\n\n${lines.join("\n\n")}\n\n` +
    `Ces probabilités sont issues d'un modèle de Poisson calibré sur les forces offensives et défensives de chaque équipe. ` +
    `Le football reste imprévisible : aucune analyse ne garantit un résultat.`
  );
}

export async function POST(req: Request) {
  const { question } = await req.json().catch(() => ({}));
  if (!question || typeof question !== "string" || question.length > 1000) {
    return NextResponse.json({ error: "Question invalide" }, { status: 400 });
  }

  // Mode démo : assistant ouvert, sans authentification ni quota.
  if (!DEMO) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Connectez-vous pour utiliser l'assistant", code: "AUTH" }, { status: 401 });
    }

    const quota = await consumeQuota(session.user.id, "assistant");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Quota atteint : ${quota.limit} questions par jour avec votre plan. Passez Pro pour un assistant illimité.`,
          code: "QUOTA",
        },
        { status: 402 }
      );
    }
  }

  const context = await buildContext(question);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ answer: localAnswer(question, context), source: "modele" });
  }

  try {
    const client = new Anthropic();
    const contextText = context.map((c) => `${c.label}\n${c.detail}`).join("\n\n");
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Données de notre modèle sur les matchs à venir :\n\n${contextText}\n\nQuestion de l'utilisateur : ${question}`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ answer: text || localAnswer(question, context), source: "ia" });
  } catch {
    return NextResponse.json({ answer: localAnswer(question, context), source: "modele" });
  }
}
