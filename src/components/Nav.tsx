import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const LOGO = "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();
  const onDevisPage = location.pathname.startsWith("/devis/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/#showreel", label: "Réalisations" },
    { href: "/#services", label: "Services" },
    { href: "/#process", label: "Process" },
    { href: "/#tarifs", label: "Tarifs" },
    { href: "/#faq", label: "FAQ" },
  ];

  const textColor = scrolled ? "text-foreground" : "text-white";
  const subColor = scrolled ? "text-foreground/70 hover:text-foreground" : "text-white/80 hover:text-white";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-background/85 border-b border-foreground/10 shadow-[0_1px_30px_-10px_rgba(123,45,142,0.15)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className={`flex items-center gap-3 group ${textColor}`}>
          <img src={LOGO} alt="VizioCraft" className="h-9 w-auto transition-transform group-hover:scale-105" />
          <span className="hidden sm:inline text-lg font-semibold tracking-tight">
            VizioCraft
          </span>
        </Link>

        <ul className={`hidden md:flex items-center gap-8 text-sm ${subColor}`}>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="/#contact"
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
              scrolled
                ? "border-foreground/15 text-foreground hover:bg-foreground/5"
                : "border-white/25 text-white hover:bg-white/10"
            }`}
          >
            Contact
          </a>
          {!onDevisPage && (
            <a
              href="/devis/standard"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white glow-brand hover:opacity-95 transition"
            >
              Devis →
            </a>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className={`md:hidden p-2 ${textColor}`}
          aria-label="Menu"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-foreground/10 bg-background/95 backdrop-blur-xl">
          <ul className="flex flex-col gap-1 px-6 py-4 text-foreground">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block py-3">
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-3 flex flex-col gap-2">
              <a
                href="/#contact"
                onClick={() => setOpen(false)}
                className="block text-center rounded-full border border-foreground/20 px-5 py-3 text-sm font-semibold text-foreground"
              >
                Contact
              </a>
              {!onDevisPage && (
                <a
                  href="/devis/standard"
                  onClick={() => setOpen(false)}
                  className="block text-center rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white"
                >
                  Devis →
                </a>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
