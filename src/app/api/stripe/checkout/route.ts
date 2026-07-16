import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, priceIdForPlan } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const { plan } = await req.json().catch(() => ({}));
  if (plan !== "STARTER" && plan !== "PRO_MONTHLY" && plan !== "LIFETIME") {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }
  const mode: "subscription" | "payment" = plan === "LIFETIME" ? "payment" : "subscription";

  const stripe = getStripe();
  const priceId = priceIdForPlan(plan);
  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: "Paiement non configuré : renseignez STRIPE_SECRET_KEY et les price IDs dans .env" },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/compte?paiement=succes`,
    cancel_url: `${appUrl}/tarifs?paiement=annule`,
    metadata: { userId: user.id, plan },
    ...(mode === "subscription" ? { subscription_data: { metadata: { userId: user.id, plan } } } : {}),
  });

  return NextResponse.json({ url: checkout.url });
}
