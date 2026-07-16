"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

const links = [
  { href: "/matchs", label: "Matchs" },
  { href: "/assistant", label: "Assistant IA" },
  { href: "/tarifs", label: "Tarifs" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-night-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PrediStart" className="h-9 w-9 rounded-xl ring-1 ring-pitch-500/40" />
          Predi<span className="text-pitch-400">Start</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-slate-300 transition hover:text-white">
              {l.label}
            </Link>
          ))}
          {DEMO ? (
            <span className="rounded-full border border-pitch-500/40 bg-pitch-500/10 px-3 py-1 text-xs font-semibold text-pitch-300">
              Démo publique
            </span>
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link href="/compte" className="text-sm text-slate-300 transition hover:text-white">
                Mon compte
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary !px-4 !py-2 text-sm">
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/connexion" className="text-sm text-slate-300 transition hover:text-white">
                Connexion
              </Link>
              <Link href="/inscription" className="btn-primary !px-4 !py-2 text-sm">
                Essai gratuit
              </Link>
            </div>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-slate-300">
                {l.label}
              </Link>
            ))}
            {DEMO ? (
              <span className="text-xs font-semibold text-pitch-300">Démo publique</span>
            ) : session ? (
              <>
                <Link href="/compte" onClick={() => setOpen(false)} className="text-slate-300">
                  Mon compte
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left text-slate-300">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/connexion" onClick={() => setOpen(false)} className="text-slate-300">
                  Connexion
                </Link>
                <Link href="/inscription" onClick={() => setOpen(false)} className="text-pitch-400">
                  Essai gratuit
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
