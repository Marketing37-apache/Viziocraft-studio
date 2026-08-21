import { createServerFn } from "@tanstack/react-start";
import PDFDocument from "pdfkit";

// API Key Brevo depuis les variables d'environnement
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

type SendDevisPayload = {
  name: string;
  email: string;
  company?: string;
  message?: string;
  devisData: {
    formula: string;
    niveau: string;
    collaboration: string;
    delivery: string;
    videos: Array<{ type: string; qty: number; price: number }>;
    options: string[];
    totalVideos: number;
    subtotal: number;
    reduction: number;
    express: number;
    totalFinal: number;
  };
};

export const sendDevisEmails = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: SendDevisPayload }) => {
    const { name, email, company, message, devisData } = data;

    try {
      // Génération du PDF
      const pdfBuffer = await generateDevisPDF(name, email, devisData);
      const pdfBase64 = pdfBuffer.toString("base64");

      // ========================================
      // EMAIL 1 → TOI (marketing@viziocraft.com)
      // ========================================
      const emailToYou = {
        sender: { name: "VizioCraft Devis", email: "marketing@viziocraft.com" },
        to: [{ email: "marketing@viziocraft.com", name: "Marketing VizioCraft" }],
        replyTo: { email: email, name: name || "" },
        subject: `Nouveau devis — ${name || "Prospect"} — ${devisData.totalFinal}€`,
        htmlContent: buildInternalEmailBody(name, email, company || "", message || "", devisData),
      };

      const res1 = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailToYou),
      });

      if (!res1.ok) {
        const error = await res1.text();
        throw new Error(`Brevo API error (email 1): ${error}`);
      }

      // ========================================
      // EMAIL 2 → CLIENT (avec PDF joint)
      // ========================================
      const emailToClient = {
        sender: { name: "VizioCraft", email: "marketing@viziocraft.com" },
        to: [{ email: email, name: name || "" }],
        replyTo: { email: "marketing@viziocraft.com", name: "VizioCraft" },
        subject: `Votre devis VizioCraft — ${devisData.totalFinal}€`,
        htmlContent: buildClientEmailBody(name, devisData),
        attachment: [
          {
            name: `Devis_VizioCraft_${name.replace(/\s+/g, "_")}.pdf`,
            content: pdfBase64,
          },
        ],
      };

      const res2 = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailToClient),
      });

      if (!res2.ok) {
        const error = await res2.text();
        throw new Error(`Brevo API error (email 2): ${error}`);
      }

      return { success: true, message: "Emails envoyés avec succès" };
    } catch (error: any) {
      console.error("Erreur Brevo:", error);
      throw new Error(`Échec de l'envoi d'email: ${error.message}`);
    }
  }
);

