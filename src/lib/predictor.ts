/**
 * Moteur de prédiction PrediStart.
 *
 * Modèle de Poisson bivarié inspiré de Dixon-Coles (1997) :
 * les buts marqués par chaque équipe suivent une loi de Poisson dont
 * l'intensité dépend de la force offensive de l'équipe, de la faiblesse
 * défensive de l'adversaire, de l'avantage du terrain et de la forme récente.
 * Une correction de dépendance (tau) ajuste les scores faibles (0-0, 1-0, 0-1, 1-1),
 * connus pour être mal capturés par deux Poisson indépendantes.
 */

export interface TeamRating {
  name: string;
  shortName: string;
  league: string;
  /** Force offensive relative (1 = moyenne de la ligue) */
  attack: number;
  /** Solidité défensive relative (1 = moyenne ; <1 = encaisse moins) */
  defense: number;
  /** Forme récente sur 5 matchs, entre 0 (mauvaise) et 1 (excellente) */
  form: number;
}

export interface ScoreProb {
  home: number;
  away: number;
  prob: number;
}

export interface Prediction {
  homeXg: number;
  awayXg: number;
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  over15: number;
  btts: number;
  topScores: ScoreProb[];
  /** Indice de confiance 0-100 : écart entre l'issue la plus probable et les autres */
  confidence: number;
  insights: string[];
}

/** Moyenne de buts à domicile / extérieur dans les 5 grands championnats. */
const LEAGUE_HOME_GOALS = 1.53;
const LEAGUE_AWAY_GOALS = 1.23;
/** Paramètre de dépendance Dixon-Coles pour les scores faibles. */
const RHO = -0.08;
/** Amplitude de l'effet forme sur l'intensité de buts (±10 %). */
const FORM_WEIGHT = 0.2;
const MAX_GOALS = 8;

function poisson(k: number, lambda: number): number {
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

/** Correction Dixon-Coles des scores 0-0, 1-0, 0-1, 1-1. */
function tau(x: number, y: number, lambda: number, mu: number): number {
  if (x === 0 && y === 0) return 1 - lambda * mu * RHO;
  if (x === 0 && y === 1) return 1 + lambda * RHO;
  if (x === 1 && y === 0) return 1 + mu * RHO;
  if (x === 1 && y === 1) return 1 - RHO;
  return 1;
}

function formFactor(form: number): number {
  return 1 + FORM_WEIGHT * (form - 0.5);
}

export function expectedGoals(home: TeamRating, away: TeamRating): { homeXg: number; awayXg: number } {
  const homeXg = LEAGUE_HOME_GOALS * home.attack * away.defense * formFactor(home.form);
  const awayXg = LEAGUE_AWAY_GOALS * away.attack * home.defense * formFactor(away.form);
  return { homeXg, awayXg };
}

export function predict(home: TeamRating, away: TeamRating): Prediction {
  const { homeXg, awayXg } = expectedGoals(home, away);

  // Matrice des probabilités de score, corrigée puis renormalisée.
  const matrix: number[][] = [];
  let total = 0;
  for (let h = 0; h <= MAX_GOALS; h++) {
    matrix[h] = [];
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = poisson(h, homeXg) * poisson(a, awayXg) * tau(h, a, homeXg, awayXg);
      matrix[h][a] = Math.max(p, 0);
      total += matrix[h][a];
    }
  }

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over25 = 0;
  let over15 = 0;
  let btts = 0;
  const scores: ScoreProb[] = [];

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = matrix[h][a] / total;
      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;
      if (h + a > 2.5) over25 += p;
      if (h + a > 1.5) over15 += p;
      if (h > 0 && a > 0) btts += p;
      scores.push({ home: h, away: a, prob: p });
    }
  }

  scores.sort((x, y) => y.prob - x.prob);
  const topScores = scores.slice(0, 5);

  const sorted = [homeWin, draw, awayWin].sort((x, y) => y - x);
  const confidence = Math.round(Math.min(100, 40 + (sorted[0] - sorted[1]) * 150));

  const insights = buildInsights(home, away, { homeXg, awayXg, homeWin, draw, awayWin, over25, btts });

  return {
    homeXg,
    awayXg,
    homeWin,
    draw,
    awayWin,
    over25,
    under25: 1 - over25,
    over15,
    btts,
    topScores,
    confidence,
    insights,
  };
}

function pct(x: number): string {
  return `${Math.round(x * 100)} %`;
}

function buildInsights(
  home: TeamRating,
  away: TeamRating,
  p: { homeXg: number; awayXg: number; homeWin: number; draw: number; awayWin: number; over25: number; btts: number }
): string[] {
  const insights: string[] = [];

  const favorite = p.homeWin > p.awayWin ? home : away;
  const favProb = Math.max(p.homeWin, p.awayWin);
  if (favProb > 0.55) {
    insights.push(`${favorite.name} part nettement favori (${pct(favProb)} de probabilité de victoire).`);
  } else if (Math.abs(p.homeWin - p.awayWin) < 0.08) {
    insights.push(`Match très équilibré : aucune équipe ne dépasse ${pct(favProb)} de probabilité de victoire.`);
  } else {
    insights.push(`${favorite.name} a un léger avantage (${pct(favProb)}), mais l'issue reste ouverte.`);
  }

  const totalXg = p.homeXg + p.awayXg;
  if (totalXg > 3) {
    insights.push(`Match à fort potentiel offensif : ${totalXg.toFixed(1)} buts attendus au total (plus de 2,5 buts à ${pct(p.over25)}).`);
  } else if (totalXg < 2.2) {
    insights.push(`Profil de match fermé : seulement ${totalXg.toFixed(1)} buts attendus, l'under 2,5 est à ${pct(1 - p.over25)}.`);
  }

  if (p.btts > 0.6) {
    insights.push(`Les deux équipes ont de bonnes chances de marquer (${pct(p.btts)}).`);
  } else if (p.btts < 0.42) {
    insights.push(`Au moins une équipe pourrait rester muette : les deux équipes ne marquent qu'à ${pct(p.btts)}.`);
  }

  if (home.form >= 0.7 && away.form <= 0.4) {
    insights.push(`Dynamique contrastée : ${home.name} est en pleine forme alors que ${away.name} traverse une période difficile.`);
  } else if (away.form >= 0.7 && home.form <= 0.4) {
    insights.push(`Attention à la forme : ${away.name} reste sur une excellente série, contrairement à ${home.name}.`);
  }

  if (home.defense <= 0.85 && away.defense <= 0.85) {
    insights.push(`Deux défenses solides s'affrontent : les espaces devraient être rares.`);
  } else if (home.defense >= 1.15 && away.defense >= 1.15) {
    insights.push(`Deux défenses friables : les attaquants devraient avoir des occasions des deux côtés.`);
  }

  if (p.draw > 0.28) {
    insights.push(`Le match nul est une issue crédible à ${pct(p.draw)}.`);
  }

  return insights;
}
