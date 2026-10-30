import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { CalendlyWidget } from "@/components/CalendlyWidget";
import { Faq, type FaqItem } from "@/components/Faq";
import { WorkGallery } from "@/components/WorkGallery";
import { Process } from "@/components/Process";
import { WarmContext, WorkTile } from "@/components/WorkTile";
import { bySlug } from "@/data/work";
import { IntroLoader } from "@/components/IntroLoader";
import { Atmosphere } from "@/components/Atmosphere";
import { HoverVideo, landscapePosters, type Poster } from "@/components/HoverVideo";
import { VideoLightbox } from "@/components/VideoLightbox";
import {
  CountUp,
  MaskLines,
  useMagnetic,
  useMarquee,
  useTilt,
  useViewProgress,
} from "@/lib/motion";

// Flag pour masquer temporairement l'offre "Montage continu"
const SHOW_MONTAGE_CONTINU = false;

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "VizioCraft - L'équipe montage vidéo qui pense chaque seconde" },
      {
        name: "description",
        content:
          "Agence de montage vidéo : shorts, ads, podcasts et formats longs produits avec rapidité, cohérence et exigence. +100 clients, +5000 vidéos.",
      },
      { property: "og:title", content: "VizioCraft - Votre équipe monteur vidéo dédiée" },
      {
        property: "og:description",
        content: "Production scalable, qualité constante. +5000 vidéos livrées.",
      },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: PRESENTATION_POSTERS[0].src,
        fetchPriority: "high",
      },
    ],
  }),
});

const CDN = "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02";
const CONTACT_FRAME = `${CDN}/6999a130299153a6ec0f8c4a_Frame%201.avif`;
const FOUNDER_A = `${CDN}/69998b87a516cf380be00adc_Frame%201.avif`;
const FOUNDER_B = `${CDN}/69998b8714bfe203a0795193_Frame%202.avif`;
const PRESENTATION_YT = "S3AOQxL4Uio";
/* Miniature du hero : une image plein cadre extraite de la vidéo (1280x720, webp, ~35 Ko).
   Pour en changer : maxres1 / maxres2 / maxres3, ou le chemin d'une image maison. */
const PRESENTATION_POSTERS: Poster[] = [
  { src: `https://i.ytimg.com/vi_webp/${PRESENTATION_YT}/maxres2.webp`, fit: "cover" },
  ...landscapePosters(PRESENTATION_YT),
];

const FORMAT_TAGS = [
  "Reels",
  "YouTube",
  "TikTok",
  "Ads",
  "Podcasts",
  "Motion design",
  "Corporate",
  "Shorts",
  "Branding",
  "Documentaire",
];

/* Les 4 questions qui décident un client. Affichées d'emblée. */
const FAQ_FEATURED: FaqItem[] = [
  {
    q: "Combien de temps entre l'envoi des rushs et la vidéo livrée ?",
    a: "72h en standard pour les premières vidéos. Une fois en production continue, on livre souvent dès le lendemain. Si c'est urgent, on a une option 24h express et on peut prioriser sans déstabiliser le reste du planning.",
  },
  {
    q: "Et si la vidéo ne me plaît pas du premier coup ?",
    a: "On ajuste. Vous laissez vos commentaires directement sur la timeline via Frame.io (à la seconde près), on retravaille et on renvoie. En offre ponctuelle 2 retours sont inclus, en abonnement les retours sont illimités dans la limite du raisonnable.",
  },
  {
    q: "Pourquoi vos tarifs sont 3× moins chers qu'une agence en France ?",
    a: "Charges et coûts opérationnels plus bas à Madagascar, c'est tout. La qualité, l'équipement et l'expertise sont exactement les mêmes (souvent meilleurs car on est spécialistes vidéo, pas une agence généraliste). On reverse la différence à nos clients, pas en marges.",
  },
  {
    q: "3 à 4 vidéos par semaine : vous tenez vraiment la cadence ?",
    a: "Oui, on est plus de 20 monteurs dans l'équipe. Quand un client a besoin de volume, on déploie 2 ou 3 monteurs en parallèle avec un chef de projet qui garantit la cohérence. Aujourd'hui certains clients sortent jusqu'à 30 vidéos par mois avec nous sans aucune perte de qualité.",
  },
];

