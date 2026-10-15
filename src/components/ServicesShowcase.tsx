import { Link } from "@tanstack/react-router";
import { useSpotlight } from "@/lib/motion";

type Service = {
  t: string;
  sub: string;
  tag: string;
  slug?: string;
  href?: string;
  img?: string;
  span: string;
  svgPath: string;
};

const CDNS = "https://cdn.prod.website-files.com/6996b2b29f614702ad210f72";

const SERVICES: Service[] = [
  {
    t: "Shorts & Reels",
    sub: "Le format qui décide de votre croissance. Hook en moins d'une seconde, rythme millimétré, sous-titres incrustés et b-rolls qui tiennent l'attention jusqu'à la dernière frame.",
    tag: "9:16 · TikTok · Reels · Shorts",
    href: "#showreel",
    img: "https://i.ytimg.com/vi/fYZlCGaTZZQ/hqdefault.jpg",
    span: "lg:col-span-3 lg:row-span-2",
    svgPath:
      "M7 4h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm5 3v10l5-5-5-5z",
  },
  {
    t: "Publicités vidéo",
    sub: "Ads pensées pour convertir : objectif, cible, itération. On monte pour la performance, pas pour le portfolio.",
    tag: "Performance",
    slug: "publicites-video",
    span: "lg:col-span-3",
    svgPath: "M3 3h18v4H3zM3 10h11v4H3zM3 17h7v4H3zM17 10l4 7h-8l4-7z",
  },
  {
    t: "Formats longs",
    sub: "YouTube, vlogs, documentaires : une narration qui ne laisse pas tomber à la troisième minute.",
    tag: "Long format",
    slug: "contenu-educatif",
    span: "lg:col-span-3",
    svgPath:
      "M15 10l-8 4.5V5.5L15 10zm6-7H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z",
  },
  {
    t: "Podcast vidéo",
    sub: "Multi-cam, chapitrage, clips verticaux extraits de chaque épisode.",
    tag: "Multi-cam",
    slug: "podcast-video",
    span: "lg:col-span-2",
    svgPath:
      "M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-1 17.93V22h2v-2.07A8 8 0 0 0 20 12h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93z",
  },
  {
    t: "Volume quotidien",
    sub: "Une équipe de monteurs déployée en parallèle pour tenir 30 vidéos par mois.",
    tag: "Continu",
    slug: "corporate-evenementiel",
    span: "lg:col-span-2",
    svgPath:
      "M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4H4zM4 10h4v4H4zm6 0h4v4H4zm6 0h4v4H4zM4 16h4v4H4zm6 0h4v4H4zm6 0h4v4H4z",
  },
  {
    t: "Motion design",
    sub: "Logos animés, kinetic type, habillages sonores pour exister sans visage.",
    tag: "Animation",
    slug: "motion-design",
    span: "lg:col-span-2",
    svgPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
];

function ServiceIcon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

function ServiceCard({ s, i }: { s: Service; i: number }) {
  const ref = useSpotlight<HTMLDivElement>();

  const content = (
    <>
      <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-white/90 transition-colors duration-500 group-hover:border-white/30 group-hover:bg-white group-hover:text-[#0a0812]">
            <ServiceIcon path={s.svgPath} />
          </div>
          <span className="font-label pt-1 text-white/30 transition-colors duration-500 group-hover:text-white/70">
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-6 sm:mt-8">
          <span className="font-label inline-block rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-white/60">
            {s.tag}
          </span>
          <h3 className="mt-4 font-display text-xl tracking-tight text-white sm:text-2xl">{s.t}</h3>
          <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-white/55 sm:text-sm">
            {s.sub}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="font-label text-white/40 transition-colors duration-500 group-hover:text-white">
            Explorer
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-500 group-hover:translate-x-1 group-hover:border-white group-hover:bg-white group-hover:text-[#0a0812]">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {s.img && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src={s.img}
            alt=""
            aria-hidden
            loading="lazy"
            className="h-full w-full scale-105 object-cover opacity-[0.16] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:opacity-30"
            style={{ objectPosition: "50% 35%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0812] via-[#0a0812]/85 to-[#0a0812]/40" />
        </div>
      )}
    </>
  );

  const inner =
    "group spotlight relative flex h-full min-h-[230px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#100d1a] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 focus-visible:-translate-y-1.5";

  return (
    <div
      ref={ref}
      data-reveal="up"
      className={`${s.span} h-full`}
      style={{ ["--rd" as string]: `${i * 60}ms` }}
    >
      {s.slug ? (
        <Link
          to="/univers/$slug"
          params={{ slug: s.slug! }}
          className={inner}
          aria-label={`${s.t} - en savoir plus`}
        >
          {content}
        </Link>
      ) : (
        <a href={s.href ?? "#contact"} className={inner}>
          {content}
        </a>
      )}
    </div>
  );
}

export function ServicesShowcase() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[minmax(230px,auto)]">
      {SERVICES.map((s, i) => (
        <ServiceCard key={(s.slug ?? s.href ?? "") + i} s={s} i={i} />
      ))}
    </div>
  );
}
