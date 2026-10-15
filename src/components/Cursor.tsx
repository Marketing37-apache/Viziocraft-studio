import { useEffect, useRef, useState } from "react";

/* Curseur : point précis + anneau retardé, avec libellé contextuel
   (Play sur une vidéo, Glisser sur un carrousel).
   Uniquement pointeur fin et mouvement réduit désactivé. */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("vz-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let visible = false;

    const render = () => {
      rx += (mx - rx) * 0.19;
      ry += (my - ry) * 0.19;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        rx = mx;
        ry = my;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };
    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        "[data-cursor], a, button, [role=button], input, textarea, select, label",
      ) as HTMLElement | null;
      if (!target) {
        setLabel("");
        setActive(false);
        return;
      }
      const custom = target.getAttribute("data-cursor");
      if (custom) {
        setLabel(custom);
        setActive(true);
      } else if (target.matches("input, textarea, select, [contenteditable=true]")) {
        setLabel("");
        setActive(false);
      } else {
        setLabel("");
        setActive(true);
      }
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);

    dot.style.opacity = "0";
    ring.style.opacity = "0";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("vz-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = label ? "h-[74px] w-[74px]" : active ? "h-12 w-12" : "h-9 w-9";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={dotRef}
        className={`absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-white mix-blend-difference transition-opacity duration-300 ${
          label ? "!opacity-0" : ""
        }`}
      />
      <div ref={ringRef} className="absolute left-0 top-0 transition-opacity duration-300">
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${size} ${
            label
              ? "bg-ink text-white shadow-[0_18px_40px_-18px_rgba(12,10,18,0.7)]"
              : "border border-white mix-blend-difference"
          } ${pressed ? "scale-[0.86]" : "scale-100"}`}
        >
          {label && <span className="font-label text-[9.5px] tracking-[0.14em]">{label}</span>}
        </div>
      </div>
    </div>
  );
}
