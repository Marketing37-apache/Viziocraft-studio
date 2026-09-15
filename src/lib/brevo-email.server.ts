import { createServerFn } from "@tanstack/react-start";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// API Key Brevo depuis les variables d'environnement
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

type SendDevisPayload = {
  name: string;
  email: string;
  company?: string;
  message?: string;
  devisData: {
    formula: string;
    niveau: string;
    collaboration: string;
    videos: Array<{ type: string; qty: number; unitPrice: number; total: number }>;
    options: string[];
    totalVideos: number;
    subtotal: number;
    reduction: number;
    express: number;
    totalFinal: number;
  };
};

export const sendDevisEmails = createServerFn({ method: "POST" })
  .inputValidator((d: SendDevisPayload) => d)
  .handler(async ({ data }) => {
    const { name, email, company, message, devisData } = data;

    try {
      // ========================================
      // ÉTAPE 1: Ajouter le contact dans Brevo
      // ========================================
      await addContactToBrevo(name, email, company, devisData);

      // ========================================
      // ÉTAPE 2: Génération du PDF
      // ========================================
      const pdfBuffer = await generateDevisPDF(name, email, devisData);
      const pdfBase64 = pdfBuffer.toString("base64");

      // ========================================
      // ÉTAPE 3: EMAIL 1 → TOI (marketing@viziocraft.com)
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
      // ÉTAPE 4: EMAIL 2 → CLIENT (avec PDF joint)
      // ========================================
      const emailToClient = {
        sender: { name: "VizioCraft", email: "marketing@viziocraft.com" },
        to: [{ email: email, name: name || "" }],
        replyTo: { email: "marketing@viziocraft.com", name: "VizioCraft" },
        subject: `Votre devis personnalise VizioCraft`,
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
// AJOUTER CONTACT DANS BREVO (pour les relances)
// ========================================
async function addContactToBrevo(
  name: string, 
  email: string, 
  company?: string, 
  devisData?: any
): Promise<void> {
  try {
    // Préparer les attributs du contact
    const attributes: Record<string, any> = {
      FIRSTNAME: name.split(' ')[0] || name,
      LASTNAME: name.split(' ').slice(1).join(' ') || '',
    };

    // Ajouter l'entreprise si fournie
    if (company) {
      attributes.COMPANY = company;
    }

    // Ajouter des infos du devis si disponibles
    if (devisData) {
      attributes.LAST_QUOTE_AMOUNT = devisData.totalFinal;
      attributes.LAST_QUOTE_LEVEL = devisData.niveau;
      attributes.LAST_QUOTE_TYPE = devisData.formula;
      attributes.LAST_CONTACT_DATE = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    }

    const contactPayload = {
      email: email,
      attributes: attributes,
      listIds: [2], // ID de la liste "Prospects Devis" (à créer dans Brevo si besoin)
      updateEnabled: true, // Met à jour le contact s'il existe déjà
    };

    const response = await fetch(BREVO_CONTACTS_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactPayload),
    });

    // Même si ça fail (contact existant, etc.), on continue l'envoi d'email
    if (!response.ok) {
      const error = await response.text();
      console.warn(`Avertissement ajout contact Brevo: ${error}`);
      // On ne throw pas d'erreur, juste un warning
    } else {
      console.log(`Contact ${email} ajouté/mis à jour dans Brevo`);
    }
  } catch (error) {
    console.warn(`Erreur ajout contact Brevo:`, error);
    // On continue malgré l'erreur pour ne pas bloquer l'envoi d'email
  }
}

// ========================================
// GÉNÉRATION PDF DU DEVIS (création from scratch avec header stylé)
// ========================================
async function generateDevisPDF(name: string, email: string, devisData: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // Charger les polices
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Charger le logo VZ depuis le CDN
  const logoUrl = "https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png";
  const logoResponse = await fetch(logoUrl);
  const logoBytes = await logoResponse.arrayBuffer();
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.035);

  // Couleurs
  const purple = rgb(0.48, 0.18, 0.56); // #7b2d8e (VIZIO)
  const blue = rgb(0.17, 0.66, 0.89); // #2ba8e2 (CRAFT)
  const black = rgb(0.06, 0.06, 0.08);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const gray = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.6, 0.6, 0.6);

  const contentX = 50;
  const contentRight = width - 50;

  // ===== HEADER =====
  let y = height - 60;

  const vizioText = "VIZIO";
  const craftText = "CRAFT";
  const logoTextSize = 30;
  const vizioWidth = boldFont.widthOfTextAtSize(vizioText, logoTextSize);

  page.drawText(vizioText, { x: contentX, y, size: logoTextSize, font: boldFont, color: purple });
  page.drawText(craftText, { x: contentX + vizioWidth, y, size: logoTextSize, font: boldFont, color: blue });

  // Logo image à droite du header
  page.drawImage(logoImage, {
    x: contentRight - logoDims.width,
    y: y - 4,
    width: logoDims.width,
    height: logoDims.height,
  });

  y -= 20;
  page.drawText("Votre equipe video dediee", { x: contentX, y, size: 11, font: regularFont, color: darkGray });

  y -= 30;
  const dateStr = new Date().toLocaleDateString("fr-FR");
  page.drawText(`Date : ${dateStr}`, { x: contentX, y, size: 9, font: regularFont, color: gray });
  y -= 14;
  page.drawText("Contact : marketing@viziocraft.com", { x: contentX, y, size: 9, font: regularFont, color: gray });

  y -= 45;

  // ===== TITRE "DEVIS" centré =====
  const devisText = "DEVIS";
  const devisWidth = boldFont.widthOfTextAtSize(devisText, 22);
  page.drawText(devisText, { x: (width - devisWidth) / 2, y, size: 22, font: boldFont, color: black });

  y -= 50;

  // ===== CLIENT =====
  page.drawText("CLIENT", { x: contentX, y, size: 12, font: boldFont, color: black });
  page.drawLine({ start: { x: contentX, y: y - 4 }, end: { x: contentX + 80, y: y - 4 }, thickness: 1.5, color: black });

  y -= 24;
  page.drawText(`Nom : ${name}`, { x: contentX, y, size: 10, font: regularFont, color: darkGray });
  y -= 16;
  page.drawText(`Email : ${email}`, { x: contentX, y, size: 10, font: regularFont, color: darkGray });

  y -= 34;

  // ===== CONFIGURATION =====
  page.drawText("CONFIGURATION", { x: contentX, y, size: 12, font: boldFont, color: black });
  page.drawLine({ start: { x: contentX, y: y - 4 }, end: { x: contentX + 130, y: y - 4 }, thickness: 1.5, color: black });

  y -= 24;
  page.drawText(`Formule : ${devisData.formula}`, { x: contentX, y, size: 10, font: regularFont, color: darkGray });
  y -= 16;
  page.drawText(`Niveau de montage : ${devisData.niveau}`, { x: contentX, y, size: 10, font: regularFont, color: darkGray });
  y -= 16;
  page.drawText(`Collaboration : ${devisData.collaboration}`, { x: contentX, y, size: 10, font: regularFont, color: darkGray });

  y -= 34;

  // ===== DETAIL DES VIDEOS =====
  if (devisData.videos && devisData.videos.length > 0) {
    page.drawText("DETAIL DES VIDEOS", { x: contentX, y, size: 12, font: boldFont, color: black });
    page.drawLine({ start: { x: contentX, y: y - 4 }, end: { x: contentX + 170, y: y - 4 }, thickness: 1.5, color: black });

    y -= 28;

    const col1 = contentX;
    const col2 = 460;
    const col3 = 505;
    const col4 = 545;

    page.drawText("Format", { x: col1, y, size: 9, font: boldFont, color: black });
    page.drawText("Qte", { x: col2, y, size: 9, font: boldFont, color: black });
    page.drawText("Prix", { x: col3, y, size: 9, font: boldFont, color: black });
    page.drawText("Total", { x: col4, y, size: 9, font: boldFont, color: black });

    y -= 6;
    page.drawLine({ start: { x: col1, y }, end: { x: contentRight, y }, thickness: 1, color: black });

    y -= 18;

    for (const video of devisData.videos) {
      const formatText = video.type.length > 42 ? video.type.substring(0, 39) + "..." : video.type;

      page.drawText(formatText, { x: col1, y, size: 9.5, font: regularFont, color: black });
      page.drawText(String(video.qty), { x: col2, y, size: 9.5, font: regularFont, color: black });
      page.drawText(`${video.unitPrice}€`, { x: col3, y, size: 9.5, font: regularFont, color: black });
      page.drawText(`${video.total}€`, { x: col4, y, size: 9.5, font: regularFont, color: black });

      y -= 22;

      if (y < 180) break;
    }

    page.drawLine({ start: { x: col1, y: y + 8 }, end: { x: contentRight, y: y + 8 }, thickness: 0.5, color: lightGray });

    y -= 25;
  }

  // ===== OPTIONS =====
  if (devisData.options && devisData.options.length > 0 && y > 150) {
    const optionsLabel = "Options : ";
    const optionsText = devisData.options.join(", ");
    const maxWidth = 300;

    page.drawText(optionsLabel, { x: contentX, y, size: 9.5, font: regularFont, color: black });
    const labelWidth = regularFont.widthOfTextAtSize(optionsLabel, 9.5);

    // Découpe le texte des options sur plusieurs lignes si trop long
    const words = optionsText.split(", ");
    let line = "";
    let lineY = y;
    let first = true;
    for (const word of words) {
      const candidate = line ? `${line}, ${word}` : word;
      const w = regularFont.widthOfTextAtSize(candidate, 9.5);
      if (w > maxWidth && line) {
        page.drawText(line, { x: first ? contentX + labelWidth : contentX, y: lineY, size: 9.5, font: regularFont, color: black });
        lineY -= 15;
        line = word;
        first = false;
      } else {
        line = candidate;
      }
    }
    if (line) {
      page.drawText(line, { x: first ? contentX + labelWidth : contentX, y: lineY, size: 9.5, font: regularFont, color: black });
    }
    y = lineY - 30;
  }

  // ===== TOTAUX =====
  const totalsX = 380;
  const valuesX = 500;

  page.drawText("Sous-total :", { x: totalsX, y, size: 10, font: regularFont, color: gray });
  page.drawText(`${devisData.subtotal}€`, { x: valuesX, y, size: 10, font: regularFont, color: black });

  if (devisData.reduction > 0) {
    y -= 20;
    page.drawText("Reduction multishoot :", { x: totalsX, y, size: 10, font: regularFont, color: gray });
    page.drawText(`-${devisData.reduction}€`, { x: valuesX, y, size: 10, font: regularFont, color: black });
  }

  if (devisData.express > 0) {
    y -= 20;
    page.drawText("Supplement express :", { x: totalsX, y, size: 10, font: regularFont, color: gray });
    page.drawText(`+${devisData.express}€`, { x: valuesX, y, size: 10, font: regularFont, color: black });
  }

  y -= 16;
  page.drawLine({ start: { x: totalsX, y }, end: { x: contentRight, y }, thickness: 2, color: black });

  y -= 32;
  page.drawText("TOTAL :", { x: totalsX, y, size: 15, font: boldFont, color: black });
  page.drawText(`${devisData.totalFinal}€`, { x: valuesX - 8, y, size: 17, font: boldFont, color: black });

  // Footer
  y = 65;
  const noteText = "Ce devis est valable 30 jours. Les prix sont exprimes en euros TTC.";
  const noteWidth = regularFont.widthOfTextAtSize(noteText, 8);
  page.drawText(noteText, { x: (width - noteWidth) / 2, y, size: 8, font: regularFont, color: lightGray });

  y -= 14;
  const footerText = "VizioCraft — marketing@viziocraft.com — viziocraft.com";
  const footerWidth = regularFont.widthOfTextAtSize(footerText, 8);
  page.drawText(footerText, { x: (width - footerWidth) / 2, y, size: 8, font: regularFont, color: lightGray });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
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

  lines.push(`<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; color: #333; background: #ffffff; border: 1px solid #111111;">`);

  // Header — logo VizioCraft (fond blanc, pas de dégradé)
  lines.push(`<div style="padding: 20px 32px; text-align: left; border-bottom: 1px solid #e8e8e8;">`);
  lines.push(`<img src="https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png" alt="VizioCraft" width="24" height="24" style="display: block; margin-bottom: 8px;" />`);
  lines.push(`<h1 style="margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;"><span style="color: #7b2d8e;">VIZIO</span><span style="color: #2ba8e2;">CRAFT</span></h1>`);
  lines.push(`<p style="margin: 2px 0 0 0; color: #999999; font-size: 11px;">Nouvelle demande de devis</p>`);
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
  lines.push(`<p style="margin: 8px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">marketing@viziocraft.com</p>`);
  lines.push(`</div>`);

  lines.push(`</div>`);
  return lines.join("\n");
}

