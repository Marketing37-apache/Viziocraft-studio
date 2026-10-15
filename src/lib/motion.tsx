import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/* ------------------------------------------------
   Motion primitives - zero dependency.
   Tout est piloté par : IntersectionObserver + rAF + CSS vars.
------------------------------------------------ */

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/* --- Scroll velocity (singleton) : rend les marquees vivants --- */
let lastY = 0;
let velocity = 0;
let installed = false;

function installVelocityTracker() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  lastY = window.scrollY;
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        velocity = velocity * 0.55 + (y - lastY) * 0.45;
        lastY = y;
        ticking = false;
      });
    },
    { passive: true },
  );
  window.setInterval(() => {
    velocity *= 0.86;
  }, 90);
}

export function getScrollVelocity() {
  installVelocityTracker();
  return velocity;
}

/* --- In-view --- */
export function useInView<T extends Element>(threshold = 0.15, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return [ref, inView] as const;
}

/* --- Observeur global pour [data-reveal] ---
   Un seul IntersectionObserver pour toute la page + MutationObserver
   pour les nœuds injectés. Ajoute .is-in quand l'élément entre. */
export function useRevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const observeAll = (root: ParentNode) => {
      root.querySelectorAll?.("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    };
    /* on laisse la page finir de s'hydrater avant de toucher aux classes */
    const start = window.setTimeout(() => observeAll(document), 80);

    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          const el = n as Element;
          if (el.matches?.("[data-reveal]:not(.is-in)")) io.observe(el);
          observeAll(el);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(start);
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}

/* --- Reveal wrapper --- */
export function Reveal({
  children,
  as: Tag = "div",
  effect = "up",
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  effect?: "up" | "fade" | "scale" | "blur";
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Tag
      data-reveal={effect}
      className={className}
      style={{ ...style, ["--rd" as string]: `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* --- Masked lines: chaque ligne glisse depuis son cache --- */
export function MaskLines({
  lines,
  className = "",
  delay = 0,
  step = 110,
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  step?: number;
}) {
  return (
    <>
      {lines.map((l, i) => (
        <span
          key={i}
          className={`mask-line ${className}`}
          style={{
            ["--wd" as string]: `calc(var(--intro-delay, 0ms) + ${delay + i * step}ms)`,
          }}
        >
          <span>{l}</span>
        </span>
      ))}
    </>
  );
}

/* --- Mots masqués un par un (kinetic type) --- */
export function Words({
  text,
  delay = 0,
  step = 70,
  className = "",
}: {
  text: string;
  delay?: number;
  step?: number;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className={`mask-line ${className}`}
          style={{ ["--wd" as string]: `${delay + i * step}ms` }}
        >
          <span>
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </>
  );
}

/* --- Compteur qui s'anime à l'entrée dans le viewport --- */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1500,
  className = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/* --- Aimantation : le bouton suit légèrement le curseur --- */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    };
    const leave = () => {
      el.style.transition = "transform 600ms cubic-bezier(0.16,1,0.3,1)";
      el.style.transform = "translate3d(0,0,0)";
      window.setTimeout(() => {
        el.style.transition = "";
      }, 620);
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);

  return ref;
}

/* --- Spotlight : les variables --mx/--my suivent la souris --- */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const move = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        raf = 0;
      });
    };
    el.addEventListener("mousemove", move);
    return () => {
      el.removeEventListener("mousemove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}

/* --- Carrousel en dérive lente, piloté en rAF ---
   Dérive automatique + glisser (souris et tactile) avec inertie + flèches.
   Le track contient 3 exemplaires du jeu d'éléments pour boucler sans couture. */
export function useMarquee<T extends HTMLElement>({
  speed = 30,
  direction = "left",
  count,
  scrollBoost = 0,
  draggable = true,
}: {
  speed?: number;
  direction?: "left" | "right";
  /** nombre d'éléments d'un jeu (le track en contient 3 exemplaires) */
  count: number;
  /** 0 = vitesse constante ; > 0 = accélère avec la vélocité du scroll */
  scrollBoost?: number;
  draggable?: boolean;
}) {
  const trackRef = useRef<T | null>(null);
  const pausedRef = useRef(false);
  const nudgeRef = useRef(0);
  const [paused, setPausedState] = useState(false);
  const reduced = useReducedMotion();
  const offsetRef = useRef(0);

  const setPaused = (v: boolean) => {
    pausedRef.current = v;
    setPausedState(v);
  };

  /** décale le carrousel d'un nombre de pixels (flèches précédent / suivant) */
  const nudge = (px: number) => {
    nudgeRef.current += px;
  };

  useEffect(() => {
    const el = trackRef.current;
    const rail = el?.parentElement;
    if (!el || !rail) return;

    let raf = 0;
    let last = performance.now();
    let boost = 0;
    let segment = 0;
    let inertia = 0;
    let visible = true;

    let pointerId = -1;
    let startX = 0;
    let lastX = 0;
    let lastT = 0;
    let dragging = false;
    let moved = false;

    const measure = () => {
      const a = el.children[0] as HTMLElement | undefined;
      const b = el.children[count] as HTMLElement | undefined;
      segment = a && b ? Math.abs(b.offsetLeft - a.offsetLeft) : el.scrollWidth / 3;
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" })
        : null;
    io?.observe(rail);

    const apply = () => {
      if (segment > 0) {
        while (offsetRef.current <= -segment) offsetRef.current += segment;
        while (offsetRef.current > 0) offsetRef.current -= segment;
      }
      el.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
    };

    const loop = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      raf = requestAnimationFrame(loop);
      if (!visible || segment <= 0) return;

      if (dragging) return;

      if (Math.abs(nudgeRef.current) > 0.5) {
        const step = nudgeRef.current * Math.min(1, dt * 7);
        nudgeRef.current -= step;
        offsetRef.current += step;
        apply();
        return;
      }
      if (Math.abs(inertia) > 8) {
        offsetRef.current += inertia * dt;
        inertia *= Math.pow(0.04, dt);
        apply();
        return;
      }
      if (pausedRef.current || reduced) return;

      if (scrollBoost > 0) {
        const target = Math.min(Math.abs(getScrollVelocity()) * scrollBoost, speed * 2);
        boost += (target - boost) * 0.07;
      }
      offsetRef.current += (speed + boost) * dt * (direction === "left" ? -1 : 1);
      apply();
    };
    raf = requestAnimationFrame(loop);

    /* --- Glisser --- */
    const down = (e: PointerEvent) => {
      if (!draggable || (e.pointerType === "mouse" && e.button !== 0)) return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      lastT = performance.now();
      moved = false;
      inertia = 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      if (!dragging) {
        if (Math.abs(e.clientX - startX) < 7) return;
        dragging = true;
        moved = true;
        rail.classList.add("is-dragging");
        try {
          rail.setPointerCapture(pointerId);
        } catch {
          /* capture indisponible : on continue sans */
        }
      }
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      inertia = inertia * 0.6 + (dx / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
      offsetRef.current += dx;
      apply();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = -1;
      if (dragging) {
        dragging = false;
        rail.classList.remove("is-dragging");
        if (performance.now() - lastT > 90) inertia = 0;
        inertia = Math.max(-2600, Math.min(2600, inertia));
      }
    };
    /* un glisser ne doit pas déclencher le clic de la carte */
    const click = (e: MouseEvent) => {
      if (!moved) return;
      moved = false;
      e.preventDefault();
      e.stopPropagation();
    };

    rail.addEventListener("pointerdown", down);
    rail.addEventListener("pointermove", move);
    rail.addEventListener("pointerup", up);
    rail.addEventListener("pointercancel", up);
    rail.addEventListener("click", click, true);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      rail.removeEventListener("pointerdown", down);
      rail.removeEventListener("pointermove", move);
      rail.removeEventListener("pointerup", up);
      rail.removeEventListener("pointercancel", up);
      rail.removeEventListener("click", click, true);
    };
  }, [speed, direction, count, reduced, scrollBoost, draggable]);

  return { trackRef, paused, setPaused, nudge };
}

/* --- Progression d'un élément dans le viewport (0 → 1), écrite en CSS var ---
   0 quand le haut de l'élément touche le bas de l'écran,
   1 quand il atteint la position `end` (fraction de la hauteur d'écran). */
export function useViewProgress<T extends HTMLElement>(
  onProgress: (p: number, el: T) => void,
  { start = 1, end = 0.2 }: { start?: number; end?: number } = {},
) {
  const ref = useRef<T | null>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let active = false;
    let lastP = -1;

    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (start * vh - r.top) / ((start - end) * vh)));
      if (Math.abs(p - lastP) > 0.001) {
        lastP = p;
        cb.current(p, el);
      }
    };
    const onScroll = () => {
      if (active && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        active = e.isIntersecting;
        if (active) onScroll();
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(el);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [start, end]);

  return ref;
}

/* --- Inclinaison 3D légère + halo : la carte suit le pointeur --- */
export function useTilt<T extends HTMLElement>(max = 4) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const move = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
        if (!reduced) {
          el.style.setProperty("--ry", `${(x - 0.5) * 2 * max}deg`);
          el.style.setProperty("--rx", `${(0.5 - y) * 2 * max}deg`);
        }
      });
    };
    const leave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max]);

  return ref;
}
