import { Link } from "@tanstack/react-router";
import { LinkedInIcon, InstagramIcon, YouTubeIcon, FacebookIcon } from "@/components/SocialIcons";

const CDN = "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02";
const LOGO = `${CDN}/6996b52b771675ec516ec984_Asset%201%20(1).png`;

const FOUNDERS = [
  {
    name: "Charles Boucher",
    role: "Co-fondateur",
    image: `${CDN}/69998b87a516cf380be00adc_Frame%201.avif`,
    socials: [
      {
        Icon: LinkedInIcon,
        href: "https://www.linkedin.com/in/charles-boucher-339b4a3b/",
        label: "LinkedIn",
      },
      {
        Icon: InstagramIcon,
        href: "https://www.instagram.com/chash.officiel/",
        label: "Instagram",
      },
      { Icon: YouTubeIcon, href: "https://www.youtube.com/@chash.official", label: "YouTube" },
      {
        Icon: FacebookIcon,
        href: "https://www.facebook.com/people/Chash/61576916018526/",
        label: "Facebook",
      },
    ],
  },
  {
    name: "Alexandre Boucher",
    role: "Co-fondateur",
    image: `${CDN}/69998b8714bfe203a0795193_Frame%202.avif`,
    socials: [
      {
        Icon: LinkedInIcon,
        href: "https://www.linkedin.com/in/alexandre-b-3bb089b6/",
        label: "LinkedIn",
      },
    ],
  },
];

const SITE_LINKS = [
  { l: "Réalisations", h: "/#showreel" },
  { l: "Process", h: "/#process" },
  { l: "Tarifs", h: "/#tarifs" },
  { l: "FAQ", h: "/#faq" },
  { l: "Contact", h: "/#contact" },
  { l: "Devis", h: "/devis/surmesure" },
];

const LEGAL_LINKS = [
  { l: "Mentions légales", h: "/mentions-legales" },
  { l: "Confidentialité", h: "/politique-confidentialite" },
  { l: "CGV", h: "/cgv" },
  { l: "Cookies", h: "/cookies" },
];

export function Footer() {
  return (
    <footer className="relative z-[2] border-t border-ink/10 bg-paper text-ink">
      <div className="shell">
        {/* Ligne principale : marque, liens, fondateurs */}
        <div className="flex flex-col gap-7 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-7">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3"
            aria-label="VizioCraft, accueil"
          >
            <img src={LOGO} alt="" width={709} height={792} loading="lazy" className="h-8 w-auto" />
            <span>
              <span className="block font-display text-[17px] font-bold leading-none tracking-tight">
                VizioCraft
              </span>
              <span className="font-label mt-1.5 block text-ink/60">
                Votre équipe de montage dédiée
              </span>
            </span>
          </Link>

          <nav aria-label="Liens du site">
            <ul className="flex flex-wrap gap-x-6 gap-y-1 text-[14px] font-medium text-ink/75">
              {SITE_LINKS.map((l) => (
                <li key={l.l}>
                  <a
                    href={l.h}
                    className="link-sweep inline-block py-2 transition-colors hover:text-ink"
                  >
                    {l.l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-4 sm:flex sm:flex-wrap sm:items-center sm:gap-x-7">
            {FOUNDERS.map((f) => (
              <li key={f.name} className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <img
                  src={f.image}
                  alt={`Portrait de ${f.name}`}
                  width={40}
                  height={40}
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-ink/10"
                />
                <div>
                  <p className="text-[13px] font-semibold leading-tight">{f.name}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {f.socials.map(({ Icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${f.name} sur ${label}`}
                        className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Barre basse */}
        <div className="flex flex-col gap-3 border-t border-ink/10 py-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-label text-ink/60">
            © {new Date().getFullYear()} VizioCraft · Antananarivo, MG
          </p>

          <ul className="font-label flex flex-wrap gap-x-5 gap-y-1 text-ink/60">
            {LEGAL_LINKS.map((l) => (
              <li key={l.l}>
                <Link to={l.h} className="inline-block py-1.5 transition-colors hover:text-ink">
                  {l.l}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-5">
            <p className="font-label text-ink/55">
              Dev &amp; intégration par{" "}
              <a
                href="https://lumina-canvapro-mt.pages.dev/"
                target="_blank"
                rel="noreferrer"
                className="text-ink/80 transition-colors hover:text-brand"
              >
                teamviziocraft
              </a>
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              data-cursor="Haut"
              aria-label="Revenir en haut de la page"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
