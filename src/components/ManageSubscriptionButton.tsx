"use client";

import { useState } from "react";

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portail", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur inattendue");
      } else if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <button onClick={openPortal} disabled={loading} className="btn-secondary">
        {loading ? "Ouverture…" : "Gérer mon abonnement"}
      </button>
      {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
    </div>
  );
}
