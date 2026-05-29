import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/cookies")({
  component: Page,
  head: () => ({ meta: [{ title: "Cookies | VizioCraft" }] }),
});

function Page() {
  return (
    <main>
      <Nav />
      <LegalPage title="Politique de cookies" updated="Mars 2026">
        <h2>Cookies utilisés sur le site</h2>
        <p>
          Le site VizioCraft n'utilise aucun cookie de mesure d'audience, ni de cookie publicitaire,
          ni de cookie de profilage.
        </p>

        <h2>Cookies tiers (vidéos intégrées)</h2>
        <p>
          Lorsque vous lisez une vidéo embarquée depuis YouTube ou Google Drive, ces services peuvent
          déposer leurs propres cookies sur votre navigateur. Vous pouvez consulter leurs politiques
          respectives pour plus d'informations.
        </p>

        <h2>Gestion des cookies</h2>
        <p>
          Vous pouvez à tout moment configurer votre navigateur pour bloquer ou supprimer les cookies déjà
          présents (Chrome, Safari, Firefox, Edge proposent tous des paramètres dédiés).
        </p>
      </LegalPage>
      <Footer />
    </main>
  );
}
