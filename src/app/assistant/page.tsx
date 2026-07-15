"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

const suggestions = [
  "Que penses-tu du prochain match du PSG ?",
  "Compare l'attaque de l'OM et de Monaco",
  "Quel match a le plus de chances de finir avec +2,5 buts ?",
];

export default function AssistantPage() {
  const { status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError({ message: json.error ?? "Erreur inattendue", code: json.code });
      } else {
        setMessages((m) => [...m, { role: "assistant", text: json.answer }]);
      }
    } catch {
      setError({ message: "Erreur réseau, réessayez." });
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  if (!DEMO && status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Assistant IA football</h1>
        <p className="mt-4 text-slate-400">
          Posez n&apos;importe quelle question sur les matchs à venir : l&apos;assistant répond à partir des données
          de notre modèle statistique. 5 questions gratuites par jour.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/inscription" className="btn-primary">Créer un compte gratuit</Link>
          <Link href="/connexion" className="btn-secondary">Connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-10" style={{ minHeight: "calc(100vh - 200px)" }}>
      <h1 className="text-2xl font-bold">Assistant IA</h1>
      <p className="mt-1 text-sm text-slate-400">
        Réponses basées sur les probabilités et statistiques du modèle AvantMatch.
      </p>

      <div className="mt-6 flex-1 space-y-4">
        {messages.length === 0 && (
          <div className="card p-6">
            <p className="text-sm text-slate-400">Essayez par exemple :</p>
            <div className="mt-3 flex flex-col gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-pitch-500/50 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user" ? "bg-pitch-500 text-night-950" : "card text-slate-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="card px-4 py-3 text-sm text-slate-400">L&apos;assistant réfléchit…</div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            {error.message}
            {error.code === "QUOTA" && (
              <Link href="/tarifs" className="ml-2 font-semibold text-pitch-400 underline">
                Passer Pro
              </Link>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 mt-6 flex gap-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre question sur un match…"
          className="input"
          maxLength={1000}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
          Envoyer
        </button>
      </form>
    </div>
  );
}
