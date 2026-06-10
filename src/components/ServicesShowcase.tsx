import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

type Service = {
  t: string;
  sub: string;
  tag: string;
  slug?: string;
  href?: string;
  // SVG path for the icon
  svgPath: string;
};

const SERVICES: Service[] = [
  {
    t: "Shorts & Reels",
    sub: "TikTok · Reels · YouTube Shorts",
    tag: "Format court",
    href: "#showreel",
    svgPath: "M7 4h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm5 3v10l5-5-5-5z",
  },
  {
    t: "Publicités vidéo",
    sub: "Ads pensées pour convertir",
    tag: "Performance",
    slug: "publicites-video",
    svgPath: "M3 3h18v4H3zM3 10h11v4H3zM3 17h7v4H3zM17 10l4 7h-8l4-7z",
  },
  {
    t: "Podcast vidéo",
    sub: "Multi-cam · clips · chapitrage",
    tag: "Multi-cam",
    slug: "podcast-video",
    svgPath: "M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-1 17.93V22h2v-2.07A8 8 0 0 0 20 12h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93z",
  },
  {
    t: "Volume quotidien",
    sub: "9:16 natif · cohérence · scalable",
    tag: "Continu",
    slug: "corporate-evenementiel",
    svgPath: "M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z",
  },
  {
    t: "Motion design",
    sub: "Logos animés · kinetic type",
    tag: "Animation",
    slug: "motion-design",
    svgPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    t: "Formats longs",
    sub: "YouTube · vlogs · documentaires",
    tag: "Long format",
    slug: "contenu-educatif",
    svgPath: "M15 10l-8 4.5V5.5L15 10zm6-7H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z",
  },
];

function ServiceIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d={path} />
    </svg>
  );
}

function ServiceButton({ s, i }: { s: Service; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const Wrapper: any = s.slug ? Link : "a";
  const wrapperProps = s.slug
    ? { to: `/univers/${s.slug}` }
    : { href: s.href ?? "#contact" };

  return (
    <Wrapper
      ref={ref}
      {...wrapperProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-card px-5 py-5 transition-all duration-300 hover:border-primary/25 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(123,45,142,0.2)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(28px) scale(0.97)",
        transition: `opacity 650ms ease ${i * 70}ms, transform 650ms cubic-bezier(.16,.9,.3,1) ${i * 70}ms`,
      }}
    >
      {/* Glow blob qui suit le hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "radial-gradient(circle at 30% 50%, rgba(123,45,142,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Ligne accent animée en bas */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-brand-gradient transition-all duration-500 ease-out"
        style={{ width: hovered ? "100%" : "0%" }}
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* Icône + contenu */}
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Icône avec animation de rotation légère */}
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-background text-primary transition-all duration-300 group-hover:border-primary/30 group-hover:bg-brand-soft group-hover:scale-110 group-hover:rotate-3">
            <ServiceIcon path={s.svgPath} />
          </div>

          <div className="min-w-0">
            {/* Tag */}
            <span className="inline-block rounded-full bg-primary/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary/70 mb-1.5">
              {s.tag}
            </span>
            {/* Titre */}
            <p className="font-display text-[15px] font-semibold leading-tight text-foreground">{s.t}</p>
            {/* Sous-titre */}
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.sub}</p>
          </div>
        </div>

        {/* Flèche */}
        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-foreground/10 text-sm text-muted-foreground transition-all duration-300 group-hover:border-primary/40 group-hover:bg-brand-soft group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 mt-0.5">
          →
        </div>
      </div>
    </Wrapper>
  );
}

export function ServicesShowcase() {
  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s, i) => (
        <ServiceButton key={(s.slug ?? s.href ?? "") + i} s={s} i={i} />
      ))}
    </div>
  );
}