// ========================================
// FORMAT EMAIL CLIENT (simplifié et professionnel)
// ========================================
function buildClientEmailBody(name: string, devisData: any): string {
  const firstName = name?.split(" ")[0] || "";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre devis VizioCraft</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #ffffff;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table width="560" cellpadding="0" cellspacing="0" style="padding: 32px 8px;">

          <!-- Logo -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <img src="https://cdn.prod.website-files.com/6996b2b19f614702ad210f02/6996b52b771675ec516ec984_Asset%201%20(1).png" alt="VizioCraft" width="28" height="28" style="display: block;" />
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td>

              <p style="margin: 0 0 16px 0; font-size: 15px; color: #1d1d1f;">
                Bonjour${firstName ? ` ${firstName}` : ""},
              </p>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                Merci d'avoir utilisé notre simulateur de devis VizioCraft.
              </p>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                Vous trouverez en pièce jointe votre devis personnalisé.
              </p>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                Vous avez une question sur votre devis ou souhaitez aller plus loin ?<br>
                📅 <a href="https://viziocraft.com/#contact" style="color: #7b2d8e; font-weight: 600; text-decoration: underline;">Prendre rendez-vous</a>
              </p>

              <p style="margin: 24px 0 0 0; font-size: 15px; line-height: 1.6; color: #333333;">
                À bientôt,<br>
                L'équipe VizioCraft 🎬
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0 0;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                VizioCraft · <a href="mailto:marketing@viziocraft.com" style="color: #999999; text-decoration: none;">marketing@viziocraft.com</a>
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
