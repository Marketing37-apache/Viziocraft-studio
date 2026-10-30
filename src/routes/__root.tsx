import {
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Nav } from "@/components/Nav";
import { useRevealObserver } from "@/lib/motion";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          La page n'a pas pu se charger
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un problème est survenu de notre côté. Réessayez ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VizioCraft - L'équipe montage vidéo qui pense chaque seconde" },
      {
        name: "description",
        content:
          "Agence de montage vidéo. Reels, ads, podcasts, contenus sociaux produits avec rapidité, cohérence et exigence.",
      },
      { property: "og:title", content: "VizioCraft - Votre équipe vidéo dédiée" },
      { property: "og:description", content: "Une équipe créative dédiée à votre contenu vidéo." },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content:
          "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "VizioCraft - Agence de montage vidéo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "VizioCraft - Votre équipe vidéo dédiée" },
      {
        name: "twitter:description",
        content: "Agence de montage vidéo. Reels, ads, podcasts, contenus sociaux.",
      },
      {
        name: "twitter:image",
        content:
          "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png",
      },
    ],
    links: [
      { rel: "canonical", href: "https://viziocraft.com" },
      { rel: "stylesheet", href: appCss },
      /* favicon-vz.png pèse 29 Ko ; l'ancien favicon.png en pesait 2,1 Mo */
      { rel: "icon", type: "image/png", href: "/favicon-vz.png" },
      { rel: "apple-touch-icon", href: "/favicon-vz.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://cdn.prod.website-files.com" },
      { rel: "preconnect", href: "https://i.ytimg.com" },
      { rel: "dns-prefetch", href: "https://www.youtube-nocookie.com" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const FONTS_URL =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;500&display=swap";

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WQLN2XWD');`,
          }}
        />
        {/* intro déjà vue pendant cette session : on la saute avant la première peinture */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('vz-intro'))document.documentElement.classList.add('vz-skip-intro')}catch(e){}`,
          }}
        />
        <HeadContent />
        <link rel="preload" as="style" href={FONTS_URL} />
        <link rel="stylesheet" href={FONTS_URL} />
        {/* sans JavaScript : miniatures et contenus restent visibles */}
        <noscript>
          <style>{`.hv-poster img,[data-reveal]{opacity:1!important;transform:none!important}.mask-line>span{transform:none!important}.ink-word{opacity:1!important}.tile-in{opacity:1!important}`}</style>
        </noscript>
      </head>
      <body>
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WQLN2XWD" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function GlobalEffects() {
  useRevealObserver();
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Nav />
      <GlobalEffects />
      <Outlet />
      <CookieBannerLazy />
    </QueryClientProvider>
  );
}

import { CookieBanner as CookieBannerLazy } from "@/components/CookieBanner";
