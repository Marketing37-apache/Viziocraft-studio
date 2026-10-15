import { useEffect, useState } from "react";

const LOGO =
  "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png";

/* Le lettrage est un SVG : textLength impose la largeur exacte, donc le mot
   occupe toujours toute la largeur disponible, jamais plus, quelle que soit
   la police chargée ou la taille d'écran. */
function Wordmark({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 1000 178" className="block w-full overflow-visible" aria-hidden>
      <text
        x="0"
        y="150"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fontSize="196"
        fontWeight="800"
        style={{ fontFamily: "'Bricolage Grotesque', 'Inter', system-ui, sans-serif" }}
        fill={filled ? "#0c0a12" : "none"}
        stroke={filled ? "none" : "rgba(12,10,18,0.34)"}
        strokeWidth={filled ? 0 : 1.2}
        vectorEffect="non-scaling-stroke"
      >
        VIZIOCRAFT
      </text>
    </svg>
  );
}

/* La scène est rendue deux fois, une par moitié d'écran : au moment de la
   coupe, chaque moitié part de son côté et le mot est tranché en deux. */
function Scene() {
  return (
    <div className="intro-scene">
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-5 pt-5 sm:px-10 sm:pt-8">
        <span className="intro-tag flex items-center gap-2.5">
          <img src={LOGO} alt="" className="h-6 w-auto sm:h-7" />
          <span className="font-label text-ink/60">VizioCraft · Montage vidéo</span>
        </span>
        <span className="intro-count font-display text-[13vw] font-semibold leading-[0.8] tracking-[-0.05em] text-ink tabular-nums sm:text-[5.2vw]" />
      </div>

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 sm:px-10">
        <div className="relative">
          <div className="intro-word-outline">
            <Wordmark filled={false} />
          </div>
          <div className="intro-word-fill absolute inset-0">
            <Wordmark filled />
          </div>
          <span className="intro-head absolute -bottom-3 -top-3 w-px bg-brand-gradient" />
        </div>
        <p className="intro-tag absolute inset-x-5 top-full mt-5 font-em text-[5.4vw] leading-tight text-ink/70 sm:inset-x-10 sm:mt-7 sm:text-[2.1vw]">
          L'équipe montage qui pense chaque seconde.
        </p>
      </div>

      <div className="intro-tag absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-5 sm:px-10 sm:pb-8">
        <span className="font-label text-ink/55">Antananarivo · GMT+3</span>
        <span className="font-label text-ink/55">Shorts · Ads · Podcasts · Longs</span>
      </div>
    </div>
  );
}

/* Ouverture : le compteur monte, le mot s'encre, puis l'écran est coupé en deux.
   100 % CSS (fonctionne avant l'hydratation). Une seule fois par session :
   un script inline pose .vz-skip-intro avant la première peinture. */
let played = false;

export function IntroLoader() {
  /* déjà jouée pendant cette visite (retour sur l'accueil) : on ne rejoue pas */
  const [skip] = useState(played);

  useEffect(() => {
    const done = () => document.documentElement.classList.add("vz-skip-intro");
    if (skip) {
      done();
      return;
    }
    played = true;
    try {
      sessionStorage.setItem("vz-intro", "1");
    } catch {
      /* stockage indisponible : on ignore */
    }
    const t = window.setTimeout(done, 3600);
    return () => window.clearTimeout(t);
  }, [skip]);

  if (skip) return null;

  return (
    <div aria-hidden className="intro">
      <div className="intro-half intro-half--top">
        <Scene />
      </div>
      <div className="intro-half intro-half--bottom">
        <Scene />
      </div>
      <span className="intro-seam" />
    </div>
  );
}
