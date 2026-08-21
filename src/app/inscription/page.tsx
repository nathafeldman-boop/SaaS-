"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function InscriptionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur inattendue");
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (result?.error) {
        router.push("/connexion");
      } else {
        router.push("/matchs");
        router.refresh();
      }
    } catch {
      setError("Erreur réseau, réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">Créer un compte</h1>
      <p className="mt-2 text-slate-400">3 analyses et 5 questions IA par jour, gratuitement. Sans carte bancaire.</p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-8">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}
        <div>
          <label className="mb-1 block text-sm text-slate-400">Prénom ou pseudo</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" maxLength={80} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Mot de passe (8 caractères min.)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Création…" : "Créer mon compte gratuit"}
        </button>
        <p className="text-center text-sm text-slate-400">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-pitch-400 underline">
            Connexion
          </Link>
        </p>
      </form>
    </div>
  );
}
