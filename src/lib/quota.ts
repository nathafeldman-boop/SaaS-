import { prisma } from "@/lib/db";
import { getPlan } from "@/lib/plans";

export type QuotaKind = "analysis" | "assistant";

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number | null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Consomme une unité de quota si possible ; renvoie l'état du quota. */
export async function consumeQuota(userId: string, kind: QuotaKind): Promise<QuotaResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, used: 0, limit: 0 };

  const plan = getPlan(user.plan);
  const limit = kind === "analysis" ? plan.analysesPerDay : plan.assistantPerDay;

  const day = today();
  const usage = await prisma.dailyUsage.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day },
    update: {},
  });

  const used = kind === "analysis" ? usage.analysisCount : usage.assistantCount;
  if (limit !== null && used >= limit) {
    return { allowed: false, used, limit };
  }

  await prisma.dailyUsage.update({
    where: { userId_day: { userId, day } },
    data: kind === "analysis" ? { analysisCount: { increment: 1 } } : { assistantCount: { increment: 1 } },
  });

  return { allowed: true, used: used + 1, limit };
}

export async function getUsage(userId: string): Promise<{ analysisCount: number; assistantCount: number }> {
  const usage = await prisma.dailyUsage.findUnique({
    where: { userId_day: { userId, day: today() } },
  });
  return {
    analysisCount: usage?.analysisCount ?? 0,
    assistantCount: usage?.assistantCount ?? 0,
  };
}
