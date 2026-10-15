import { useEffect, useRef, useState } from "react";

const SCRIPT = "https://assets.calendly.com/assets/external/widget.js";
const URL = "https://calendly.com/viziocraft/30min?primary_color=7b2d8e&text_color=0c0a12";

type CalendlyApi = {
  initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
};

/* Calendly n'est chargé qu'à l'approche de la section : la page d'accueil
   ne paie pas son poids au premier affichage. La hauteur est réservée,
   donc aucun saut de mise en page. */
export function CalendlyWidget() {
  const holderRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;
    let cancelled = false;

    const init = () => {
      const api = (window as unknown as { Calendly?: CalendlyApi }).Calendly;
      if (cancelled || !api || holder.querySelector("iframe")) return;
      api.initInlineWidget({ url: URL, parentElement: holder });
      setLoaded(true);
    };

    const load = () => {
      if ((window as unknown as { Calendly?: CalendlyApi }).Calendly) {
        init();
        return;
      }
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", init, { once: true });
    };

    if (typeof IntersectionObserver === "undefined") {
      load();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(holder);

    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        ref={holderRef}
        className="relative h-[700px] w-full min-w-0 overflow-hidden rounded-2xl border border-foreground/10 bg-white [&>iframe]:h-full [&>iframe]:w-full"
      >
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="h-10 w-10 animate-pulse rounded-full bg-brand-soft" />
            <p className="text-sm text-muted-foreground">Chargement de l'agenda…</p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Réservation directe · Réponse automatique · Aucun engagement
      </p>
    </div>
  );
}
