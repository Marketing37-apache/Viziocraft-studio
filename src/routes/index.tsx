import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { Faq } from "@/components/Faq";
import { MarqueeShorts, type ShortItem } from "@/components/MarqueeShorts";
import { ServicesShowcase } from "@/components/ServicesShowcase";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { DevisBuilder } from "@/components/DevisBuilder";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "VizioCraft — Agence de montage vidéo premium" },
      { name: "description", content: "Votre équipe vidéo dédiée. Shorts, ads, podcasts, motion design. +35 clients, +1000 vidéos produites." },
      { property: "og:title", content: "VizioCraft — Agence de montage vidéo premium" },
      { property: "og:description", content: "Votre équipe vidéo dédiée. Production scalable, qualité constante." },
    ],
  }),
});

const CDN = "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02";
const CONTACT_FRAME = `${CDN}/6999a130299153a6ec0f8c4a_Frame%201.avif`;
const PRESENTATION_YT = "S3AOQxL4Uio";
const YOUTUBE_PREVIEW_PARAMS = "rel=0&modestbranding=1&playsinline=1&mute=1&autoplay=1&loop=1&controls=0";

// ——— Shorts split into 2 rows (left + right scrolling, no gap, no cut) ———
const SHORTS_ROW_A: ShortItem[] = [
  { id: "STDO3CoZ1B8", client: "Alexandre Chiabai" },
  { id: "FkZdFfPfqc0", client: "Charles Gastaud" },
  { id: "1194RRrMcUE", client: "Nina Voit" },
  { id: "jdfCIJPPbZA", client: "Twiice Auto" },
  { id: "65Q6lfhRLAg", client: "Opluo Podcast" },
  { id: "fFhwa6ajPlE", client: "Essential Talk" },
  { id: "zQrxTk-qulE", client: "Marvin Ndiaye" },
  { id: "KBQdckODVo8", client: "Alexandre Chiabai" },
  { id: "YOTxD57xchs", client: "Charles Gastaud" },
  { id: "vi4dMM8uOys", client: "Nina Voit" },
  { id: "5cCGAZm8Ejg", client: "Twiice Auto" },
  { id: "xT4Ki6kyVmc", client: "Opluo Podcast" },
  { id: "UxPdz8im8U4", client: "French Gem Hunter" },
  { id: "fYZlCGaTZZQ", client: "Lucas Lopez" },
];

const SHORTS_ROW_B: ShortItem[] = [
  { id: "DUEgEWEAasg", client: "Alexandre Chiabai" },
  { id: "rkkfYZqnLdM", client: "Charles Gastaud" },
  { id: "YRLBqozhWsw", client: "Nina Voit" },
  { id: "9gxlZETjKKY", client: "Twiice Auto" },
  { id: "-8xG51E4Y6o", client: "Opluo Podcast" },
  { id: "i-TBNjN_aQw", client: "Essential Talk" },
  { id: "T6ws087EuiI", client: "Benoit Moget" },
  { id: "pCLNrvOxidM", client: "Charles Gastaud" },
  { id: "vY0iAaxEA_A", client: "Charles Gastaud" },
  { id: "HhvO2W4Srt0", client: "Charles Gastaud" },
  { id: "55gYp9tRL1c", client: "French Gem Hunter" },
  { id: "Awdktu9wM5c", client: "French Gem Hunter" },
  { id: "8mpa7elY4DQ", client: "French Gem Hunter" },
  { id: "b7C1TC4IfqM", client: "French Gem Hunter" },
];

type LongVideo = {
  id: string;
  href: string;
  title: string;
};

const LONGS: LongVideo[] = [
  { id: "Tap2qqLun3c", href: "https://youtu.be/Tap2qqLun3c", title: "Format long 1" },
  { id: "JNJIKiUQ5EU", href: "https://youtu.be/JNJIKiUQ5EU", title: "Format long 2" },
  { id: "8uI05E19ezk", href: "https://youtu.be/8uI05E19ezk", title: "Format long 3" },
  { id: "qrlorS0FBWY", href: "https://youtu.be/qrlorS0FBWY", title: "Format long 4" },
  { id: "w5a3u9f3bq0", href: "https://youtu.be/w5a3u9f3bq0", title: "Format long 5" },
  { id: "3DzzmIkyowc", href: "https://youtu.be/3DzzmIkyowc", title: "Format long 6" },
  { id: "Q1nv33ehBJM", href: "https://youtu.be/Q1nv33ehBJM", title: "Format long 7" },
];

