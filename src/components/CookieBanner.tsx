import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent =
      typeof window !== "undefined" ? localStorage.getItem("viziocraft_cookie_consent") : "ok";
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const set = (v: string) => {
    localStorage.setItem("viziocraft_cookie_consent", v);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fade-in fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md md:bottom-6 md:left-auto md:right-8">
      <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-white/95 p-5 shadow-[0_30px_80px_-30px_rgba(12,10,18,0.45)] backdrop-blur-xl sm:p-6">
        <h3 className="font-display text-lg font-semibold">Respect de votre vie privée</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Nous utilisons des cookies essentiels au bon fonctionnement du site. Consultez notre{" "}
          <Link to="/cookies" className="text-primary hover:underline">
            politique des cookies
          </Link>
          .
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => set("declined")}
            className="rounded-full border border-foreground/15 px-4 py-2.5 text-xs font-semibold text-foreground/80 hover:bg-foreground/5"
          >
            Refuser
          </button>
          <button
            onClick={() => set("accepted")}
            className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
