import { useEffect, useRef, useState } from "react";

const CDN2 = "https://cdn.prod.website-files.com/6996b2b29f614702ad210f72";

type Service = {
  t: string;
  short: string;
  desc: string;
  bullets: string[];
  img: string;
  span?: string; // grid span classes
  ratio?: string;
};

const SERVICES: Service[] = [
  {
    t: "Shorts & Reels",
    short: "Verticaux scroll-stopping",
    desc: "Extraits de vos longs formats ou production native pour TikTok, Reels, YouTube Shorts.",
    bullets: ["Sous-titres animés", "Hook puissant", "Rythme 9:16 natif"],
    img: `${CDN2}/699ab9aed3c37eb93d81731b_image20.jpeg`,
    span: "lg:col-span-2 lg:row-span-2",
    ratio: "aspect-[4/5]",
  },
  {
    t: "Publicités vidéo",
    short: "Ads pensées performance",
    desc: "Hook fort, rythme serré, variantes A/B, formats adaptés à chaque plateforme.",
    bullets: ["Variantes A/B", "Multi-formats", "ROI-driven"],
    img: `${CDN2}/699ab9aed3c37eb93d817327_image4.jpeg`,
    ratio: "aspect-[4/3]",
  },
  {
    t: "Podcast vidéo",
    short: "Multi-cam et clips",
    desc: "Synchro multi-cam, chapitrage, et clips courts dérivés à partir d'épisodes longs.",
    bullets: ["Multi-cam sync", "Clips extraits", "Chapitrage"],
    img: `${CDN2}/699ab9aed3c37eb93d81732a_image8.jpeg`,
    ratio: "aspect-[4/3]",
  },
  {
    t: "Corporate & événementiel",
    short: "Image maîtrisée",
    desc: "Films institutionnels, témoignages clients, aftermovies — exigence et cohérence.",
    bullets: ["DA travaillée", "Étalonnage premium", "Sound design"],
    img: `${CDN2}/699ab9aed3c37eb93d81733d_image6.jpeg`,
    ratio: "aspect-[4/3]",
  },
  {
    t: "Motion design",
    short: "Animation sur-mesure",
    desc: "Logos animés, typographie cinétique, transitions et infographies premium.",
    bullets: ["After Effects", "Kinetic type", "Infographies"],
    img: `${CDN2}/699ab9aed3c37eb93d81734c_image5.jpeg`,
    ratio: "aspect-[4/3]",
  },
  {
    t: "Contenu éducatif",
    short: "Clarté & pédagogie",
    desc: "Tutos, modules de formation, vidéos explicatives — structure et rythme pédagogique.",
    bullets: ["Schémas animés", "Voice-over clean", "Modulaire"],
    img: `${CDN2}/699ab9aed3c37eb93d81735e_image11.jpeg`,
    ratio: "aspect-[4/3]",
  },
];

function FloatCard({ s, i }: { s: Service; i: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <a
      href="#contact"
      ref={ref}
      className={`group relative block overflow-hidden rounded-[2rem] ${s.span ?? ""}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 800ms ease ${i * 90}ms, transform 800ms cubic-bezier(.2,.7,.2,1) ${i * 90}ms`,
      }}
    >
      <div className={`relative w-full ${s.ratio ?? "aspect-[4/3]"} overflow-hidden`}>
        <img
          src={s.img}
          alt={s.t}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110"
        />
        {/* Always-on subtle bottom fade so title is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* Hover gradient that fuses with the image (no white box) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b2e]/95 via-[#1a0b2e]/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Default state — minimal label */}
        <div className="absolute inset-x-6 bottom-6 text-white transition-transform duration-500 group-hover:-translate-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 transition-opacity duration-300 ease-out group-hover:opacity-0">{s.short}</p>
          <h3 className="mt-1.5 font-display text-2xl sm:text-3xl drop-shadow-md transition-opacity duration-300 ease-out group-hover:opacity-0">{s.t}</h3>

          {/* Hover-revealed details */}
          <div className="mt-3 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-48 group-hover:opacity-100">
            <p className="text-sm leading-relaxed text-white/90">{s.desc}</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {s.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-white/85">
                  <span className="h-1 w-1 rounded-full bg-white" /> {b}
                </li>
              ))}
            </ul>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Discuter de ce service
              <span className="transition group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>

        {/* Soft glow ring on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-white/10 transition-all duration-500 group-hover:ring-white/30 group-hover:shadow-[0_30px_80px_-20px_rgba(123,45,142,0.5)]" />
      </div>
    </a>
  );
}

export function ServicesShowcase() {
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[220px]">
      {SERVICES.map((s, i) => (
        <FloatCard key={s.t} s={s} i={i} />
      ))}
    </div>
  );
}
