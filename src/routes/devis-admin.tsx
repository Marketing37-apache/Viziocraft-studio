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

/** Prix de base, identiques à DevisBuilder.tsx */
const FORMATS = [
  { key: "short", name: "Short", dur: "Reels, TikTok, UGC", base: 45 },
  { key: "ads", name: "Ads", dur: "Spot publicitaire", base: 48 },
  { key: "podcast", name: "Podcast", dur: "0-15 min", base: 400 },
  { key: "interview", name: "Interview", dur: "0-15 min", base: 400 },
  { key: "vlog", name: "Vlog", dur: "0-15 min", base: 150 },
  { key: "documentaire", name: "Documentaire", dur: "0-15 min", base: 150 },
];

/** Options, prix fixe par vidéo */
const OPTIONS = [
  { k: "Sous-titres animés", p: 15 },
  { k: "Motion design", p: 30 },
  { k: "Voix-off / narration", p: 20 },
  { k: "Illustration", p: 15 },
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
              Prix unitaires de base par format, sans réduction volume ni remise multishoot.
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
                  <th className="py-3 px-4 font-medium">Description</th>
                  <th className="py-3 px-4 font-medium text-right">Prix unitaire</th>
                </tr>
              </thead>
              <tbody>
                {FORMATS.map((f, i) => (
                  <tr key={f.key} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                    <td className="py-3 px-4 font-medium">{f.name}</td>
                    <td className="py-3 px-4 text-white/50">{f.dur || "—"}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-[#c4b5fd]">
                      {f.base}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tableau des options */}
          <div>
            <h2 className="text-xs uppercase tracking-[0.22em] text-white/50 mb-3">Options (prix fixe / vidéo)</h2>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <tbody>
                  {OPTIONS.map((o, i) => (
                    <tr key={o.k} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="py-3 px-4">{o.k}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-[#c4b5fd]">{o.p}€</td>
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
