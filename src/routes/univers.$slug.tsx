import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const CDN = "https://cdn.prod.website-files.com/6996b2b29f614702ad210f72";

type Block = { h: string; p: string };
type Tile = { src: string; alt: string; tall?: boolean; wide?: boolean };
type Stat = { k: string; v: string };
type Quote = { q: string; a: string };

type Univers = {
  slug: string;
  eyebrow: string;
  title: string;
  highlight: string;
  baseline: string;
  hero: string;
  introTitle: string;
  intro: string;
  manifesto: string[];          // 3 short pillars
  blocks: Block[];               // 3-4 narrative blocks
  gallery: Tile[];               // 6-8 tiles (gif/images)
  stats: Stat[];                 // 3 numbers
  process: { n: string; t: string; p: string }[]; // 4-5 steps
  tools: string[];               // chips
  deliverables: string[];        // bullet list
  quote: Quote;
  // Per-universe visual theme
  theme: {
    pageBg: string;             // bg of page
    pageInk: string;            // base text class
    accent: string;             // accent text (used by helpers)
    accentBg: string;           // accent surface
    chipBg: string;
    chipText: string;
    cardBg: string;
    cardBorder: string;
    softBg: string;             // soft band background
    button: string;             // primary CTA classes
    quoteBg: string;
    eyebrowColor: string;
    decorative: string;         // descriptor for decorative shapes
  };
};

/* ——————————————————————————— DATA ——————————————————————————— */