/* Le reste, replié derrière "Voir les autres questions". */
const FAQ_MORE: FaqItem[] = [
  {
    q: "J'ai déjà un style très spécifique, comment vous l'apprenez ?",
    a: "On commence toujours par une vidéo test sur votre vrai contenu, dans votre vrai style. Vous validez la DA, on verrouille les standards (sous-titres, rythme, b-rolls, sound design), et le reste de la production suit cette charte précise. Vous n'avez pas à expliquer 10 fois.",
  },
  {
    q: "Vous travaillez avec qui ? Des créateurs, des marques ?",
    a: "Les deux. On a aujourd'hui +100 clients actifs : créateurs de contenu, podcasteurs, marques B2B, agences. Plus de 5000 vidéos produites au total. On adapte notre process à chaque profil : pas la même approche pour une YouTubeuse que pour une agence de pub.",
  },
  {
    q: "Au quotidien, comment on communique ?",
    a: "Sans chaîne d'emails interminable. On utilise WhatsApp pour les échanges rapides et Frame.io pour les retours précis sur la vidéo. Vous avez un interlocuteur fixe (chef de projet) qui vous répond en moins de 2h, 7j/7.",
  },
  {
    q: "Vous êtes basés à Madagascar : c'est compliqué pour communiquer ?",
    a: "Pas du tout. On est sur un fuseau très proche (GMT+3, 1h de décalage avec la France en été). Tous les fondateurs et chefs de projet sont francophones natifs. Pour beaucoup de clients on est plus réactifs que leur ancienne agence parisienne.",
  },
  {
    q: "Qui est propriétaire des fichiers finaux ?",
    a: "Vous, à 100 %. Vous récupérez les exports finaux, et sur demande on vous envoie aussi les projets sources (Premiere, After Effects). Aucune clause de rétention.",
  },
  {
    q: "Concrètement, comment on démarre ?",
    a: "Vous réservez un appel en bas de page. On prend 30 minutes pour comprendre votre besoin, on monte une vidéo test sur votre contenu, vous validez, et on lance la production.",
  },
];

/* Délai d'entrée : attend la fin de l'intro quand elle est jouée. */
const after = (ms: number): CSSProperties =>
  ({ ["--rd"]: `calc(var(--intro-delay, 0ms) + ${ms}ms)` }) as CSSProperties;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-label inline-flex items-center gap-2.5 text-ink/65">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {children}
    </span>
  );
}

