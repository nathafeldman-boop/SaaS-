"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

interface Team {
  name: string;
  shortName: string;
  color: string;
  league: string;
}

interface UpcomingMatch {
  home: string;
  away: string;
  league: string;
  kickoff: string;
}

type FormResult = "W" | "D" | "L";

interface FreeAnalysis {
  header: {
    home: { name: string; shortName: string; color: string };
    away: { name: string; shortName: string; color: string };
    competition: string;
  };
  form: {
    home: { results: FormResult[]; wdl: string; label: string; hot: boolean };
    away: { results: FormResult[]; wdl: string; label: string; hot: boolean };
  };
  resume: string;
  scenario: string;
  confidence: number;
  confidenceLabel: string;
}

interface PremiumAnalysis {
  homeWin: number;
  draw: number;
  awayWin: number;
  homeXg: number;
  awayXg: number;
  over25: number;
  btts: number;
  topScores: { home: number; away: number; prob: number }[];
  insights: string[];
}

interface DuelResponse {
  free: FreeAnalysis;
  premium: PremiumAnalysis | null;
  locked: boolean;
  code?: "AUTH" | "UPGRADE";
  demo?: boolean;
}

function Badge({ short, color, size = 40 }: { short: string; color: string; size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-full font-bold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.32 }}
    >
      {short.slice(0, 3)}
    </span>
  );
}

