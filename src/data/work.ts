/* ------------------------------------------------
   Réalisations : vidéos du partage Frame.io "PORTFOLIO".
   Chaque vidéo existe en trois fichiers dans /public/work :
   - <slug>.webp          miniature (première image affichée)
   - <slug>-preview.mp4   extrait muet de 5 s, joué au survol (150 à 400 Ko)
   - <slug>.mp4           version de lecture avec le son (720p)
   Les formats longs ne sont hébergés qu'en extrait d'une minute :
   la version intégrale s'ouvre sur Frame.io.
   Pour modifier un titre ou une catégorie, il suffit d'éditer ce fichier.
------------------------------------------------ */

export type WorkCategory = "ads" | "shorts" | "longs" | "motion";

export type Work = {
  slug: string;
  title: string;
  /** étiquette courte affichée sur la vignette */
  label: string;
  categories: WorkCategory[];
  /** v = vertical 9:16, l = horizontal 16:9 */
  o: "v" | "l";
  /** durée de la vidéo d'origine, en secondes */
  duration: number;
  /** identifiant Frame.io : renseigné quand le site ne montre qu'un extrait */
  frameId?: string;
};

const SHARE = "https://next.frame.io/share/d1be79fb-abf2-4ee7-a353-85fe9d0a5ecf/view";

export const workFiles = (w: Work) => ({
  poster: `/work/${w.slug}.webp`,
  preview: `/work/${w.slug}-preview.mp4`,
  video: `/work/${w.slug}.mp4`,
  fullUrl: w.frameId ? `${SHARE}/${w.frameId}` : undefined,
});

export const formatDuration = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export const WORKS: Work[] = [
  {
    slug: "pub-jeep-ia",
    title: "Pub Jeep, 100 % IA",
    label: "Publicité · IA",
    categories: ["ads", "motion"],
    o: "l",
    duration: 44,
  },
  {
    slug: "pub-cosmetique",
    title: "Pub cosmétique",
    label: "Publicité",
    categories: ["ads"],
    o: "v",
    duration: 48,
  },
  {
    slug: "ugc-terrain",
    title: "UGC terrain",
    label: "UGC",
    categories: ["shorts", "ads"],
    o: "v",
    duration: 26,
  },
  {
    slug: "pub-cinematique",
    title: "Pub sport cinématique",
    label: "Publicité",
    categories: ["ads"],
    o: "v",
    duration: 34,
  },
  {
    slug: "vsl-face-camera",
    title: "VSL face caméra",
    label: "VSL",
    categories: ["shorts", "ads"],
    o: "v",
    duration: 66,
  },
  {
    slug: "micro-trottoir",
    title: "Micro-trottoir",
    label: "Short",
    categories: ["shorts"],
    o: "v",
    duration: 53,
  },
  {
    slug: "reel-ferrari-ia",
    title: "Reel Ferrari, 100 % IA",
    label: "Reel · IA",
    categories: ["motion", "ads"],
    o: "v",
    duration: 30,
  },
  {
    slug: "documentaire",
    title: "Documentaire Chat Control",
    label: "Documentaire",
    categories: ["longs"],
    o: "l",
    duration: 568,
    frameId: "60836540-a400-49cf-adbb-3480fdd06ef6",
  },
  {
    slug: "interview-dirigeant",
    title: "Interview dirigeant",
    label: "Interview",
    categories: ["longs"],
    o: "l",
    duration: 251,
    frameId: "24c69d37-1373-41f1-848e-f4a229d0bd60",
  },
  {
    slug: "motion-design",
    title: "Habillage TV en motion design",
    label: "Motion design",
    categories: ["motion"],
    o: "l",
    duration: 85,
  },
  {
    slug: "short-podcast",
    title: "Short podcast",
    label: "Short",
    categories: ["shorts"],
    o: "v",
    duration: 20,
  },
  {
    slug: "ugc-boutique",
    title: "UGC en boutique",
    label: "UGC",
    categories: ["shorts", "ads"],
    o: "v",
    duration: 64,
  },
  {
    slug: "reel-sport",
    title: "Reel sport",
    label: "Reel",
    categories: ["shorts"],
    o: "v",
    duration: 35,
  },
  {
    slug: "intro-vlog-miami",
    title: "Intro de vlog, Miami",
    label: "Vlog",
    categories: ["longs"],
    o: "l",
    duration: 41,
  },
  {
    slug: "film-entreprise",
    title: "Film sécurité industrielle",
    label: "Corporate",
    categories: ["ads", "longs"],
    o: "l",
    duration: 36,
  },
  {
    slug: "ugc-produit",
    title: "UGC produit",
    label: "UGC",
    categories: ["shorts", "ads"],
    o: "v",
    duration: 35,
  },
  {
    slug: "short-nutrition",
    title: "Short nutrition",
    label: "Short",
    categories: ["shorts"],
    o: "v",
    duration: 40,
  },
  {
    slug: "vlog-convention",
    title: "Vlog convention",
    label: "Vlog",
    categories: ["longs"],
    o: "l",
    duration: 250,
    frameId: "bddb9ada-9612-495f-9f71-6afbacc5359c",
  },
  {
    slug: "long-format-terrain",
    title: "Reportage terrain",
    label: "Long format",
    categories: ["longs"],
    o: "l",
    duration: 742,
    frameId: "f9f73a63-bede-4373-a63c-17ea3ef11871",
  },
  {
    slug: "carte-3d",
    title: "Carte 3D animée",
    label: "Motion design",
    categories: ["motion"],
    o: "l",
    duration: 120,
    frameId: "9833b5b1-2f1c-47d5-9b25-ec14139daab6",
  },
  {
    slug: "short-dynamique",
    title: "Short dynamique",
    label: "Short",
    categories: ["shorts"],
    o: "l",
    duration: 37,
  },
];

export const bySlug = (slug: string) => WORKS.find((w) => w.slug === slug)!;

/* La sélection d'accueil : peu de vidéos, toutes différentes. */
export const SELECTION = [
  "pub-jeep-ia",
  "pub-cosmetique",
  "ugc-terrain",
  "pub-cinematique",
  "vsl-face-camera",
  "micro-trottoir",
  "reel-ferrari-ia",
  "documentaire",
].map(bySlug);

export const FILTERS: { key: "selection" | "all" | WorkCategory; label: string }[] = [
  { key: "selection", label: "Sélection" },
  { key: "ads", label: "Publicités" },
  { key: "shorts", label: "Shorts & UGC" },
  { key: "longs", label: "Formats longs" },
  { key: "motion", label: "Motion & IA" },
  { key: "all", label: "Tout" },
];