function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`btn-arrow ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ------------------------- HERO ------------------------- */

function Hero() {
  const magnetic = useMagnetic<HTMLAnchorElement>(0.25);
  const [warm, setWarm] = useState(false);
  const warmed = useRef(false);

  /* La scène vidéo grandit à mesure qu'elle entre dans l'écran. */
  const stageRef = useViewProgress<HTMLDivElement>(
    (p, el) => el.style.setProperty("--p", p.toFixed(4)),
    { start: 1, end: 0.3 },
  );

  return (
    <section
      id="top"
      className="after-intro relative pt-[104px] sm:pt-[124px] lg:pt-[136px]"
      /* dès que la souris bouge, on prépare le lecteur : la lecture au survol sera immédiate */
      onPointerMove={(e) => {
        if (warmed.current || e.pointerType !== "mouse") return;
        warmed.current = true;
        setWarm(true);
      }}
    >
      <div className="shell">
        <div
          className="flex items-center justify-between gap-4"
          data-reveal="fade"
          style={after(0)}
        >
          <span className="flex items-center gap-2.5">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-label text-ink/65">Agence de montage vidéo</span>
          </span>
          <span className="font-label hidden text-ink/60 sm:block">
            +100 clients · +5000 vidéos livrées
          </span>
        </div>

        <div className="mt-5 grid gap-8 sm:mt-7 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1
            data-reveal="fade"
            style={after(0)}
            className="whitespace-nowrap font-display text-[clamp(2.6rem,13.2vw,6rem)] font-bold leading-[0.88] tracking-[-0.055em] text-ink lg:col-span-8 lg:text-[min(8.7vw,17.5vh,7.85rem)]"
          >
            <MaskLines
              delay={80}
              step={110}
              lines={[
                <span className="inline-flex items-center gap-[0.16em]">
                  Votre équipe
                  <span
                    aria-hidden
                    className="hidden inline-flex shrink-0 items-center rounded-full bg-white/70 p-[0.045em] shadow-[0_10px_30px_-14px_rgba(12,10,18,0.5)] ring-1 ring-ink/10"
                  >
                    <img
                      src={FOUNDER_A}
                      alt=""
                      className="h-[0.56em] w-[0.56em] rounded-full object-cover"
                    />
                    <img
                      src={FOUNDER_B}
                      alt=""
                      className="-ml-[0.16em] h-[0.56em] w-[0.56em] rounded-full object-cover ring-2 ring-white"
                    />
                    <span className="-ml-[0.16em] hidden h-[0.56em] w-[0.56em] items-center justify-center rounded-full bg-ink ring-2 ring-white sm:flex">
                      <span className="text-[0.17em] font-semibold tracking-normal text-white">
                        +20
                      </span>
                    </span>
                  </span>
                </span>,
                <>monteur vidéo</>,
                <span className="relative inline-block">
                  <em className="font-em pr-[0.08em] text-[1.07em] text-brand-gradient">dédiée.</em>
                  <svg
                    aria-hidden
                    viewBox="0 0 300 20"
                    preserveAspectRatio="none"
                    className="scribble absolute -bottom-[0.02em] left-0 h-[0.13em] w-[96%]"
                    fill="none"
                    style={{ ["--sd" as string]: "calc(var(--intro-delay, 0ms) + 950ms)" }}
                  >
                    <path
                      d="M3 13C52 5 98 16 148 10s96-9 149-1"
                      pathLength={1}
                      stroke="url(#vz-scribble)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    <defs>
                      <linearGradient id="vz-scribble" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0" stopColor="#7b2d8e" />
                        <stop offset="1" stopColor="#2ba8e2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>,
              ]}
            />
          </h1>

          <div className="lg:col-span-4 lg:pb-[1.2vh]">
            <p
              data-reveal="up"
              style={after(420)}
              className="max-w-md text-[16px] leading-relaxed text-ink/70 sm:text-[17px]"
            >
              Shorts, publicités, podcasts et formats longs produits avec une seule obsession :
              capter l'attention dès la première seconde, et la tenir jusqu'à la dernière.
            </p>

            <div
              className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center"
              data-reveal="up"
              style={after(520)}
            >
              <a
                ref={magnetic}
                href="#showreel"
                className="btn-vz rounded-full bg-ink px-6 py-4 text-[14.5px] font-semibold text-white shadow-[0_22px_44px_-22px_rgba(12,10,18,0.75)]"
              >
                Voir les réalisations
                <Arrow />
              </a>
              <a
                href="/devis/surmesure"
                className="btn-vz rounded-full border border-ink/15 bg-white/60 px-6 py-4 text-[14.5px] font-semibold text-ink backdrop-blur"
                style={{ ["--btn-fill" as string]: "#0c0a12" }}
              >
                Calculer mon devis
                <span className="font-label opacity-60">2 min</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scène vidéo, taille modérée : la présentation au centre, deux réalisations
          verticales en satellites. Miniatures d'abord, lecture au survol, son au clic. */}
      <div className="shell mt-10 sm:mt-12 lg:mt-[6vh]">
        <div
          ref={stageRef}
          className="hero-stage relative mx-auto w-full max-w-[1120px]"
          data-reveal="scale"
          style={after(300)}
        >
          <WarmContext.Provider value={warm}>
            <div className="hero-sat hero-sat--left hidden lg:block">
              <WorkTile
                work={bySlug("ugc-boutique")}
                compact
                className="rounded-[20px] shadow-[0_40px_80px_-40px_rgba(12,10,18,0.75)] ring-1 ring-ink/10"
              />
            </div>
            <div className="hero-sat hero-sat--right hidden lg:block">
              <WorkTile
                work={bySlug("reel-sport")}
                compact
                className="rounded-[20px] shadow-[0_40px_80px_-40px_rgba(12,10,18,0.75)] ring-1 ring-ink/10"
              />
            </div>
          </WarmContext.Provider>

          <div className="hero-stage-inner relative z-[2] mx-auto w-full lg:w-[min(66%,calc((100svh-250px)*16/9))]">
            <HoverVideo
              id={PRESENTATION_YT}
              title="Présentation de l'agence VizioCraft"
              ariaLabel="Lire la présentation de l'agence VizioCraft, 2 minutes"
              posters={PRESENTATION_POSTERS}
              eager
              intent={40}
              warm={warm}
              zoom={1.035}
              className="aspect-video w-full rounded-[20px] shadow-[0_50px_100px_-50px_rgba(12,10,18,0.7)] ring-1 ring-ink/10 sm:rounded-[26px]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-[#0c0a12]/65 via-transparent to-transparent transition-opacity duration-700 group-data-[state=playing]/hv:opacity-40"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex items-end justify-between gap-4 p-4 sm:p-6">
                <span className="flex items-center gap-3 sm:gap-4">
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/hv:scale-110 sm:h-14 sm:w-14">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-9 w-9 sm:h-10 sm:w-10"
                      fill="white"
                      style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="text-left">
                    <span className="block font-display text-[16px] font-semibold leading-tight tracking-tight text-white sm:text-[19px]">
                      Présentation de l'agence
                    </span>
                    <span className="font-label mt-1 block text-white/80">
                      <span className="group-data-[state=playing]/hv:hidden">
                        2 min ·{" "}
                        <span className="[@media(hover:none)]:hidden">Survolez pour lire</span>
                        <span className="[@media(hover:hover)]:hidden">Touchez pour lire</span>
                      </span>
                      <span className="hidden group-data-[state=playing]/hv:inline">
                        Cliquez pour le son
                      </span>
                    </span>
                  </span>
                </span>
                <span className="font-label hidden rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur xl:block">
                  Charles &amp; Alexandre, fondateurs
                </span>
              </span>
            </HoverVideo>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- TICKER FORMATS ------------------------- */

function FormatsTicker() {
  const loop = [...FORMAT_TAGS, ...FORMAT_TAGS, ...FORMAT_TAGS];
  const { trackRef } = useMarquee<HTMLDivElement>({
    speed: 34,
    direction: "left",
    count: FORMAT_TAGS.length,
    scrollBoost: 0.35,
    draggable: false,
  });

  return (
    <div
      aria-hidden
      className="relative mt-14 overflow-hidden border-y border-ink/10 py-4 sm:mt-20 sm:py-5"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div ref={trackRef} className="flex w-max items-center will-change-transform">
        {loop.map((tag, i) => (
          <span key={`${tag}-${i}`} className="flex items-center">
            <span className="font-label px-6 text-ink/60 sm:px-9">{tag}</span>
            <span className="h-1 w-1 rotate-45 bg-brand" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- MANIFESTE ------------------------- */

const MANIFESTE: { t: string; em?: boolean }[] = [
  ..."Vous gagnez".split(" ").map((t) => ({ t })),
  { t: "du", em: true },
  { t: "temps.", em: true },
  ..."On s'occupe du reste : qualité, rapidité, suivi, motion,".split(" ").map((t) => ({ t })),
  { t: "ia.", em: true },
];

function Manifeste() {
  /* Chaque mot s'encre à mesure que le paragraphe traverse l'écran. */
  const ref = useViewProgress<HTMLParagraphElement>(
    (p, el) => {
      const words = el.querySelectorAll<HTMLElement>(".ink-word");
      const on = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("is-on", i < on));
    },
    { start: 0.86, end: 0.34 },
  );

  const stats = [
    { k: <CountUp to={100} prefix="+" />, v: "Clients accompagnés" },
    { k: <CountUp to={5000} prefix="+" />, v: "Vidéos livrées" },
    { k: <CountUp to={20} suffix="+" />, v: "Monteurs dans l'équipe" },
    { k: <CountUp to={72} suffix="h" />, v: "Livraison standard" },
  ];

  return (
    <section className="relative pt-24 sm:pt-32 lg:pt-44">
      <div className="shell">
        <SectionLabel>Manifeste</SectionLabel>
        <p
          ref={ref}
          className="mt-6 max-w-[21ch] font-display text-[clamp(2rem,5.6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:max-w-[24ch] lg:max-w-[26ch]"
        >
          {MANIFESTE.map((w, i) => (
            <span key={i}>
              <span
                className={`ink-word inline-block ${
                  w.em ? "font-em pr-[0.05em] text-[1.06em] text-brand-gradient" : ""
                }`}
              >
                {w.t}
              </span>{" "}
            </span>
          ))}
        </p>
        <p className="mt-5 max-w-[38ch] text-[clamp(0.85rem,1.4vw,1.1rem)] leading-relaxed text-ink/50 tracking-[-0.01em]" data-reveal="up">
          Toujours à jour sur l'IA, pour donner à nos monteurs les moyens d'aller plus vite et plus loin.
        </p>

        <div className="mt-12 grid gap-10 border-t border-ink/10 pt-8 sm:mt-16 lg:grid-cols-12 lg:gap-10 lg:pt-10">
          <p
            className="max-w-md text-[15.5px] leading-relaxed text-ink/70 sm:text-[17px] lg:col-span-4"
            data-reveal="up"
          >
            Un hook raté coûte une vue. Une coupe mal placée coûte un abonné. C'est pour ça que nos
            monteurs travaillent avec un chef de projet, une charte verrouillée et zéro
            approximation.
          </p>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-9 lg:col-span-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.v}
                data-reveal="up"
                style={{ ["--rd" as string]: `${i * 80}ms` }}
                className="border-l border-ink/15 pl-4 sm:pl-5"
              >
                <dt className="font-label text-ink/60">{s.v}</dt>
                <dd className="mt-2 font-display text-[clamp(2.3rem,4.3vw,3.7rem)] font-bold leading-none tracking-[-0.05em] text-ink tabular-nums">
                  {s.k}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- TARIFS ------------------------- */

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`mt-0.5 h-4 w-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