const UNIVERS: Record<string, Univers> = {
  "publicites-video": {
    slug: "publicites-video",
    eyebrow: "Univers · Publicités vidéo",
    title: "Des ads qui ne se zappent pas. ",
    highlight: "Performance × esthétique.",
    baseline:
      "Hook chirurgical, rythme serré, variantes prêtes pour Meta, TikTok, YouTube. La pub vidéo qui aligne la créa sur le ROI.",
    hero: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`,
    introTitle: "L'attention coûte cher. Nous la rentabilisons.",
    intro:
      "Sur les feeds, vous avez 1.7 seconde pour exister. Au-delà, votre CPM s'envole. Notre travail commence là — un hook qui interrompt, une promesse qui retient, un call-to-action qui convertit. Tout le reste est secondaire.",
    manifesto: [
      "Le brief commence par l'objectif business, pas par la créa.",
      "On livre 3 variantes par ad. Vous testez, on itère sur la gagnante.",
      "Le motion sert le message, jamais l'inverse.",
    ],
    blocks: [
      {
        h: "Hook craft",
        p: "Pattern interrupt, question forte, claim contre-intuitif. Nos hooks sont travaillés en amont avec vos analytics — ce qui scrolle, ce qui retient, ce qui convertit chez VOTRE audience.",
      },
      {
        h: "Variantes A/B natives",
        p: "Une ad, trois hooks, trois fins. Vous lancez en parallèle sur Ads Manager, vous identifiez le winner en 48h. On itère sur la variante gagnante jusqu'au seuil de rentabilité.",
      },
      {
        h: "Multi-format en un seul brief",
        p: "9:16 Reels, 1:1 feed, 16:9 YouTube, vertical TikTok — un seul devis, tous les ratios livrés. Plus de double frais, plus de désynchronisation entre plateformes.",
      },
      {
        h: "Sound design qui conclut",
        p: "Une bonne pub se finit dans la tête du viewer. Stinger sonore, voix-off mixée à la perfection, silences calculés. Le son fait 50% de la conversion.",
      },
    ],
    gallery: [
      { src: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`, alt: "Ad campagne 1", wide: true },
      { src: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`, alt: "Ad 2" },
      { src: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`, alt: "Ad 3" },
      { src: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`, alt: "Ad 4", tall: true },
      { src: `${CDN}/699ab9aed3c37eb93d81731b_image20.jpeg`, alt: "Ad 5" },
      { src: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`, alt: "Ad 6", wide: true },
    ],
    stats: [
      { k: "×3.1", v: "CTR moyen vs. baseline client" },
      { k: "48h", v: "Délai de livraison d'un set de variantes" },
      { k: "−42%", v: "CPA observé après itération" },
    ],
    process: [
      { n: "01", t: "Audit funnel", p: "On lit vos chiffres avant de toucher à un calque. Quel est le drop, où, pourquoi." },
      { n: "02", t: "Hook lab", p: "5 hooks scriptés, 2 sélectionnés, tournage / montage immédiat." },
      { n: "03", t: "Première salve", p: "3 variantes livrées, déployées sur petit budget de test." },
      { n: "04", t: "Itération data-driven", p: "On garde la winner, on déstructure ce qui marche, on reconstruit la suite." },
    ],
    tools: ["Meta Ads", "TikTok Ads", "YouTube Ads", "After Effects", "Premiere Pro", "DaVinci"],
    deliverables: [
      "Master 4K + exports 9:16 / 1:1 / 16:9",
      "3 hooks alternatifs par ad",
      "Sous-titres SRT + burned-in",
      "Bumper logo + outro CTA",
      "Pack thumbnails statiques pour A/B test",
    ],
    quote: {
      q: "On a coupé deux agences pour ne garder que VizioCraft. La fluidité est dingue, et le ROAS suit.",
      a: "— Direction acquisition, marque SaaS B2B",
    },
    theme: {
      pageBg: "bg-[#0b0f1a]",
      pageInk: "text-white",
      accent: "text-[#ff5e3a]",
      accentBg: "bg-[#ff5e3a]",
      chipBg: "bg-[#ff5e3a]/15",
      chipText: "text-[#ff8a73]",
      cardBg: "bg-white/[0.04]",
      cardBorder: "border-white/10",
      softBg: "bg-white/[0.02]",
      button: "bg-[#ff5e3a] text-white hover:bg-[#ff7355]",
      quoteBg: "bg-gradient-to-br from-[#ff5e3a]/20 to-transparent",
      eyebrowColor: "text-[#ff8a73]",
      decorative: "orange-glow",
    },
  },

  "podcast-video": {
    slug: "podcast-video",
    eyebrow: "Univers · Podcast vidéo",
    title: "Une conversation devient ",
    highlight: "un univers visuel.",
    baseline:
      "Multi-cam synchro, étalonnage cohérent, clips courts dérivés. Le podcast vidéo qui transforme chaque épisode en machine à contenu.",
    hero: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`,
    introTitle: "Un épisode = un long, dix shorts, trois carrousels.",
    intro:
      "Vous tournez 90 minutes. La plupart en sortent une vidéo. Nous en sortons une saison de contenu. Long format YouTube, shorts viraux, snippets LinkedIn, visuels Instagram — tout vit du même tournage.",
    manifesto: [
      "Le multi-cam, c'est la liberté. Plus jamais coincé sur un seul plan.",
      "Chaque clip court a une mini-narration : début, twist, punchline.",
      "L'identité visuelle reste constante d'un épisode à l'autre.",
    ],
    blocks: [
      {
        h: "Sync multi-cam à la milliseconde",
        p: "Deux, trois, quatre caméras + micros lavalier dédiés. Synchro audio à la frame, étalonnage homogène, gestion des hots-mics. Vous fournissez le tournage, on fournit une émission.",
      },
      {
        h: "Clips viraux extraits",
        p: "8 à 15 shorts par épisode, identifiés sur les pics d'attention. Hook restructuré, contexte minimum, fin punchy. Spécifiquement coupés pour TikTok, Reels, YouTube Shorts.",
      },
      {
        h: "Chapitrage SEO",
        p: "Chapitres YouTube optimisés sémantiquement pour booster la visibilité et l'écoute. Description SEO friendly, tags, miniatures A/B.",
      },
      {
        h: "Habillage signature",
        p: "Lower-thirds, transitions de chapitres, motion typography sur les phrases fortes. Une identité reconnaissable épisode après épisode.",
      },
    ],
    gallery: [
      { src: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`, alt: "Podcast 1", wide: true },
      { src: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`, alt: "Podcast 2" },
      { src: `${CDN}/699ab9aed3c37eb93d81731b_image20.jpeg`, alt: "Podcast 3", tall: true },
      { src: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`, alt: "Podcast 4" },
      { src: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`, alt: "Podcast 5" },
      { src: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`, alt: "Podcast 6", wide: true },
    ],
    stats: [
      { k: "4 cams", v: "Synchro audio/vidéo native" },
      { k: "10+", v: "Shorts extraits par épisode" },
      { k: "72h", v: "Délai de livraison standard" },
    ],
    process: [
      { n: "01", t: "Brief éditorial", p: "Pitch épisode, axes forts, moments à valoriser dans les shorts." },
      { n: "02", t: "Réception & sync", p: "Upload rushes, on synchronise le multi-cam, on cale les niveaux." },
      { n: "03", t: "Long format", p: "Cut narratif, b-rolls, lower-thirds, étalonnage, mixage." },
      { n: "04", t: "Shorts dérivés", p: "On isole les pépites, on les reformate verticalement avec hook." },
      { n: "05", t: "Pack publication", p: "Long + shorts + descriptions + tags + thumbs prêtes à publier." },
    ],
    tools: ["Premiere Pro", "DaVinci Resolve", "PluralEyes", "Auphonic", "After Effects"],
    deliverables: [
      "Long format master en 4K",
      "10–15 shorts verticaux",
      "Pack thumbnails (3 variantes)",
      "Description + chapitres + tags SEO",
      "Audio podcast nettoyé (mp3 + wav)",
    ],
    quote: {
      q: "Le ratio temps de tournage / contenu publié a triplé. Mon podcast est devenu un système.",
      a: "— Animateur d'un podcast B2B, 25k abonnés YouTube",
    },
    theme: {
      pageBg: "bg-[#fdfaf3]",
      pageInk: "text-[#1a1410]",
      accent: "text-[#a8632d]",
      accentBg: "bg-[#a8632d]",
      chipBg: "bg-[#a8632d]/12",
      chipText: "text-[#a8632d]",
      cardBg: "bg-white",
      cardBorder: "border-[#1a1410]/10",
      softBg: "bg-[#f5ede0]",
      button: "bg-[#1a1410] text-[#fdfaf3] hover:bg-[#2a221c]",
      quoteBg: "bg-[#f5ede0]",
      eyebrowColor: "text-[#a8632d]",
      decorative: "warm",
    },
  },

  "corporate-evenementiel": {
    slug: "corporate-evenementiel",
    eyebrow: "Univers · Corporate & Événementiel",
    title: "L'image que votre marque ",
    highlight: "mérite vraiment.",
    baseline:
      "Films institutionnels, témoignages clients, aftermovies. Une production qui parle aux décideurs sans jamais ennuyer.",
    hero: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`,
    introTitle: "Le corporate n'est pas synonyme d'ennui.",
    intro:
      "Trop d'agences confondent « sérieux » et « plat ». Nous croyons l'inverse : un film d'entreprise réussi raconte une vraie histoire, met en valeur de vrais visages, et donne envie d'en savoir plus. Pas une slide animée de plus.",
    manifesto: [
      "Une caméra qui sait quand se taire. Une voix-off qui sait quand parler.",
      "L'étalonnage est un acte stratégique, pas une étape technique.",
      "Le sound design fait passer un message corporate de tiède à mémorable.",
    ],
    blocks: [
      {
        h: "Films institutionnels",
        p: "Court (90s) ou long (5-8min), nous structurons un récit qui aligne mission, valeurs et différenciation. On évite les clichés visuels et les slogans creux. On vise l'émotion utile.",
      },
      {
        h: "Témoignages clients",
        p: "Une interview bien menée vaut dix études de cas écrites. Préparation des questions, direction du témoignant, montage qui garde l'authenticité tout en virant les hésitations.",
      },
      {
        h: "Aftermovies & événements",
        p: "Un événement bien filmé est un actif marketing pour 12 mois. Energy cut, recap stratégique 90s, version longue 4-6min, plus des shorts immédiats pour le j+1.",
      },
      {
        h: "Direction artistique signature",
        p: "Charte vidéo posée dès le premier projet : LUT signature, typographie, transitions, sound design. Cohérence garantie sur l'ensemble de votre production corporate.",
      },
    ],
    gallery: [
      { src: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`, alt: "Corporate 1", wide: true },
      { src: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`, alt: "Corporate 2", tall: true },
      { src: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`, alt: "Corporate 3" },
      { src: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`, alt: "Corporate 4" },
      { src: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`, alt: "Corporate 5" },
      { src: `${CDN}/699ab9aed3c37eb93d81731b_image20.jpeg`, alt: "Corporate 6", wide: true },
    ],
    stats: [
      { k: "+35", v: "Marques accompagnées" },
      { k: "8 min", v: "Format institutionnel typique" },
      { k: "12 mois", v: "Durée de vie marketing moyenne" },
    ],
    process: [
      { n: "01", t: "Discovery stratégique", p: "Qui parle, à qui, pourquoi maintenant. Avant tout choix créatif." },
      { n: "02", t: "Pré-production", p: "Storyboard, casting des prises de parole, repérage." },
      { n: "03", t: "Tournage encadré", p: "Plan de tournage millimétré, plusieurs angles, prise son pro." },
      { n: "04", t: "Post-production premium", p: "Cut narratif, étalonnage cinématique, mixage 5.1." },
      { n: "05", t: "Versionning", p: "Master + déclinaisons réseaux + version sous-titrée pour silent autoplay." },
    ],
    tools: ["Premiere Pro", "DaVinci Resolve", "After Effects", "Pro Tools", "Sony / RED"],
    deliverables: [
      "Master cinéma 4K H.264 + ProRes",
      "Versions réseaux (9:16, 1:1, 16:9)",
      "Version sous-titrée français + anglais",
      "Pack b-rolls bonus pour vos réseaux",
      "Photos extraites HD",
    ],
    quote: {
      q: "C'est la première fois que notre film d'entreprise n'embarrasse pas l'équipe quand on le montre.",
      a: "— Directrice communication, groupe industriel 400 personnes",
    },
    theme: {
      pageBg: "bg-[#f4f1eb]",
      pageInk: "text-[#0e0e0e]",
      accent: "text-[#9b7d2c]",
      accentBg: "bg-[#9b7d2c]",
      chipBg: "bg-[#0e0e0e]/8",
      chipText: "text-[#0e0e0e]",
      cardBg: "bg-white",
      cardBorder: "border-[#0e0e0e]/12",
      softBg: "bg-white",
      button: "bg-[#0e0e0e] text-[#f4f1eb] hover:bg-[#1f1f1f]",
      quoteBg: "bg-white",
      eyebrowColor: "text-[#9b7d2c]",
      decorative: "editorial",
    },
  },

  "motion-design": {
    slug: "motion-design",
    eyebrow: "Univers · Motion Design",
    title: "Le pixel qui bouge, ",
    highlight: "avec intention.",
    baseline:
      "Logos animés, typographie cinétique, transitions sur-mesure, explainer animés. Le motion qui structure votre récit visuel.",
    hero: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`,
    introTitle: "Un bon motion ne se voit pas. Il guide.",
    intro:
      "Quand l'animation est mal calibrée, on la subit. Quand elle est juste, on ne la remarque même pas — on comprend, on retient, on agit. Notre motion design sert le message, jamais l'inverse.",
    manifesto: [
      "L'easing est plus important que le keyframe.",
      "Une animation existe pour faire passer une info, pas pour épater.",
      "Le silence visuel est aussi puissant qu'un mouvement.",
    ],
    blocks: [
      {
        h: "Logo intros & branding motion",
        p: "Vous avez investi dans une identité forte. Donnez-lui sa version animée — intro vidéo, bumper, logo loop pour fin de vidéo. Cohérence garantie avec votre charte.",
      },
      {
        h: "Kinetic typography",
        p: "Quand l'image manque et que la voix porte, la typographie animée prend le relais. Punchlines, citations, données chiffrées — chaque mot rythmé pour maximiser la mémorisation.",
      },
      {
        h: "Explainer & infographies",
        p: "Vous avez un concept complexe à vulgariser. On le décompose visuellement, étape par étape, avec une économie graphique qui respecte le viewer.",
      },
      {
        h: "Transitions signature",
        p: "Une transition réussie est invisible. Nous construisons votre toolkit de transitions sur-mesure, réutilisable sur tous vos projets futurs — vous n'aurez plus à payer la roue à chaque fois.",
      },
    ],
    gallery: [
      { src: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`, alt: "Motion 1", wide: true },
      { src: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`, alt: "Motion 2" },
      { src: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`, alt: "Motion 3", tall: true },
      { src: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`, alt: "Motion 4" },
      { src: `${CDN}/699ab9aed3c37eb93d81731b_image20.jpeg`, alt: "Motion 5" },
      { src: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`, alt: "Motion 6", wide: true },
    ],
    stats: [
      { k: "+500", v: "Animations produites" },
      { k: "60fps", v: "Standard de livraison" },
      { k: "After Effects", v: "Pipeline natif" },
    ],
    process: [
      { n: "01", t: "Storyboard", p: "Frames clés, intentions de mouvement, mood visuel — validés avant production." },
      { n: "02", t: "Style frames", p: "3 styles graphiques poussés, vous choisissez la direction." },
      { n: "03", t: "Animation", p: "Production frame par frame, courbes d'easing chirurgicales." },
      { n: "04", t: "Sound design", p: "Synchronisation audio, whooshes, impacts, ambiance." },
      { n: "05", t: "Livraison", p: "Master + versions transparentes, alphas, loops, déclinaisons." },
    ],
    tools: ["After Effects", "Cinema 4D", "Illustrator", "Figma", "Plexus", "Trapcode"],
    deliverables: [
      "Master vidéo 4K H.264",
      "Version alpha (transparente) pour overlay",
      "Boucles parfaites (perfect loops)",
      "Source After Effects (sur demande)",
      "Variations courtes pour réseaux",
    ],
    quote: {
      q: "Nos vidéos avaient besoin d'âme. Le motion VizioCraft les a transformées en signature.",
      a: "— Brand lead, startup fintech",
    },
    theme: {
      pageBg: "bg-[#06061a]",
      pageInk: "text-white",
      accent: "text-[#a78bfa]",
      accentBg: "bg-[#a78bfa]",
      chipBg: "bg-[#a78bfa]/15",
      chipText: "text-[#c4b5fd]",
      cardBg: "bg-white/[0.04]",
      cardBorder: "border-white/10",
      softBg: "bg-white/[0.03]",
      button: "bg-gradient-to-r from-[#a78bfa] to-[#67e8f9] text-[#06061a] hover:opacity-90",
      quoteBg: "bg-gradient-to-br from-[#a78bfa]/20 to-[#67e8f9]/10",
      eyebrowColor: "text-[#c4b5fd]",
      decorative: "neon",
    },
  },

  "contenu-educatif": {
    slug: "contenu-educatif",
    eyebrow: "Univers · Contenu éducatif",
    title: "Apprendre devient ",
    highlight: "un plaisir visuel.",
    baseline:
      "Tutoriels, modules de formation, vidéos explicatives. La pédagogie qui retient l'attention jusqu'au dernier chapitre.",
    hero: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`,
    introTitle: "Une bonne formation, c'est 70% montage.",
    intro:
      "Vous pouvez avoir le meilleur contenu pédagogique du monde — si le rythme est mauvais, personne ne finira. Notre travail : transformer votre savoir en expérience d'apprentissage qui se regarde, jusqu'au bout.",
    manifesto: [
      "Une notion = un chapitre = une accroche visuelle.",
      "Les schémas animés font ce que les mots ne peuvent pas.",
      "Le silence est un outil pédagogique — on laisse respirer.",
    ],
    blocks: [
      {
        h: "Modules de formation",
        p: "Découpage par compétence, chapitrage clair, transitions identifiables. Chaque module est conçu pour être consommé seul ou en parcours complet — flexibilité maximale pour vos apprenants.",
      },
      {
        h: "Vidéos explicatives",
        p: "Concept complexe expliqué en 90 secondes. Schémas animés, voix-off claire, métaphores visuelles fortes. Le format viral de la pédagogie moderne.",
      },
      {
        h: "Tutoriels & démos produit",
        p: "Screen recording propre, zooms intelligents sur les actions clés, sous-titres incrustés. L'utilisateur reproduit chaque étape sans avoir à pauser.",
      },
      {
        h: "Pack pédagogique modulaire",
        p: "Une formation = 1 long format + des shorts chapitres + des fiches récap visuelles + une intro standardisée. Tout votre contenu pédago vit dans un même langage visuel.",
      },
    ],
    gallery: [
      { src: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`, alt: "Edu 1", wide: true },
      { src: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`, alt: "Edu 2" },
      { src: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`, alt: "Edu 3", tall: true },
      { src: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`, alt: "Edu 4" },
      { src: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`, alt: "Edu 5" },
      { src: `${CDN}/699ab9aed3c37eb93d81731b_image20.jpeg`, alt: "Edu 6", wide: true },
    ],
    stats: [
      { k: "+250", v: "Vidéos pédagogiques produites" },
      { k: "92%", v: "Taux de complétion moyen client" },
      { k: "5 langues", v: "Sous-titrage multilingue" },
    ],
    process: [
      { n: "01", t: "Architecture pédagogique", p: "Carte des notions, ordre d'apprentissage, points de friction anticipés." },
      { n: "02", t: "Scripts & storyboards", p: "Rédaction des voix-off, schémas annotés, validation pédago." },
      { n: "03", t: "Animation & enregistrement", p: "Voix-off pro, motion design didactique, screen capture HD." },
      { n: "04", t: "Mix & accessibilité", p: "Sous-titres FR + langues cibles, descriptions alt, formats accessibles." },
      { n: "05", t: "Pack final", p: "Long format + chapitres + fiches récap + pack relances réseaux." },
    ],
    tools: ["After Effects", "Camtasia", "Premiere Pro", "Notion (scripts)", "Articulate"],
    deliverables: [
      "Modules vidéo MP4 HD/4K",
      "Sous-titres FR + EN (.srt + burned-in)",
      "Fiches récap PDF par chapitre",
      "Quiz embarqués (sur demande)",
      "Master sans habillage pour LMS",
    ],
    quote: {
      q: "Notre taux de complétion est passé de 38% à 89% en refondant les modules avec VizioCraft.",
      a: "— Responsable formation, école en ligne 12k apprenants",
    },
    theme: {
      pageBg: "bg-[#eef4ff]",
      pageInk: "text-[#0b1d3a]",
      accent: "text-[#1e6fd9]",
      accentBg: "bg-[#1e6fd9]",
      chipBg: "bg-[#1e6fd9]/12",
      chipText: "text-[#1e6fd9]",
      cardBg: "bg-white",
      cardBorder: "border-[#0b1d3a]/10",
      softBg: "bg-white",
      button: "bg-[#1e6fd9] text-white hover:bg-[#1758ad]",
      quoteBg: "bg-white",
      eyebrowColor: "text-[#1e6fd9]",
      decorative: "blueprint",
    },
  },
};

