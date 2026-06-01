import { useEffect, useRef, useState } from "react";

export type ShortItem = { id: string; client: string };

/* Geometry note — make the 16:9 iframe perfectly fill a 9:16 container.
 * Container W × H where H/W = 16/9. The iframe (16:9 player) holds a 9:16
 * video letterboxed inside it. To fill the container with the inner video:
 *   iframe height  = 100% (player height = container height)
 *   iframe width   = ~316% (player width = container height × 16/9 ÷ video w/h)
 *   left offset    = ~-108%  (= (316 − 100) / 2 to center)
 * Result: no black bars, YouTube chrome cropped off-screen. */
const SHORT_IFRAME = "absolute top-0 h-full w-[316%] left-[-108%] pointer-events-none";

function ShortCard({ id, client }: ShortItem) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        setIsInViewport(e.isIntersecting);
      },
      { 
        rootMargin: "250px", // preload when within 250px of viewport
        threshold: 0.01 
      }
    );
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const params =
    "autoplay=1&mute=1&loop=1&playlist=" + id +
    "&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3";

  return (
    <div className="group relative shrink-0 w-[165px] sm:w-[210px] md:w-[230px]">
      <div
        ref={wrapRef}
        className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] transition duration-500 group-hover:scale-[1.04] group-hover:ring-white/40"
      >
        {/* Thumbnail fallback — scaled to fill (vi.jpg is 16:9, crop to 9:16) */}
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt={`Short ${client}`}
          loading="lazy"
          className="absolute top-0 h-full w-[316%] left-[-108%] object-cover"
        />
        {isInViewport && (
          <iframe
            src={`https://www.youtube.com/embed/${id}?${params}`}
            title={`Short ${client}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            loading="lazy"
            className={SHORT_IFRAME}
          />
        )}
        <span className="absolute inset-0 z-10" aria-hidden />
      </div>
    </div>
  );
}

export function MarqueeShorts({
  items,
  direction = "left",
  speed = 60,
}: {
  items: ShortItem[];
  direction?: "left" | "right";
  speed?: number;
}) {
  // Triple so the strip is wide enough for ultra-wide screens
  const loop = [...items, ...items, ...items];

  return (
    <div
      className="group/marquee relative mx-auto max-w-[100rem] overflow-hidden px-4 sm:px-8 lg:px-12"
      style={{ maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)" }}
    >
      <div
        className="flex gap-3 sm:gap-4 w-max group-hover/marquee:[animation-play-state:paused]"
        style={{ animation: `marquee-${direction} ${speed}s linear infinite`, willChange: "transform" }}
      >
        {loop.map((s, i) => (
          <ShortCard key={`${s.id}-${i}`} {...s} />
        ))}
      </div>
      <style>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes marquee-right { from { transform: translateX(-33.333%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
