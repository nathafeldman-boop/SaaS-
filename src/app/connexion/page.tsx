"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/matchs");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">Connexion</h1>
      <p className="mt-2 text-slate-400">Ravi de vous revoir.</p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-8">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        <p className="text-center text-sm text-slate-400">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-pitch-400 underline">
            Inscription gratuite
          </Link>
        </p>
      </form>
    </div>
  );
}