// ========================================
// GÉNÉRATION PDF DU DEVIS
// ========================================
async function generateDevisPDF(name: string, email: string, devisData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header avec logo et infos
    doc.fontSize(24).fillColor("#7b2d8e").text("VizioCraft", { align: "left" });
    doc.fontSize(10).fillColor("#666").text("Votre équipe vidéo dédiée", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#999").text(`Date : ${new Date().toLocaleDateString("fr-FR")}`);
    doc.text(`Contact : contact@viziocraft.com`);
    doc.moveDown(2);

    // Titre
    doc.fontSize(18).fillColor("#1d1d1f").text("DEVIS", { align: "center" });
    doc.moveDown(1);

    // Informations client
    doc.fontSize(11).fillColor("#7b2d8e").text("CLIENT", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#333").text(`Nom : ${name}`);
    doc.text(`Email : ${email}`);
    doc.moveDown(1.5);

    // Configuration
    doc.fontSize(11).fillColor("#7b2d8e").text("CONFIGURATION", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#333");
    doc.text(`Formule : ${devisData.formula}`);
    doc.text(`Niveau de montage : ${devisData.niveau}`);
    doc.text(`Collaboration : ${devisData.collaboration}`);
    doc.text(`Délai de livraison : ${devisData.delivery}`);
    doc.moveDown(1.5);

    // Tableau des vidéos
    if (devisData.videos && devisData.videos.length > 0) {
      doc.fontSize(11).fillColor("#7b2d8e").text("DÉTAIL DES VIDÉOS", { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 320;
      const col3 = 400;
      const col4 = 480;

      // Header tableau
      doc.fontSize(9).fillColor("#7b2d8e");
      doc.text("Format", col1, tableTop);
      doc.text("Qté", col2, tableTop);
      doc.text("Prix/u", col3, tableTop);
      doc.text("Total", col4, tableTop);

      doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke("#7b2d8e");

      let yPos = tableTop + 25;
      doc.fontSize(9).fillColor("#333");

      devisData.videos.forEach((v: any) => {
        doc.text(v.type, col1, yPos, { width: 260 });
        doc.text(String(v.qty), col2, yPos);
        doc.text(`${v.unitPrice}€`, col3, yPos);
        doc.text(`${v.total}€`, col4, yPos);
        yPos += 20;
      });

      doc.moveTo(col1, yPos).lineTo(550, yPos).stroke("#ddd");
      doc.moveDown(2);
    }

    // Options
    if (devisData.options && devisData.options.length > 0) {
      doc.fontSize(10).fillColor("#666");
      doc.text(`Options : ${devisData.options.join(", ")}`);
      doc.moveDown(1);
    }

    // Totaux
    doc.moveDown(1);
    const totalsX = 350;
    doc.fontSize(10).fillColor("#666");
    doc.text("Sous-total :", totalsX, doc.y);
    doc.text(`${devisData.subtotal}€`, 480, doc.y, { align: "right" });
    doc.moveDown(0.5);

    if (devisData.reduction > 0) {
      doc.text("Réduction multishoot :", totalsX, doc.y);
      doc.text(`-${devisData.reduction}€`, 480, doc.y, { align: "right" });
      doc.moveDown(0.5);
    }

    if (devisData.express > 0) {
      doc.text("Supplément express :", totalsX, doc.y);
      doc.text(`+${devisData.express}€`, 480, doc.y, { align: "right" });
      doc.moveDown(0.5);
    }

    doc.moveTo(totalsX, doc.y + 5).lineTo(550, doc.y + 5).stroke("#7b2d8e");
    doc.moveDown(0.8);

    doc.fontSize(14).fillColor("#7b2d8e").font("Helvetica-Bold");
    doc.text("TOTAL :", totalsX, doc.y);
    doc.text(`${devisData.totalFinal}€`, 480, doc.y, { align: "right" });

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#999").font("Helvetica");
    doc.text("Ce devis est valable 30 jours. Les prix sont exprimés en euros TTC.");
    doc.text("VizioCraft — contact@viziocraft.com — viziocraft.com", { align: "center" });

    doc.end();
  });
}

// ========================================
// FORMAT EMAIL INTERNE (pour toi) — VERSION PRO
// ========================================
function buildInternalEmailBody(
  name: string,
  email: string,
  company: string,
  message: string,
  devisData: any
): string {
  const lines: string[] = [];

  lines.push(`<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; color: #333; background: #ffffff;">`);
  
  // Header
  lines.push(`<div style="background: linear-gradient(135deg, #7b2d8e 0%, #2ba8e2 100%); padding: 32px; text-align: center;">`);
  lines.push(`<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">VIZIOCRAFT</h1>`);
  lines.push(`<p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">Nouvelle demande de devis</p>`);
  lines.push(`</div>`);

  // Infos contact
  lines.push(`<div style="padding: 32px; border-bottom: 1px solid #e8e8e8;">`);
  lines.push(`<h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #7b2d8e; text-transform: uppercase; letter-spacing: 0.5px;">Informations client</h2>`);
  lines.push(`<table style="width: 100%; border-collapse: collapse;">`);
  lines.push(`<tr><td style="padding: 8px 0; color: #666; width: 120px; font-size: 14px;">Nom</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${name || "Non renseigné"}</td></tr>`);
  lines.push(`<tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2ba8e2; text-decoration: none; font-size: 14px;">${email}</a></td></tr>`);
  if (company) lines.push(`<tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Entreprise</td><td style="padding: 8px 0; font-size: 14px;">${company}</td></tr>`);
  lines.push(`</table>`);
  if (message) {
    lines.push(`<div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-left: 3px solid #7b2d8e; border-radius: 4px;">`);
    lines.push(`<p style="margin: 0; font-size: 13px; color: #666; font-weight: 600;">Message du client</p>`);
    lines.push(`<p style="margin: 8px 0 0 0; font-size: 14px; color: #333; line-height: 1.6;">${message.replace(/\n/g, "<br/>")}</p>`);
    lines.push(`</div>`);
  }
  lines.push(`</div>`);

  if (devisData) {
    // Configuration
    lines.push(`<div style="padding: 32px; border-bottom: 1px solid #e8e8e8;">`);
    lines.push(`<h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #7b2d8e; text-transform: uppercase; letter-spacing: 0.5px;">Configuration du projet</h2>`);
    lines.push(`<table style="width: 100%; border-collapse: collapse;">`);
    lines.push(`<tr><td style="padding: 8px 0; color: #666; width: 180px; font-size: 14px;">Formule</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${devisData.formula}</td></tr>`);
    lines.push(`<tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Niveau de montage</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${devisData.niveau}</td></tr>`);
    lines.push(`<tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Collaboration</td><td style="padding: 8px 0; font-size: 14px;">${devisData.collaboration}</td></tr>`);
    lines.push(`<tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Délai</td><td style="padding: 8px 0; font-size: 14px;">${devisData.delivery}</td></tr>`);
    lines.push(`</table>`);
    lines.push(`</div>`);

    // Vidéos
    if (devisData.videos && devisData.videos.length > 0) {
      lines.push(`<div style="padding: 32px; border-bottom: 1px solid #e8e8e8;">`);
      lines.push(`<h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #7b2d8e; text-transform: uppercase; letter-spacing: 0.5px;">Détail des vidéos</h2>`);
      lines.push(`<table style="width: 100%; border-collapse: collapse;">`);
      lines.push(`<thead><tr style="border-bottom: 2px solid #7b2d8e;">`);
      lines.push(`<th style="text-align: left; padding: 12px 8px; color: #7b2d8e; font-size: 13px; font-weight: 700; text-transform: uppercase;">Format</th>`);
      lines.push(`<th style="text-align: center; padding: 12px 8px; color: #7b2d8e; font-size: 13px; font-weight: 700; text-transform: uppercase;">Qté</th>`);
      lines.push(`<th style="text-align: right; padding: 12px 8px; color: #7b2d8e; font-size: 13px; font-weight: 700; text-transform: uppercase;">Prix/u</th>`);
      lines.push(`<th style="text-align: right; padding: 12px 8px; color: #7b2d8e; font-size: 13px; font-weight: 700; text-transform: uppercase;">Total</th>`);
      lines.push(`</tr></thead><tbody>`);
      
      devisData.videos.forEach((v: any, idx: number) => {
        const bgColor = idx % 2 === 0 ? "#fafafa" : "#ffffff";
        lines.push(`<tr style="background: ${bgColor};">`);
        lines.push(`<td style="padding: 12px 8px; font-size: 14px; color: #333;">${v.type}</td>`);
        lines.push(`<td style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 14px; color: #333;">${v.qty}</td>`);
        lines.push(`<td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #666;">${v.unitPrice}€</td>`);
        lines.push(`<td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 14px; color: #7b2d8e;">${v.total}€</td>`);
        lines.push(`</tr>`);
      });
      lines.push(`</tbody></table>`);
      lines.push(`</div>`);
    }

    // Options
    if (devisData.options && devisData.options.length > 0) {
      lines.push(`<div style="padding: 24px 32px; background: #f9f9f9; border-left: 4px solid #2ba8e2;">`);
      lines.push(`<p style="margin: 0; font-size: 13px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Options sélectionnées</p>`);
      lines.push(`<p style="margin: 8px 0 0 0; font-size: 14px; color: #333;">${devisData.options.join(" • ")}</p>`);
      lines.push(`</div>`);
    }

    // Totaux
    lines.push(`<div style="padding: 32px; background: #fafafa;">`);
    lines.push(`<table style="width: 100%; max-width: 350px; margin-left: auto;">`);
    lines.push(`<tr><td style="padding: 8px 0; font-size: 14px; color: #666;">Sous-total</td><td style="padding: 8px 0; text-align: right; font-size: 14px; color: #333;">${devisData.subtotal}€</td></tr>`);
    if (devisData.reduction > 0) {
      lines.push(`<tr><td style="padding: 8px 0; font-size: 14px; color: #666;">Réduction multishoot</td><td style="padding: 8px 0; text-align: right; font-size: 14px; color: #27ae60;">-${devisData.reduction}€</td></tr>`);
    }
    if (devisData.express > 0) {
      lines.push(`<tr><td style="padding: 8px 0; font-size: 14px; color: #666;">Supplément express</td><td style="padding: 8px 0; text-align: right; font-size: 14px; color: #e67e22;">+${devisData.express}€</td></tr>`);
    }
    lines.push(`<tr style="border-top: 2px solid #7b2d8e;"><td style="padding: 16px 0 0 0; font-size: 18px; font-weight: 700; color: #7b2d8e;">TOTAL</td><td style="padding: 16px 0 0 0; text-align: right; font-size: 24px; font-weight: 800; color: #7b2d8e;">${devisData.totalFinal}€</td></tr>`);
    lines.push(`</table>`);
    lines.push(`</div>`);
  }

  // Footer
  lines.push(`<div style="padding: 24px 32px; text-align: center; background: #1a0b2e; color: #ffffff;">`);
  lines.push(`<p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7);">VizioCraft — Votre équipe vidéo dédiée</p>`);
  lines.push(`<p style="margin: 8px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">contact@viziocraft.com</p>`);
  lines.push(`</div>`);

  lines.push(`</div>`);
  return lines.join("\n");
}

// ========================================
// FORMAT EMAIL CLIENT (ultra-professionnel, sans emojis)
// ========================================
function buildClientEmailBody(name: string, devisData: any): string {
  const firstName = name?.split(" ")[0] || "Madame, Monsieur";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre devis VizioCraft</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f5f5f5;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Card principale -->
        <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7b2d8e 0%, #2ba8e2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">VIZIOCRAFT</h1>
              <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">Votre équipe vidéo dédiée</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1d1d1f;">
                ${firstName},
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.7; color: #555;">
                Nous vous remercions pour votre demande de devis. Vous trouverez ci-joint le document détaillé de votre estimation personnalisée, calculée sur la base de votre configuration.
              </p>

              <!-- Résumé rapide -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fafafa; border: 1px solid #e8e8e8; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #7b2d8e;">Résumé de votre projet</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">Formule</td>
                        <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #333; text-align: right;">${devisData?.formula || "—"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">Niveau</td>
                        <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #333; text-align: right;">${devisData?.niveau || "—"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">Vidéos</td>
                        <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #333; text-align: right;">${devisData?.totalVideos || 0} format${(devisData?.totalVideos || 0) > 1 ? "s" : ""}</td>
                      </tr>
                    </table>

                    <div style="margin: 20px 0 0 0; padding-top: 20px; border-top: 2px solid #7b2d8e;">
                      <table width="100%">
                        <tr>
                          <td style="font-size: 16px; font-weight: 700; color: #7b2d8e;">MONTANT ESTIMÉ</td>
                          <td style="font-size: 32px; font-weight: 800; color: #7b2d8e; text-align: right;">${devisData?.totalFinal || 0}€</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0; font-size: 14px; line-height: 1.7; color: #555;">
                Ce devis est une estimation basée sur votre configuration. Il peut être ajusté selon les spécificités détaillées de votre projet et reste valable 30 jours.
              </p>

              <div style="background: #f9f9f9; border-left: 4px solid #2ba8e2; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #2ba8e2;">Prochaine étape</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #555;">
                  Nous vous proposons de planifier un échange téléphonique de 15 minutes pour affiner votre projet, répondre à vos questions et confirmer les modalités de collaboration.
                </p>
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://viziocraft.com/#contact" style="display: inline-block; background: linear-gradient(135deg, #7b2d8e 0%, #2ba8e2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 4px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
                      Planifier un échange
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #888; text-align: center;">
                Vous pouvez également répondre directement à cet email. Nous reviendrons vers vous sous 24 heures ouvrées.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #1a0b2e; padding: 32px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #ffffff;">VizioCraft</p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: rgba(255,255,255,0.7);">Votre équipe vidéo dédiée</p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.6);">
                <a href="mailto:contact@viziocraft.com" style="color: rgba(255,255,255,0.8); text-decoration: none;">contact@viziocraft.com</a> · 
                <a href="https://viziocraft.com" style="color: rgba(255,255,255,0.8); text-decoration: none;">viziocraft.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
