import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DevisBuilder } from "@/components/DevisBuilder";

export const Route = createFileRoute("/devis/standard")({
  component: DevisStandardPage,
  head: () => ({
    meta: [
      { title: "Devis standard — VizioCraft" },
      { name: "description", content: "Configurez votre devis vidéo personnalisé en quelques clics. Résultat immédiat, aucun engagement." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function DevisStandardPage() {
  return (
    <main className="bg-[#f0f2f5] text-[#0f172a] min-h-screen">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-10 sm:pt-32 sm:pb-12 lg:pt-44 lg:pb-16">
        {/* Subtle geometric accent */}
        <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none">
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full border border-[#1e3a5f]/8" />
          <div className="absolute -right-16 top-20 h-[400px] w-[400px] rounded-full border border-[#1e3a5f]/5" />
          <div className="absolute right-32 -top-10 h-[300px] w-[300px] rounded-full border border-[#1e3a5f]/6" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
          <Link
            to="/"
            hash="tarifs"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#1e3a5f]/60 hover:text-[#1e3a5f] transition"
          >
            ← Retour aux formules
          </Link>

          <div className="mt-6 sm:mt-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1e3a5f]/8 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1e3a5f]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Configurateur · Devis personnalisé
            </span>
            <h1 className="mt-5 sm:mt-6 font-display text-[1.9rem] leading-[1.07] tracking-tight sm:text-4xl lg:text-6xl text-[#0f172a]">
              Votre devis,{" "}
              <span className="text-[#1e3a5f]">calculé en direct.</span>
            </h1>
            <p className="mt-4 sm:mt-5 max-w-2xl text-[15px] sm:text-lg leading-relaxed text-[#0f172a]/65">
              Sélectionnez vos formats, ajustez les options, obtenez une estimation précise — le tout en moins d'une minute. Aucun engagement, récapitulatif envoyé par mail.
            </p>
          </div>

          {/* Trust band */}
          <div className="mt-7 sm:mt-10 flex flex-wrap gap-4 sm:gap-6">
            {[
              { icon: "⚡", label: "Réponse sous 24h" },
              { icon: "🔒", label: "Aucun engagement" },
              { icon: "📋", label: "Récap détaillé par mail" },
              { icon: "🎯", label: "Prix fermes, sans surprise" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[13px] sm:text-sm text-[#0f172a]/60">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILDER */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          {/* Thin top accent line */}
          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-[#1e3a5f]/20 to-transparent" />
          <DevisBuilderStandardWrapper />
        </div>
      </section>

      <Footer />
    </main>
  );
}

/**
 * Wraps DevisBuilder in the "standard" visual shell.
 * The DevisBuilder already adapts its internals based on variant;
 * here we use "essentiel" as the base logic but override the outer
 * presentation with a clean blue-slate aesthetic via a wrapper.
 */
function DevisBuilderStandardWrapper() {
  return (
    <div className="relative">
      {/* Outer card shell specific to /devis/standard */}
      <div className="rounded-2xl sm:rounded-[2rem] border border-[#1e3a5f]/12 bg-white shadow-[0_8px_40px_-12px_rgba(30,58,95,0.18)] overflow-hidden">
        <div className="border-b border-[#1e3a5f]/8 bg-[#f8fafc] px-6 py-4 sm:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-white text-xs font-bold">✦</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e3a5f]">Configurateur standard</p>
              <p className="text-[11px] text-[#0f172a]/50">Tous formats · Calcul en temps réel</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#0f172a]/50">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Récapitulatif envoyé par mail
            </span>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <DevisBuilder open variant="essentiel" />
        </div>
      </div>

      {/* Bottom note */}
      <p className="mt-6 text-center text-xs text-[#0f172a]/40">
        Les estimations sont indicatives et peuvent varier selon les détails finaux du projet.
        Un devis ferme vous est envoyé après validation de votre brief.
      </p>
    </div>
  );
}
