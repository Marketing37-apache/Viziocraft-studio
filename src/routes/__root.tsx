import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
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
      { title: "VizioCraft — Votre équipe vidéo dédiée" },
      { name: "description", content: "Agence de montage vidéo premium. Reels, ads, podcasts, contenus sociaux produits avec rapidité, cohérence et exigence." },
      { property: "og:title", content: "VizioCraft — Votre équipe vidéo dédiée" },
      { property: "og:description", content: "Une équipe créative dédiée à votre contenu vidéo." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "VizioCraft — Agence de montage vidéo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "VizioCraft — Votre équipe vidéo dédiée" },
      { name: "twitter:description", content: "Agence de montage vidéo premium. Reels, ads, podcasts, contenus sociaux." },
      { name: "twitter:image", content: "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png" },
    ],
    links: [
      { rel: "canonical", href: "https://viziocraft.com" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" },
      { rel: "preconnect", href: "https://cdn.prod.website-files.com" },
      { rel: "preload", as: "image", href: "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png", fetchPriority: "high" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WQLN2XWD');`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        <noscript dangerouslySetInnerHTML={{ __html: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WQLN2XWD" height="0" width="0" style="display:none;visibility:hidden"></iframe>' }} />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <CookieBannerLazy />
    </QueryClientProvider>
  );
}

import { CookieBanner as CookieBannerLazy } from "@/components/CookieBanner";
