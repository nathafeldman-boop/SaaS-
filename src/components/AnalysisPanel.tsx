"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ScoreProb {
  home: number;
  away: number;
  prob: number;
}

interface Prediction {
  homeXg: number;
  awayXg: number;
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  over15: number;
  btts: number;
  topScores: ScoreProb[];
  confidence: number;
  insights: string[];
}

interface AnalysisResponse {
  prediction: Prediction;
  quota: { used: number; limit: number | null; plan: string };
}

function pct(x: number): string {
  return `${Math.round(x * 100)} %`;
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold">{pct(value)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10">
        <div className="h-2.5 rounded-full" style={{ width: pct(value), backgroundColor: color }} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 text-center">
      <p className="text-xl font-bold text-pitch-400">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export function AnalysisPanel({ matchId, homeName, awayName }: { matchId: string; homeName: string; awayName: string }) {
  const { status } = useSession();
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyse() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyse/${matchId}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError({ message: json.error ?? "Erreur inattendue", code: json.code });
      } else {
        setData(json);
      }
    } catch {
      setError({ message: "Erreur réseau, réessayez." });
    } finally {
      setLoading(false);
    }
  }

  if (!DEMO && status === "unauthenticated") {
    return (
      <div className="card mt-10 p-8 text-center">
        <h2 className="text-xl font-semibold">Analyse verrouillée</h2>
        <p className="mt-2 text-slate-400">
          Créez un compte gratuit pour débloquer 3 analyses par jour : probabilités 1N2, scores exacts, buts attendus
          et lecture du match.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/inscription" className="btn-primary">Créer un compte gratuit</Link>
          <Link href="/connexion" className="btn-secondary">J&apos;ai déjà un compte</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card mt-10 p-8 text-center">
        <h2 className="text-xl font-semibold">Analyse statistique complète</h2>
        <p className="mt-2 text-slate-400">
          Probabilités d&apos;issue, scores les plus probables, buts attendus (xG), plus/moins 2,5 buts, BTTS et
          lecture du match par notre modèle.
        </p>
        <button onClick={analyse} disabled={loading} className="btn-primary mt-6">
          {loading ? "Analyse en cours…" : "Lancer l'analyse"}
        </button>
        {error && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            {error.message}
            {error.code === "QUOTA" && (
              <Link href="/tarifs" className="ml-2 font-semibold text-pitch-400 underline">
                Passer Pro
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }

  const p = data.prediction;

  return (
    <div className="mt-10 space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Probabilités d&apos;issue</h2>
          <span className="rounded-full bg-pitch-500/15 px-3 py-1 text-xs font-semibold text-pitch-300">
            Confiance {p.confidence}/100
          </span>
        </div>
        <div className="mt-5 space-y-4">
          <Bar label={`Victoire ${homeName}`} value={p.homeWin} color="#14bf5b" />
          <Bar label="Match nul" value={p.draw} color="#94a3b8" />
          <Bar label={`Victoire ${awayName}`} value={p.awayWin} color="#60a5fa" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={`Buts attendus ${homeName}`} value={p.homeXg.toFixed(2)} />
        <Stat label={`Buts attendus ${awayName}`} value={p.awayXg.toFixed(2)} />
        <Stat label="Plus de 2,5 buts" value={pct(p.over25)} />
        <Stat label="Les deux équipes marquent" value={pct(p.btts)} />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Scores les plus probables</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {p.topScores.map((s, i) => (
            <div key={i} className={`rounded-xl p-4 text-center ${i === 0 ? "bg-pitch-500/15 ring-1 ring-pitch-500/40" : "bg-white/5"}`}>
              <p className="text-xl font-bold">
                {s.home} - {s.away}
              </p>
              <p className="mt-1 text-xs text-slate-400">{pct(s.prob)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Lecture du match</h2>
        <ul className="mt-4 space-y-3">
          {p.insights.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="text-pitch-400">▸</span>
              {insight}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-slate-500">
          Analyse générée par le modèle statistique AvantMatch (Poisson bivarié, correction Dixon-Coles). Le football
          reste imprévisible : aucune issue n&apos;est garantie.
        </p>
      </div>

      {data.quota.limit !== null && (
        <p className="text-center text-sm text-slate-400">
          {data.quota.used}/{data.quota.limit} analyses utilisées aujourd&apos;hui —{" "}
          <Link href="/tarifs" className="text-pitch-400 underline">
            passez Pro pour l&apos;illimité
          </Link>
        </p>
      )}
    </div>
  );
}
