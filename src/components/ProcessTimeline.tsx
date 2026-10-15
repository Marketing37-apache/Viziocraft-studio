import { useEffect, useRef, useState } from "react";

const CDN2 = "https://cdn.prod.website-files.com/6996b2b29f614702ad210f72";

const STEPS = [
  {
    n: "01",
    kicker: "Découverte",
    title: "L'appel de préparation",
    desc: "On analyse votre besoin, votre positionnement, votre direction artistique. On verrouille ensemble la cible, le ton, et les formats.",
    duration: "30 min",
    bullets: ["Brief créatif", "Plan d'action", "Devis détaillé"],
    img: `${CDN2}/69bbd209b6d1ec9b233be4af_DSC00306-p-1080.jpg`,
  },
  {
    n: "02",
    kicker: "Validation",
    title: "Démarrage du projet",
    desc: "Une première vidéo réelle, sur votre contenu, dans votre style. C'est la preuve avant tout engagement.",
    duration: "72h",
    bullets: ["DA validée", "Standards verrouillés", "Aucun engagement"],
    img: `${CDN2}/69bbd298e7222bfba34e34da_DSC00274-p-1080.jpg`,
  },
  {
    n: "03",
    kicker: "Production",
    title: "La production en continu",
    desc: "On déploie plusieurs monteurs en parallèle pour scaler votre volume sans jamais sacrifier la qualité.",
    duration: "En continu",
    bullets: ["+20 monteurs", "Chef de projet dédié", "Qualité constante"],
    img: "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6a2a78dcf25d345902b51327_step2-test.jpg",
  },
  {
    n: "04",
    kicker: "Communication",
    title: "Communiquer simplement",
    desc: "WhatsApp + Frame.io. Pas d'emails, pas de tickets, pas d'attente. Une review à la seconde près, une réponse en moins de 2h.",
    duration: "7j/7",
    bullets: ["Review à la seconde", "Réponse < 2h", "Drive partagé"],
    img: `${CDN2}/69bbd390da6242586058293c_DSC00314-p-1080.jpg`,
  },
];

export function ProcessTimeline() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.step);
            if (!Number.isNaN(idx)) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const step = STEPS[active];

  return (
    <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
      {/* --- Panneau sticky : l'image scrube avec le scroll --- */}
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-28">
          <div
            data-reveal="scale"
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_40px_90px_-40px_rgba(123,45,142,0.7)]"
          >
            <div className="relative aspect-[4/3] w-full">
              {STEPS.map((s, i) => (
                <img
                  key={s.n}
                  src={s.img}
                  alt={s.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ opacity: i === active ? 1 : 0 }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07060b] via-transparent to-transparent" />
              <div className="absolute inset-0 safe-frame" aria-hidden />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur">
                <span className="rec-dot h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
                <span className="font-label text-white/80">{step.duration}</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between gap-4">
                  <span className="font-display text-5xl font-bold leading-none text-white/95">
                    {step.n}
                  </span>
                  <span className="font-label text-white/60">{step.kicker}</span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.n}
                      className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20"
                    >
                      <span
                        className="block h-full origin-left bg-gradient-to-r from-[#7B2D8E] to-[#2BA8E2] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ transform: `scaleX(${i <= active ? 1 : 0})` }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Étapes --- */}
      <div ref={listRef} className="lg:col-span-7">
        {STEPS.map((s, i) => (
          <article
            key={s.n}
            data-step={i}
            data-reveal="up"
            style={{ ["--rd" as string]: `${i * 40}ms` }}
            className={`border-t border-white/10 py-9 first:border-t-0 first:pt-0 sm:py-12 ${
              i === active ? "" : "lg:opacity-55"
            } transition-opacity duration-500`}
          >
            {/* Image inline (mobile) */}
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 lg:hidden">
              <img
                src={s.img}
                alt={s.title}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 backdrop-blur">
                <span className="rec-dot h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
                <span className="font-label text-white/80">{s.duration}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-display text-4xl font-bold leading-none text-brand-gradient sm:text-5xl">
                {s.n}
              </span>
              <span className="h-px flex-1 bg-white/12" />
              <span className="font-label text-white/40">{s.duration}</span>
            </div>

            <p className="font-label mt-5 text-[#8ec9f0]">{s.kicker}</p>
            <h3 className="mt-2.5 font-display text-2xl tracking-tight text-white sm:text-3xl lg:text-4xl">
              {s.title}
            </h3>
            <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-base">
              {s.desc}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {s.bullets.map((b) => (
                <li
                  key={b}
                  className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75"
                >
                  {b}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
