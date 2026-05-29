import { Link } from "@tanstack/react-router";
import { LinkedInIcon, InstagramIcon, YouTubeIcon, FacebookIcon } from "@/components/SocialIcons";

const CDN = "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02";
const LOGO = `${CDN}/69999911cee89007bdcb6319_viziocraft-logo-white.avif`;

const FOUNDERS = [
  {
    name: "Charles Boucher",
    image: `${CDN}/69998b87a516cf380be00adc_Frame%201.avif`,
    socials: [
      { Icon: LinkedInIcon, href: "https://www.linkedin.com/in/charles-boucher-339b4a3b/", label: "LinkedIn" },
      { Icon: InstagramIcon, href: "https://www.instagram.com/chash.officiel/", label: "Instagram" },
      { Icon: YouTubeIcon, href: "https://www.youtube.com/@chash.official", label: "YouTube" },
      { Icon: FacebookIcon, href: "https://www.facebook.com/people/Chash/61576916018526/", label: "Facebook" },
    ],
  },
  {
    name: "Alexandre Boucher",
    image: `${CDN}/69998b8714bfe203a0795193_Frame%202.avif`,
    socials: [
      { Icon: LinkedInIcon, href: "https://www.linkedin.com/in/alexandre-b-3bb089b6/", label: "LinkedIn" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="surface-ink relative overflow-hidden">
      <div className="grain" />
      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={LOGO} alt="VizioCraft" className="h-9 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Du montage vidéo clé en main, spécialement pensé pour vous.
            </p>

            <div className="mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Retrouvez-nous
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {FOUNDERS.map((f) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                      <img src={f.image} alt={`Portrait de ${f.name}`} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-white leading-none">{f.name}</span>
                      <div className="flex items-center gap-2">
                        {f.socials.map(({ Icon, href, label }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${f.name} sur ${label}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/90 transition hover:bg-white hover:text-[#1a0b2e]"
                          >
                            <Icon className="h-4 w-4" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <FooterCol title="Navigation" links={[
            { l: "Réalisations", h: "/#showreel" },
            { l: "Services", h: "/#services" },
            { l: "Process", h: "/#process" },
            { l: "Tarifs", h: "/#tarifs" },
            { l: "FAQ", h: "/#faq" },
          ]} />
          <FooterCol title="Agence" links={[
            { l: "Contact", h: "/#contact" },
            { l: "Devis personnalisé", h: "/#tarifs" },
          ]} />
          <FooterCol title="Légal" links={[
            { l: "Mentions légales", h: "/mentions-legales" },
            { l: "Confidentialité", h: "/politique-confidentialite" },
            { l: "CGV", h: "/cgv" },
            { l: "Cookies", h: "/cookies" },
          ]} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} VizioCraft. Tous droits réservés.</p>
          <p>Crafted with care · Antananarivo 🇲🇬</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { l: string; h: string }[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">{title}</h4>
      <ul className="mt-5 space-y-3 text-sm text-white/85">
        {links.map((l) => (
          <li key={l.l}>
            <a href={l.h} className="transition hover:text-white">{l.l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
