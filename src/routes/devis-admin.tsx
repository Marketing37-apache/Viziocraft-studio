import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/devis-admin")({
  component: DevisAdminPage,
  head: () => ({
    meta: [
      { title: "Fiche tarifs - VizioCraft" },
      { name: "description", content: "Fiche des prix unitaires internes" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

/** Prix de base (avant multiplicateur de niveau), identiques à DevisBuilder.tsx */
const FORMATS = [
  { key: "s1", name: "Short Classique", dur: "-45s", base: 30 },
  { key: "s2", name: "Short Développé", dur: "+45s", base: 35 },
  { key: "pb", name: "Short Publicitaire", dur: "", base: 50 },
  { key: "pod-short", name: "Clips courts (podcast)", dur: "", base: 10 },
  { key: "l1", name: "Format classique", dur: "-8 min", base: 200 },
  { key: "l2", name: "Format Standard", dur: "8–15 min", base: 220 },
  { key: "l3", name: "Format Long", dur: "+15 min", base: 260 },
  { key: "pd", name: "Podcast / Interview Filmé", dur: "20–90 min", base: 250 },
];

/** Multiplicateurs de niveau, identiques à DevisBuilder.tsx */
const LEVELS = [
  { name: "Basic", mult: 1 },
  { name: "Standard", mult: 1.25 },
  { name: "Premium", mult: 1.875 },
];

/** Options, prix fixe par vidéo, indépendant du niveau */
const OPTIONS = [
  { k: "Sous-titres animés", p: 8 },
  { k: "Sound design", p: 5 },
  { k: "Multi-format export", p: 8 },
  { k: "Voix-off / narration", p: 15 },
];

function DevisAdminPage() {
  return (
    <main className="bg-[#0b0716] text-white min-h-screen">
      <Nav />

      <section className="relative overflow-hidden pt-24 pb-10 sm:pt-32 sm:pb-12">
        <div className="relative mx-auto max-w-4xl px-5 sm:px-6 lg:px-10">
          <Link to="/devis/surmesure" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#c4b5fd] hover:opacity-80">
            ← Retour au devis public
          </Link>

          <div className="mt-6 sm:mt-8">
            <h1 className="font-display text-[1.9rem] leading-[1.07] tracking-tight sm:text-4xl">
              Fiche des <span className="text-[#c4b5fd]">prix unitaires</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed opacity-70">
              Prix de base par format et par niveau, sans réduction volume ni remise multishoot.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-6 lg:px-10 pb-24">
        <div className="mx-auto max-w-4xl space-y-10">

          {/* Tableau des formats */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-white/50">
                  <th className="py-3 px-4 font-medium">Format</th>
                  <th className="py-3 px-4 font-medium">Durée</th>
                  {LEVELS.map((lvl) => (
                    <th key={lvl.name} className="py-3 px-4 font-medium text-right">{lvl.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FORMATS.map((f, i) => (
                  <tr key={f.key} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                    <td className="py-3 px-4 font-medium">{f.name}</td>
                    <td className="py-3 px-4 text-white/50">{f.dur || "—"}</td>
                    {LEVELS.map((lvl) => (
                      <td key={lvl.name} className="py-3 px-4 text-right tabular-nums">
                        {Math.round(f.base * lvl.mult)}€
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tableau des options */}
          <div>
            <h2 className="text-xs uppercase tracking-[0.22em] text-white/50 mb-3">Options (prix fixe / vidéo, tous niveaux)</h2>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <tbody>
                  {OPTIONS.map((o, i) => (
                    <tr key={o.k} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="py-3 px-4">{o.k}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{o.p}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
