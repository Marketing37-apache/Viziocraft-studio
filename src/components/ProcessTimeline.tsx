import { useEffect, useRef, useState } from "react";

const CDN2 = "https://cdn.prod.website-files.com/6996b2b29f614702ad210f72";

const STEPS = [
  {
    n: "01",
    kicker: "Étape 01 — Découverte",
    title: "L'appel de préparation",
    desc: "On analyse votre besoin, votre positionnement, votre direction artistique. On verrouille ensemble la cible, le ton, et les formats.",
    duration: "30 min",
    bullets: ["Brief créatif", "Plan d'action", "Devis détaillé"],
    img: `${CDN2}/69bbd209b6d1ec9b233be4af_DSC00306-p-1080.jpg`,
  },
  {
    n: "02",
    kicker: "Étape 02 — Validation",
    title: "La vidéo test",
    desc: "Une première vidéo réelle, sur votre contenu, dans votre style. C'est la preuve avant tout engagement.",
    duration: "72h",
    bullets: ["DA validée", "Standards verrouillés", "Aucun engagement"],
    img: `${CDN2}/69bbd24fca314a4a29a46fe9_DSC00269-p-1080.jpg`,
  },
  {
    n: "03",
    kicker: "Étape 03 — Production",
    title: "La production en continu",
    desc: "On déploie plusieurs monteurs en parallèle pour scaler votre volume sans jamais sacrifier la qualité.",
    duration: "En continu",
    bullets: ["+20 monteurs", "Chef de projet dédié", "Qualité constante"],
    img: `${CDN2}/69bbd298e7222bfba34e34da_DSC00274-p-1080.jpg`,
  },
  {
    n: "04",
    kicker: "Étape 04 — Communication",
    title: "Communiquer simplement",
    desc: "WhatsApp + Frame.io. Pas d'emails, pas de tickets, pas d'attente. Une review à la seconde près, une réponse en moins de 2h.",
    duration: "7j/7",
    bullets: ["Review à la seconde", "Réponse < 2h", "Drive partagé"],
    img: `${CDN2}/69bbd390da6242586058293c_DSC00314-p-1080.jpg`,
  },
];

function StepRow({ s, i }: { s: (typeof STEPS)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const reverse = i % 2 === 1;

  return (
    <div
      ref={ref}
      className="relative grid items-center gap-10 lg:grid-cols-12 lg:gap-16"
    >
      {/* Image side */}
      <div
        className={`relative lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : `translateX(${reverse ? 60 : -60}px)`,
          transition: "opacity 900ms ease, transform 900ms cubic-bezier(.2,.7,.2,1)",
        }}
      >
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-brand-gradient opacity-15 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 shadow-[0_40px_80px_-30px_rgba(123,45,142,0.4)]">
            <img
              src={s.img}
              alt={s.title}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition duration-[1500ms] hover:scale-105"
            />
            <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
              ⏱ {s.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Text side */}
      <div
        className={`lg:col-span-5 ${reverse ? "lg:order-1" : ""}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 900ms ease 200ms, transform 900ms cubic-bezier(.2,.7,.2,1) 200ms",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-5xl font-bold text-brand-gradient">{s.n}</span>
          <span className="h-px flex-1 bg-foreground/15" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">{s.kicker}</p>
        <h3 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">{s.title}</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{s.desc}</p>
        <ul className="mt-6 space-y-2.5">
          {s.bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-foreground/85">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-[10px] text-white">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ProcessTimeline() {
  return (
    <div className="mt-20 space-y-28 lg:space-y-36">
      {STEPS.map((s, i) => (
        <StepRow key={s.n} s={s} i={i} />
      ))}
    </div>
  );
}
