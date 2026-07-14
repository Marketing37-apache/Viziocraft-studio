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
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const rafRef = useRef<number | undefined>(undefined);

  // Generate unique particles for each button instance
  const particles = useRef<Array<{
    id: number;
    startX: number;
    startY: number;
    vx: number;
    vy: number;
    size: number;
    color: 'primary' | 'pink';
    delay: number;
  }>>([]);

  useEffect(() => {
    particles.current = [...Array(10)].map((_, idx) => ({
      id: idx,
      startX: 10 + Math.random() * 80,
      startY: 10 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 1.5,
      size: 2 + Math.random() * 3,
      color: Math.random() > 0.5 ? 'primary' : 'pink',
      delay: idx * 50,
    }));
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setMousePosition({ x, y });
    });
  };

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
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-2xl bg-card transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(28px) scale(0.97)",
        transition: `opacity 650ms ease ${i * 70}ms, transform 650ms cubic-bezier(.16,.9,.3,1) ${i * 70}ms`,
      }}
    >
      {/* Optimized gradient background using CSS variables */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(123,45,142,0.12) 0%, rgba(236,72,153,0.06) 40%, transparent 70%)`,
        }}
      />

      {/* Simplified border glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-pink-500/10" />

      {/* Corner accents - simplified */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-primary/0 transition-all duration-500 group-hover:border-primary/30 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-primary/0 transition-all duration-500 group-hover:border-primary/30 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-primary/0 transition-all duration-500 group-hover:border-primary/30 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-primary/0 transition-all duration-500 group-hover:border-primary/30 rounded-br-xl" />

      {/* Contenu principal */}
      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Icône avec effet simplifié */}
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-brand-gradient opacity-0 blur-lg transition-all duration-500 group-hover:opacity-30" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-foreground/10 bg-background text-primary transition-all duration-500 group-hover:border-primary/40 group-hover:scale-105 group-hover:-translate-y-0.5">
              <ServiceIcon path={s.svgPath} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Titre - gardé visible avec changement de couleur */}
            <p className="font-display text-[16px] font-bold leading-tight text-foreground transition-colors duration-500 group-hover:text-primary">
              {s.t}
            </p>

            {/* Tag et sous-titre - révélés avec animation */}
            <div
              className="overflow-hidden transition-all duration-500 ease-out"
              style={{
                maxHeight: hovered ? "70px" : "0px",
                opacity: hovered ? 1 : 0,
              }}
            >
              <div className="pt-3 space-y-2">
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-primary border border-primary/20">
                  {s.tag}
                </span>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {s.sub}
                </p>
              </div>
            </div>
          </div>

          {/* Flèche optimisée */}
          <div className="shrink-0 relative">
            <div className="absolute inset-0 rounded-full bg-brand-gradient opacity-0 blur-sm transition-all duration-500 group-hover:opacity-40" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 text-muted-foreground transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(123,45,142,0.4)]">
              <svg
                className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Ligne animée en bas */}
      <div
        className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-primary via-pink-500 to-primary transition-all duration-500 ease-out"
        style={{ width: hovered ? "100%" : "0%" }}
      />

      {/* Particules avancées avec système de physique */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.current.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full transition-all duration-1200 ease-out ${
              particle.color === 'primary' ? 'bg-primary/70' : 'bg-pink-500/70'
            }`}
            style={{
              left: `${particle.startX}%`,
              top: `${particle.startY}%`,
              width: hovered ? `${particle.size}px` : '0px',
              height: hovered ? `${particle.size}px` : '0px',
              opacity: hovered ? 0.9 : 0,
              transform: hovered 
                ? `translate(${particle.vx * 20}px, ${particle.vy * 20}px) scale(${1 + Math.random() * 0.3})` 
                : 'translate(0, 0) scale(0)',
              transitionDelay: `${particle.delay}ms`,
              boxShadow: hovered 
                ? particle.color === 'primary' 
                  ? '0 0 8px rgba(123,45,142,0.6)' 
                  : '0 0 8px rgba(236,72,153,0.6)'
                : 'none',
            }}
          />
        ))}
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
