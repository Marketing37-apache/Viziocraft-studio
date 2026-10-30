import { createContext, useContext, useEffect, useRef, useState, type CSSProperties } from "react";
import { openVideo } from "@/components/VideoLightbox";
import { formatDuration, workFiles, type Work } from "@/data/work";

/* ------------------------------------------------
   Vignette de réalisation.
   - au repos : une miniature webp (lazy), aucune vidéo chargée
   - souris dans la section : l'extrait muet de 5 s (150 à 400 Ko) se précharge
   - survol : l'extrait démarre aussitôt et se fond par-dessus la miniature
   - clic / toucher : lecture en grand, avec le son
   Les vidéos sont hébergées sur le site : pas de lecteur tiers, pas d'habillage.
------------------------------------------------ */

/** La section signale ici que la souris est dedans : les vignettes préchargent leur extrait. */
export const WarmContext = createContext(false);

export function WorkTile({
  work,
  className = "",
  style,
  eager = false,
  compact = false,
}: {
  work: Work;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
  /** vignette réduite (hero) : textes allégés */
  compact?: boolean;
}) {
  const files = workFiles(work);
  const warm = useContext(WarmContext);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hovering = useRef(false);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /* préchargement de l'extrait quand la souris entre dans la section */
  useEffect(() => {
    if (warm) setArmed(true);
  }, [warm]);

  const play = () => {
    hovering.current = true;
    setArmed(true);
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      /* lecture refusée (économie d'énergie) : la miniature reste */
    });
  };
  const pause = () => {
    hovering.current = false;
    setPlaying(false);
    videoRef.current?.pause();
  };

  return (
    <a
      href={files.video}
      aria-label={`Lire : ${work.title}, ${work.label}, ${formatDuration(work.duration)}`}
      data-cursor={playing ? "Son" : "Play"}
      className={`work-tile @container group/tile relative block overflow-hidden bg-[#0c0a12] ${
        work.o === "v" ? "aspect-[9/16]" : "aspect-video"
      } ${className}`}
      style={style}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") play();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") pause();
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) play();
      }}
      onBlur={pause}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        pause();
        openVideo({
          title: work.title,
          vertical: work.o === "v",
          src: files.video,
          poster: files.poster,
          caption: files.fullUrl
            ? `${work.label} · extrait d'une minute sur ${formatDuration(work.duration)}`
            : `${work.label} · ${formatDuration(work.duration)}`,
          fullUrl: files.fullUrl,
        });
      }}
    >
      <img
        src={files.poster}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tile:scale-[1.04] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {armed && (
        <video
          ref={videoRef}
          src={files.preview}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => {
            if (hovering.current) setPlaying(true);
          }}
          onCanPlay={(e) => {
            if (hovering.current) e.currentTarget.play().catch(() => {});
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0a12]/80 via-[#0c0a12]/5 to-[#0c0a12]/25 transition-opacity duration-500 group-hover/tile:opacity-70"
      />

      <span className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5 sm:p-3">
        <span className="font-label truncate rounded-full bg-white/90 px-2.5 py-1 text-ink backdrop-blur">
          {work.label}
        </span>
        {!compact && (
          <span className="font-label hidden shrink-0 rounded-full bg-[#0c0a12]/45 px-2.5 py-1 text-white/90 tabular-nums backdrop-blur @min-[230px]:inline-block">
            {formatDuration(work.duration)}
          </span>
        )}
      </span>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-4">
        <span
          className={`block font-display font-semibold leading-tight tracking-[-0.02em] text-white ${
            compact ? "text-[13px]" : "text-[14px] sm:text-[16px]"
          }`}
        >
          {work.title}
        </span>
        <span
          aria-hidden
          className={`flex shrink-0 items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tile:scale-110 ${
            compact ? "h-8 w-8" : "h-9 w-9 sm:h-10 sm:w-10"
          } ${playing ? "scale-75 opacity-0" : ""}`}
        >
          <svg viewBox="0 0 24 24" className={compact ? "h-6 w-6" : "h-7 w-7 sm:h-8 sm:h-8"} fill="white" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </a>
  );
}
