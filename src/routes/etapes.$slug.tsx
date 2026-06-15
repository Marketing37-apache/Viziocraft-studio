import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const CDN2 = "https://cdn.prod.website-files.com/6996b2b29f614702ad210f72";
const step1 = `${CDN2}/69bbd209b6d1ec9b233be4af_DSC00306-p-1600.jpg`;
const step2 = `${CDN2}/69bbd24fca314a4a29a46fe9_DSC00269-p-1600.jpg`;
const step3 = `${CDN2}/69bbd298e7222bfba34e34da_DSC00274-p-1600.jpg`;
const step4 = `${CDN2}/69bbd390da6242586058293c_DSC00314-p-1600.jpg`;

type Etape = {
  n: string;
  slug: string;
  title: string;
  tagline: string;
  img: string;
  intro: string;
  blocks: { h: string; p: string }[];
  next?: { slug: string; title: string };
  prev?: { slug: string; title: string };
};

const ETAPES: Record<string, Etape> = {
  "appel-de-preparation": {
    n: "01",
    slug: "appel-de-preparation",
    title: "L'appel de préparation",
    tagline: "On analyse ton besoin, ton positionnement, ta DA.",
    img: step1,
    intro:
      "Avant toute production, on prend le temps de comprendre — ton activité, ton audience, ton image actuelle et ce que tu cherches à transformer. C'est l'étape qui conditionne tout le reste.",
    blocks: [
      { h: "Comprendre ton business", p: "On parle branding, performance, audience, cohérence. Pas juste « tu veux quel style ? » — on cherche d'abord ce que la vidéo doit accomplir pour toi." },
      { h: "Cadrer ta DA", p: "Ton univers visuel, ta typographie, tes références, tes refus. On construit un cadre clair pour garantir une cohérence sur l'ensemble des livrables." },
      { h: "Définir le workflow", p: "Volume, formats, délais, points de validation, canaux de communication. Tout est posé dès le départ pour éviter les frictions plus tard." },
    ],
    next: { slug: "video-test", title: "Démarrage du projet" },
  },
  "video-test": {
    n: "02",
    slug: "video-test",
    title: "Démarrage du projet",
    tagline: "On monte une première vidéo pour valider le rendu, le rythme, le style.",
    img: step2,
    intro:
      "Plutôt que de te demander de te fier à des mots, on produit. Une vraie vidéo, sur ton vrai contenu, dans ton vrai style. Tu vois exactement ce que tu vas recevoir — semaine après semaine.",
    blocks: [
      { h: "Une preuve, pas une promesse", p: "On monte une vidéo complète avec ton DA, ton rythme, tes codes. Si quelque chose ne te plaît pas, on ajuste avant de lancer la production en volume." },
      { h: "Calibrage du style", p: "Tu valides : ton de voix, choix de b-rolls, niveau de motion, traitement des sous-titres, format des intros. On verrouille les standards." },
      { h: "Aucun engagement", p: "Tu décides après si on continue. Pas de surprise, pas de qualité aléatoire en cours de route." },
    ],
    prev: { slug: "appel-de-preparation", title: "L'appel de préparation" },
    next: { slug: "production", title: "La production" },
  },
  production: {
    n: "03",
    slug: "production",
    title: "La production",
    tagline: "Si tu as plusieurs vidéos, on déploie plusieurs monteurs.",
    img: step3,
    intro:
      "Une fois la DA validée, on passe en mode production continue. Le secret : tu n'es jamais bloqué par la dispo d'un seul monteur. On dimensionne l'équipe selon ton volume — pas l'inverse.",
    blocks: [
      { h: "Scalable", p: "+20 monteurs disponibles. 5 vidéos cette semaine, 30 la semaine prochaine — on absorbe. Pas de freelance débordé, pas de ghosting." },
      { h: "Chef de projet attitré", p: "Un seul interlocuteur côté VizioCraft. Il connaît ton univers, ton historique, tes préférences. Communication fluide et continue." },
      { h: "Qualité constante", p: "Standards verrouillés à l'étape précédente. Chaque monteur travaille avec les mêmes guides — la cohérence reste impeccable même en volume." },
    ],
    prev: { slug: "video-test", title: "La vidéo test" },
    next: { slug: "communiquer", title: "Communiquer" },
  },
  communiquer: {
    n: "04",
    slug: "communiquer",
    title: "Communiquer",
    tagline: "WhatsApp et Frame.io, nos deux outils pour rester en contact.",
    img: step4,
    intro:
      "On reste accessible. WhatsApp pour l'échange rapide et humain, Frame.io pour la review précise sur chaque seconde de la vidéo. Pas d'aller-retour confus par email.",
    blocks: [
      { h: "WhatsApp pour la fluidité", p: "Pour les briefs rapides, les ajustements, les demandes urgentes. Conversation directe avec ton chef de projet — pas de ticket, pas d'attente." },
      { h: "Frame.io pour la review", p: "Tu commentes directement sur la timeline, à la seconde près. Le monteur voit exactement où ajuster — fini les « à 0:34 environ »." },
      { h: "Drive pour les rushs", p: "Tu déposes tes fichiers, on prend la suite. Si tu mets tes rushs un vendredi, ta vidéo est prête pour une mise en ligne le lundi." },
    ],
    prev: { slug: "production", title: "La production" },
  },
};

