import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/politique-confidentialite")({
  component: Page,
  head: () => ({ meta: [{ title: "Politique de confidentialité | VizioCraft" }] }),
});

function Page() {
  return (
    <main>
      <Nav />
      <LegalPage title="Politique de confidentialité" updated="Mars 2026">
        <h2>Collecte des données</h2>
        <p>
          VizioCraft collecte uniquement les données strictement nécessaires au traitement de votre demande
          via le formulaire de contact : nom, adresse email, et contenu du message.
        </p>

        <h2>Finalité</h2>
        <p>
          Ces informations sont utilisées exclusivement pour répondre à votre demande, préparer un appel commercial,
          et organiser une éventuelle collaboration. Elles ne sont jamais revendues ni partagées avec des tiers
          à des fins marketing.
        </p>

        <h2>Conservation</h2>
        <p>
          Les données issues du formulaire sont conservées le temps nécessaire au traitement de votre demande,
          puis archivées pendant une durée maximale de 3 ans à des fins de prospection commerciale,
          conformément aux recommandations de la CNIL.
        </p>

        <h2>Sous-traitants</h2>
        <p>
          Le formulaire de contact est traité par Formspree (services d'envoi d'email), conforme au RGPD.
          Les vidéos intégrées au site proviennent de YouTube et Google Drive, susceptibles d'installer
          leurs propres cookies — voir leurs politiques respectives.
        </p>

        <h2>Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'opposition et de
          suppression de vos données. Pour exercer ces droits, contactez-nous via le formulaire du site.
        </p>
      </LegalPage>
      <Footer />
    </main>
  );
}
