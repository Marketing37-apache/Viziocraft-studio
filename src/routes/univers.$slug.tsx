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
    highlight: "Montées pour convertir.",
    baseline:
      "Un hook qui accroche, un rythme qui retient, un format adapté à chaque plateforme. La pub vidéo pensée pour performer.",
    hero: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`,
    introTitle: "L'attention coûte cher. Nous la rentabilisons.",
    intro:
      "Sur les feeds, vous disposez de moins de deux secondes avant que le viewer passe à autre chose. Notre travail commence à ce moment précis — construire un hook qui arrête le scroll, une promesse qui crédibilise, un call-to-action qui déclenche l'action. Chaque coupe, chaque sous-titre, chaque seconde est au service de votre objectif.",
    manifesto: [
      "Le brief commence par l'objectif de conversion, pas par la direction artistique.",
      "On itère sur chaque pub jusqu'à ce qu'elle délivre les résultats attendus.",
      "Le motion sert le message, jamais l'inverse.",
    ],
    blocks: [
      {
        h: "Un hook qui stoppe le scroll",
        p: "L'ouverture est le seul moment où vous pouvez encore perdre votre audience. On travaille chaque première seconde — image d'accroche, rythme initial, promesse implicite — pour qu'elle soit impossible à ignorer.",
      },
      {
        h: "Formats adaptés à chaque plateforme",
        p: "9:16 pour Reels et TikTok, 1:1 pour le feed Meta, 16:9 pour YouTube — un seul brief, tous les formats livrés, chacun optimisé pour son contexte. Pas de recadrage approximatif, une vraie adaptation.",
      },
      {
        h: "Montage orienté conversion",
        p: "Chaque coupe, chaque sous-titre et chaque transition est calibré pour maintenir l'attention et guider le viewer vers l'action. On monte avec l'objectif en tête, pas avec l'esthétique comme priorité.",
      },
      {
        h: "Disponibles pour itérer",
        p: "Une pub lancée, des données remontées, une nouvelle version livrée. On reste disponibles après la livraison initiale pour affiner en fonction des performances réelles.",
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
      { k: "×3", v: "Taux de clic supérieur après optimisation" },
      { k: "48h", v: "Délai de livraison standard" },
      { k: "−40%", v: "Coût par résultat observé après itération" },
    ],
    process: [
      { n: "01", t: "Brief", p: "Vous transmettez vos fichiers sources, l'objectif de la campagne et la cible visée. On part de là, pas d'un template." },
      { n: "02", t: "Montage", p: "On construit la pub avec le hook, le rythme et le format adaptés à la plateforme de diffusion." },
      { n: "03", t: "Livraison", p: "Vous recevez les exports finaux, prêts à diffuser, dans chaque format demandé." },
      { n: "04", t: "Ajustements", p: "Vos retours sont intégrés rapidement. On ajuste jusqu'à validation complète." },
    ],
    tools: ["After Effects", "Premiere Pro", "DaVinci Resolve"],
    deliverables: [
      "Exports dans tous les formats demandés — 9:16, 1:1, 16:9",
      "Sous-titres incrustés et synchronisés",
      "Intro ou outro avec votre logo",
      "Miniatures statiques pour vos campagnes",
    ],
    quote: {
      q: "On a consolidé notre production chez VizioCraft après avoir testé deux autres agences. La réactivité et les résultats ne sont pas comparables.",
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
      "Synchro multi-caméra, étalonnage cohérent, clips courts dérivés. Chaque épisode devient une source de contenu sur toutes les plateformes.",
    hero: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`,
    introTitle: "Un tournage, plusieurs semaines de contenu.",
    intro:
      "Vous enregistrez un épisode. La plupart des équipes en sortent une vidéo. Nous en sortons un long format YouTube structuré, des clips courts reformatés pour les réseaux, et des visuels prêts à publier — le tout issu du même tournage, sans charge supplémentaire de votre côté.",
    manifesto: [
      "Plusieurs caméras, une émission cohérente et bien montée.",
      "Chaque moment fort devient un clip court autonome avec sa propre logique narrative.",
      "L'identité visuelle reste constante d'un épisode à l'autre.",
    ],
    blocks: [
      {
        h: "Synchronisation multi-caméra",
        p: "Une caméra par intervenant, complétée d'un plan d'ensemble si le tournage s'y prête. On synchronise toutes les sources, on corrige les niveaux audio, on livre une émission finalisée — pas un assemblage brut.",
      },
      {
        h: "Clips courts extraits de chaque épisode",
        p: "On identifie les séquences à fort potentiel et on les reformate en clips verticaux optimisés pour TikTok, Reels et YouTube Shorts. Le volume livré dépend de la durée et de la densité du contenu.",
      },
      {
        h: "Chapitrage et éléments de publication",
        p: "Chapitres YouTube pour structurer la navigation, description rédigée, miniatures livrées. Votre épisode est prêt à être publié dès réception, sans étape supplémentaire.",
      },
      {
        h: "Habillage visuel homogène",
        p: "Nom des intervenants à l'écran, animations sur les phrases clés, transitions soignées. Un style visuel cohérent qui renforce la reconnaissance de votre émission épisode après épisode.",
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
      { k: "Multi-cam", v: "Synchronisation native audio et vidéo" },
      { k: "Clips dérivés", v: "Volume adapté au contenu de chaque épisode" },
      { k: "72h", v: "Délai de livraison standard" },
    ],
    process: [
      { n: "01", t: "Brief", p: "Vous nous transmettez le contexte de l'épisode et les séquences à valoriser en priorité." },
      { n: "02", t: "Réception des rushes", p: "Vous uploadez vos fichiers. On synchronise les sources et on calibre les niveaux audio." },
      { n: "03", t: "Montage long format", p: "Découpage narratif, habillage, étalonnage colorimétrique, mixage audio." },
      { n: "04", t: "Clips dérivés", p: "On extrait les séquences à fort potentiel et on les reformate en clips verticaux." },
      { n: "05", t: "Livraison", p: "Long format, clips courts, miniatures et descriptions — tout livré en une seule passe." },
    ],
    tools: ["Premiere Pro", "DaVinci Resolve", "After Effects"],
    deliverables: [
      "Long format en haute qualité, prêt à publier",
      "Clips verticaux extraits selon le contenu",
      "Miniatures livrées",
      "Description et chapitres rédigés",
    ],
    quote: {
      q: "Le volume de contenu publié a triplé à partir du même temps de tournage. Le podcast est devenu une vraie machine à distribution.",
      a: "— Podcasteur, créateur de contenu B2B",
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
    eyebrow: "Univers · Shorts & Reels",
    title: "Du scroll stoppé, ",
    highlight: "tous les jours.",
    baseline:
      "Shorts, Reels, TikToks — montés pour capter l'attention dès la première seconde et convertir en abonnés ou en clients.",
    hero: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`,
    introTitle: "Le format court est le plus exigeant à maîtriser.",
    intro:
      "En 30 à 60 secondes, chaque choix de montage est visible. Le premier plan, l'enchaînement des coupes, le placement des sous-titres, la dernière image — tout se voit. On monte vos shorts avec le même niveau d'exigence qu'un long format, parce que votre audience, elle, ne fait pas la différence.",
    manifesto: [
      "Un short mal monté réduit votre crédibilité avant même que le contenu soit vu.",
      "Le rythme est le résultat d'un travail technique, pas d'une intuition.",
      "Les sous-titres sont partie intégrante du montage, pas un ajout de dernière minute.",
    ],
    blocks: [
      {
        h: "Montage natif 9:16",
        p: "On ne recadre pas une vidéo horizontale en vertical. Chaque short est monté directement dans le bon format, avec un cadrage, un rythme et une hiérarchie visuelle pensés pour le mobile et le scroll.",
      },
      {
        h: "Sous-titres intégrés au montage",
        p: "Police, couleurs, taille, position, timing — les sous-titres sont traités comme un élément de mise en scène. Ils guident le regard et maintiennent l'engagement, même en lecture silencieuse.",
      },
      {
        h: "Accroche dès la première image",
        p: "Chaque short s'ouvre sur une séquence travaillée pour retenir l'attention immédiatement. Pas de générique, pas d'introduction — on entre dans le sujet avant que le viewer ait le temps de scroller.",
      },
      {
        h: "Volume soutenu, qualité constante",
        p: "Qu'il s'agisse de cinq ou trente shorts par mois, on maintient la même cohérence d'exécution. Un style validé une fois, appliqué systématiquement à chaque livraison.",
      },
    ],
    gallery: [
      { src: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`, alt: "Short 1", wide: true },
      { src: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`, alt: "Short 2", tall: true },
      { src: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`, alt: "Short 3" },
      { src: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`, alt: "Short 4" },
      { src: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`, alt: "Short 5" },
      { src: `${CDN}/699ab9aed3c37eb93d81731b_image20.jpeg`, alt: "Short 6", wide: true },
    ],
    stats: [
      { k: "+5000", v: "Shorts produits pour nos clients" },
      { k: "24h", v: "Option de livraison express disponible" },
      { k: "30+", v: "Shorts mensuels pour certains clients actifs" },
    ],
    process: [
      { n: "01", t: "Brief", p: "Vous transmettez vos rushes et vos références visuelles. On définit ensemble le style à appliquer." },
      { n: "02", t: "Cadrage du style", p: "On livre un premier short. Vous le validez, on verrouille la direction visuelle pour la suite." },
      { n: "03", t: "Production régulière", p: "On livre selon votre rythme de publication — quotidien, hebdomadaire ou à la demande." },
      { n: "04", t: "Ajustements", p: "Vos retours sont intégrés rapidement, sans remettre le style en question à chaque fois." },
    ],
    tools: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
    deliverables: [
      "Shorts en 9:16, prêts à publier",
      "Sous-titres animés incrustés",
      "Exports adaptés à chaque plateforme",
      "Miniatures fournies si nécessaire",
    ],
    quote: {
      q: "Pour la première fois, je publie tous les jours sans m'impliquer dans le montage. La régularité a changé mes résultats.",
      a: "— Créateur de contenu, 80k abonnés",
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
    title: "L'animation au service ",
    highlight: "de votre message.",
    baseline:
      "Logos animés, textes en mouvement, intros et transitions sur-mesure. Le motion design qui renforce votre identité vidéo.",
    hero: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`,
    introTitle: "Un bon motion design ne se remarque pas. Il guide.",
    intro:
      "Quand l'animation est précisément calibrée, elle devient transparente — on retient l'information, on comprend le propos, on reste attentif. Quand elle ne l'est pas, on ne voit plus que l'animation. Notre rôle est de faire en sorte que chaque élément en mouvement serve votre contenu, et rien d'autre.",
    manifesto: [
      "Chaque élément animé a une fonction précise. S'il n'en a pas, il disparaît.",
      "La cohérence visuelle sur l'ensemble d'une production vaut plus qu'un effet ponctuel.",
      "Un style défini dès le premier projet, réutilisable sur toute votre production.",
    ],
    blocks: [
      {
        h: "Intro et logo animé",
        p: "Votre identité visuelle mise en mouvement pour ouvrir chaque vidéo. Court, propre, à votre image. On crée un élément réutilisable sur tous vos formats — YouTube, Reels, publicités, podcasts.",
      },
      {
        h: "Typographie et textes animés",
        p: "Titres, statistiques, phrases clés — mis en scène avec du mouvement pour renforcer la mémorisation. Particulièrement efficace sur les séquences où l'image seule ne suffit pas à porter le message.",
      },
      {
        h: "Habillage et éléments récurrents",
        p: "Nom des intervenants, annotations, indicateurs de chapitre — les éléments graphiques qui assoient le niveau de finition de vos vidéos et renforcent la cohérence de votre image.",
      },
      {
        h: "Transitions et kit réutilisable",
        p: "Un ensemble de transitions et d'éléments graphiques à votre image, applicable sur l'ensemble de vos projets futurs. Vous n'avez pas à redéfinir votre style à chaque nouvelle production.",
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
      { k: "+500", v: "Éléments animés produits" },
      { k: "After Effects", v: "Notre outil de production principal" },
      { k: "Réutilisable", v: "Chaque élément livré avec ses fichiers sources" },
    ],
    process: [
      { n: "01", t: "Brief visuel", p: "Vous partagez vos références, votre charte graphique existante et vos contraintes." },
      { n: "02", t: "Direction artistique", p: "On vous soumet une orientation visuelle avant de lancer la production." },
      { n: "03", t: "Production", p: "Animation cadre par cadre, timing soigné, rendu final propre." },
      { n: "04", t: "Livraison", p: "Fichiers exportés prêts à intégrer dans vos vidéos. Fichiers sources fournis sur demande." },
    ],
    tools: ["After Effects", "Premiere Pro", "DaVinci Resolve"],
    deliverables: [
      "Éléments animés exportés en MP4",
      "Version fond transparent disponible pour incrustation",
      "Fichiers sources After Effects sur demande",
      "Déclinaisons adaptées aux différents formats",
    ],
    quote: {
      q: "Nos vidéos ont désormais une identité visuelle reconnaissable et cohérente. Le motion design a structuré toute notre production.",
      a: "— Responsable contenu, marque lifestyle",
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
    eyebrow: "Univers · Formats longs",
    title: "Des vidéos longues qui ",
    highlight: "tiennent l'attention.",
    baseline:
      "YouTube, interviews, vlogs, formats documentaires — montés pour que vos viewers restent jusqu'à la fin.",
    hero: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`,
    introTitle: "Un long format bien construit, c'est de la fidélisation.",
    intro:
      "Une vidéo longue dont le rythme n'est pas maîtrisé perd son audience après deux minutes. Une vidéo bien montée la retient jusqu'à la fin et la fait revenir la semaine suivante. On prend en charge la structure, le rythme et les finitions — pour que chaque minute de votre contenu soit justifiée.",
    manifesto: [
      "Un bon montage s'efface. Une coupe mal placée, jamais.",
      "Le rythme d'un long format se construit dès les premières décisions de découpage.",
      "Les b-rolls, les transitions et la colorimétrie sont des outils narratifs, pas des options.",
    ],
    blocks: [
      {
        h: "Montage narratif",
        p: "On structure votre contenu pour maintenir l'engagement de bout en bout : introduction qui accroche, progression maîtrisée, conclusion mémorable. Le montage raconte autant que le contenu lui-même.",
      },
      {
        h: "B-rolls et visuels d'appui",
        p: "On intègre vos rushes secondaires aux moments où ils renforcent le propos et aèrent la vidéo. Si vous n'en disposez pas, on identifie et propose des alternatives adaptées.",
      },
      {
        h: "Étalonnage et cohérence visuelle",
        p: "Correction colorimétrique, homogénéité de l'exposition, rendu visuel soigné. Votre vidéo présente le même niveau de finition du début à la fin, quelle que soit la source.",
      },
      {
        h: "Habillage et finitions",
        p: "Sous-titres, annotations, transitions, intro et outro. L'ensemble des éléments qui confèrent à votre vidéo un rendu professionnel et une identité visuelle identifiable.",
      },
    ],
    gallery: [
      { src: `${CDN}/699ab9aed3c37eb93d81735e_image11.jpeg`, alt: "Long format 1", wide: true },
      { src: `${CDN}/699ab9aed3c37eb93d81734c_image5.jpeg`, alt: "Long format 2" },
      { src: `${CDN}/699ab9aed3c37eb93d81732a_image8.jpeg`, alt: "Long format 3", tall: true },
      { src: `${CDN}/699ab9aed3c37eb93d81733d_image6.jpeg`, alt: "Long format 4" },
      { src: `${CDN}/699ab9aed3c37eb93d817327_image4.jpeg`, alt: "Long format 5" },
      { src: `${CDN}/699ab9aed3c37eb93d81731b_image20.jpeg`, alt: "Long format 6", wide: true },
    ],
    stats: [
      { k: "+1000", v: "Formats longs produits" },
      { k: "72h", v: "Délai de livraison standard" },
      { k: "7j/7", v: "Production en continu" },
    ],
    process: [
      { n: "01", t: "Brief", p: "Vous transmettez vos rushes, vos références stylistiques et vos attentes de rendu." },
      { n: "02", t: "Montage", p: "On structure et monte votre vidéo selon le rythme et l'habillage définis en amont." },
      { n: "03", t: "Livraison", p: "Vous recevez la vidéo finalisée, prête à publier, dans le format convenu." },
      { n: "04", t: "Ajustements", p: "Vos retours sont intégrés jusqu'à validation complète de votre part." },
    ],
    tools: ["Premiere Pro", "DaVinci Resolve", "After Effects"],
    deliverables: [
      "Vidéo montée en haute qualité, prête à publier",
      "Sous-titres incrustés et synchronisés",
      "Habillage et éléments graphiques intégrés",
      "Exports dans les formats demandés",
    ],
    quote: {
      q: "La durée de visionnage de mes vidéos a doublé depuis qu'on travaille ensemble. Le montage change vraiment tout.",
      a: "— Créateur YouTube, communauté tech",
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
      className={`group relative overflow-hidden rounded-2xl border ${theme.cardBorder} ${g.wide ? "col-span-2 sm:col-span-2 lg:col-span-2" : ""
        } cursor-zoom-in transition-all duration-300 ${!loaded ? "animate-pulse bg-current/5 min-h-[150px]" : ""}`}
    >
      <img
        src={g.src}
        alt={g.alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-auto block transition duration-700 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"
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
        <div className="mx-auto max-w-6xl">
          <p className={`mb-5 text-center text-xs font-semibold uppercase tracking-[0.22em] opacity-50 ${t.pageInk}`}>
            Explorer nos autres services
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/univers/$slug"
                params={{ slug: prev.slug }}
                className={`group flex items-center gap-4 rounded-2xl border-2 ${t.cardBorder} ${t.cardBg} px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-current/30 cursor-pointer`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.accentBg} text-white text-lg font-bold transition group-hover:scale-110`}>
                  ←
                </span>
                <div className="min-w-0">
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${t.eyebrowColor}`}>Service précédent</p>
                  <p className="mt-0.5 font-display text-base leading-tight truncate">{prev.title}{prev.highlight}</p>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                to="/univers/$slug"
                params={{ slug: next.slug }}
                className={`group flex items-center justify-between gap-4 rounded-2xl border-2 ${t.cardBorder} ${t.cardBg} px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-current/30 cursor-pointer sm:flex-row-reverse sm:text-right`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.accentBg} text-white text-lg font-bold transition group-hover:scale-110`}>
                  →
                </span>
                <div className="min-w-0">
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${t.eyebrowColor}`}>Service suivant</p>
                  <p className="mt-0.5 font-display text-base leading-tight truncate">{next.title}{next.highlight}</p>
                </div>
              </Link>
            ) : <div />}
          </div>
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
