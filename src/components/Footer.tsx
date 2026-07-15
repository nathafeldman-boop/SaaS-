import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-lg font-bold">
              Avant<span className="text-pitch-400">Match</span>
            </p>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Analyses statistiques de football par IA. AvantMatch est un outil d&apos;information et d&apos;analyse :
              il ne s&apos;agit pas d&apos;un service de paris et aucun résultat n&apos;est garanti.
            </p>
          </div>
          <nav className="flex gap-6 text-sm text-slate-400">
            <Link href="/matchs" className="hover:text-white">Matchs</Link>
            <Link href="/assistant" className="hover:text-white">Assistant IA</Link>
            <Link href="/tarifs" className="hover:text-white">Tarifs</Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} AvantMatch. Jouer comporte des risques : endettement, isolement, dépendance.
          Pour être aidé, appelez le 09 74 75 13 13 (appel non surtaxé).
        </p>
      </div>
    </footer>
  );
}