export const Route = createFileRoute("/etapes/$slug")({
  loader: ({ params }): { etape: Etape } => {
    const etape = ETAPES[params.slug];
    if (!etape) throw notFound();
    return { etape };
  },
  component: EtapePage,
});

function EtapePage() {
  const { etape } = Route.useLoaderData() as { etape: Etape };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-12 lg:pt-44 lg:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(123,45,142,0.3),transparent)] blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Retour à l'accueil
          </Link>
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.3em] text-brand-gradient">
            Étape {etape.n} / 04
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {etape.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{etape.tagline}</p>
        </div>
      </section>

      {/* Big image */}
      <section className="px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-foreground/10">
            <img src={etape.img} alt={etape.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-xl leading-relaxed text-foreground/90 sm:text-2xl">{etape.intro}</p>
        </div>
      </section>

      {/* Blocks */}
      <section className="border-t border-foreground/10 px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-5xl space-y-12">
          {etape.blocks.map((b, i) => (
            <div key={b.h} className="grid gap-4 sm:grid-cols-[120px_1fr] sm:gap-10">
              <p className="text-sm font-medium uppercase tracking-wider text-brand-gradient">
                0{i + 1}
              </p>
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">{b.h}</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{b.p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Next / prev */}
      <section className="border-t border-foreground/10 px-6 py-16 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:justify-between">
          {etape.prev ? (
            <Link
              to="/etapes/$slug"
              params={{ slug: etape.prev.slug }}
              className="group rounded-2xl border border-foreground/10 bg-card p-6 transition hover:border-foreground/20 sm:w-1/2"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Étape précédente</p>
              <p className="mt-2 text-lg font-semibold">
                <span className="transition group-hover:-translate-x-1 inline-block">←</span> {etape.prev.title}
              </p>
            </Link>
          ) : <div className="sm:w-1/2" />}
          {etape.next ? (
            <Link
              to="/etapes/$slug"
              params={{ slug: etape.next.slug }}
              className="group rounded-2xl border border-foreground/10 bg-card p-6 transition hover:border-foreground/20 sm:w-1/2 sm:text-right"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Étape suivante</p>
              <p className="mt-2 text-lg font-semibold">
                {etape.next.title} <span className="transition group-hover:translate-x-1 inline-block">→</span>
              </p>
            </Link>
          ) : (
            <Link
              to="/"
              hash="contact"
              className="group rounded-2xl border border-transparent bg-brand-gradient p-6 text-white transition hover:opacity-90 sm:w-1/2 sm:text-right"
            >
              <p className="text-xs uppercase tracking-wider text-white/80">On démarre ?</p>
              <p className="mt-2 text-lg font-semibold">
                Parlons de votre projet <span className="transition group-hover:translate-x-1 inline-block">→</span>
              </p>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
