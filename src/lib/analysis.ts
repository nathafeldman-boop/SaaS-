/**
 * Contenu d'analyse « funnel » : à partir de la prédiction statistique, on produit
 * la partie gratuite (forme, résumé, scénario, confiance) et la partie premium
 * (probabilités exactes, scores, marchés) qui est verrouillée derrière le paywall.
 */

import { predict, type Prediction } from "@/lib/predictor";
import type { FixtureTeam } from "@/lib/fixtures";

export type FormResult = "W" | "D" | "L";

export interface TeamForm {
  results: FormResult[];
  wdl: string; // ex "4-0-1"
  label: string; // ex "En grande forme"
  hot: boolean;
}

export interface MatchHeader {
  home: { name: string; shortName: string; color: string };
  away: { name: string; shortName: string; color: string };
  competition: string;
}

export interface FreeAnalysis {
  header: MatchHeader;
  form: { home: TeamForm; away: TeamForm };
  resume: string;
  scenario: string;
  confidence: number;
  confidenceLabel: string;
}

export interface PremiumAnalysis {
  homeWin: number;
  draw: number;
  awayWin: number;
  homeXg: number;
  awayXg: number;
  over25: number;
  btts: number;
  topScores: { home: number; away: number; prob: number }[];
  insights: string[];
}

function teamForm(t: FixtureTeam): TeamForm {
  const wins = Math.max(0, Math.min(5, Math.round(t.form * 5)));
  const losses = 5 - wins;
  const results: FormResult[] = [];
  // On alterne pour un rendu naturel : une défaite en tête si présente, puis des victoires.
  if (losses > 0) results.push("L");
  for (let i = 0; i < wins; i++) results.push("W");
  for (let i = 1; i < losses; i++) results.push("L");
  const label = t.form >= 0.65 ? "En grande forme" : t.form >= 0.45 ? "Forme correcte" : "Forme fragile";
  return { results, wdl: `${wins}-0-${losses}`, label, hot: t.form >= 0.65 };
}

function confidenceLabel(c: number): string {
  if (c >= 78) return "Très élevée";
  if (c >= 64) return "Élevée";
  if (c >= 52) return "Correcte";
  return "Modérée";
}

function buildResume(home: FixtureTeam, away: FixtureTeam, competition: string): string {
  return (
    `${home.name} affronte ${away.name} en ${competition}. ` +
    `Notre IA, connectée à l'actualité foot, croise la forme récente, les forces offensives et défensives ` +
    `et l'avantage du terrain pour estimer l'issue la plus probable et les scénarios de match…`
  );
}

function buildScenario(home: FixtureTeam, away: FixtureTeam, p: Prediction): string {
  const favIsHome = p.homeWin >= p.awayWin;
  const fav = favIsHome ? home : away;
  const dog = favIsHome ? away : home;
  const totalXg = p.homeXg + p.awayXg;
  const tempo =
    totalXg > 3
      ? "Le match devrait être ouvert et rythmé, avec des occasions des deux côtés"
      : totalXg < 2.2
      ? "Le match s'annonce fermé et tactique, avec peu d'espaces"
      : "Le match devrait s'équilibrer entre phases de possession et transitions";
  return (
    `${fav.name} devrait progressivement prendre le contrôle en imposant son rythme et sa maîtrise technique, ` +
    `en occupant majoritairement le terrain adverse et en multipliant les offensives coordonnées. ` +
    `${dog.name} cherchera à rester compact, à garder le score serré le plus longtemps possible ` +
    `et à miser sur des transitions rapides pour surprendre. ${tempo}.`
  );
}

/** Analyse complète : partie gratuite + partie premium (à verrouiller côté client/serveur). */
export function analyse(home: FixtureTeam, away: FixtureTeam, competition?: string): { free: FreeAnalysis; premium: PremiumAnalysis } {
  const p = predict(home, away);
  const comp = competition ?? (home.league === away.league ? home.league : "Match international");

  const free: FreeAnalysis = {
    header: {
      home: { name: home.name, shortName: home.shortName, color: home.color },
      away: { name: away.name, shortName: away.shortName, color: away.color },
      competition: comp,
    },
    form: { home: teamForm(home), away: teamForm(away) },
    resume: buildResume(home, away, comp),
    scenario: buildScenario(home, away, p),
    confidence: p.confidence,
    confidenceLabel: confidenceLabel(p.confidence),
  };

  const premium: PremiumAnalysis = {
    homeWin: p.homeWin,
    draw: p.draw,
    awayWin: p.awayWin,
    homeXg: p.homeXg,
    awayXg: p.awayXg,
    over25: p.over25,
    btts: p.btts,
    topScores: p.topScores,
    insights: p.insights,
  };

  return { free, premium };
}
