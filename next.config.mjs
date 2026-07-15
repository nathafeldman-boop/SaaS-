/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Mode démo automatique : activé si aucune base n'est configurée (déploiement
    // public zéro-config). Dès qu'une vraie DATABASE_URL est présente, l'app tourne
    // en mode SaaS complet (auth, quotas, Stripe). Peut être forcé via NEXT_PUBLIC_DEMO.
    NEXT_PUBLIC_DEMO: process.env.NEXT_PUBLIC_DEMO ?? (process.env.DATABASE_URL ? "0" : "1"),
  },
};

export default nextConfig;
