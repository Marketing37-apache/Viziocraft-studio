import { useEffect, useRef, useSyncExternalStore } from "react";

/* Lecture en grand, avec le son. Un seul lecteur pour toute la page,
   monté uniquement à la demande.
   - `id`  : vidéo YouTube (présentation de l'agence)
   - `src` : fichier vidéo hébergé sur le site (réalisations) */

export type LightboxVideo = {
  title: string;
  vertical?: boolean;
  id?: string;
  src?: string;
  poster?: string;
  /** texte sous la vidéo (format, durée...) */
  caption?: string;
  /** lien vers la version intégrale quand le site n'en montre qu'un extrait */
  fullUrl?: string;
};

let current: LightboxVideo | null = null;
let opener: HTMLElement | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function openVideo(video: LightboxVideo) {
  opener = (document.activeElement as HTMLElement | null) ?? null;
  current = video;
  emit();
}

export function closeVideo() {
  current = null;
  emit();
  opener?.focus?.({ preventScroll: true });
  opener = null;
}

const FOCUSABLE = "button, a[href], video[controls], iframe";

export function VideoLightbox() {
  const video = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideo();
      /* le focus tourne dans la fenêtre */
      if (e.key === "Tab" && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const i = items.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey
          ? items[(i - 1 + items.length) % items.length]
          : items[(i + 1) % items.length];
        e.preventDefault();
        next.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [video]);

  if (!video) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 p-4 sm:p-8"
    >
      <div
        className="lightbox-scrim absolute inset-0 bg-[#0c0a12]/90 backdrop-blur-md"
        onClick={closeVideo}
      />

      <button
        ref={closeRef}
        onClick={closeVideo}
        data-cursor="Fermer"
        aria-label="Fermer la vidéo"
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-[#0c0a12] sm:right-6 sm:top-6"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div
        className={`lightbox-stage relative z-[5] overflow-hidden rounded-2xl bg-black shadow-[0_60px_140px_-40px_rgba(0,0,0,0.9)] sm:rounded-3xl ${
          video.vertical
            ? "aspect-[9/16] h-[min(78dvh,calc((100vw-2rem)*16/9))]"
            : "aspect-video w-[min(100%,calc((100dvh-11rem)*16/9))]"
        }`}
      >
        {video.src ? (
          <video
            src={video.src}
            poster={video.poster}
            title={video.title}
            autoPlay
            controls
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        ) : (
          <iframe
            src={
              `https://www.youtube-nocookie.com/embed/${video.id}` +
              `?autoplay=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&hl=fr`
            }
            title={video.title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>

      <div className="relative z-[5] flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-center">
        <p className="font-display text-[15px] font-semibold tracking-tight text-white sm:text-[17px]">
          {video.title}
        </p>
        {video.caption && <p className="font-label text-white/60">{video.caption}</p>}
        {video.fullUrl && (
          <a
            href={video.fullUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white hover:text-[#0c0a12]"
          >
            Voir la version complète
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
