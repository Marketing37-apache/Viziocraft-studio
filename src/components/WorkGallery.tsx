import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { WarmContext, WorkTile } from "@/components/WorkTile";
import { FILTERS, SELECTION, WORKS, type Work } from "@/data/work";

/* ------------------------------------------------
   Galerie "justifiée" : chaque rangée mélange formats verticaux et horizontaux,
   et toutes les vignettes d'une rangée ont exactement la même hauteur
   (la largeur de chaque vignette est proportionnelle à son format).
   Peu de vidéos à la fois, des filtres pour le reste.
------------------------------------------------ */

const RATIO = { v: 9 / 16, l: 16 / 9 } as const;
const ROW_MAX = 3.65;
const ROW_MIN = 3.45;

function pack(items: Work[]) {
  const rows: Work[][] = [];
  let row: Work[] = [];
  let sum = 0;
  for (const w of items) {
    const r = RATIO[w.o];
    if (row.length && sum + r > ROW_MAX) {
      rows.push(row);
      row = [];
      sum = 0;
    }
    row.push(w);
    sum += r;
  }
  if (row.length) rows.push(row);
  return rows;
}

type FilterKey = (typeof FILTERS)[number]["key"];

export function WorkGallery() {
  const [filter, setFilter] = useState<FilterKey>("selection");
  const sectionRef = useRef<HTMLElement>(null);
  const [warm, setWarm] = useState(false);

  const items = useMemo(() => {
    if (filter === "selection") return SELECTION;
    if (filter === "all") return WORKS;
    return WORKS.filter((w) => w.categories.includes(filter));
  }, [filter]);
  const rows = useMemo(() => pack(items), [items]);

  /* souris dans la section (ordinateur, connexion normale) : on précharge les extraits */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const conn = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (conn?.saveData || /2g|3g/.test(conn?.effectiveType ?? "")) return;
    const on = () => setWarm(true);
    el.addEventListener("pointerenter", on, { once: true });
    return () => el.removeEventListener("pointerenter", on);
  }, []);

  const count = (key: FilterKey) =>
    key === "selection"
      ? SELECTION.length
      : key === "all"
        ? WORKS.length
        : WORKS.filter((w) => w.categories.includes(key)).length;

  let index = 0;

  return (
    <section
      ref={sectionRef}
      id="showreel"
      className="relative scroll-mt-24 pt-20 sm:pt-28 lg:pt-36"
    >
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8" data-reveal="up">
            <span className="font-label inline-flex items-center gap-2.5 text-ink/65">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Réalisations
            </span>
            <h2 className="mt-5 font-display text-[clamp(2.5rem,7.4vw,6.2rem)] font-bold leading-[0.9] tracking-[-0.05em] text-ink">
              Le travail parle{" "}
              <em className="font-em pr-[0.06em] text-[1.06em] text-brand-gradient">pour nous.</em>
            </h2>
          </div>
          <div
            className="lg:col-span-4 lg:pb-2"
            data-reveal="up"
            style={{ ["--rd" as string]: "120ms" }}
          >
            <p className="max-w-md text-[15.5px] leading-relaxed text-ink/70 sm:text-[17px]">
              Publicités, UGC, interviews, documentaires, motion design et IA : un aperçu de ce qui
              sort de nos timelines.
            </p>
            <p className="font-label mt-4 text-ink/55">
              <span className="[@media(hover:none)]:hidden">Survol = aperçu · Clic = son</span>
              <span className="[@media(hover:hover)]:hidden">Touchez pour lire avec le son</span>
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div
          className="no-scrollbar -mx-5 mt-9 overflow-x-auto px-5 sm:mx-0 sm:mt-11 sm:px-0"
          data-reveal="fade"
        >
          <div role="group" aria-label="Filtrer les réalisations" className="flex w-max gap-2">
            {FILTERS.map((f) => {
              const active = f.key === filter;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.key)}
                  className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-300 ${
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-ink/12 bg-white/60 text-ink/75 hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {f.label}
                  <span
                    className={`font-label tabular-nums ${active ? "text-white/60" : "text-ink/45"}`}
                  >
                    {count(f.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille : une remise en scène à chaque filtre */}
        <WarmContext.Provider value={warm}>
          <div
            key={filter}
            data-reveal="fade"
            className="work-grid mt-6 flex flex-wrap gap-2.5 sm:mt-8 md:flex-col md:flex-nowrap md:gap-3 lg:gap-4"
          >
            {rows.map((row, r) => {
              const sum = row.reduce((s, w) => s + RATIO[w.o], 0);
              const total = Math.max(sum, ROW_MIN);
              const n = row.length;
              return (
                <div key={r} className="contents md:flex md:gap-3 lg:gap-4">
                  {row.map((w) => {
                    const i = index++;
                    return (
                      <WorkTile
                        key={w.slug}
                        work={w}
                        className={`tile-in rounded-[18px] ring-1 ring-ink/10 shadow-[0_30px_60px_-38px_rgba(12,10,18,0.6)] sm:rounded-[22px] md:shrink-0 md:w-[var(--w)] ${
                          w.o === "v" ? "w-[calc(50%-5px)]" : "w-full"
                        }`}
                        style={
                          {
                            ["--w"]: `calc((100% - ${n - 1} * var(--row-gap)) * ${(RATIO[w.o] / total).toFixed(5)})`,
                            ["--i"]: i,
                          } as CSSProperties
                        }
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </WarmContext.Provider>

        {filter === "selection" && (
          <div className="mt-8 flex justify-center sm:mt-10" data-reveal="fade">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="btn-vz rounded-full border border-ink/15 bg-white/60 px-6 py-4 text-[14.5px] font-semibold text-ink"
              style={{ ["--btn-fill" as string]: "#0c0a12" }}
            >
              Voir les {WORKS.length} réalisations
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
