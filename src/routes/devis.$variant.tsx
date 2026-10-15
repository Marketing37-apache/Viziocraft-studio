import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { DevisBuilder } from "@/components/DevisBuilder";

type Variant = "essentiel" | "surmesure";

const META: Record<
  Variant,
  { eyebrow: string; title: string; highlight: string; baseline: string }
> = {
  essentiel: {
    eyebrow: "Configurateur · Montage essentiel",
    title: "Configurez votre devis ",
    highlight: "à la vidéo.",
    baseline:
      "Pour tester sans engagement. Vous payez à l'unité, vous choisissez tout : niveau de montage, options, délai. Récap envoyé immédiatement par mail.",
  },
  surmesure: {
    eyebrow: "Votre devis · En quelques secondes",
    title: "Calculez votre production ",
    highlight: "au plus juste.",
    baseline:
      "Sélectionnez vos formats, ajustez les quantités. Le total se calcule en direct et vous recevez un récapitulatif détaillé par mail.",
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
        <Link to="/" hash="tarifs" className="mt-4 inline-block text-primary underline">
          Retour aux tarifs
        </Link>
      </div>
    </main>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Devis ${loaderData.variant} - VizioCraft` : "Configurateur de devis" },
      { name: "description", content: "Composez votre devis vidéo personnalisé en 1 minute." },
      { name: "robots", content: "noindex" },
    ],
    links: [
      {
        rel: "canonical",
        href: `https://viziocraft.com/devis/${loaderData?.variant || "surmesure"}`,
      },
    ],
  }),
});

function DevisPage() {
  const { variant } = Route.useLoaderData() as { variant: Variant };
  const m = META[variant];

  return (
    <main className="relative min-h-screen overflow-x-clip bg-paper text-ink">
      {/* lumière d'ambiance : elle se fond dans la page, sans bord visible */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px]">
        <div className="absolute -left-40 -top-24 h-[620px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(198,156,238,0.5),transparent)] blur-3xl" />
        <div className="absolute -right-32 top-20 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(139,206,247,0.45),transparent)] blur-3xl" />
      </div>

      {/* HERO */}
      <section className="relative pb-10 pt-28 sm:pb-12 sm:pt-36 lg:pb-14 lg:pt-44">
        <div className="shell relative">
          <Link
            to="/"
            hash="tarifs"
            className="font-label inline-flex min-h-11 items-center gap-2 text-ink/65 transition-colors hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Retour aux formules
          </Link>

          <div className="mt-5 max-w-5xl">
            <span className="font-label inline-flex items-center gap-2.5 text-ink/65">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {m.eyebrow}
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,6.6vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.05em]">
              {m.title}
              <em className="font-em pr-[0.06em] text-[1.06em] text-brand-gradient">
                {m.highlight}
              </em>
            </h1>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-ink/70 sm:text-[17px]">
              {m.baseline}
            </p>
          </div>
        </div>
      </section>

      {/* BUILDER */}
      <section className="relative px-3 pb-16 sm:px-6 sm:pb-24 lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <DevisBuilder open variant={variant} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
