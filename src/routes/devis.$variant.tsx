import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DevisBuilder } from "@/components/DevisBuilder";

type Variant = "essentiel" | "surmesure";

const META: Record<Variant, {
  eyebrow: string;
  title: string;
  highlight: string;
  baseline: string;
  bg: string;
  ink: string;
  accent: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
  cardWrap: string;
  decorative: string;
}> = {
  essentiel: {
    eyebrow: "Configurateur · Montage essentiel",
    title: "Configurez votre devis ",
    highlight: "à la vidéo.",
    baseline: "Pour tester sans engagement. Vous payez à l'unité, vous choisissez tout — niveau de montage, options, délai. Récap envoyé immédiatement par mail.",
    bg: "bg-[#f7f5f0]",
    ink: "text-[#1a1410]",
    accent: "text-[#a8632d]",
    accentBg: "bg-[#a8632d]",
    badgeBg: "bg-[#a8632d]/12",
    badgeText: "text-[#a8632d]",
    cardWrap: "bg-white",
    decorative: "warm-soft",
  },
  surmesure: {
    eyebrow: "Votre devis · En quelques secondes",
    title: "Calculez votre production ",
    highlight: "au plus juste.",
    baseline: "Sélectionnez vos formats, ajustez les quantités. Le total se calcule en direct et vous recevez un récapitulatif détaillé par mail.",
    bg: "bg-[#0b0716]",
    ink: "text-white",
    accent: "text-[#c4b5fd]",
    accentBg: "bg-gradient-to-r from-[#a78bfa] to-[#ec4899]",
    badgeBg: "bg-white/10",
    badgeText: "text-white",
    cardWrap: "bg-white",
    decorative: "neon-prestige",
  },
};

export const Route = createFileRoute("/devis/$variant")({
  component: DevisPage,
  loader: ({ params }) => {
    if (params.variant !== "essentiel" && params.variant !== "surmesure") throw notFound();
    return { variant: params.variant as Variant };
  },
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center">
      <div className="text-center">
        <p className="font-display text-2xl">Configurateur introuvable</p>
        <Link to="/" hash="tarifs" className="mt-4 inline-block text-primary underline">Retour aux tarifs</Link>
      </div>
    </main>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Devis ${loaderData.variant} — VizioCraft` : "Configurateur de devis" },
      { name: "description", content: "Composez votre devis vidéo personnalisé en 1 minute." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function DevisPage() {
  const { variant } = Route.useLoaderData() as { variant: Variant };
  const m = META[variant];

  return (
    <main className={`${m.bg} ${m.ink} min-h-screen`}>
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-10 sm:pt-32 sm:pb-12 lg:pt-44 lg:pb-16">
        {m.decorative === "neon-prestige" && (
          <>
            <div className="absolute -left-40 top-20 h-[700px] w-[700px] rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.25),transparent)] blur-3xl" />
            <div className="absolute -right-32 top-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(236,72,153,0.18),transparent)] blur-3xl" />
          </>
        )}
        {m.decorative === "warm-soft" && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(168,99,45,0.08),transparent_55%)]" />
        )}

        <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
          <Link to="/" hash="tarifs" className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] ${m.accent} hover:opacity-80`}>
            ← Retour aux formules
          </Link>

          <div className="mt-6 sm:mt-8">
            <span className={`inline-flex items-center gap-2 rounded-full ${m.badgeBg} ${m.badgeText} px-3 py-1.5 sm:px-4 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em]`}>
              {m.eyebrow}
            </span>
            <h1 className="mt-5 sm:mt-6 font-display text-[1.9rem] leading-[1.07] tracking-tight sm:text-4xl lg:text-6xl">
              {m.title}
              <span className={m.accent}>{m.highlight}</span>
            </h1>
            <p className="mt-4 sm:mt-5 max-w-2xl text-[15px] sm:text-lg leading-relaxed opacity-80">{m.baseline}</p>
          </div>
        </div>
      </section>

      {/* BUILDER */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className={variant === "surmesure" ? "sm:rounded-[2.5rem] p-[2px] bg-gradient-to-br from-[#a78bfa] via-[#ec4899] to-[#f59e0b] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" : ""}>
            <div className={variant === "surmesure" ? "sm:rounded-[2.4rem] bg-[#0b0716] p-1" : ""}>
              <DevisBuilder open variant={variant} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
