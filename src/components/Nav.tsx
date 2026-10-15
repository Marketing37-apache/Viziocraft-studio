import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const LOGO =
  "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png";

const LINKS = [
  { id: "showreel", href: "/#showreel", label: "Réalisations" },
  { id: "process", href: "/#process", label: "Process" },
  { id: "tarifs", href: "/#tarifs", label: "Tarifs" },
  { id: "faq", href: "/#faq", label: "FAQ" },
  { id: "contact", href: "/#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const { location } = useRouterState();
  const onHome = location.pathname === "/";
  const onDevisPage = location.pathname.startsWith("/devis/");

  /* La barre s'efface quand on descend, revient dès qu'on remonte. */
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (y > 520 && y > last + 6) setHidden(true);
        else if (y < last - 6 || y <= 520) setHidden(false);
        last = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Section courante : repère discret dans la barre. */
  useEffect(() => {
    if (!onHome || typeof IntersectionObserver === "undefined") {
      setActive("");
      return;
    }
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onHome, location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-5 sm:pt-4 ${
          hidden && !open ? "-translate-y-[130%]" : "translate-y-0"
        }`}
      >
        <nav
          aria-label="Navigation principale"
          className={`mx-auto flex max-w-[1344px] items-center justify-between gap-3 rounded-full border py-1.5 pl-4 pr-1.5 transition-all duration-500 sm:pl-5 ${
            scrolled || open || !onHome
              ? "border-ink/10 bg-white/85 shadow-[0_18px_50px_-28px_rgba(12,10,18,0.45)] backdrop-blur-xl"
              : "border-ink/[0.06] bg-white/45 backdrop-blur-md"
          }`}
        >
          <Link
            to="/"
            aria-label="VizioCraft, retour à l'accueil"
            className="group flex shrink-0 items-center gap-2.5 text-ink"
          >
            <img
              src={LOGO}
              alt=""
              width={709}
              height={792}
              className="h-7 w-auto transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6 group-hover:scale-110 sm:h-8"
            />
            <span className="font-display text-[16px] font-bold tracking-tight max-[359px]:hidden">
              VizioCraft
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={active === l.id ? "true" : undefined}
                  className={`relative rounded-full px-4 py-2.5 text-[13.5px] font-medium transition-colors duration-300 ${
                    active === l.id ? "text-ink" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {l.label}
                  <span
                    aria-hidden
                    className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand transition-all duration-500 ${
                      active === l.id ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <span className="mr-2 hidden items-center gap-2 xl:flex">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-label text-ink/60">Disponible 7j/7</span>
            </span>
            {!onDevisPage && (
              <a
                href="/devis/surmesure"
                className="btn-vz whitespace-nowrap rounded-full bg-ink px-4 py-3 text-[13px] font-semibold text-white sm:px-5"
              >
                Devis en 2 min
              </a>
            )}
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink lg:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              aria-controls="vz-mobile-menu"
            >
              <span className="relative block h-3 w-[18px]">
                <span
                  className={`absolute left-0 block h-[1.5px] w-full bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "top-[5px] rotate-45" : "top-0.5"}`}
                />
                <span
                  className={`absolute left-0 block h-[1.5px] w-full bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "top-[5px] -rotate-45" : "top-[9px]"}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Menu mobile : plein écran, entrée décalée */}
      <div
        id="vz-mobile-menu"
        className={`fixed inset-0 z-40 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className={`absolute inset-0 flex flex-col justify-between bg-paper px-5 pb-8 pt-28 transition-[clip-path,opacity] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            open
              ? "opacity-100 [clip-path:inset(0_0_0_0)]"
              : "opacity-0 [clip-path:inset(0_0_100%_0)]"
          }`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(198,156,238,0.55),transparent)] blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(139,206,247,0.5),transparent)] blur-2xl"
          />

          <ul className="relative">
            {LINKS.map((l, i) => (
              <li
                key={l.href}
                className="overflow-hidden border-b border-ink/10"
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? "none" : "translateY(22px)",
                  transition: `opacity 700ms var(--ease-vz) ${160 + i * 70}ms, transform 700ms var(--ease-vz) ${160 + i * 70}ms`,
                }}
              >
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-5 font-display text-[2.6rem] font-semibold leading-none tracking-[-0.04em] text-ink"
                >
                  {l.label}
                  <span className="font-label text-ink/55">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>

          <div
            className="relative flex flex-col gap-3"
            style={{
              opacity: open ? 1 : 0,
              transition: "opacity 700ms var(--ease-vz) 480ms",
            }}
          >
            <p className="font-label flex items-center gap-2 text-ink/60">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Disponible 7j/7 · Réponse sous 24h
            </p>
            {!onDevisPage && (
              <a
                href="/devis/surmesure"
                onClick={() => setOpen(false)}
                className="rounded-full bg-ink px-5 py-4 text-center text-[15px] font-semibold text-white"
              >
                Calculer mon devis en 2 min
              </a>
            )}
            <a
              href="/#contact"
              onClick={() => setOpen(false)}
              className="rounded-full border border-ink/15 bg-white/60 px-5 py-4 text-center text-[15px] font-semibold text-ink"
            >
              Réserver un appel
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