function TeamPicker({
  teams,
  value,
  onSelect,
  placeholder,
}: {
  teams: Team[];
  value: Team | null;
  onSelect: (t: Team | null) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams.slice(0, 8);
    return teams.filter((t) => t.name.toLowerCase().includes(q) || t.shortName.toLowerCase().includes(q)).slice(0, 8);
  }, [query, teams]);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-xl border-2 border-cyan-400/60 bg-night-950 px-4 py-3 focus-within:border-pitch-500">
        {value && <Badge short={value.shortName} color={value.color} size={28} />}
        <input
          value={value ? value.name : query}
          onChange={(e) => {
            onSelect(null);
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-white/10 bg-night-900 shadow-xl">
          {results.map((t) => (
            <button
              key={t.shortName}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(t);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5"
            >
              <Badge short={t.shortName} color={t.color} size={24} />
              <span className="text-sm text-white">{t.name}</span>
              <span className="ml-auto text-xs text-slate-500">{t.league}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FormRow({ label, color, short, form }: { label: string; color: string; short: string; form: FreeAnalysis["form"]["home"] }) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="flex items-center gap-2">
        <Badge short={short} color={color} size={24} />
        <span className="font-semibold">{label}</span>
      </div>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
        {form.hot && <span>🔥</span>}
        {form.label}
      </p>
      <p className="mt-2 text-sm">
        Forme :{" "}
        {form.results.map((r, i) => (
          <span key={i}>{r === "W" ? "✅" : r === "D" ? "➖" : "❌"}</span>
        ))}
        <span> ⏳</span>
      </p>
      <p className="mt-1 text-xs text-slate-400">V-N-D : {form.wdl}</p>
    </div>
  );
}

function pct(x: number) {
  return `${Math.round(x * 100)} %`;
}

export function MatchAnalyzer({ teams, upcoming }: { teams: Team[]; upcoming: UpcomingMatch[] }) {
  const router = useRouter();
  const [home, setHome] = useState<Team | null>(teams.find((t) => t.shortName === "PSG") ?? null);
  const [away, setAway] = useState<Team | null>(null);
  const [result, setResult] = useState<DuelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"none" | "signup" | "pricing">("none");
  const resultRef = useRef<HTMLDivElement>(null);

  async function analyse(hShort?: string, aShort?: string) {
    const h = hShort ?? home?.shortName;
    const a = aShort ?? away?.shortName;
    if (!h || !a) {
      setError("Choisissez deux équipes à analyser.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home: h, away: a }),
      });
      const json: DuelResponse & { error?: string } = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur inattendue");
      } else {
        setResult(json);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function unlock() {
    if (!result) return;
    if (DEMO) {
      setLoading(true);
      try {
        const res = await fetch("/api/duel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            home: result.free.header.home.shortName,
            away: result.free.header.away.shortName,
            unlock: true,
          }),
        });
        setResult(await res.json());
      } finally {
        setLoading(false);
      }
      return;
    }
    if (result.code === "AUTH") setModal("signup");
    else setModal("pricing");
  }

  function pickUpcoming(m: UpcomingMatch) {
    const h = teams.find((t) => t.name === m.home) ?? null;
    const a = teams.find((t) => t.name === m.away) ?? null;
    setHome(h);
    setAway(a);
    if (h && a) analyse(h.shortName, a.shortName);
  }

  return (
    <div>
      {/* Carte analyseur */}
      <div className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Match à analyser</p>

        <div className="mt-4 space-y-3">
          <TeamPicker teams={teams} value={home} onSelect={setHome} placeholder="Équipe à domicile (ex : PSG)" />
          <p className="text-center text-sm font-semibold text-slate-500">VS</p>
          <TeamPicker teams={teams} value={away} onSelect={setAway} placeholder="Cherche une équipe (ex : Real Madrid)" />
        </div>

        <button onClick={() => analyse()} disabled={loading} className="btn-primary mt-4 w-full text-base">
          {loading ? "Analyse en cours…" : "⚡ Analyser le match avec l'IA"}
        </button>
        {error && <p className="mt-3 text-center text-sm text-amber-300">{error}</p>}
        <p className="mt-3 text-center text-xs text-slate-500">
          Notre IA croise des millions de données pour chaque pronostic.
        </p>
      </div>

      {/* Résultat */}
      {result && (
        <div ref={resultRef} className="mt-6 space-y-5">
          {/* En-tête match analysé */}
          <div className="card p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-slate-400">Match analysé</p>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Badge short={result.free.header.home.shortName} color={result.free.header.home.color} size={52} />
                <span className="text-sm font-bold">{result.free.header.home.name}</span>
              </div>
              <span className="text-lg font-light text-slate-500">VS</span>
              <div className="flex flex-col items-center gap-2">
                <Badge short={result.free.header.away.shortName} color={result.free.header.away.color} size={52} />
                <span className="text-sm font-bold">{result.free.header.away.name}</span>
              </div>
            </div>
            <span className="mt-4 inline-block rounded-full border border-pitch-500/50 px-4 py-1 text-sm font-semibold text-pitch-300">
              Analyse IA prête
            </span>
            <p className="mt-2 text-xs text-slate-500">Basée sur stats + actualité foot</p>
            <p className="mt-3 text-xs text-slate-400">
              🏆 {result.free.header.competition} &nbsp;•&nbsp; 📅 Prochainement &nbsp;•&nbsp; 📍 À déterminer
            </p>
          </div>

          {/* Forme récente */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-semibold">📊 Forme récente</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FormRow
                label={result.free.header.home.name}
                color={result.free.header.home.color}
                short={result.free.header.home.shortName}
                form={result.free.form.home}
              />
              <FormRow
                label={result.free.header.away.name}
                color={result.free.header.away.color}
                short={result.free.header.away.shortName}
                form={result.free.form.away}
              />
            </div>
          </div>

          {/* Résumé rapide */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-semibold">🔍 Résumé rapide</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{result.free.resume}</p>
            <p className="mt-2 text-xs text-pitch-400">Généré à partir de millions de données et de l&apos;actualité foot.</p>
          </div>

          {/* Scénario */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-semibold">📌 Scénario #1</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{result.free.scenario}</p>
          </div>

          {/* Confiance */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-semibold">🎯 Confiance de l&apos;IA</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-3 flex-1 rounded-full bg-white/10">
                <div className="h-3 rounded-full bg-pitch-500" style={{ width: pct(result.free.confidence / 100) }} />
              </div>
              <span className="text-sm font-semibold text-pitch-300">{result.free.confidenceLabel}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Niveau de confiance basé sur la qualité des données disponibles.</p>
          </div>

          {/* Probabilités : premium (débloqué) ou verrouillé */}
          {result.premium ? (
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-semibold">📊 Probabilités exactes</h3>
              <div className="mt-5 space-y-4">
                {[
                  { label: `Victoire ${result.free.header.home.shortName}`, v: result.premium.homeWin, c: "#14bf5b" },
                  { label: "Match nul", v: result.premium.draw, c: "#94a3b8" },
                  { label: `Victoire ${result.free.header.away.shortName}`, v: result.premium.awayWin, c: "#60a5fa" },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-400">{b.label}</span>
                      <span className="font-semibold">{pct(b.v)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10">
                      <div className="h-2.5 rounded-full" style={{ width: pct(b.v), backgroundColor: b.c }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="xG domicile" value={result.premium.homeXg.toFixed(2)} />
                <Stat label="xG extérieur" value={result.premium.awayXg.toFixed(2)} />
                <Stat label="+2,5 buts" value={pct(result.premium.over25)} />
                <Stat label="Les 2 marquent" value={pct(result.premium.btts)} />
              </div>
              <h4 className="mt-6 text-sm font-semibold text-slate-300">Scores les plus probables</h4>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {result.premium.topScores.map((s, i) => (
                  <div key={i} className={`rounded-xl p-3 text-center ${i === 0 ? "bg-pitch-500/15 ring-1 ring-pitch-500/40" : "bg-white/5"}`}>
                    <p className="text-lg font-bold">{s.home} - {s.away}</p>
                    <p className="text-xs text-slate-400">{pct(s.prob)}</p>
                  </div>
                ))}
              </div>
              {result.demo && (
                <p className="mt-5 rounded-xl bg-pitch-500/10 p-3 text-center text-xs text-pitch-300">
                  ✅ Analyse complète débloquée (mode démo). En production, cette partie est réservée aux abonnés.
                </p>
              )}
            </div>
          ) : (
            <div className="card relative overflow-hidden p-6">
              <h3 className="flex items-center gap-2 font-semibold">📊 Probabilités exactes</h3>
              {/* Aperçu flouté */}
              <div className="pointer-events-none mt-5 space-y-4 blur-md" aria-hidden>
                {["Victoire domicile", "Match nul", "Victoire extérieur"].map((l, i) => (
                  <div key={l}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-400">{l}</span>
                      <span className="font-semibold">{[64, 21, 15][i]} %</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10">
                      <div className="h-2.5 rounded-full bg-pitch-500" style={{ width: `${[64, 21, 15][i]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Overlay paywall */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-night-950/70 p-6 text-center backdrop-blur-sm">
                <p className="text-xl font-extrabold">Tu n&apos;as accès qu&apos;à 15% de notre analyse</p>
                <div className="mt-3 h-2 w-48 rounded-full bg-white/15">
                  <div className="h-2 w-[15%] rounded-full bg-pitch-500" />
                </div>
                <p className="mt-3 max-w-sm text-sm text-slate-300">
                  L&apos;analyse complète contient les probabilités exactes, les scénarios restants et les insights premium.
                </p>
                <button onClick={unlock} disabled={loading} className="btn-primary mt-5">
                  🥇 Débloquer l&apos;analyse complète
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prochains matchs */}
      {upcoming.length > 0 && (
        <div className="card mt-6 p-6">
          <h3 className="font-semibold">Prochains matchs</h3>
          <div className="mt-4 space-y-2">
            {upcoming.slice(0, 6).map((m, i) => (
              <button
                key={i}
                onClick={() => pickUpcoming(m)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-sm transition hover:border-pitch-500/50"
              >
                <span className="w-14 shrink-0 text-xs text-slate-500">
                  {new Date(m.kickoff).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                </span>
                <span className="font-medium text-pitch-300">{m.home}</span>
                <span className="text-slate-500">vs</span>
                <span className="font-medium">{m.away}</span>
                <span className="ml-auto text-xs text-slate-500">Analyser →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {modal === "signup" && <SignupModal onClose={() => setModal("none")} />}
      {modal === "pricing" && <PricingModal onClose={() => setModal("none")} onGo={() => router.push("/tarifs")} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3 text-center">
      <p className="text-lg font-bold text-pitch-400">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function SignupModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { signIn } = await import("next-auth/react");
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: email.split("@")[0], email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur inattendue");
        setLoading(false);
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      router.refresh();
      onClose();
    } catch {
      setError("Erreur réseau, réessayez.");
      setLoading(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-2xl font-bold">Créer un compte</h2>
      <p className="mt-2 text-sm text-slate-400">Inscris-toi gratuitement pour débloquer l&apos;analyse complète.</p>
      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-night-950"
        onClick={() => setError("La connexion Google nécessite une configuration OAuth. Utilisez l'email pour la démo.")}
      >
        <span className="text-lg">G</span> Continuer avec Google
      </button>
      <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" /> ou <span className="h-px flex-1 bg-white/10" />
      </div>
      <form onSubmit={submit} className="space-y-3">
        {error && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{error}</div>}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe (min. 8 caractères)" className="input" />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Création…" : "✉ S'inscrire"}</button>
      </form>
      <button onClick={onClose} className="mt-4 w-full text-center text-sm text-slate-400">Fermer</button>
    </Overlay>
  );
}

function PricingModal({ onClose, onGo }: { onClose: () => void; onGo: () => void }) {
  const tiers = [
    { name: "Starter", price: "9,99 €", per: "/mois", feats: ["1 analyse par jour", "Stats clés", "Probabilités exactes 1×/jour"], highlight: false },
    { name: "Pro", price: "19 €", per: "/mois", feats: ["Analyses illimitées", "Analyse complète détaillée", "Scénarios avancés", "Chat IA"], highlight: true },
    { name: "Lifetime", price: "99 €", per: "une fois", feats: ["Analyses illimitées à vie", "Plus jamais de paiement mensuel", "Économise +100 €/an"], highlight: false },
  ];
  return (
    <Overlay onClose={onClose}>
      <h2 className="text-2xl font-bold">Débloquer l&apos;analyse</h2>
      <p className="mt-1 text-sm text-slate-400">Accède à l&apos;analyse complète et aux pronostics détaillés.</p>
      <div className="mt-5 space-y-3">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-xl border p-4 ${t.highlight ? "border-pitch-500/60 ring-1 ring-pitch-500/30" : "border-white/10"}`}>
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">{t.name}{t.highlight && <span className="ml-2 text-xs text-pitch-300">★ Populaire</span>}</span>
              <span className="text-xl font-extrabold">{t.price}<span className="text-xs font-normal text-slate-400">{t.per}</span></span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              {t.feats.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={onGo} className="btn-primary mt-5 w-full">Voir les offres</button>
      <button onClick={onClose} className="mt-3 w-full text-center text-sm text-slate-400">Fermer</button>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl border border-white/10 bg-night-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
