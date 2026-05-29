import { useEffect, useRef, useState } from "react";

export type ShortItem = { id: string; client: string };

function ShortCard({ id, client, active }: ShortItem & { active: boolean }) {
  // Autoplay muted loop YouTube short — params keep it minimal/clean
  const params = `autoplay=${active ? 1 : 0}&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0`;
  return (
    <div className="group relative shrink-0 w-[180px] sm:w-[200px]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] transition duration-500 group-hover:scale-[1.04] group-hover:ring-white/40">
        <iframe
          src={`https://www.youtube.com/embed/${id}?${params}`}
          title={`Short ${client}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="lazy"
          className="absolute inset-0 h-full w-full pointer-events-none"
        />
        {/* clickable overlay → open original on YouTube */}
        <a
          href={`https://www.youtube.com/shorts/${id}`}
          target="_blank"
          rel="noreferrer"
          className="absolute inset-0 z-10"
          aria-label={`Voir le short ${client} sur YouTube`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3">
          <p className="text-[11px] font-medium text-white/95 truncate">{client}</p>
        </div>
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
  speed?: number; // seconds for full loop
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Only mount iframes when this row is near the viewport (saves CPU)
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting),
      { rootMargin: "200px" }
    );
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // Duplicate to make a seamless loop
  const loop = [...items, ...items];

  return (
    <div
      ref={wrapRef}
      className="group/marquee relative overflow-hidden"
      style={{ maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)" }}
    >
      <div
        className="flex gap-4 w-max group-hover/marquee:[animation-play-state:paused]"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {loop.map((s, i) => (
          <ShortCard key={`${s.id}-${i}`} {...s} active={active} />
        ))}
      </div>
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
