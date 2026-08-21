import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Client Prisma paresseux : il n'est réellement instancié qu'au premier accès
 * (première requête). En mode démo (sans base ni DATABASE_URL), le client n'est
 * jamais construit, ce qui permet de déployer une démo publique sans base.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient());
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return Reflect.get(client, prop, receiver);
  },
});
