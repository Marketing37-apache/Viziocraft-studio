import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { openVideo } from "@/components/VideoLightbox";

/* ------------------------------------------------
   Vidéo "miniature d'abord".
   1. Au chargement : une simple image (webp, lazy). Aucun lecteur, aucun script.
   2. Dès que la souris s'approche (hero, carrousel) : le lecteur YouTube est
      monté EN COULISSE, derrière la miniature, et tourne au ralenti.
      YouTube affiche son habillage (titre, boutons, logo) pendant environ
      3 secondes à chaque démarrage : on attend qu'il ait disparu.
   3. Au survol : fondu de la miniature vers une vidéo déjà en lecture et propre.
      Aucun écran noir, aucun spinner, aucun habillage.
   4. Au clic / au toucher : ouverture en grand, avec le son.
   Sur écran tactile, rien n'est monté : la miniature suffit, le toucher ouvre la vidéo.
------------------------------------------------ */

/** Un carrousel signale ici que la souris est dessus : ses cartes visibles se préparent. */
export const PrerollContext = createContext(false);

const YT_ORIGIN = "https://www.youtube-nocookie.com";
const THUMBS = "https://i.ytimg.com";

/* cover  : l'image a déjà le bon format
   pillar : vignette 4:3 d'une vidéo verticale, on ne garde que la bande centrale
   letter : vignette 4:3 d'une vidéo 16:9, on rogne les bandes noires haut et bas */
export type Poster = { src: string; fit: "cover" | "pillar" | "letter" };

/** Miniatures d'un format horizontal, grand écran : 1280x720 webp, puis repli jpg. */
export function landscapePosters(id: string): Poster[] {
  return [
    { src: `${THUMBS}/vi_webp/${id}/hq720.webp`, fit: "cover" },
    { src: `${THUMBS}/vi/${id}/hqdefault.jpg`, fit: "letter" },
  ];
}

/** Idem, version mobile : 640 px de large, deux fois plus légère. */
export function landscapePostersLight(id: string): Poster[] {
  return [
    { src: `${THUMBS}/vi_webp/${id}/sddefault.webp`, fit: "letter" },
    { src: `${THUMBS}/vi/${id}/hqdefault.jpg`, fit: "letter" },
  ];
}

/** Miniatures d'un short, grand écran : image verticale haute définition. */
export function portraitPosters(id: string): Poster[] {
  return [
    { src: `${THUMBS}/vi_webp/${id}/oar2.webp`, fit: "cover" },
    { src: `${THUMBS}/vi/${id}/oar2.jpg`, fit: "cover" },
    { src: `${THUMBS}/vi/${id}/hqdefault.jpg`, fit: "pillar" },
  ];
}

/** Idem, version mobile : image verticale native de 268x480, environ 20 Ko. */
export function portraitPostersLight(id: string): Poster[] {
  return [
    { src: `${THUMBS}/vi/${id}/frame0.jpg`, fit: "cover" },
    { src: `${THUMBS}/vi/${id}/hqdefault.jpg`, fit: "pillar" },
  ];
}

const FIT: Record<Poster["fit"], string> = {
  cover: "left-0 top-0 h-full w-full",
  pillar: "left-[-108%] top-0 h-full w-[316%]",
  letter: "left-0 top-[-16.67%] !h-[133.34%] w-full",
};

/* Une miniature : chaîne de repli si une variante manque, apparition en fondu. */
function PosterImage({
  chain,
  eager,
  className = "",
}: {
  chain: Poster[];
  eager: boolean;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const poster = chain[Math.min(index, chain.length - 1)];

  return (
    <img
      key={poster.src}
      /* image déjà en cache avant l'hydratation : onLoad ne se déclenchera pas */
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
      }}
      src={poster.src}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      draggable={false}
      data-loaded={loaded}
      onLoad={() => setLoaded(true)}
      onError={() => setIndex((i) => Math.min(i + 1, chain.length - 1))}
      className={`${FIT[poster.fit]} ${className}`}
    />
  );
}

type State = "idle" | "warming" | "playing";

/* durée pendant laquelle YouTube montre son habillage après un démarrage */
const CHROME_MS = 3400;
/* vitesse de lecture en coulisse : économise décodage et données */
const BACKSTAGE_RATE = 0.25;

let uid = 0;

