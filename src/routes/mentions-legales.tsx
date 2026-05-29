import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/mentions-legales")({
  component: Page,
  head: () => ({ meta: [{ title: "Mentions légales | VizioCraft" }] }),
});

function Page() {
  return (
    <main>
      <Nav />
      <LegalPage title="Mentions légales" updated="Mars 2026">
        <h2>Éditeur du site</h2>
        <p>
          Le site <strong>VizioCraft</strong> est édité par VizioCraft, agence de montage vidéo
          basée à Antananarivo, Madagascar.
        </p>
        <p>
          Co-fondateurs : Charles Boucher, Alexandre Boucher.<br />
          Email de contact : via le formulaire disponible sur la page Contact.
        </p>

        <h2>Hébergement</h2>
        <p>Ce site est hébergé sur une infrastructure edge serverless (Cloudflare Workers).</p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur ce site (textes, images, vidéos, logos, charte graphique)
          est la propriété exclusive de VizioCraft, sauf mention contraire. Toute reproduction,
          représentation, modification ou diffusion, totale ou partielle, est interdite sans accord écrit préalable.
        </p>

        <h2>Responsabilité</h2>
        <p>
          VizioCraft s'efforce d'assurer l'exactitude des informations publiées sur ce site mais ne
          saurait être tenue responsable d'éventuelles erreurs, omissions ou indisponibilités du service.
        </p>

        <h2>Contact</h2>
        <p>Pour toute demande relative aux présentes mentions, utilisez le formulaire de contact du site.</p>

        <p className="text-xs italic">
          Ce document est une trame standard — à compléter par l'éditeur avec ses informations légales définitives
          (RCS, numéro de TVA, adresse postale, directeur de la publication).
        </p>
      </LegalPage>
      <Footer />
    </main>
  );
}
