import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/cgv")({
  component: Page,
  head: () => ({ meta: [{ title: "CGV | VizioCraft" }] }),
});

function Page() {
  return (
    <main>
      <Nav />
      <LegalPage title="Conditions Générales de Vente" updated="Mars 2026">
        <h2>1. Objet</h2>
        <p>
          Les présentes CGV régissent les prestations de montage vidéo, motion design et production audiovisuelle
          fournies par VizioCraft à ses clients professionnels.
        </p>

        <h2>2. Devis & commande</h2>
        <p>
          Tout devis est valable 30 jours. La commande devient ferme à la réception du devis signé
          et de l'acompte (généralement 30 %).
        </p>

        <h2>3. Délais</h2>
        <p>
          Les délais indiqués sont donnés à titre indicatif et dépendent de la fourniture des rushs et des validations
          du client. VizioCraft s'engage à un délai standard de 72h en offre ponctuelle, et à un flux continu pour les
          abonnements mensuels.
        </p>

        <h2>4. Tarifs & paiement</h2>
        <p>
          Les tarifs sont indiqués hors taxes. Le solde est dû à la livraison des fichiers finaux,
          sauf condition particulière mentionnée au devis.
        </p>

        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le client devient propriétaire des fichiers livrés après paiement intégral. VizioCraft conserve
          le droit d'utiliser les projets dans son portfolio sauf mention contraire écrite.
        </p>

        <h2>6. Litiges</h2>
        <p>
          Tout litige sera soumis à une tentative de résolution amiable préalable. À défaut, les tribunaux
          compétents seront ceux du siège de VizioCraft.
        </p>

        <p className="text-xs italic">Trame standard — à finaliser avec un juriste selon votre juridiction définitive.</p>
      </LegalPage>
      <Footer />
    </main>
  );
}