export function HoverVideo({
  id,
  title,
  vertical = false,
  posters,
  mobilePosters,
  eager = false,
  intent = 90,
  warm = false,
  zoom = 1.1,
  className = "",
  ariaLabel,
  duplicate = false,
  children,
}: {
  id: string;
  title: string;
  vertical?: boolean;
  posters: Poster[];
  /** variante plus légère servie sous 640 px de large */
  mobilePosters?: Poster[];
  /** image prioritaire (hero) : pas de lazy loading */
  eager?: boolean;
  /** délai d'intention avant de réagir au survol (évite les survols de passage) */
  intent?: number;
  /** prépare le lecteur en coulisse dès maintenant (hero) */
  warm?: boolean;
  /** léger zoom du lecteur : rogne les bords où YouTube pose ses éléments */
  zoom?: number;
  className?: string;
  ariaLabel?: string;
  /** copie de bouclage d'un carrousel : hors tabulation et lecteurs d'écran */
  duplicate?: boolean;
  children?: ReactNode;
}) {
  const railActive = useContext(PrerollContext);
  const [state, setState] = useState<State>("idle");
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);

  const rootRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const hovering = useRef(false);
  const ready = useRef(false);
  const clean = useRef(false);
  const timers = useRef<{
    intent?: number;
    clean?: number;
    pause?: number;
    unmount?: number;
    giveUp?: number;
  }>({});
  const key = useRef(`vz-${++uid}`);

  const command = useCallback((func: string, args: unknown[] = []) => {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YT_ORIGIN,
    );
  }, []);

  /* Le carrousel est survolé : cette carte est-elle à l'écran ? */
  useEffect(() => {
    if (!railActive) {
      setInView(false);
      return;
    }
    const check = () => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      setInView(
        r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight,
      );
    };
    check();
    const t = window.setInterval(check, 500);
    return () => window.clearInterval(t);
  }, [railActive]);

  const backstage = warm || (railActive && inView);

  /* Montage en coulisse, puis mise au repos quand plus personne n'en a besoin. */
  useEffect(() => {
    const t = timers.current;
    if (backstage) {
      window.clearTimeout(t.pause);
      window.clearTimeout(t.unmount);
      if (!mounted) setMounted(true);
      else if (ready.current && !clean.current) command("playVideo");
      return;
    }
    if (!mounted || hovering.current) return;
    t.pause = window.setTimeout(() => {
      if (!hovering.current) command("pauseVideo");
    }, 6000);
    t.unmount = window.setTimeout(() => {
      if (!hovering.current) setMounted(false);
    }, 30000);
    return () => {
      window.clearTimeout(t.pause);
      window.clearTimeout(t.unmount);
    };
  }, [backstage, mounted, command]);

  /* Dialogue avec le lecteur. */
  useEffect(() => {
    if (!mounted) {
      ready.current = false;
      clean.current = false;
      return;
    }
    const t = timers.current;
    let handshake = 0;

    /* le lecteur peut mettre du temps à arriver sur une connexion lente :
       on se présente jusqu'à ce qu'il réponde */
    const listen = () => {
      if (ready.current) {
        window.clearInterval(handshake);
        return;
      }
      frameRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: key.current, channel: "widget" }),
        YT_ORIGIN,
      );
    };

    const onPlayerState = (playerState: number) => {
      if (playerState === 1) {
        /* YouTube active les sous-titres quand le son est coupé : on les retire */
        command("unloadModule", ["captions"]);
        command("setOption", ["captions", "track", {}]);
        if (!hovering.current) {
          command("setPlaybackRate", [BACKSTAGE_RATE]);
          /* personne ne survole : on ne tourne pas en coulisse indéfiniment */
          window.clearTimeout(t.pause);
          t.pause = window.setTimeout(() => {
            if (!hovering.current) command("pauseVideo");
          }, 60000);
        }
        if (clean.current) return;
        window.clearTimeout(t.clean);
        t.clean = window.setTimeout(() => {
          clean.current = true;
          command("unloadModule", ["captions"]);
          if (hovering.current) {
            command("setPlaybackRate", [1]);
            setState("playing");
          }
        }, CHROME_MS);
        return;
      }
      if (playerState === 3) return; // mise en mémoire : l'habillage ne revient pas
      /* pause, fin, arrêt : l'habillage reviendra au prochain démarrage */
      window.clearTimeout(t.clean);
      clean.current = false;
      setState((s) => (s === "playing" ? "warming" : s));
      if (playerState === 0) {
        command("seekTo", [0, true]);
        command("playVideo");
      }
    };

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || e.source !== frameRef.current?.contentWindow) return;
      let data: { event?: string; info?: unknown };
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!data || typeof data !== "object") return;

      if (!ready.current && (data.event === "onReady" || data.event === "initialDelivery")) {
        ready.current = true;
        window.clearInterval(handshake);
        command("addEventListener", ["onStateChange"]);
        command("playVideo");
      }
      if (data.event === "onStateChange" && typeof data.info === "number") {
        onPlayerState(data.info);
      }
    };

    window.addEventListener("message", onMessage);
    handshake = window.setInterval(listen, 250);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(handshake);
      window.clearTimeout(t.clean);
    };
  }, [mounted, command]);

  useEffect(() => {
    const t = timers.current;
    return () => {
      Object.values(t).forEach((x) => window.clearTimeout(x));
    };
  }, []);

  const start = useCallback(() => {
    if (hovering.current) return;
    hovering.current = true;
    const t = timers.current;
    window.clearTimeout(t.pause);
    window.clearTimeout(t.unmount);
    window.clearTimeout(t.intent);
    t.intent = window.setTimeout(() => {
      if (!hovering.current) return;
      if (clean.current) {
        command("setPlaybackRate", [1]);
        setState("playing");
        return;
      }
      setState("warming");
      if (!mounted) setMounted(true);
      else if (ready.current) command("playVideo");
      /* lecture auto refusée par le navigateur (économie d'énergie, données) :
         on reste sur la miniature, le clic ouvre toujours la vidéo */
      window.clearTimeout(t.giveUp);
      t.giveUp = window.setTimeout(() => {
        setState((s) => (s === "warming" ? "idle" : s));
      }, 12000);
    }, intent);
  }, [mounted, command, intent]);

  const stop = useCallback(() => {
    if (!hovering.current) return;
    hovering.current = false;
    const t = timers.current;
    window.clearTimeout(t.intent);
    window.clearTimeout(t.giveUp);
    setState("idle");
    if (!mounted) return;
    command("setPlaybackRate", [BACKSTAGE_RATE]);
    /* le lecteur reste prêt un moment, puis se met au repos */
    window.clearTimeout(t.pause);
    window.clearTimeout(t.unmount);
    t.pause = window.setTimeout(
      () => {
        if (!hovering.current) command("pauseVideo");
      },
      warm ? 45000 : 12000,
    );
    if (!warm) {
      t.unmount = window.setTimeout(() => {
        if (!hovering.current) setMounted(false);
      }, 40000);
    }
  }, [mounted, command, warm]);

  const src =
    `${YT_ORIGIN}/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1` +
    `&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&hl=fr&enablejsapi=1` +
    (typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "");

  /* Un lecteur 16:9 dans une carte 9:16 : 316 % de large, centré, pas de bandes noires. */
  const w = (vertical ? 3.16 : 1) * zoom;
  const frameStyle: CSSProperties = {
    top: `${(-(zoom - 1) / 2) * 100}%`,
    left: `${(-(w - 1) / 2) * 100}%`,
    width: `${w * 100}%`,
    height: `${zoom * 100}%`,
  };

  return (
    <a
      ref={rootRef}
      href={`https://www.youtube.com/watch?v=${id}`}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel ?? `Lire la vidéo : ${title}`}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      data-cursor={state === "playing" ? "Son" : "Play"}
      data-state={state}
      className={`hv group/hv block ${className}`}
      style={{ ["--hv-zoom" as string]: zoom + 0.03 }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") start();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") stop();
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) start();
      }}
      onBlur={stop}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        stop();
        if (mounted) command("pauseVideo");
        openVideo({ id, title, vertical });
      }}
      draggable={false}
    >
      {mounted && (
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
          aria-hidden
          className="hv-frame"
          style={frameStyle}
        />
      )}

      <span className="hv-poster" aria-hidden>
        {mobilePosters ? (
          <>
            <PosterImage chain={mobilePosters} eager={eager} className="sm:hidden" />
            <PosterImage chain={posters} eager={eager} className="max-sm:hidden" />
          </>
        ) : (
          <PosterImage chain={posters} eager={eager} />
        )}
      </span>

      <span className="hv-warm" aria-hidden />
      {children}
    </a>
  );
}
