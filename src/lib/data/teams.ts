/**
 * Ratings des équipes (attaque / défense relatives à la moyenne de la ligue, forme sur 5 matchs).
 * En production, ces valeurs sont recalculées chaque nuit à partir des résultats
 * (voir src/lib/data/provider.ts pour brancher un fournisseur de données live).
 */

export interface SeedTeam {
  name: string;
  shortName: string;
  league: string;
  attack: number;
  defense: number;
  form: number;
  color: string;
}

export const LEAGUES = {
  LIGUE_1: "Ligue 1",
  PREMIER_LEAGUE: "Premier League",
  LIGA: "LaLiga",
  SERIE_A: "Serie A",
  BUNDESLIGA: "Bundesliga",
} as const;

export const TEAMS: SeedTeam[] = [
  // ——— Ligue 1 ———
  { name: "Paris Saint-Germain", shortName: "PSG", league: LEAGUES.LIGUE_1, attack: 1.62, defense: 0.62, form: 0.85, color: "#004170" },
  { name: "AS Monaco", shortName: "ASM", league: LEAGUES.LIGUE_1, attack: 1.28, defense: 0.92, form: 0.65, color: "#e63329" },
  { name: "Olympique de Marseille", shortName: "OM", league: LEAGUES.LIGUE_1, attack: 1.32, defense: 0.95, form: 0.7, color: "#2faee0" },
  { name: "LOSC Lille", shortName: "LOSC", league: LEAGUES.LIGUE_1, attack: 1.12, defense: 0.82, form: 0.6, color: "#e01e13" },
  { name: "Olympique Lyonnais", shortName: "OL", league: LEAGUES.LIGUE_1, attack: 1.18, defense: 1.02, form: 0.55, color: "#da001a" },
  { name: "OGC Nice", shortName: "OGCN", league: LEAGUES.LIGUE_1, attack: 1.02, defense: 0.85, form: 0.5, color: "#c8102e" },
  { name: "RC Lens", shortName: "RCL", league: LEAGUES.LIGUE_1, attack: 1.05, defense: 0.9, form: 0.6, color: "#fdd116" },
  { name: "Stade Rennais", shortName: "SRFC", league: LEAGUES.LIGUE_1, attack: 1.08, defense: 1.05, form: 0.45, color: "#e13327" },
  { name: "RC Strasbourg", shortName: "RCSA", league: LEAGUES.LIGUE_1, attack: 1.05, defense: 1.0, form: 0.65, color: "#00a0e0" },
  { name: "Stade Brestois", shortName: "SB29", league: LEAGUES.LIGUE_1, attack: 0.98, defense: 1.08, form: 0.5, color: "#e30613" },
  { name: "Toulouse FC", shortName: "TFC", league: LEAGUES.LIGUE_1, attack: 0.92, defense: 0.98, form: 0.45, color: "#5f259f" },
  { name: "Stade de Reims", shortName: "SDR", league: LEAGUES.LIGUE_1, attack: 0.85, defense: 1.05, form: 0.35, color: "#e30613" },
  { name: "FC Nantes", shortName: "FCN", league: LEAGUES.LIGUE_1, attack: 0.82, defense: 1.1, form: 0.4, color: "#fcd405" },
  { name: "AJ Auxerre", shortName: "AJA", league: LEAGUES.LIGUE_1, attack: 0.88, defense: 1.12, form: 0.45, color: "#004a9c" },
  { name: "Angers SCO", shortName: "SCO", league: LEAGUES.LIGUE_1, attack: 0.75, defense: 1.15, form: 0.4, color: "#000000" },
  { name: "Le Havre AC", shortName: "HAC", league: LEAGUES.LIGUE_1, attack: 0.78, defense: 1.2, form: 0.35, color: "#0060ac" },
  { name: "Montpellier HSC", shortName: "MHSC", league: LEAGUES.LIGUE_1, attack: 0.8, defense: 1.25, form: 0.3, color: "#f26f21" },
  { name: "AS Saint-Étienne", shortName: "ASSE", league: LEAGUES.LIGUE_1, attack: 0.82, defense: 1.22, form: 0.4, color: "#309e50" },

  // ——— Premier League ———
  { name: "Manchester City", shortName: "MCI", league: LEAGUES.PREMIER_LEAGUE, attack: 1.5, defense: 0.72, form: 0.75, color: "#6cabdd" },
  { name: "Arsenal", shortName: "ARS", league: LEAGUES.PREMIER_LEAGUE, attack: 1.42, defense: 0.65, form: 0.8, color: "#ef0107" },
  { name: "Liverpool", shortName: "LIV", league: LEAGUES.PREMIER_LEAGUE, attack: 1.48, defense: 0.75, form: 0.7, color: "#c8102e" },
  { name: "Chelsea", shortName: "CHE", league: LEAGUES.PREMIER_LEAGUE, attack: 1.3, defense: 0.88, form: 0.65, color: "#034694" },
  { name: "Tottenham", shortName: "TOT", league: LEAGUES.PREMIER_LEAGUE, attack: 1.25, defense: 1.02, form: 0.5, color: "#132257" },
  { name: "Manchester United", shortName: "MUN", league: LEAGUES.PREMIER_LEAGUE, attack: 1.1, defense: 1.0, form: 0.55, color: "#da291c" },
  { name: "Newcastle", shortName: "NEW", league: LEAGUES.PREMIER_LEAGUE, attack: 1.2, defense: 0.92, form: 0.6, color: "#241f20" },
  { name: "Aston Villa", shortName: "AVL", league: LEAGUES.PREMIER_LEAGUE, attack: 1.15, defense: 0.95, form: 0.6, color: "#95bfe5" },
  { name: "Brighton", shortName: "BHA", league: LEAGUES.PREMIER_LEAGUE, attack: 1.08, defense: 1.05, form: 0.55, color: "#0057b8" },
  { name: "West Ham", shortName: "WHU", league: LEAGUES.PREMIER_LEAGUE, attack: 0.95, defense: 1.12, form: 0.4, color: "#7a263a" },

  // ——— LaLiga ———
  { name: "Real Madrid", shortName: "RMA", league: LEAGUES.LIGA, attack: 1.52, defense: 0.7, form: 0.8, color: "#febe10" },
  { name: "FC Barcelone", shortName: "BAR", league: LEAGUES.LIGA, attack: 1.55, defense: 0.78, form: 0.75, color: "#a50044" },
  { name: "Atlético Madrid", shortName: "ATM", league: LEAGUES.LIGA, attack: 1.25, defense: 0.68, form: 0.65, color: "#cb3524" },
  { name: "Athletic Bilbao", shortName: "ATH", league: LEAGUES.LIGA, attack: 1.1, defense: 0.82, form: 0.6, color: "#ee2523" },
  { name: "Villarreal", shortName: "VIL", league: LEAGUES.LIGA, attack: 1.15, defense: 0.95, form: 0.6, color: "#ffe667" },
  { name: "Real Sociedad", shortName: "RSO", league: LEAGUES.LIGA, attack: 1.02, defense: 0.9, form: 0.5, color: "#0067b1" },
  { name: "Real Betis", shortName: "BET", league: LEAGUES.LIGA, attack: 1.05, defense: 1.0, form: 0.55, color: "#00954c" },
  { name: "Séville FC", shortName: "SEV", league: LEAGUES.LIGA, attack: 0.92, defense: 1.08, form: 0.4, color: "#d8092f" },

  // ——— Serie A ———
  { name: "Inter Milan", shortName: "INT", league: LEAGUES.SERIE_A, attack: 1.45, defense: 0.7, form: 0.75, color: "#0068a8" },
  { name: "Naples", shortName: "NAP", league: LEAGUES.SERIE_A, attack: 1.3, defense: 0.75, form: 0.7, color: "#12a0d7" },
  { name: "Juventus", shortName: "JUV", league: LEAGUES.SERIE_A, attack: 1.18, defense: 0.72, form: 0.6, color: "#000000" },
  { name: "AC Milan", shortName: "MIL", league: LEAGUES.SERIE_A, attack: 1.25, defense: 0.9, form: 0.6, color: "#fb090b" },
  { name: "Atalanta", shortName: "ATA", league: LEAGUES.SERIE_A, attack: 1.35, defense: 0.88, form: 0.65, color: "#1e71b8" },
  { name: "AS Rome", shortName: "ROM", league: LEAGUES.SERIE_A, attack: 1.12, defense: 0.85, form: 0.55, color: "#8e1f2f" },
  { name: "Lazio", shortName: "LAZ", league: LEAGUES.SERIE_A, attack: 1.08, defense: 0.92, form: 0.5, color: "#87d8f7" },
  { name: "Fiorentina", shortName: "FIO", league: LEAGUES.SERIE_A, attack: 1.05, defense: 0.95, form: 0.55, color: "#6a2c91" },

  // ——— Bundesliga ———
  { name: "Bayern Munich", shortName: "BAY", league: LEAGUES.BUNDESLIGA, attack: 1.6, defense: 0.75, form: 0.8, color: "#dc052d" },
  { name: "Bayer Leverkusen", shortName: "B04", league: LEAGUES.BUNDESLIGA, attack: 1.4, defense: 0.8, form: 0.7, color: "#e32221" },
  { name: "Borussia Dortmund", shortName: "BVB", league: LEAGUES.BUNDESLIGA, attack: 1.35, defense: 0.95, form: 0.6, color: "#fde100" },
  { name: "RB Leipzig", shortName: "RBL", league: LEAGUES.BUNDESLIGA, attack: 1.28, defense: 0.9, form: 0.6, color: "#dd0741" },
  { name: "Eintracht Francfort", shortName: "SGE", league: LEAGUES.BUNDESLIGA, attack: 1.18, defense: 1.02, form: 0.6, color: "#e1000f" },
  { name: "VfB Stuttgart", shortName: "VFB", league: LEAGUES.BUNDESLIGA, attack: 1.2, defense: 1.0, form: 0.55, color: "#e32219" },
  { name: "SC Fribourg", shortName: "SCF", league: LEAGUES.BUNDESLIGA, attack: 1.0, defense: 1.0, form: 0.5, color: "#000000" },
  { name: "Werder Brême", shortName: "SVW", league: LEAGUES.BUNDESLIGA, attack: 1.02, defense: 1.1, form: 0.5, color: "#1d9053" },
];
