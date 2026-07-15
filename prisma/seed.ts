import { PrismaClient } from "@prisma/client";
import { TEAMS } from "../src/lib/data/teams";

const prisma = new PrismaClient();

/** Génère un calendrier de matchs à venir sur les 7 prochains jours, par ligue. */
function upcomingKickoffs(dayOffset: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, hour === 20 ? 45 : 0, 0, 0);
  return d;
}

async function main() {
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  const teams = await Promise.all(
    TEAMS.map((t) =>
      prisma.team.create({
        data: {
          name: t.name,
          shortName: t.shortName,
          league: t.league,
          attack: t.attack,
          defense: t.defense,
          form: t.form,
          color: t.color,
        },
      })
    )
  );

  const byLeague = new Map<string, typeof teams>();
  for (const t of teams) {
    const list = byLeague.get(t.league) ?? [];
    list.push(t);
    byLeague.set(t.league, list);
  }

  const hours = [15, 17, 19, 20, 21];
  let created = 0;

  for (const [league, list] of byLeague) {
    // Appariement simple : on mélange (déterministe) et on croise les équipes deux à deux,
    // réparties sur la semaine à venir.
    const shuffled = [...list].sort((a, b) => a.name.localeCompare(b.name));
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const dayOffset = 1 + ((created * 3) % 7);
      const hour = hours[created % hours.length];
      await prisma.match.create({
        data: {
          league,
          kickoff: upcomingKickoffs(dayOffset, hour),
          homeTeamId: shuffled[i].id,
          awayTeamId: shuffled[i + 1].id,
        },
      });
      created++;
    }
    // Deuxième vague de matchs avec des affiches croisées différentes.
    for (let i = 0; i + 3 < shuffled.length; i += 4) {
      const dayOffset = 2 + ((created * 2) % 6);
      const hour = hours[(created + 2) % hours.length];
      await prisma.match.create({
        data: {
          league,
          kickoff: upcomingKickoffs(dayOffset, hour),
          homeTeamId: shuffled[i].id,
          awayTeamId: shuffled[i + 3].id,
        },
      });
      created++;
    }
  }

  console.log(`Seed terminé : ${teams.length} équipes, ${created} matchs à venir.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