function PriceCard({
  badge,
  title,
  sub,
  price,
  priceUnit,
  note,
  features,
  cta,
  href,
  to,
  dark = false,
  index = 0,
}: {
  badge: string;
  title: string;
  sub: string;
  price: ReactNode;
  priceUnit: string;
  note: string;
  features: string[];
  cta: string;
  href?: string;
  to?: string;
  dark?: boolean;
  index?: number;
}) {
  const ref = useTilt<HTMLDivElement>(3);

  const ctaClass = `btn-vz w-full rounded-full px-5 py-4 text-[14.5px] font-semibold ${
    dark ? "bg-white text-ink" : "bg-ink text-white"
  }`;

  return (
    <div
      data-reveal="up"
      style={{ ["--rd" as string]: `${index * 110}ms` }}
      className="[perspective:1400px]"
    >
      <div
        ref={ref}
        className={`tilt spotlight relative flex h-full flex-col overflow-hidden rounded-[28px] border p-6 sm:p-9 ${
          dark
            ? "ink border-white/10 bg-[#0c0a12] shadow-[0_50px_100px_-50px_rgba(123,45,142,0.75)]"
            : "border-ink/10 bg-white shadow-[0_40px_90px_-60px_rgba(12,10,18,0.45)]"
        }`}
        style={
          dark
            ? ({
                ["--spot-a"]: "rgba(177, 108, 232, 0.3)",
                ["--spot-b"]: "rgba(43, 168, 226, 0.14)",
              } as CSSProperties)
            : undefined
        }
      >
        {dark && (
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(123,45,142,0.7),transparent)] blur-2xl"
          />
        )}

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`font-label rounded-full px-3 py-1.5 ${
                dark ? "bg-white/10 text-white" : "bg-ink/[0.06] text-ink"
              }`}
            >
              {badge}
            </span>
            <span className={`font-label ${dark ? "text-white/60" : "text-ink/55"}`}>
              0{index + 1}
            </span>
          </div>

          <h3
            className={`mt-7 font-display text-[1.7rem] font-bold leading-none tracking-[-0.04em] sm:text-[2rem] ${
              dark ? "text-white" : "text-ink"
            }`}
          >
            {title}
          </h3>
          <p className={`mt-2 text-[15px] ${dark ? "text-white/65" : "text-ink/65"}`}>{sub}</p>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className={`font-display text-[clamp(2.9rem,6.4vw,4.6rem)] font-bold leading-[0.9] tracking-[-0.055em] ${
                dark ? "text-white" : "text-ink"
              }`}
            >
              {price}
            </span>
            <span className={`text-[15px] ${dark ? "text-white/65" : "text-ink/65"}`}>
              {priceUnit}
            </span>
          </div>
          <p className={`font-label mt-3 ${dark ? "text-white/55" : "text-ink/55"}`}>{note}</p>

          <ul
            className={`mt-7 space-y-3 border-t pt-7 text-[15px] ${
              dark ? "border-white/12 text-white/80" : "border-ink/10 text-ink/80"
            }`}
          >
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check className={dark ? "text-[#c9a4f0]" : "text-brand"} />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-9">
            {to ? (
              <Link
                to={to}
                params={{ variant: "surmesure" }}
                className={ctaClass}
                style={dark ? ({ ["--btn-hover-color"]: "#fff" } as CSSProperties) : undefined}
              >
                {cta}
                <Arrow />
              </Link>
            ) : (
              <a href={href ?? "#contact"} className={ctaClass}>
                {cta}
                <Arrow />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tarifs() {
  return (
    <section id="tarifs" className="relative scroll-mt-24 pt-24 sm:pt-32 lg:pt-44">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8" data-reveal="up">
            <SectionLabel>Tarifs</SectionLabel>
            <h2 className="mt-5 font-display text-[clamp(2.5rem,7.4vw,6.2rem)] font-bold leading-[0.9] tracking-[-0.05em] text-ink">
              {SHOW_MONTAGE_CONTINU ? "Trois" : "Deux"} manières de travailler{" "}
              <em className="font-em pr-[0.06em] text-[1.06em] text-brand-gradient">ensemble.</em>
            </h2>
          </div>
          <div
            className="lg:col-span-4 lg:pb-2"
            data-reveal="up"
            style={{ ["--rd" as string]: "120ms" }}
          >
            <p className="max-w-md text-[15.5px] leading-relaxed text-ink/70 sm:text-[17px]">
              Pas de surprises, pas de frais cachés. Le devis se construit en direct, à la minute
              près.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {["Sans engagement", "Facture pro", "Réponse < 24h"].map((t) => (
                <li
                  key={t}
                  className="font-label rounded-full border border-ink/12 bg-white/60 px-3 py-1.5 text-ink/70"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`mt-10 grid gap-4 sm:mt-14 sm:gap-5 ${
            SHOW_MONTAGE_CONTINU ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          <PriceCard
            index={0}
            badge="À la vidéo"
            title="Montage essentiel"
            sub="Pour tester sans engagement"
            price="30 à 250 €"
            priceUnit="/ vidéo"
            note="Selon le type et la durée"
            features={[
              "Short, long format, podcast, pub",
              "Niveau de montage au choix",
              "Options à la carte",
              "Révisions incluses",
            ]}
            to="/devis/$variant"
            cta="Calculer mon devis"
          />

          {SHOW_MONTAGE_CONTINU && (
            <PriceCard
              index={1}
              badge="Le plus populaire · Abonnement"
              title="Montage continu"
              sub="Production sans interruption"
              price="850 €"
              priceUnit="/ mois"
              note="Jusqu'à 20 shorts ou 4 longs formats"
              features={[
                "Tous formats inclus",
                "Support prioritaire",
                "Révisions illimitées",
                "Livraison continue",
                "Au-delà : tarif préférentiel",
              ]}
              href="#contact"
              cta="Démarrer"
            />
          )}

          <PriceCard
            index={SHOW_MONTAGE_CONTINU ? 2 : 1}
            dark
            badge="Sur mesure"
            title="Production personnalisée"
            sub="Entièrement à la carte"
            price="Prix"
            priceUnit="calculé en direct"
            note="One shot ou multishoot mensuel"
            features={[
              "Chaque type + quantité au choix",
              "Réduction multishoot disponible",
              "Devis détaillé par mail",
              "Un chef de projet attitré",
            ]}
            to="/devis/$variant"
            cta="Configurer mon devis"
          />
        </div>

        <p className="font-label mt-7 text-center text-ink/55">
          Prix hors taxes · Devis ferme envoyé sous 24h · Paiement à la livraison
        </p>
      </div>
    </section>
  );
}

/* ------------------------- FAQ ------------------------- */

function FaqSection() {
  return (
    <section id="faq" className="relative scroll-mt-24 pt-24 sm:pt-32 lg:pt-44">
      <div className="shell">
        {/* Le titre vit dans la marge : la liste ne prend que la hauteur utile */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4" data-reveal="up">
            <div className="lg:sticky lg:top-28">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="mt-5 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-bold leading-[0.92] tracking-[-0.05em] text-ink">
                Les vraies{" "}
                <em className="font-em pr-[0.06em] text-[1.06em] text-brand-gradient">
                  questions.
                </em>
              </h2>
              <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink/70">
                Celles que nos clients posent avant de signer. Une autre en tête ?{" "}
                <a href="#contact" className="link-sweep font-semibold text-ink">
                  Posez-la en direct
                </a>
                .
              </p>
            </div>
          </div>
          <div className="lg:col-span-8" data-reveal="up" style={{ ["--rd" as string]: "120ms" }}>
            <Faq featured={FAQ_FEATURED} more={FAQ_MORE} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- BANDEAU ------------------------- */

function KineticBand() {
  const phrases = [
    "Vous avez un projet",
    "Nous avons l'équipe",
    "On en parle ?",
    "Réponse sous 24h",
  ];
  const loop = [...phrases, ...phrases, ...phrases];
  const { trackRef, setPaused } = useMarquee<HTMLDivElement>({
    speed: 70,
    direction: "left",
    count: phrases.length,
    scrollBoost: 0.5,
    draggable: false,
  });

  return (
    <div className="relative mt-24 overflow-x-clip py-6 sm:mt-32 lg:mt-40">
      <a
        href="#contact"
        aria-label="Vous avez un projet ? Parlons-en : aller à la prise de rendez-vous"
        data-cursor="Parlons"
        className="ink relative -mx-4 block -rotate-[1.4deg] bg-[#0c0a12] py-6 shadow-[0_40px_90px_-50px_rgba(12,10,18,0.9)] sm:py-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          aria-hidden
          className="flex w-max items-center gap-8 will-change-transform sm:gap-12"
        >
          {loop.map((p, i) => (
            <span key={`${p}-${i}`} className="flex items-center gap-8 sm:gap-12">
              <span
                className={`whitespace-nowrap text-[clamp(1.9rem,5.2vw,4rem)] leading-none text-white ${
                  i % 2 === 0
                    ? "font-display font-bold tracking-[-0.045em]"
                    : "font-em text-[clamp(2.1rem,5.8vw,4.4rem)]"
                }`}
              >
                {p}
              </span>
              <span className="h-2.5 w-2.5 rotate-45 bg-brand-gradient" />
            </span>
          ))}
        </div>
      </a>
    </div>
  );
}

/* ------------------------- CONTACT ------------------------- */

function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-24 pb-20 pt-20 sm:pb-28 sm:pt-28 lg:pt-36">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:col-span-6">
            <div data-reveal="fade">
              <SectionLabel>Contact</SectionLabel>
              <h2 className="mt-5 font-display text-[clamp(2.7rem,8vw,6.6rem)] font-bold leading-[0.88] tracking-[-0.055em] text-ink">
                <MaskLines
                  step={110}
                  lines={[
                    <>Discutons de</>,
                    <>
                      votre{" "}
                      <em className="font-em pr-[0.08em] text-[1.07em] text-brand-gradient">
                        projet.
                      </em>
                    </>,
                  ]}
                />
              </h2>
            </div>

            <p
              className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-ink/70 sm:text-[17px]"
              data-reveal="up"
              style={{ ["--rd" as string]: "200ms" }}
            >
              VizioCraft est une société basée à Madagascar, spécialisée dans le montage vidéo professionnel. Notre mission : offrir une solution concrète aux pros qui
              veulent produire vite et bien, sans compromis sur la qualité.
            </p>

            <figure
              className="relative mt-8 overflow-hidden rounded-[24px] ring-1 ring-ink/10 sm:rounded-[28px]"
              data-reveal="scale"
              style={{ ["--rd" as string]: "280ms" }}
            >
              <img
                src={CONTACT_FRAME}
                alt="Charles et Alexandre, fondateurs de VizioCraft"
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#0c0a12]/85 via-[#0c0a12]/15 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                <span>
                  <span className="font-label block text-white/75">Charles &amp; Alexandre</span>
                  <span className="mt-1.5 block max-w-sm font-display text-[17px] font-semibold leading-snug tracking-tight text-white sm:text-xl">
                    Vos interlocuteurs directs, du premier appel au dernier rendu.
                  </span>
                </span>
                <span className="font-label hidden shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur sm:block">
                  GMT+3
                </span>
              </figcaption>
            </figure>
          </div>

          <div
            className="rounded-[24px] border border-ink/10 bg-white p-3 shadow-[0_50px_110px_-60px_rgba(123,45,142,0.55)] sm:rounded-[28px] sm:p-7 lg:col-span-6 lg:p-9"
            data-reveal="up"
            style={{ ["--rd" as string]: "160ms" }}
          >
            <div className="px-2 pt-3 sm:p-0">
              <span className="font-label inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" /> Réponse sous
                24h
              </span>
              <h3 className="mt-5 font-display text-[1.6rem] font-bold leading-none tracking-[-0.04em] text-ink sm:text-[2rem]">
                Réserver un appel de préparation
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                Choisissez votre créneau : on discute de votre projet et on répond à toutes vos
                questions. 30 minutes, sans engagement.
              </p>
            </div>
            <div className="mt-6">
              <CalendlyWidget />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- PAGE ------------------------- */

function Index() {
  return (
    <>
      <Atmosphere />
      <IntroLoader />

      <main className="relative z-[2] overflow-x-clip">
        <Hero />
        <FormatsTicker />
        <WorkGallery />
        <Manifeste />
        <Process />
        <Tarifs />
        <FaqSection />
        <KineticBand />
        <Contact />
      </main>

      <Footer />
      <VideoLightbox />
    </>
  );
}
