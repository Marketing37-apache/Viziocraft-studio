import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const LOGO = "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

  // when on top, hero is dark → white text. When scrolled, white blurred bg → dark text.
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

        <a
          href="/#contact"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white glow-brand hover:opacity-95 transition"
        >
          Démarrer un projet →
        </a>

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
            <li className="pt-3">
              <a
                href="/#contact"
                onClick={() => setOpen(false)}
                className="block text-center rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white"
              >
                Démarrer un projet
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
