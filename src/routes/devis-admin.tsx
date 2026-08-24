import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DevisBuilder } from "@/components/DevisBuilder";

export const Route = createFileRoute("/devis-admin")({
  component: DevisAdminPage,
  head: () => ({
    meta: [
      { title: "Mode Admin - Simulateur de prix - VizioCraft" },
      { name: "description", content: "Simulateur de prix pour agents internes" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function DevisAdminPage() {
  return (
    <main className="bg-[#0b0716] text-white min-h-screen">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-10 sm:pt-32 sm:pb-12">
        <div className="absolute -left-40 top-20 h-[700px] w-[700px] rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.25),transparent)] blur-3xl" />
        <div className="absolute -right-32 top-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(236,72,153,0.18),transparent)] blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
          <Link to="/devis/surmesure" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#c4b5fd] hover:opacity-80">
            ← Retour au devis public
          </Link>

          <div className="mt-6 sm:mt-8">
            <h1 className="font-display text-[1.9rem] leading-[1.07] tracking-tight sm:text-4xl lg:text-6xl">
              Simulateur avec{" "}
              <span className="text-[#c4b5fd]">prix</span>
            </h1>
            <p className="mt-4 text-[15px] sm:text-lg leading-relaxed opacity-80">
              Prix unitaires et multiplicateurs affichés.
            </p>
          </div>
        </div>
      </section>

      {/* BUILDER EN MODE ADMIN */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="sm:rounded-[2.5rem] p-[2px] bg-gradient-to-br from-[#a78bfa] via-[#ec4899] to-[#f59e0b] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="sm:rounded-[2.4rem] bg-[#0b0716] p-1">
              <DevisBuilder open variant="surmesure" adminMode />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}