const ORDER = ["publicites-video", "podcast-video", "corporate-evenementiel", "motion-design", "contenu-educatif"];

export const Route = createFileRoute("/univers/$slug")({
  component: UniversPage,
  loader: ({ params }) => {
    const u = UNIVERS[params.slug];
    if (!u) throw notFound();
    return { u };
  },
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center bg-background">
      <div className="text-center">
        <p className="font-display text-2xl">Univers introuvable</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">Retour à l'accueil</Link>
      </div>
    </main>
  ),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.u.title.trim()} ${loaderData.u.highlight} — VizioCraft` },
          { name: "description", content: loaderData.u.baseline },
        ]
      : [],
  }),
});

/* ——————————————————————————— RENDER ——————————————————————————— */

function GalleryTile({ g, theme, onClick }: { g: Tile; theme: Univers["theme"]; onClick: () => void }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) return null;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border ${theme.cardBorder} ${
        g.wide ? "col-span-2 sm:col-span-2 lg:col-span-2" : ""
      } cursor-zoom-in transition-all duration-300 ${!loaded ? "animate-pulse bg-current/5 min-h-[150px]" : ""}`}
    >
      <img
        src={g.src}
        alt={g.alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-auto block transition duration-700 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}

function UniversPage() {
  const { u } = Route.useLoaderData() as { u: Univers };
  const idx = ORDER.indexOf(u.slug);
  const next = idx >= 0 && idx < ORDER.length - 1 ? UNIVERS[ORDER[idx + 1]] : null;
  const prev = idx > 0 ? UNIVERS[ORDER[idx - 1]] : null;
  const t = u.theme;

  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeImageIndex === null) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveImageIndex(null);
      if (e.key === "ArrowRight") {
        setActiveImageIndex((prevIdx) => (prevIdx !== null ? (prevIdx + 1) % u.gallery.length : null));
      }
      if (e.key === "ArrowLeft") {
        setActiveImageIndex((prevIdx) => (prevIdx !== null ? (prevIdx - 1 + u.gallery.length) % u.gallery.length : null));
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, u.gallery.length]);

  return (
    <main className={`${t.pageBg} ${t.pageInk} min-h-screen`}>
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
        {t.decorative === "orange-glow" && (
          <>
            <div className="absolute -left-32 top-20 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(255,94,58,0.18),transparent)] blur-3xl" />
            <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(closest-side,rgba(255,94,58,0.12),transparent)] blur-3xl" />
          </>
        )}
        {t.decorative === "neon" && (
          <>
            <div className="absolute -left-40 top-10 h-[700px] w-[700px] rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.25),transparent)] blur-3xl" />
            <div className="absolute -right-32 top-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(103,232,249,0.18),transparent)] blur-3xl" />
          </>
        )}
        {t.decorative === "warm" && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(168,99,45,0.08),transparent_60%)]" />
        )}
        {t.decorative === "blueprint" && (
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#0b1d3a 1px,transparent 1px),linear-gradient(90deg,#0b1d3a 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        )}
        {t.decorative === "editorial" && (
          <div className="absolute inset-x-0 top-0 h-px bg-[#0e0e0e]/10" />
        )}

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Link to="/" className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] ${t.eyebrowColor} hover:opacity-80`}>
            ← Retour au portfolio
          </Link>

          <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className={`inline-flex items-center gap-2 rounded-full ${t.chipBg} px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${t.chipText}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${t.accentBg}`} />
                {u.eyebrow}
              </span>
              <h1 className="mt-6 font-display text-5xl leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
                {u.title}
                <span className={t.accent}>{u.highlight}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-80">{u.baseline}</p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/" hash="contact" className={`inline-flex items-center gap-2 rounded-full ${t.button} px-7 py-4 text-sm font-semibold transition`}>
                  Démarrer un projet →
                </Link>
                <a href="#detail" className={`inline-flex items-center gap-2 rounded-full border ${t.cardBorder} px-7 py-4 text-sm font-semibold opacity-80 hover:opacity-100 transition`}>
                  Explorer l'univers
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                <img src={u.hero} alt={u.title} className="aspect-[4/3] w-full object-cover" loading="eager" />
              </div>
            </div>
          </div>

          {/* Stats band */}
          <div className={`mt-16 grid gap-px overflow-hidden rounded-3xl border ${t.cardBorder} ${t.cardBg} sm:grid-cols-3`}>
            {u.stats.map((s) => (
              <div key={s.k} className={`${t.softBg} px-6 py-7 sm:px-8 sm:py-10`}>
                <p className={`font-display text-4xl sm:text-5xl ${t.accent}`}>{s.k}</p>
                <p className="mt-2 text-sm opacity-70">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO + INTRO */}
      <section id="detail" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${t.eyebrowColor}`}>Manifeste</span>
              <ul className="mt-6 space-y-5">
                {u.manifesto.map((m, i) => (
                  <li key={i} className="flex gap-4">
                    <span className={`mt-2 h-6 w-6 shrink-0 rounded-full ${t.accentBg} text-center text-[11px] font-bold leading-6 text-white`}>{i + 1}</span>
                    <span className="text-base leading-relaxed opacity-85">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{u.introTitle}</h2>
              <p className="mt-5 text-lg leading-relaxed opacity-80">{u.intro}</p>
            </div>
          </div>
        </div>
      </section>

      {/* NARRATIVE BLOCKS — alternating layout */}
      <section className={`${t.softBg} py-20 lg:py-28`}>
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-5 md:grid-cols-2">
            {u.blocks.map((b, i) => (
              <div key={i} className={`rounded-3xl border ${t.cardBorder} ${t.cardBg} p-7 sm:p-9 transition hover:-translate-y-1 hover:shadow-2xl`}>
                <span className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${t.eyebrowColor}`}>0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl sm:text-3xl">{b.h}</h3>
                <p className="mt-3 text-sm leading-relaxed opacity-80">{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY — adaptive layout */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 max-w-2xl">
            <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${t.eyebrowColor}`}>Galerie</span>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">L'empreinte visuelle.</h2>
            <p className="mt-4 text-base leading-relaxed opacity-70">
              L'harmonie des formes, du rythme et de la lumière au service d'une narration singulière.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 items-start">
            {u.gallery.map((g, i) => (
              <GalleryTile key={i} g={g} theme={t} onClick={() => setActiveImageIndex(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className={`${t.softBg} py-20 lg:py-28`}>
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${t.eyebrowColor}`}>Notre process</span>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">De votre brief au master final.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {u.process.map((p) => (
              <div key={p.n} className={`relative rounded-2xl border ${t.cardBorder} ${t.cardBg} p-6`}>
                <span className={`font-display text-5xl ${t.accent} opacity-30`}>{p.n}</span>
                <h3 className="mt-2 font-display text-xl">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{p.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS + DELIVERABLES */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${t.eyebrowColor}`}>Stack</span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl">Les outils que nous maîtrisons.</h3>
              <div className="mt-6 flex flex-wrap gap-2">
                {u.tools.map((tool) => (
                  <span key={tool} className={`rounded-full ${t.chipBg} ${t.chipText} px-4 py-2 text-xs font-semibold uppercase tracking-wider`}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${t.eyebrowColor}`}>Livrables inclus</span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl">Tout ce que vous récupérez.</h3>
              <ul className="mt-6 space-y-3">
                {u.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-sm opacity-85">
                    <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${t.accentBg} text-[10px] text-white`}>✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="px-6 pb-20 lg:px-10 lg:pb-28">
        <div className={`mx-auto max-w-5xl rounded-[2rem] border ${t.cardBorder} ${t.quoteBg} p-10 sm:p-14 text-center`}>
          <p className={`font-display text-2xl leading-snug sm:text-3xl`}>« {u.quote.q} »</p>
          <p className="mt-5 text-sm opacity-70">{u.quote.a}</p>
        </div>
      </section>

      {/* NAV NEXT/PREV */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-6xl grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link
              to="/univers/$slug"
              params={{ slug: prev.slug }}
              className={`group rounded-2xl border ${t.cardBorder} ${t.cardBg} p-6 transition hover:-translate-y-0.5 hover:shadow-xl`}
            >
              <p className={`text-[11px] uppercase tracking-[0.22em] ${t.eyebrowColor}`}>← Univers précédent</p>
              <p className="mt-2 font-display text-xl group-hover:opacity-80">{prev.title} {prev.highlight}</p>
            </Link>
          ) : <div />}
          {next ? (
            <Link
              to="/univers/$slug"
              params={{ slug: next.slug }}
              className={`group rounded-2xl border ${t.cardBorder} ${t.cardBg} p-6 text-right transition hover:-translate-y-0.5 hover:shadow-xl`}
            >
              <p className={`text-[11px] uppercase tracking-[0.22em] ${t.eyebrowColor}`}>Univers suivant →</p>
              <p className="mt-2 font-display text-xl group-hover:opacity-80">{next.title} {next.highlight}</p>
            </Link>
          ) : <div />}
        </div>
      </section>

      <Footer />

      {/* LIGHTBOX MODAL */}
      {activeImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300"
          onClick={() => setActiveImageIndex(null)}
        >
          {/* Close button */}
          <button
            className="absolute right-6 top-6 z-55 text-white/70 hover:text-white transition p-2.5 rounded-full hover:bg-white/10 cursor-pointer"
            onClick={() => setActiveImageIndex(null)}
            aria-label="Fermer la galerie"
          >
            <X size={26} />
          </button>

          {/* Prev button */}
          <button
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-55 text-white/70 hover:text-white transition p-3.5 rounded-full hover:bg-white/10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prevIdx) => (prevIdx !== null ? (prevIdx - 1 + u.gallery.length) % u.gallery.length : null));
            }}
            aria-label="Image précédente"
          >
            <ChevronLeft size={36} />
          </button>

          {/* Next button */}
          <button
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-55 text-white/70 hover:text-white transition p-3.5 rounded-full hover:bg-white/10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prevIdx) => (prevIdx !== null ? (prevIdx + 1) % u.gallery.length : null));
            }}
            aria-label="Image suivante"
          >
            <ChevronRight size={36} />
          </button>

          {/* Image Container */}
          <div
            className="relative flex flex-col items-center max-w-[90vw] max-h-[85vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={u.gallery[activeImageIndex].src}
              alt={u.gallery[activeImageIndex].alt}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
            />
            <p className="mt-5 text-center text-sm font-semibold tracking-[0.1em] uppercase text-white/80">
              {u.gallery[activeImageIndex].alt}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
