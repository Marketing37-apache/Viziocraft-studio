import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = typeof window !== "undefined" ? localStorage.getItem("viziocraft_cookie_consent") : "ok";
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
    <div className="fixed bottom-6 left-6 right-6 z-50 mx-auto max-w-md md:left-auto md:right-8 fade-in">
      <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-background/95 p-6 shadow-2xl backdrop-blur-xl">
        <h3 className="font-display text-lg font-semibold">🍪 Respect de votre vie privée</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Nous utilisons des cookies essentiels au bon fonctionnement du site.
          Consultez notre <Link to="/cookies" className="text-primary hover:underline">politique des cookies</Link>.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => set("declined")} className="rounded-full border border-foreground/10 px-4 py-2 text-xs font-semibold text-foreground/80 hover:bg-foreground/5">
            Refuser
          </button>
          <button onClick={() => set("accepted")} className="rounded-full bg-brand-gradient px-5 py-2.5 text-xs font-semibold text-white glow-brand hover:opacity-90">
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
