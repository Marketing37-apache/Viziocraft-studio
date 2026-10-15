import { Link } from "@tanstack/react-router";
import { type CSSProperties } from "react";
import { useViewProgress } from "@/lib/motion";

const CDN_A = "https://cdn.prod.website-files.com/6996b2b29f614702ad210f72";
const CDN_B = "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02";

const STEPS = [
  {
    n: "01",
    slug: "appel-de-preparation",
    kicker: "Découverte",
    title: "L'appel de préparation",
    desc: "Votre besoin, votre positionnement, votre DA. On verrouille la cible, le ton et les formats.",
    duration: "30 min",
    img: `${CDN_A}/69bbd209b6d1ec9b233be4af_DSC00306-p-500.jpg`,
  },
  {
    n: "02",
    slug: "video-test",
    kicker: "Validation",
    title: "La vidéo test",
    desc: "Une vraie vidéo, sur votre contenu, dans votre style. La preuve avant tout engagement.",
    duration: "72h",
    img: `${CDN_A}/69bbd298e7222bfba34e34da_DSC00274-p-500.jpg`,
  },
  {
    n: "03",
    slug: "production",
    kicker: "Production",
    title: "La production en continu",
    desc: "Plusieurs monteurs en parallèle, un chef de projet, des standards verrouillés.",
    duration: "En continu",
    img: `${CDN_B}/6a2a78dcf25d345902b51327_step2-test-p-500.jpg`,
  },
  {
    n: "04",
    slug: "communiquer",
    kicker: "Échanges",
    title: "Communiquer simplement",
    desc: "WhatsApp et Frame.io. Une review à la seconde près, une réponse en moins de 2h.",
    duration: "7j/7",
    img: `${CDN_A}/69bbd390da6242586058293c_DSC00314-p-500.jpg`,
  },
];

/* Process en une ligne : quatre étapes reliées par un trait qui se remplit
   à mesure qu'on descend. Chaque étape mène à sa page de détail ;
   au survol, la photo de l'étape apparaît au-dessus. */
export function Process() {
  const ref = useViewProgress<HTMLOListElement>(
    (p, el) => el.style.setProperty("--fill", p.toFixed(4)),
    { start: 0.85, end: 0.4 },
  );

  return (
    <section id="process" className="relative scroll-mt-24 pt-24 sm:pt-32 lg:pt-40">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8" data-reveal="up">
            <span className="font-label inline-flex items-center gap-2.5 text-ink/65">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Process
            </span>
            <h2 className="mt-5 font-display text-[clamp(2.3rem,5.6vw,4.6rem)] font-bold leading-[0.92] tracking-[-0.05em] text-ink">
              Quatre étapes,{" "}
              <em className="font-em pr-[0.06em] text-[1.06em] text-brand-gradient">
                zéro friction.
              </em>
            </h2>
          </div>
          <p
            className="max-w-md text-[15.5px] leading-relaxed text-ink/70 sm:text-[17px] lg:col-span-4 lg:pb-2"
            data-reveal="up"
            style={{ ["--rd" as string]: "120ms" }}
          >
            Le même déroulé pour chaque client, pensé pour que la qualité soit identique de la
            première à la centième vidéo.
          </p>
        </div>

        <ol
          ref={ref}
          className="process-track relative mt-8 grid gap-x-6 gap-y-1 sm:mt-14 lg:grid-cols-4 lg:gap-x-8"
          style={{ ["--steps" as string]: STEPS.length } as CSSProperties}
        >
          {/* le trait : horizontal sur ordinateur, vertical sur mobile */}
          <span aria-hidden className="process-line" />
          <span aria-hidden className="process-line process-line--fill" />

          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="process-step relative"
              data-reveal="up"
              style={
                {
                  ["--rd" as string]: `${i * 90}ms`,
                  ["--at" as string]: i / STEPS.length,
                } as CSSProperties
              }
            >
              <Link
                to="/etapes/$slug"
                params={{ slug: s.slug }}
                data-cursor="Détail"
                className="group/step relative flex gap-4 rounded-2xl py-3 pl-0 pr-2 lg:block lg:py-0 lg:pr-0"
              >
                {/* la photo de l'étape, au survol */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-[calc(100%+14px)] left-0 z-10 hidden w-[220px] origin-bottom-left overflow-hidden rounded-2xl opacity-0 shadow-[0_30px_60px_-30px_rgba(12,10,18,0.6)] ring-1 ring-ink/10 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [transform:translateY(10px)_scale(0.94)] group-hover/step:opacity-100 group-hover/step:[transform:none] lg:block"
                >
                  <img
                    src={s.img}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </span>

                <span className="process-dot font-label relative z-[1] mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-[background-color,color,border-color] duration-500 lg:mt-0">
                  {s.n}
                </span>

                <span className="block min-w-0 lg:mt-6">
                  <span className="font-label block text-ink/55">{s.kicker}</span>
                  <span className="mt-2 block font-display text-[1.25rem] font-bold leading-tight tracking-[-0.03em] text-ink transition-colors duration-300 group-hover/step:text-brand sm:text-[1.4rem]">
                    {s.title}
                  </span>
                  <span className="mt-1.5 block max-w-sm text-[14px] leading-snug text-ink/70 sm:mt-2 sm:text-[14.5px] sm:leading-relaxed">
                    {s.desc}
                  </span>
                  <span className="mt-3 flex items-center gap-3 sm:mt-4">
                    <span className="font-label rounded-full border border-ink/12 bg-white/60 px-2.5 py-1 text-ink/70">
                      {s.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink/70 transition-colors group-hover/step:text-ink">
                      Le détail
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 transition-transform duration-500 group-hover/step:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14M13 6l6 6-6 6"
                        />
                      </svg>
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
