import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { getUsage } from "@/lib/quota";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/connexion");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/connexion");

  const plan = getPlan(user.plan);
  const usage = await getUsage(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Mon compte</h1>
      <p className="mt-1 text-slate-400">{user.email}</p>

      <div className="card mt-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Plan actuel</p>
            <p className="mt-1 text-2xl font-bold">
              {plan.label}
              {plan.id !== "FREE" && <span className="ml-2 text-sm font-normal text-pitch-400">{plan.price} {plan.priceDetail}</span>}
            </p>
          </div>
          {plan.id === "FREE" ? (
            <Link href="/tarifs" className="btn-primary">Passer Pro</Link>
          ) : (
            <ManageSubscriptionButton />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm text-slate-400">Analyses aujourd&apos;hui</p>
          <p className="mt-2 text-3xl font-bold">
            {usage.analysisCount}
            <span className="text-base font-normal text-slate-400">
              {plan.analysesPerDay !== null ? ` / ${plan.analysesPerDay}` : " · illimité"}
            </span>
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-400">Questions à l&apos;assistant aujourd&apos;hui</p>
          <p className="mt-2 text-3xl font-bold">
            {usage.assistantCount}
            <span className="text-base font-normal text-slate-400">
              {plan.assistantPerDay !== null ? ` / ${plan.assistantPerDay}` : " · illimité"}
            </span>
          </p>
        </div>
      </div>

      {plan.id === "FREE" && (
        <div className="card mt-6 border-pitch-500/40 p-6">
          <h2 className="font-semibold">Débloquez l&apos;illimité</h2>
          <p className="mt-2 text-sm text-slate-400">
            Analyses et assistant IA sans limite, statistiques avancées et alertes avant coup d&apos;envoi, dès
            9,99 €/mois en formule annuelle.
          </p>
          <Link href="/tarifs" className="btn-primary mt-4 inline-flex">Voir les plans Pro</Link>
        </div>
      )}
    </div>
  );
}
