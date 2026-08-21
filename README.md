# ⚽ PrediStart — Le match, décrypté avant le coup d'envoi

**PrediStart** est un SaaS d'analyse statistique de matchs de football par IA, concurrent direct de Visifoot, positionné pour capter le même marché avec un pricing plus agressif et un produit plus généreux.

> Outil d'information et d'analyse uniquement — pas un service de paris, aucun résultat garanti.

## Le produit

- **Moteur de prédiction réel** : modèle de Poisson bivarié avec correction Dixon-Coles (la méthode de référence académique en modélisation football). Probabilités 1N2, scores exacts, buts attendus (xG), +/-2,5 buts, BTTS, indice de confiance et « lecture du match » générée automatiquement.
- **Assistant IA** : chat en français branché sur les données du modèle (API Claude, avec fallback local déterministe si aucune clé n'est configurée — l'app fonctionne sans aucune clé externe).
- **5 grands championnats** : Ligue 1 (couverture complète), Premier League, LaLiga, Serie A, Bundesliga.
- **Freemium + abonnements Stripe** : quotas journaliers gratuits, upgrade en 2 clics, portail de facturation, webhook de synchronisation des plans.

## Pricing (pensé pour battre Visifoot sur le MRR)

| | Visifoot | **PrediStart** |
|---|---|---|
| Gratuit | accès limité | **3 analyses + 5 questions IA / jour** |
| Mensuel | 22,90 €/mois, plafonné à 10 analyses/jour | **14,99 €/mois, illimité** (-35 %) |
| Annuel | 69,99 €/an | **119,88 €/an (9,99 €/mois, -33 %)** |

Logique : leur mensuel est cher et bridé, leur annuel est bradé (5,80 €/mois) — ce qui cannibalise leur MRR. PrediStart inverse : un mensuel nettement moins cher **et** illimité pour convertir leurs abonnés frustrés par le plafond, et un annuel à 9,99 €/mois qui génère ~1,7× plus de revenu par abonné annuel que le leur.

**Objectif MRR — chemin type :** avec un ARPU mixte ~12 €/mois (60 % annuel / 40 % mensuel), il faut ≈ 850 abonnés payants pour 10 k€ de MRR. À 3 % de conversion free→paid, cela demande ~28 000 inscrits — atteignable sur ce marché (audience Visifoot : Twitter/X foot FR, TikTok pronos, communautés Discord).

### Go-to-market (canaux qui marchent déjà pour Visifoot)

1. **Twitter/X + TikTok foot FR** : publier chaque jour l'analyse d'un gros match (visuel généré depuis la page analyse) avec lien — c'est exactement le moteur d'acquisition de Visifoot.
2. **Programme d'affiliation** (30 % récurrent, 12 mois) pour les comptes foot/pronos — leur croissance vient des affiliés.
3. **SEO programmatique** : une page publique par affiche (« PSG – OM : probabilités et score le plus probable »), indexable, avec l'analyse détaillée derrière l'inscription gratuite.
4. **Emails avant coup d'envoi** (jour de match) : le meilleur levier de réactivation, et l'argument n°1 du plan Pro.
5. **Upgrade contextuel** : le mur de quota s'affiche au moment où l'utilisateur veut une 4ᵉ analyse — le moment de plus forte intention.

## Stack technique

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma (SQLite en dev, Postgres en prod) · NextAuth (credentials, JWT) · Stripe (checkout, webhook, portail) · Anthropic Claude (assistant IA, optionnel).

```
src/
├── app/                  # Pages (landing, /matchs, /matchs/[id], /assistant, /tarifs, /connexion, /inscription, /compte)
│   └── api/              # analyse (quota), assistant (IA), inscription, stripe (checkout/webhook/portail), auth
├── components/           # Navbar, AnalysisPanel, chat, etc.
└── lib/
    ├── predictor.ts      # Modèle Poisson/Dixon-Coles + insights en français
    ├── data/teams.ts     # Ratings des 52 équipes (5 championnats)
    ├── plans.ts          # Plans & quotas
    ├── quota.ts          # Compteurs journaliers
    └── auth.ts / stripe.ts / db.ts
```

## Démarrage

```bash
cp .env.example .env        # renseigner NEXTAUTH_SECRET (openssl rand -base64 32)
npm install
npx prisma db push          # crée la base SQLite
npm run db:seed             # 52 équipes + calendrier de matchs de démo
npm run dev                 # http://localhost:3000
```

L'app est **entièrement fonctionnelle sans aucune clé externe** : inscription, quotas, analyses et assistant (mode modèle local). Pour activer :

- **Paiements** : créer 2 prix récurrents dans Stripe (14,99 €/mois et 119,88 €/an) et renseigner `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`. Webhook : `POST /api/stripe/webhook` (événements `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`).
- **Assistant IA (Claude)** : renseigner `ANTHROPIC_API_KEY`.
- **Prod** : passer `DATABASE_URL` sur Postgres et déployer (Vercel/Fly/Railway).

## Roadmap post-MVP

- [ ] Brancher un fournisseur de données live (API-Football / football-data.org) pour recalculer les ratings chaque nuit (`src/lib/data/`)
- [ ] Pages publiques SEO par match + Open Graph images pour le partage social
- [ ] Alertes email/push avant coup d'envoi (plan Pro)
- [ ] Analyse live pendant le match (plan Pro)
- [ ] Export CSV des analyses (plan Annuel), programme d'affiliation, app mobile (Capacitor)