function LongsCarousel({ items }: { items: LongVideo[] }) {
  const [visible, setVisible] = useState<LongVideo[] | null>(null);

  useEffect(() => {
    let mounted = true;

    async function runChecks() {
      try {
        const checks = await Promise.all(
          items.map(async (v) => {
            try {
              const res = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.id}&format=json`
              );
              if (!res.ok) return null;
              await res.json();
              return v;
            } catch (_) {
              return null;
            }
          })
        );

        if (!mounted) return;
        const filtered = checks.filter(Boolean) as LongVideo[];
        setVisible(filtered.length ? filtered : []);
      } catch (e) {
        if (mounted) setVisible(items);
      }
    }

    runChecks();
    return () => {
      mounted = false;
    };
  }, [items]);

  const available = visible === null ? items : visible;
  if (!available || available.length === 0) return null;

  const loop = [...available, ...available];
  const duration = Math.max(40, available.length * 12);

  return (
    <div
      className="relative overflow-hidden"
      style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}
    >
      <div className="flex gap-5 w-max animate-marquee-left" style={{ animationDuration: `${duration}s` }}>
        {loop.map((video, index) => (
          <a
            key={`${video.id}-${index}`}
            href={video.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Voir ${video.title}`}
            className="group block min-w-[280px] sm:min-w-[320px] md:min-w-[360px]"
          >
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-foreground/10 bg-black ring-brand shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] transition group-hover:shadow-[0_30px_80px_-20px_rgba(123,45,142,0.5)]">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?${YOUTUBE_PREVIEW_PARAMS}&playlist=${video.id}`}
                title={video.title}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </a>
        ))}
      </div>
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-left {
          animation: marquee-left linear infinite;
        }
        .animate-marquee-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

const FAQS = [
  {
    q: "Je publie 3-4 vidéos par semaine, vous pouvez vraiment tenir la cadence sans baisser la qualité ?",
    a: "Oui — on est plus de 20 monteurs dans l'équipe. Quand un client a besoin de volume, on déploie 2 ou 3 monteurs en parallèle avec un chef de projet qui garantit la cohérence. Aujourd'hui certains clients sortent jusqu'à 30 vidéos/mois avec nous sans aucune perte de qualité.",
  },
  {
    q: "J'ai déjà un style très spécifique, comment vous l'apprenez sans devoir tout reprendre ?",
    a: "On commence toujours par une vidéo test sur votre vrai contenu, dans votre vrai style. Vous validez la DA, on verrouille les standards (sous-titres, rythme, b-rolls, sound design), et le reste de la production suit cette charte précise. Vous n'avez pas à expliquer 10 fois.",
  },
  {
    q: "Combien de temps entre l'envoi du rush et la vidéo livrée ?",
    a: "72h en standard pour les premières vidéos. Une fois en production continue, on livre souvent dès le lendemain. Si c'est urgent, on a une option 24h express et on peut prioriser sans déstabiliser le reste du planning.",
  },
  {
    q: "Et si la vidéo ne me plaît pas du premier coup ?",
    a: "On ajuste. Vous laissez vos commentaires directement sur la timeline via Frame.io (à la seconde près), on retravaille et on renvoie. En offre ponctuelle 2 retours sont inclus, en abonnement les retours sont illimités dans la limite du raisonnable.",
  },
  {
    q: "Vous travaillez avec qui ? Des créateurs, des marques ?",
    a: "Les deux. On a aujourd'hui +35 clients actifs : créateurs de contenu, podcasteurs, marques B2B, agences. Plus de 1000 vidéos produites au total. On adapte notre process à chaque profil — pas la même approche pour un YouTubeur que pour une agence de pub.",
  },
  {
    q: "Au quotidien, comment on communique ? J'ai pas envie d'une chaîne d'emails interminable.",
    a: "Justement non. On utilise WhatsApp pour les échanges rapides et Frame.io pour les retours précis sur la vidéo. Vous avez un interlocuteur fixe (chef de projet) qui vous répond en moins de 2h, 7j/7.",
  },
  {
    q: "Vous êtes basés à Madagascar — c'est compliqué pour la communication ?",
    a: "Pas du tout. On est sur le même fuseau horaire (GMT+3, 1h de décalage avec la France en été). Tous les fondateurs et chefs de projet sont francophones natifs. Pour beaucoup de clients on est plus réactifs que leur ancienne agence parisienne.",
  },
  {
    q: "Pourquoi vos tarifs sont 3× moins chers qu'une agence en France ?",
    a: "Charges et coûts opérationnels plus bas à Madagascar — c'est tout. La qualité, l'équipement et l'expertise sont exactement les mêmes (souvent meilleurs car on est spécialistes vidéo, pas une agence généraliste). On reverse la différence à nos clients, pas en marges.",
  },
  {
    q: "Qui est propriétaire des fichiers finaux ?",
    a: "Vous. 100 %. Vous récupérez les exports finaux, et sur demande on vous envoie aussi les projets sources (Premiere, After Effects). Aucune clause de rétention.",
  },
  {
    q: "Concrètement, comment on démarre ?",
    a: "Vous remplissez le formulaire en bas de page. On vous appelle sous 24h pour comprendre votre besoin, on monte une vidéo test sur votre contenu, vous validez, et on lance la production.",
  },
];

function Index() {
  const [openDevis, setOpenDevis] = useState(false);
  const [devisVariant, setDevisVariant] = useState<"essentiel" | "surmesure">("essentiel");

  const openBuilder = (variant: "essentiel" | "surmesure") => {
    setDevisVariant(variant);
    setOpenDevis(true);
  };

  return (
    <main className="overflow-x-hidden">
      <Nav />

      {/* HERO */}
      <section className="surface-ink relative overflow-hidden pt-32 pb-24 lg:pt-44 lg:pb-32">
        <div className="grain" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="fade-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Agence de montage vidéo · Disponibles 7j/7
              </span>
              <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl text-white">
                Votre équipe vidéo<br /><span className="text-brand-gradient">dédiée.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
                Shorts, publicités, podcasts et branding vidéo produits avec rapidité,
                cohérence et exigence — pensés pour scaler votre contenu sans compromis.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#showreel" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#1a0b2e] hover:opacity-90 transition">
                  Voir nos réalisations
                </a>
                <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/10 transition">
                  Démarrer un projet →
                </a>
              </div>
              <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                <Stat k="+35" v="Clients satisfaits" />
                <Stat k="+1000" v="Vidéos produites" />
                <Stat k="7j/7" v="Production en continu" />
              </dl>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-30 blur-3xl" />
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${PRESENTATION_YT}?${YOUTUBE_PREVIEW_PARAMS}&playlist=${PRESENTATION_YT}`}
                    title="Présentation VizioCraft"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="h-full w-full"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-white/55 text-center">Présentation de l'agence · 2 min</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="border-y border-foreground/5 bg-muted/30 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-6 text-xs uppercase tracking-[0.2em] text-muted-foreground lg:px-10">
          <span>Reels</span><Dot /><span>YouTube</span><Dot /><span>TikTok</span><Dot /><span>Ads</span><Dot /><span>Podcasts</span><Dot /><span>Motion design</span><Dot /><span>Corporate</span>
        </div>
      </section>

      {/* SHOWREEL — auto-scrolling marquees */}
      <section id="showreel" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <Eyebrow>Réalisations récentes</Eyebrow>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
              Le travail parle <span className="text-brand-gradient">pour nous.</span>
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Une sélection de shorts produits pour des créateurs et marques. Survolez pour mettre en pause.
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-5">
          <MarqueeShorts items={SHORTS_ROW_A} direction="left" speed={90} />
          <MarqueeShorts items={SHORTS_ROW_B} direction="right" speed={100} />
        </div>

        {/* Long-form formats */}
        <div className="mx-auto mt-20 max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Formats longs</span>
              <h3 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">Des formats longs qui captent jusqu’au dernier plan.</h3>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Des formats longuement pensés pour maintenir l’attention, avec des b-rolls cohérents, une DA forte et une narration qui reste en mémoire.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <LongsCarousel items={LONGS} />
          </div>
        </div>
      </section>

      {/* SERVICES — floating cards */}
      <section id="services" className="relative bg-muted/40 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <Eyebrow>Services</Eyebrow>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
              Une production vidéo pensée<br />pour <span className="text-brand-gradient">scaler votre contenu.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Sous-titres, b-rolls, animations, IA — quelle que soit votre DA, nous adaptons
              chaque contenu à votre identité et à votre audience. Survolez chaque format pour découvrir le détail.
            </p>
          </div>
          <ServicesShowcase />
        </div>
      </section>

      {/* PROCESS — timeline */}
      <section id="process" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Comment ça se passe</Eyebrow>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
              Un workflow rapide,<br />structuré, et <span className="text-brand-gradient">fiable.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Une méthode éprouvée en 4 étapes — pensée pour garantir cohérence et qualité constante,
              projet après projet.
            </p>
          </div>
          <ProcessTimeline />
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="relative bg-muted/40 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <Eyebrow>Tarifs</Eyebrow>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
              Trois manières de travailler <span className="text-brand-gradient">ensemble.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pas de surprises, pas de frais cachés. Les détails du devis se construisent à la demande.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* Essentiel — léger */}
            <div className="relative flex flex-col rounded-3xl border border-foreground/10 bg-card p-8 transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(123,45,142,0.25)]">
              <span className="inline-flex w-fit items-center rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">À la vidéo</span>
              <h3 className="mt-4 font-display text-2xl">Montage essentiel</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pour tester sans engagement</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl">12–25€</span>
                <span className="text-sm text-muted-foreground">/ short</span>
              </div>
              <p className="text-xs text-muted-foreground">40–90€ / long format</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["Short ou long format au choix", "Sous-titres disponibles", "B-roll & effets possibles", "Révisions incluses", "Livraison en 48h"].map((f) => (
                  <li key={f} className="flex items-start gap-3"><Check /> {f}</li>
                ))}
              </ul>
              <button
                onClick={() => openBuilder("essentiel")}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-transparent px-5 py-3 text-sm font-semibold transition hover:border-primary hover:bg-brand-soft hover:text-primary"
              >
                Créer mon devis →
              </button>
            </div>

            {/* Continu — populaire, dark */}
            <div className="relative flex flex-col rounded-3xl border-2 border-transparent bg-[#1a0b2e] p-8 text-white shadow-[0_40px_70px_-25px_rgba(123,45,142,0.55)] lg:scale-[1.03]">
              <div className="absolute -inset-px -z-10 rounded-3xl bg-brand-gradient opacity-50 blur-2xl" />
              <span className="absolute -top-3 left-8 rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
                Le plus populaire
              </span>
              <span className="inline-flex w-fit items-center rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90">Abonnement</span>
              <h3 className="mt-4 font-display text-2xl">Montage continu</h3>
              <p className="mt-1 text-sm text-white/65">Production sans interruption</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl">850 €</span>
                <span className="text-sm text-white/70">/ mois</span>
              </div>
              <p className="text-xs text-white/65">Jusqu'à 20 shorts + 4 longs formats</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["Shorts ET longs formats inclus", "Support prioritaire", "Révisions illimitées", "Livraison continue", "Au-delà : tarif préférentiel"].map((f) => (
                  <li key={f} className="flex items-start gap-3"><CheckLight /> {f}</li>
                ))}
              </ul>
              <a
                href="#contact"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1a0b2e] hover:opacity-90"
              >
                Démarrer →
              </a>
            </div>

            {/* Sur mesure */}
            <div className="relative flex flex-col rounded-3xl border border-foreground/10 bg-card p-8 transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(123,45,142,0.25)]">
              <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">Sur mesure</span>
              <h3 className="mt-4 font-display text-2xl">Production personnalisée</h3>
              <p className="mt-1 text-sm text-muted-foreground">Entièrement à la carte</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl">Prix</span>
                <span className="text-sm text-muted-foreground">calculé live</span>
              </div>
              <p className="text-xs text-muted-foreground">Shorts, longs ou les deux</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["Vous choisissez chaque option", "Mix shorts + longs possible", "Devis détaillé par mail", "Réduction 1re commande"].map((f) => (
                  <li key={f} className="flex items-start gap-3"><Check /> {f}</li>
                ))}
              </ul>
              <button
                onClick={() => openBuilder("surmesure")}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white glow-brand hover:opacity-95"
              >
                Configurer →
              </button>
            </div>
          </div>

          {/* Hidden builder */}
          <DevisBuilder open={openDevis} variant={devisVariant} onClose={() => setOpenDevis(false)} />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <Eyebrow>Vos questions, nos réponses</Eyebrow>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
              Les vraies <span className="text-brand-gradient">questions</span> que nos clients nous posent.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Vous ne trouvez pas votre réponse ? Posez-la directement dans le formulaire — on revient sous 24h.
            </p>
          </div>
          <Faq items={FAQS} />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-[radial-gradient(closest-side,rgba(123,45,142,0.18),transparent)] blur-3xl" />
          <div className="absolute -right-32 bottom-20 h-[500px] w-[500px] rounded-full bg-[radial-gradient(closest-side,rgba(43,168,226,0.18),transparent)] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
            <div className="relative flex flex-col">
              <Eyebrow>Contact</Eyebrow>
              <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
                Discutons de votre <span className="text-brand-gradient">projet.</span>
              </h2>
              <p className="mt-5 text-muted-foreground">
                VizioCraft est une société basée à Madagascar, fondée par deux frères passionnés
                par la création de contenu. Notre mission : offrir une solution concrète aux pros
                qui veulent produire vite et bien, sans compromis sur la qualité.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <BigStat k="+35" v="Clients satisfaits" />
                <BigStat k="+1000" v="Vidéos produites" />
              </div>

              <div className="relative mt-8 flex-1">
                <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-gradient opacity-25 blur-2xl" />
                <div className="relative h-full overflow-hidden rounded-[2rem] border border-foreground/10 shadow-2xl">
                  <img src={CONTACT_FRAME} alt="Les fondateurs VizioCraft" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a0b2e] via-[#1a0b2e]/60 to-transparent p-6 text-white sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Charles & Alexandre</p>
                    <p className="mt-1 font-display text-xl sm:text-2xl">Vos interlocuteurs directs, du premier appel au dernier rendu.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-foreground/10 bg-card p-7 sm:p-10 shadow-[0_40px_80px_-30px_rgba(123,45,142,0.3)]">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Réponse sous 24h
              </span>
              <h3 className="mt-4 font-display text-2xl sm:text-3xl">Réserver un appel de préparation</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Quelques infos suffisent — on revient vers vous rapidement pour caler un appel et discuter
                de votre projet (formats, volume, délais).
              </p>
              <div className="mt-7">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ——— atoms ——— */
function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-display text-3xl text-white">{k}</dt>
      <dd className="mt-1 text-xs text-white/60">{v}</dd>
    </div>
  );
}
function BigStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5">
      <p className="font-display text-3xl text-brand-gradient">{k}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{v}</p>
    </div>
  );
}
function Dot() { return <span className="h-1 w-1 rounded-full bg-foreground/30" />; }
function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-xs font-semibold uppercase tracking-[0.22em] text-primary ${className}`}>{children}</span>;
}
function Check() {
  return <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient text-[9px] text-white">✓</span>;
}
function CheckLight() {
  return <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] text-white">✓</span>;
}

// Silence unused import warning if Link not used
void Link;
