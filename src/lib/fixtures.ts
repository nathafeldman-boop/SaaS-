/**
 * Génération déterministe des matchs pour le mode démo (sans base de données).
 *
 * Reproduit la logique d'appariement du seed Prisma pour fournir exactement les
 * mêmes rencontres, mais calculées en mémoire à partir de `TEAMS`. Cela permet de
 * déployer une démo publique fonctionnelle sans base ni variables d'environnement.
 */

import { TEAMS, type SeedTeam } from "@/lib/data/teams";

/** Le mode démo est activé quand aucune vraie base n'est configurée. */
export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export interface FixtureTeam {
  name: string;
  shortName: string;
  league: string;
  attack: number;
  defense: number;
  form: number;
  color: string;
}

export interface FixtureMatch {
  id: string;
  league: string;
  kickoff: Date;
  status: string;
  homeTeam: FixtureTeam;
  awayTeam: FixtureTeam;
}

function kickoff(dayOffset: number, hour: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, hour === 20 ? 45 : 0, 0, 0);
  return d;
}

function team(t: SeedTeam): FixtureTeam {
  return {
    name: t.name,
    shortName: t.shortName,
    league: t.league,
    attack: t.attack,
    defense: t.defense,
    form: t.form,
    color: t.color,
  };
}

let cache: FixtureMatch[] | null = null;

export function computeFixtures(): FixtureMatch[] {
  if (cache) return cache;

  const byLeague = new Map<string, SeedTeam[]>();
  for (const t of TEAMS) {
    const list = byLeague.get(t.league) ?? [];
    list.push(t);
    byLeague.set(t.league, list);
  }

  const hours = [15, 17, 19, 20, 21];
  const matches: FixtureMatch[] = [];
  let created = 0;

  for (const [league, list] of byLeague) {
    const shuffled = [...list].sort((a, b) => a.name.localeCompare(b.name));
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const dayOffset = 1 + ((created * 3) % 7);
      matches.push({
        id: `${shuffled[i].shortName}-${shuffled[i + 1].shortName}`,
        league,
        kickoff: kickoff(dayOffset, hours[created % hours.length]),
        status: "SCHEDULED",
        homeTeam: team(shuffled[i]),
        awayTeam: team(shuffled[i + 1]),
      });
      created++;
    }
    for (let i = 0; i + 3 < shuffled.length; i += 4) {
      const dayOffset = 2 + ((created * 2) % 6);
      matches.push({
        id: `${shuffled[i].shortName}-${shuffled[i + 3].shortName}`,
        league,
        kickoff: kickoff(dayOffset, hours[(created + 2) % hours.length]),
        status: "SCHEDULED",
        homeTeam: team(shuffled[i]),
        awayTeam: team(shuffled[i + 3]),
      });
      created++;
    }
  }

  matches.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime());
  cache = matches;
  return matches;
}

/** Accès données unifié : fixtures en démo, Prisma sinon. */
export async function listMatches(league?: string): Promise<FixtureMatch[]> {
  if (DEMO) {
    return computeFixtures().filter((m) => !league || m.league === league);
  }
  const { prisma } = await import("@/lib/db");
  return prisma.match.findMany({
    where: { kickoff: { gte: new Date() }, ...(league ? { league } : {}) },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoff: "asc" },
  }) as unknown as Promise<FixtureMatch[]>;
}

export async function getMatchById(id: string): Promise<FixtureMatch | null> {
  if (DEMO) {
    return computeFixtures().find((m) => m.id === id) ?? null;
  }
  const { prisma } = await import("@/lib/db");
  return prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true },
  }) as unknown as Promise<FixtureMatch | null>;
}

/** Toutes les équipes (pour les sélecteurs de l'analyseur). */
export function allTeams(): FixtureTeam[] {
  return TEAMS.map(team);
}

/** Recherche une équipe par nom complet ou nom court (insensible à la casse). */
export function findTeam(idOrName: string): FixtureTeam | null {
  const q = idOrName.trim().toLowerCase();
  const t =
    TEAMS.find((x) => x.shortName.toLowerCase() === q || x.name.toLowerCase() === q) ??
    TEAMS.find((x) => x.name.toLowerCase().includes(q) && q.length >= 3);
  return t ? team(t) : null;
}

export async function firstMatch(): Promise<FixtureMatch | null> {
  if (DEMO) {
    return computeFixtures()[0] ?? null;
  }
  const { prisma } = await import("@/lib/db");
  return prisma.match.findFirst({
    where: { kickoff: { gte: new Date() } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoff: "asc" },
  }) as unknown as Promise<FixtureMatch | null>;
}
