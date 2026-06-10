import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FORMSPREE = "https://formspree.io/f/maqkaznd";

const BASE_PRICES: Record<string, number> = {
  s1: 30,
  s2: 35,
  pb: 50,
  l1: 200,
  l2: 220,
  l3: 260,
  pd: 250,
};

/** Neuro = ×1 · Cinetic = ×1.25 · Domination = ×1.875 (Cinetic ×1.5) */
const LEVEL_MULT = [1, 1.25, 1.875] as const;
const EXPRESS_RATE = 0.35;

/**
 * Tranches marginales pour les shorts — ancre s1 = 28€.
 * Chaque unité est facturée au prix de sa tranche.
 * Le total est donc strictement croissant, sans rebond possible.
 *
 * Vérification clé (s1 Neuro) :
 *   10 shorts → 9×28 + 1×24 = 276€  (moy. 27,6€)
 *   20 shorts → +10×24 = 492€       (moy. 24,6€  → ~25-26€ cible ✓)
 *   30 shorts → +10×21+1×17 = 719€  (one-shot) → ×0.85 = 611€ multishoot ✓
 */
const SHORT_TIERS: { from: number; to: number; ref: number }[] = [
  { from: 1,   to: 9,        ref: 28   },
  { from: 10,  to: 19,       ref: 24   },
  { from: 20,  to: 29,       ref: 21   },
  { from: 30,  to: 49,       ref: 17   },
  { from: 50,  to: 79,       ref: 16   },
  { from: 80,  to: 119,      ref: 15   },
  { from: 120, to: 149,      ref: 14   },
  { from: 150, to: Infinity, ref: 13.5 },
];

/**
 * Calcule le total en tranches pour `qty` unités d'un short de prix de base `basePrice`.
 * Le ratio de chaque tranche est calculé par rapport à l'ancre s1=28€.
 * unitAvg = prix moyen arrondi (affiché en récap).
 */
function calcShortTotal(basePrice: number, qty: number): { total: number; unitAvg: number } {
  if (qty <= 0) return { total: 0, unitAvg: basePrice };
  const anchor = 28;
  let total = 0;
  let remaining = qty;
  for (const tier of SHORT_TIERS) {
    if (remaining <= 0) break;
    const count = tier.to === Infinity
      ? remaining
      : Math.min(remaining, tier.to - tier.from + 1);
    const unitPrice = Math.round(basePrice * (tier.ref / anchor) * 100) / 100;
    total += unitPrice * count;
    remaining -= count;
  }
  total = Math.round(total);
  return { total, unitAvg: Math.round((total / qty) * 100) / 100 };
}

/**
 * Tranches marginales pour les longs formats.
 * Volumes faibles donc tranches courtes.
 * Ratios appliqués sur le prix de base de chaque format (l1=200, l2=220, l3=260).
 *
 *  1–2  → prix plein
 *  3–5  → −5%
 *  6–10 → −8%
 * 11–15 → −11%
 * 16+   → −14%
 */
const LONG_TIERS: { from: number; to: number; ratio: number }[] = [
  { from: 1,  to: 2,        ratio: 1.00 },
  { from: 3,  to: 5,        ratio: 0.95 },
  { from: 6,  to: 10,       ratio: 0.92 },
  { from: 11, to: 15,       ratio: 0.89 },
  { from: 16, to: Infinity, ratio: 0.86 },
];

function calcLongTotal(basePrice: number, qty: number): { total: number; unitAvg: number } {
  if (qty <= 0) return { total: 0, unitAvg: basePrice };
  let total = 0;
  let remaining = qty;
  for (const tier of LONG_TIERS) {
    if (remaining <= 0) break;
    const count = tier.to === Infinity
      ? remaining
      : Math.min(remaining, tier.to - tier.from + 1);
    total += Math.round(basePrice * tier.ratio) * count;
    remaining -= count;
  }
  total = Math.round(total);
  return { total, unitAvg: Math.round((total / qty) * 100) / 100 };
}

/**
 * Podcast — −3% par épisode supplémentaire en tranches, plafonné à −20%.
 * Chaque épisode i (0-indexé) coûte basePrice × (1 − min(i×0.03, 0.20)).
 * Total toujours croissant car chaque épisode > 0€.
 */
function calcPodTotal(basePrice: number, qty: number): { total: number; unitAvg: number } {
  if (qty <= 0) return { total: 0, unitAvg: basePrice };
  let total = 0;
  for (let i = 0; i < qty; i++) {
    const disc = Math.min(i * 0.03, 0.20);
    total += Math.round(basePrice * (1 - disc));
  }
  return { total, unitAvg: Math.round((total / qty) * 100) / 100 };
}

/** 3 familles distinctes */
const FORMAT_CATEGORIES = [
  {
    id: "short",
    title: "Short / Reel",
    subtitle: "Reels, TikTok, facecam, UGC, pub",
    formats: [
      { key: "s1", name: "Short Classique", desc: "Facecam & UGC — cut dynamique, sous-titres", dur: "−45s" },
      { key: "s2", name: "Short Développé", desc: "Storytelling vertical plus développé", dur: "+45s" },
      { key: "pb", name: "Short Publicitaire", desc: "Spot publicitaire — hook, CTA, rythme serré" },
    ],
  },
  {
    id: "long",
    title: "Long YouTube",
    subtitle: "Vlog, tutoriel, review, documentaire",
    formats: [
      { key: "l1", name: "Format classique", desc: "Capsules, tutos courts, review", dur: "−8 min" },
      { key: "l2", name: "Format Standard", desc: "Vlog dense, entretien, documentary court", dur: "8–15 min" },
      { key: "l3", name: "Format Long", desc: "Documentaire, masterclass, film de marque", dur: "+15 min" },
    ],
  },
  {
    id: "pod",
    title: "Podcast / Interview",
    subtitle: "Montage vidéo d'épisodes filmés",
    formats: [
      {
        key: "pd",
        name: "Podcast / Interview Filmé",
        desc: "Multi-cam, sync audio, chapitrage — travail distinct du long YouTube",
        dur: "20–90 min",
        unitLabel: "épisode",
      },
    ],
  },
] as const;

const MULTISHOOT_FREQUENCIES = [
  "Continue au fil du montage",
  "Hebdomadaire",
  "En lot unique à la fin",
];

const LEVELS = [
  {
    name: "Neuro",
    multLabel: "Tarif de base",
    includes: null as string | null,
    bullets: ["Cuts propres", "Sous-titres simples", "Sound design léger", "Hook optimisé", "Orthographe vérifiée"],
  },
  {
    name: "Cinetic",
    multLabel: "+25% vs Neuro",
    includes: "Tout Neuro inclus",
    bullets: [
      "Animations & zooms",
      "B-roll intégré",
      "Transitions travaillées",
      "Rythme dynamique",
      "Qualité optimisée",
    ],
  },
  {
    name: "Domination",
    multLabel: "+50% vs Cinetic",
    includes: "Tout Cinetic inclus",
    bullets: ["Motion design", "Animations avancées", "Color grading cinéma", "Branding intégré"],
  },
];

const OPTIONS = [
  { k: "Sous-titres animés", p: 8 },
  { k: "Sound design", p: 5 },
  { k: "Multi-format export", p: 8 },
  { k: "Voix-off / narration", p: 15 },
];

const ALL_KEYS = Object.keys(BASE_PRICES);
const EMPTY_QTY = Object.fromEntries(ALL_KEYS.map((k) => [k, 0]));

/* ─── useHoldCounter — incrément continu au maintien ─────────────────────── */
function useHoldCounter(
  onTick: (delta: number) => void,
  delta: number,
): {
  start: () => void;
  stop: () => void;
} {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  const start = useCallback(() => {
    onTick(delta); // tick immédiat
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => onTick(delta), 80);
    }, 400); // délai avant accélération
  }, [delta, onTick]);

  // Nettoyage au démontage
  useEffect(() => () => stop(), [stop]);

  return { start, stop };
}

/* ─── StepperButton — bouton + / − avec long-press ──────────────────────── */
function StepperButton({
  delta,
  onTick,
  disabled = false,
  className,
  children,
}: {
  delta: number;
  onTick: (d: number) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { start, stop } = useHoldCounter(onTick, delta);
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
      className={className}
    >
      {children}
    </button>
  );
}

const CatIcon = ({ id, className }: { id: string; className?: string }) => {
  if (id === "short") {
    return (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <rect width="10" height="16" x="7" y="4" rx="2" ry="2" />
      </svg>
    );
  }
  if (id === "long") {
    return (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <rect width="18" height="12" x="3" y="6" rx="2" ry="2" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
    </svg>
  );
};

type Theme = ReturnType<typeof buildTheme>;

function buildTheme(isDark: boolean) {
  return {
    isDark,
    containerBg: isDark ? "bg-[#110922] border-white/[0.08] text-white" : "bg-white border-foreground/10 text-[#1a1410]",
    textPrimary: isDark ? "text-white" : "text-[#1a1410]",
    textSecondary: isDark ? "text-white/70" : "text-[#1a1410]/70",
    textMuted: isDark ? "text-white/40" : "text-[#1a1410]/40",
    textMutedHover: isDark ? "hover:text-white/70" : "hover:text-[#1a1410]",
    mutedText: isDark ? "text-white/60" : "text-muted-foreground",
    badgeText: isDark ? "text-[#c4b5fd]" : "text-[#a8632d]",
    stepNumBg: isDark
      ? "bg-gradient-to-r from-[#a78bfa] to-[#ec4899] text-white"
      : "bg-[#a8632d] text-white",
    btnActive: isDark
      ? "border-[#a78bfa] bg-[#221344]/80 text-[#c4b5fd] shadow-[0_0_20px_-6px_rgba(167,139,250,0.45)]"
      : "border-[#a8632d] bg-[#a8632d]/8 text-[#a8632d]",
    btnInactive: isDark
      ? "border-white/10 bg-transparent text-white/80 hover:border-[#a78bfa]/35 hover:bg-white/[0.04]"
      : "border-foreground/12 bg-transparent text-foreground/75 hover:border-[#a8632d]/35 hover:bg-[#f7f5f0]/80",
    catBg: isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-foreground/10",
    catHeadHover: isDark ? "hover:bg-white/[0.04]" : "hover:bg-[#f7f5f0]/60",
    formatRow: isDark
      ? "border-white/[0.08] bg-transparent hover:border-white/15"
      : "border-foreground/10 bg-transparent hover:border-foreground/20",
    formatRowActive: isDark
      ? "border-[#a78bfa]/45 bg-[#221344]/40"
      : "border-[#a8632d]/35 bg-[#a8632d]/[0.04]",
    nestedBorder: isDark ? "border-white/10" : "border-foreground/10",
    inputBg: isDark
      ? "bg-white/5 border-white/10 focus:border-[#a78bfa] text-white focus:bg-white/10"
      : "bg-[#f7f5f0] border-foreground/15 focus:border-[#a8632d] text-[#1a1410] focus:bg-white",
    optActive: isDark
      ? "border-[#a78bfa] bg-[#221344]/60 text-white shadow-[0_0_15px_rgba(167,139,250,0.15)]"
      : "border-[#a8632d] bg-[#a8632d]/[0.05] text-[#a8632d]",
    optInactive: isDark
      ? "border-white/10 bg-transparent text-white/80 hover:border-[#a78bfa]/30"
      : "border-foreground/12 bg-white text-foreground/80 hover:border-[#a8632d]/30",
    optCheck: isDark ? "border-[#a78bfa] bg-[#a78bfa] text-white" : "border-[#a8632d] bg-[#a8632d] text-white",
    submit: isDark
      ? "bg-gradient-to-r from-[#a78bfa] to-[#ec4899] text-white hover:opacity-90 shadow-[0_40px_80px_-30px_rgba(123,45,142,0.3)] glow-brand"
      : "bg-[#1a1410] text-white hover:bg-[#2e2620] shadow-md",
    recapBg: isDark ? "bg-white/[0.03]" : "bg-[#f7f5f0]/80",
    panelGlow: isDark ? "ring-1 ring-white/10" : "ring-1 ring-foreground/5",
    iconShort: isDark ? "bg-[#221344] text-[#c4b5fd]" : "bg-brand-soft text-primary",
    iconLong: isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-100 text-amber-700",
    iconPod: isDark ? "bg-white/5 text-white/70" : "bg-foreground/5 text-foreground/70",
    sectionLine: isDark ? "border-white/10" : "border-foreground/10",
    invoiceBg: isDark ? "bg-white/[0.02]" : "bg-white",
  };
}

function getCardStyle(active: boolean, isDark: boolean) {
  if (active) {
    return isDark
      ? "border-[#a78bfa] bg-[#221344]/30 shadow-[0_0_25px_-5px_rgba(167,139,250,0.25)] ring-1 ring-[#a78bfa]/20 scale-[1.01]"
      : "border-[#a8632d] bg-[#a8632d]/[0.04] shadow-[0_8px_20px_-6px_rgba(168,99,45,0.08)] ring-1 ring-[#a8632d]/10 scale-[1.01]";
  }
  return isDark
    ? "border-white/[0.08] bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"
    : "border-foreground/10 bg-white hover:border-[#a8632d]/10 hover:border-foreground/20 hover:shadow-xs";
}

function catIconClass(theme: Theme, catId: string): string {
  if (catId === "short") return theme.iconShort;
  if (catId === "long") return theme.iconLong;
  return theme.iconPod;
}

/**
 * Délais de livraison — 12 monteurs en relais 7j/7
 * (logique par famille de contenu, goulot d'étranglement = le max)
 */
function calcDeliveryStandard(quantities: Record<string, number>, podShorts: number): number {
  const s1 = (quantities["s1"] ?? 0) + (quantities["s2"] ?? 0);
  const pb = quantities["pb"] ?? 0;
  const l1 = quantities["l1"] ?? 0;
  const l2 = quantities["l2"] ?? 0;
  const l3 = quantities["l3"] ?? 0;
  const pd = quantities["pd"] ?? 0;

  let dS1 = 0;
  if (s1 > 0) {
    if      (s1 <= 8)   dS1 = 2;
    else if (s1 <= 20)  dS1 = 3;
    else if (s1 <= 35)  dS1 = 4;
    else if (s1 <= 50)  dS1 = 5;
    else if (s1 <= 70)  dS1 = 6;
    else                dS1 = 8 + Math.floor((s1 - 70) / 15);
  }

  let dPb = 0;
  if (pb > 0) {
    if      (pb <= 8)   dPb = 2;
    else if (pb <= 20)  dPb = 3;
    else if (pb <= 35)  dPb = 4;
    else if (pb <= 50)  dPb = 5;
    else if (pb <= 70)  dPb = 6;
    else                dPb = 8 + Math.floor((pb - 70) / 15);
  }

  let dL1 = 0;
  if (l1 > 0) {
    if      (l1 <= 3)   dL1 = 2;
    else if (l1 <= 8)   dL1 = 4;
    else if (l1 <= 12)  dL1 = 6;
    else                dL1 = 6 + Math.ceil((l1 - 12) / 3);
  }

  let dL2 = 0;
  if (l2 > 0) {
    if      (l2 <= 2)   dL2 = 3;
    else if (l2 <= 6)   dL2 = 5;
    else if (l2 <= 12)  dL2 = 7;
    else                dL2 = 8 + Math.ceil((l2 - 12) / 2);
  }

  let dL3 = 0;
  if (l3 > 0) {
    if      (l3 === 1)  dL3 = 6;
    else if (l3 <= 4)   dL3 = 10;
    else if (l3 <= 8)   dL3 = 14;
    else                dL3 = 14 + Math.ceil((l3 - 8) * 2);
  }

  let dPd = 0;
  if (pd > 0) {
    if      (pd === 1)  dPd = 4;
    else if (pd <= 3)   dPd = 6;
    else if (pd <= 6)   dPd = 9;
    else if (pd <= 10)  dPd = 12;
    else                dPd = 12 + Math.ceil((pd - 10) / 2);
  }

  const podShortDays = podShorts > 0
    ? (podShorts <= 8 ? 1 : podShorts <= 20 ? 2 : 3)
    : 0;

  return Math.max(dS1, dPb, dL1, dL2, dL3, dPd + podShortDays);
}

function calcDeliveryDays(
  quantities: Record<string, number>,
  podShorts: number,
  isExpress: boolean,
): string {
  const standard = calcDeliveryStandard(quantities, podShorts);
  if (standard === 0) return "—";

  if (!isExpress) {
    if (standard <= 1) return "24h";
    if (standard === 2) return "48h";
    return `${standard} jours`;
  }

  const s1 = (quantities["s1"] ?? 0) + (quantities["s2"] ?? 0);
  const pb = quantities["pb"] ?? 0;
  const l3 = quantities["l3"] ?? 0;
  const pd = quantities["pd"] ?? 0;

  const expressBlocked = s1 > 70 || pb > 70 || l3 > 4 || pd > 6;
  if (expressBlocked) {
    if (standard <= 1) return "24h";
    if (standard === 2) return "48h";
    return `${standard} jours`;
  }

  const exp = Math.max(1, Math.round(standard * 0.6));
  if (exp <= 1) return "24h";
  if (exp === 2) return "48h";
  return `${exp} jours`;
}

function formatLabel(key: string): string {
  for (const cat of FORMAT_CATEGORIES) {
    const f = cat.formats.find((x) => x.key === key);
    if (f) return `${f.name}${"dur" in f && f.dur ? ` (${f.dur})` : ""}`;
  }
  return key;
}

const FORMAT_HINTS: Record<string, string> = {
  s1: "Facecam · UGC · cut dynamique",
  s2: "Storytelling vertical développé",
  pb: "Spot pub · hook fort · CTA",
  l1: "Capsules · tutos courts · review",
  l2: "Vlog dense · entretien · docu court",
  l3: "Documentaire · masterclass · marque",
  pd: "Multi-cam · sync audio · chapitrage",
};

/* ─── FormatCard ──────────────────────────────────────────────────────────── */
function FormatCard({
  fmt,
  qty,
  onTick,
  theme,
  variant,
  solo = false,
}: {
  fmt: any;
  qty: number;
  onTick: (d: number) => void;
  theme: any;
  variant: string;
  solo?: boolean;
}) {
  const active = qty > 0;
  const hint = FORMAT_HINTS[fmt.key as string] ?? "";

  const activeAccent = variant === "surmesure" ? "text-[#c4b5fd]" : "text-[#a8632d]";
  const activeDurBadge = variant === "surmesure"
    ? "bg-[#a78bfa]/20 border-[#a78bfa]/35 text-[#c4b5fd]"
    : "bg-[#a8632d]/10 border-[#a8632d]/25 text-[#a8632d]";
  const inactiveDurBadge = theme.isDark
    ? "bg-white/5 border-white/10 text-white/45"
    : "bg-foreground/5 border-foreground/10 text-[#1a1410]/45";

  const durBadge = active ? activeDurBadge : inactiveDurBadge;

  const stepperBtnBase = theme.isDark
    ? "bg-white/5 text-white hover:bg-white/10"
    : "bg-white border border-foreground/10 text-[#1a1410] hover:bg-foreground/5 shadow-xs";
  const stepperBtnPlus = theme.isDark
    ? "bg-white/10 text-white hover:bg-white/20"
    : "bg-white border border-foreground/10 text-[#1a1410] hover:bg-foreground/5 shadow-xs";

  function Stepper({ size }: { size: "sm" | "lg" }) {
    const h = size === "lg" ? "h-9 w-9" : "h-8 w-8";
    const textSz = size === "lg" ? "text-sm" : "text-xs";
    const numW = size === "lg" ? "w-7 text-base" : "w-6 text-sm";
    return (
      <div className={`flex items-center gap-2 rounded-full p-1 border ${theme.isDark ? "bg-white/5 border-white/5" : "bg-foreground/[0.03] border-foreground/5"}`}>
        <StepperButton
          delta={-1}
          onTick={onTick}
          disabled={qty === 0}
          className={`${h} rounded-full flex items-center justify-center ${textSz} font-bold transition disabled:opacity-20 cursor-pointer select-none ${stepperBtnBase}`}
        >
          −
        </StepperButton>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          min={0}
          value={qty}
          onChange={(e) => {
            const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
            if (!isNaN(v) && v >= 0) onTick(v - qty);
            else if (e.target.value === "") onTick(-qty);
          }}
          className={`${numW} text-center font-display font-bold tabular-nums bg-transparent border-none outline-none [appearance:textfield] ${active ? theme.textPrimary : theme.textMuted}`}
          aria-label="Quantité"
        />
        <StepperButton
          delta={1}
          onTick={onTick}
          className={`${h} rounded-full flex items-center justify-center ${textSz} font-bold transition cursor-pointer select-none ${stepperBtnPlus}`}
        >
          +
        </StepperButton>
      </div>
    );
  }

  if (solo) {
    return (
      <div className={`flex flex-col sm:flex-row sm:items-center gap-6 rounded-2xl border p-6 transition-all duration-300 ${getCardStyle(active, theme.isDark)}`}>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <h4 className={`text-base font-bold font-display ${theme.textPrimary}`}>{fmt.name}</h4>
            {"dur" in fmt && fmt.dur && (
              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border whitespace-nowrap ${durBadge}`}>
                {fmt.dur}
              </span>
            )}
          </div>
          <p className={`text-xs leading-relaxed mb-3 ${theme.textSecondary}`}>{fmt.desc}</p>
          <p className={`text-[10px] font-semibold tracking-wide ${active ? activeAccent : theme.textMuted}`}>{hint}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Multi-cam", "Sync audio", "Chapitrage", "Long format"].map((tag) => (
              <span key={tag} className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                theme.isDark ? "border-white/10 text-white/50" : "border-foreground/12 text-foreground/50"
              }`}>{tag}</span>
            ))}
          </div>
        </div>
        <div className={`flex flex-col items-center gap-2 shrink-0 pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l ${
          theme.isDark ? "border-white/[0.07]" : "border-foreground/8"
        }`}>
          <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.textMuted}`}>
            {"unitLabel" in fmt && fmt.unitLabel ? fmt.unitLabel : "Quantité"}
          </span>
          <Stepper size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${getCardStyle(active, theme.isDark)}`}>
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <h4 className={`text-sm font-bold leading-tight font-display ${theme.textPrimary}`}>{fmt.name}</h4>
          {"dur" in fmt && fmt.dur && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold border whitespace-nowrap ${durBadge}`}>
              {fmt.dur}
            </span>
          )}
        </div>
        <p className={`text-[10px] font-semibold tracking-wide ${active ? activeAccent : theme.textMuted}`}>{hint}</p>
        <p className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>{fmt.desc}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-foreground/5 pt-4">
        <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.textMuted}`}>
          {"unitLabel" in fmt && fmt.unitLabel ? fmt.unitLabel : "Quantité"}
        </span>
        <Stepper size="sm" />
      </div>
    </div>
  );
}

/* ─── PodcastShortsSection — shorts dérivés du podcast ───────────────────── */
function PodcastShortsSection({
  qty,
  onTick,
  theme,
  variant,
}: {
  qty: number;
  onTick: (d: number) => void;
  theme: Theme;
  variant: string;
}) {
  const active = qty > 0;
  const stepperBtnBase = theme.isDark
    ? "bg-white/5 text-white hover:bg-white/10"
    : "bg-white border border-foreground/10 text-[#1a1410] hover:bg-foreground/5 shadow-xs";
  const stepperBtnPlus = theme.isDark
    ? "bg-white/10 text-white hover:bg-white/20"
    : "bg-white border border-foreground/10 text-[#1a1410] hover:bg-foreground/5 shadow-xs";

  return (
    <div className={`mt-5 rounded-2xl border p-5 transition-all duration-300 ${getCardStyle(active, theme.isDark)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className={`text-sm font-bold font-display ${theme.textPrimary}`}>Shorts tirés du podcast</h4>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
              active
                ? variant === "surmesure" ? "bg-[#a78bfa]/20 border-[#a78bfa]/35 text-[#c4b5fd]" : "bg-[#a8632d]/10 border-[#a8632d]/25 text-[#a8632d]"
                : theme.isDark ? "bg-white/5 border-white/10 text-white/45" : "bg-foreground/5 border-foreground/10 text-[#1a1410]/45"
            }`}>
              10€ / clip
            </span>
          </div>
          <p className={`mt-1.5 text-xs leading-relaxed ${theme.textSecondary}`}>
            Clips verticaux extraits et reformatés depuis vos épisodes — prêts pour TikTok, Reels et YouTube Shorts.
          </p>
        </div>
        <div className={`flex flex-col items-center gap-2 shrink-0 pt-4 sm:pt-0 sm:pl-5 border-t sm:border-t-0 sm:border-l ${
          theme.isDark ? "border-white/[0.07]" : "border-foreground/8"
        }`}>
          <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.textMuted}`}>Nombre de clips</span>
          <div className={`flex items-center gap-2 rounded-full p-1 border ${theme.isDark ? "bg-white/5 border-white/5" : "bg-foreground/[0.03] border-foreground/5"}`}>
            <StepperButton
              delta={-1}
              onTick={onTick}
              disabled={qty === 0}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition disabled:opacity-20 cursor-pointer select-none ${stepperBtnBase}`}
            >
              −
            </StepperButton>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              value={qty}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                if (!isNaN(v) && v >= 0) onTick(v - qty);
                else if (e.target.value === "") onTick(-qty);
              }}
              className={`w-7 text-center font-display text-base font-bold tabular-nums bg-transparent border-none outline-none [appearance:textfield] ${active ? theme.textPrimary : theme.textMuted}`}
              aria-label="Nombre de clips podcast"
            />
            <StepperButton
              delta={1}
              onTick={onTick}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition cursor-pointer select-none ${stepperBtnPlus}`}
            >
              +
            </StepperButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export function DevisBuilder({
  open,
  variant = "essentiel",
  onClose,
}: {
  open: boolean;
  variant?: "essentiel" | "surmesure";
  onClose?: () => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial = { ...EMPTY_QTY };
    initial["s1"] = variant === "surmesure" ? 4 : 1;
    return initial;
  });
  // Shorts dérivés du podcast (section spéciale)
  const [podShorts, setPodShorts] = useState(0);

  const [activeTab, setActiveTab] = useState<string>("short");
  const [lvl, setLvl] = useState(0);
  const [opts, setOpts] = useState<Record<string, boolean>>({});
  const [express, setExpress] = useState(false);
  const [duration, setDuration] = useState<"one-shot" | "multishoot">("one-shot");
  const [frequency, setFrequency] = useState(MULTISHOOT_FREQUENCIES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (open) {
      const el = document.getElementById("devis-builder");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [open]);

  // Reset express si la commande devient trop lourde pour l'offrir
  useEffect(() => {
    if (!express) return;
    const s1total = (quantities["s1"] ?? 0) + (quantities["s2"] ?? 0);
    const pbTotal = quantities["pb"] ?? 0;
    const l3Total = quantities["l3"] ?? 0;
    const pdTotal = quantities["pd"] ?? 0;
    if (s1total > 70 || pbTotal > 70 || l3Total > 4 || pdTotal > 6) {
      setExpress(false);
    }
  }, [quantities, podShorts, express]);

  const theme = useMemo(() => buildTheme(variant === "surmesure"), [variant]);

  const pricing = useMemo(() => {
    const mult = LEVEL_MULT[lvl];

    const lineItems = ALL_KEYS.filter((k) => quantities[k] > 0).map((key) => {
      const qty = quantities[key];
      const basePrice = BASE_PRICES[key];

      let calcResult: { total: number; unitAvg: number };
      if (key === "s1" || key === "s2" || key === "pb") {
        calcResult = calcShortTotal(basePrice, qty);
      } else if (key === "l1" || key === "l2" || key === "l3") {
        calcResult = calcLongTotal(basePrice, qty);
      } else if (key === "pd") {
        calcResult = calcPodTotal(basePrice, qty);
      } else {
        calcResult = { total: basePrice * qty, unitAvg: basePrice };
      }

      const total = Math.round(calcResult.total * mult);
      const unitFinal = Math.round(calcResult.unitAvg * mult);
      return { key, label: formatLabel(key), qty, unitBase: basePrice, unitFinal, total };
    });

    // Shorts dérivés du podcast (10€ base, mêmes tranches que les shorts classiques)
    const podShortItems = podShorts > 0
      ? (() => {
          const { total: psTotal, unitAvg: psAvg } = calcShortTotal(10, podShorts);
          return [{
            key: "pod-short",
            label: "Clips courts (podcast)",
            qty: podShorts,
            unitBase: 10,
            unitFinal: Math.round(psAvg * mult),
            total: Math.round(psTotal * mult),
          }];
        })()
      : [];

    const allItems = [...lineItems, ...podShortItems];
    const totalVideos = allItems.reduce((s, l) => s + l.qty, 0);
    const videoTotal = allItems.reduce((s, l) => s + l.total, 0);

    const optPerVid = OPTIONS.reduce((s, o) => (opts[o.k] ? s + o.p : s), 0);
    const optionTotal = optPerVid * totalVideos;
    const subtotal = videoTotal + optionTotal;

    // Multishoot : −15% fixe si collaboration mensuelle enchaînée
    const multiDisc = duration === "multishoot" ? 0.15 : 0;
    const discAmt = multiDisc > 0 ? Math.round(subtotal * multiDisc) : 0;
    const afterDisc = subtotal - discAmt;
    const expressAdd = express ? Math.round(afterDisc * EXPRESS_RATE) : 0;
    const total = afterDisc + expressAdd;

    const selectedOptions = OPTIONS.filter((o) => opts[o.k]);
    const delivery = calcDeliveryDays(quantities, podShorts, express);

    return {
      lineItems: allItems,
      totalVideos,
      videoTotal,
      optionTotal,
      optPerVid,
      subtotal,
      multiDisc,
      discAmt,
      afterDisc,
      expressAdd,
      total,
      selectedOptions,
      delivery,
    };
  }, [quantities, podShorts, lvl, opts, express, duration]);

  function setQty(key: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] ?? 0) + delta),
    }));
  }

  // Quand on passe podcast à 0, on remet aussi podShorts à 0
  function setQtyPod(delta: number) {
    setQuantities((prev) => {
      const next = Math.max(0, (prev["pd"] ?? 0) + delta);
      if (next === 0) setPodShorts(0);
      return { ...prev, pd: next };
    });
  }

  function setPodShortsDelta(delta: number) {
    setPodShorts((prev) => Math.max(0, prev + delta));
  }

  function buildEmailBody(): string {
    const { lineItems, selectedOptions, subtotal, discAmt, expressAdd, total, totalVideos, optionTotal } = pricing;
    const lines: string[] = [
      "—— DEVIS VIZIOCRAFT — DÉTAIL COMPLET ——",
      "",
      `Formule: ${variant === "surmesure" ? "Production sur mesure" : "Montage essentiel"}`,
      `Niveau de montage: ${LEVELS[lvl].name} (×${LEVEL_MULT[lvl]})`,
      "",
      "── VIDÉOS ──",
    ];

    if (lineItems.length === 0) {
      lines.push("  (aucune vidéo)");
    } else {
      lineItems.forEach((l) => {
        lines.push(
          `  • ${l.qty}× ${l.label}`,
          `    ${l.unitFinal}€/u → ${l.total}€`
        );
      });
    }

    if (selectedOptions.length > 0 && totalVideos > 0) {
      lines.push("", "── OPTIONS COMPLÉMENTAIRES ──");
      selectedOptions.forEach((o) => {
        lines.push(`  • ${o.k}: +${o.p}€/vid × ${totalVideos} = +${o.p * totalVideos}€`);
      });
    }

    lines.push("", "── COLLABORATION ──", `  Mode: ${duration === "multishoot" ? "Multishoot mensuel (−15%)" : "One shot"}`);
    if (duration === "multishoot") {
      lines.push(`  Fréquence: ${frequency}`);
      if (discAmt > 0) lines.push(`  Réduction mensuelle: −15% = −${discAmt}€`);
    }

    lines.push(
      "",
      "── LIVRAISON ──",
      `  ${express ? `Express prioritaire (+${Math.round(EXPRESS_RATE * 100)}%) = +${expressAdd}€` : `Standard (${pricing.delivery})`}`,
      "",
      "── TOTAL ──",
      `  Sous-total: ${subtotal}€`
    );
    if (discAmt > 0) lines.push(`  Après réduction multishoot: ${subtotal - discAmt}€`);
    if (expressAdd > 0) lines.push(`  Majoration express: +${expressAdd}€`);
    lines.push(`  TOTAL ESTIMÉ: ${total}€`);

    if (message.trim()) {
      lines.push("", "── MESSAGE CLIENT ──", message.trim());
    }
    return lines.join("\n");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || pricing.totalVideos === 0) return;
    setStatus("loading");
    const fd = new FormData();
    fd.append("_subject", `Devis VizioCraft — ${pricing.total}€ — ${name}`);
    fd.append("Formule", variant === "surmesure" ? "Production sur mesure" : "Montage essentiel");
    fd.append("Nom", name);
    fd.append("Email", email);
    fd.append("Téléphone", phone || "—");
    fd.append(
      "Détail vidéos",
      pricing.lineItems.map((l) => `${l.qty}× ${l.label} (${LEVELS[lvl].name}) = ${l.total}€`).join("\n")
    );
    fd.append("Niveau de montage", `${LEVELS[lvl].name} (×${LEVEL_MULT[lvl]})`);
    fd.append(
      "Options",
      pricing.selectedOptions.length > 0
        ? pricing.selectedOptions.map((o) => `${o.k} (+${o.p * pricing.totalVideos}€)`).join(", ")
        : "Aucune"
    );
    fd.append(
      "Collaboration",
      duration === "multishoot"
        ? `Multishoot mensuel — ${frequency} — −15% appliqué`
        : "One shot — commande unique"
    );
    fd.append(
      "Livraison",
      express ? `Express prioritaire (+${Math.round(EXPRESS_RATE * 100)}%)` : `Standard (${pricing.delivery})`
    );
    fd.append("Récapitulatif complet", buildEmailBody());
    fd.append("Total estimé", `${pricing.total}€`);
    fd.append("Message", message);
    try {
      const res = await fetch(FORMSPREE, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  const summaryLine =
    pricing.totalVideos === 0
      ? "Sélectionnez vos formats ci-dessus."
      : `${pricing.totalVideos} vidéo${pricing.totalVideos > 1 ? "s" : ""} — ${LEVELS[lvl].name}${
          duration === "multishoot" ? " — Multishoot mensuel" : " — One shot"
        }${express ? " — Express" : ` — ${pricing.delivery}`}`;

  const podQty = quantities["pd"] ?? 0;

  return (
    <div id="devis-builder" className="w-full">
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.25fr_1fr] items-start">
        <div className={`rounded-[2rem] border ${theme.containerBg} p-6 sm:p-8 space-y-10 shadow-xl relative`}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 hover:bg-muted"
            >
              ×
            </button>
          )}

          <header>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] ${theme.badgeText}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {variant === "surmesure" ? "Production sur mesure" : "Montage essentiel"}
            </span>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold">Configurez votre production</h3>
            <p className={`mt-1.5 text-sm ${theme.mutedText}`}>
              Bibliothèque de formats, niveaux de montage différenciés, devis ligne par ligne.
            </p>
          </header>

          <div className="space-y-10 border-t border-foreground/10 pt-8">

            {/* ── STEP 1 : Formats & quantités ── */}
            <Step n="1" title="Formats & quantités" theme={theme}>
              <p className={`text-xs mb-5 ${theme.mutedText}`}>
                Sélectionnez la catégorie, ajustez la quantité. Maintenez le bouton + ou − pour aller vite, ou saisissez directement.
              </p>

              {/* Onglets */}
              <div className={`flex p-1 rounded-full border mb-6 ${theme.isDark ? "bg-white/5 border-white/10" : "bg-foreground/[0.03] border-foreground/5"}`}>
                {FORMAT_CATEGORIES.map((cat) => {
                  const isActive = activeTab === cat.id;
                  const count = cat.formats.reduce((s, f) => s + (quantities[f.key] ?? 0), 0)
                    + (cat.id === "pod" ? podShorts : 0);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setActiveTab(cat.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? variant === "surmesure"
                            ? "bg-gradient-to-r from-[#a78bfa] to-[#ec4899] text-white shadow-sm"
                            : "bg-[#a8632d] text-white shadow-sm"
                          : theme.isDark
                            ? "text-white/60 hover:text-white"
                            : "text-[#1a1410]/60 hover:text-[#1a1410]"
                      }`}
                    >
                      <CatIcon id={cat.id} className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.title}</span>
                      {count > 0 && (
                        <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-extrabold ${
                          isActive
                            ? "bg-white text-black"
                            : variant === "surmesure"
                              ? "bg-[#a78bfa]/20 text-[#c4b5fd]"
                              : "bg-[#a8632d]/10 text-[#a8632d]"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Grille de cartes */}
              {(() => {
                const activeCategory = FORMAT_CATEGORIES.find((c) => c.id === activeTab);
                if (!activeCategory) return null;
                const isSolo = activeCategory.formats.length === 1;
                const gridCols = isSolo ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
                const isPodTab = activeTab === "pod";

                return (
                  <div key={activeTab}>
                    <p className={`text-sm mb-4 ${theme.mutedText}`}>{activeCategory.subtitle}</p>
                    <div className={`grid ${gridCols} gap-4`}>
                      {activeCategory.formats.map((fmt) => {
                        const qty = quantities[fmt.key] ?? 0;
                        const tickFn = fmt.key === "pd"
                          ? (d: number) => setQtyPod(d)
                          : (d: number) => setQty(fmt.key, d);
                        return (
                          <FormatCard
                            key={fmt.key}
                            fmt={fmt}
                            qty={qty}
                            onTick={tickFn}
                            theme={theme}
                            variant={variant}
                            solo={isSolo}
                          />
                        );
                      })}
                    </div>

                    {/* Section shorts podcast — animée selon podQty */}
                    {isPodTab && (
                      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
                        podQty > 0 ? "max-h-[300px] opacity-100 mt-5" : "max-h-0 opacity-0 mt-0 pointer-events-none"
                      }`}>
                        <PodcastShortsSection
                          qty={podShorts}
                          onTick={setPodShortsDelta}
                          theme={theme}
                          variant={variant}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
            </Step>

            {/* ── STEP 2 : Niveau de montage ── */}
            <Step n="2" title="Niveau de montage" theme={theme}>
              <div className="grid gap-4 sm:grid-cols-3">
                {LEVELS.map((l, idx) => {
                  const on = lvl === idx;
                  return (
                    <button
                      type="button"
                      key={l.name}
                      onClick={() => setLvl(idx)}
                      className={`rounded-xl border p-4 text-left transition-all duration-200 ${on ? theme.btnActive : theme.btnInactive}`}
                    >
                      <h4 className={`font-display text-sm font-bold ${theme.textPrimary}`}>{l.name}</h4>
                      <p className={`text-[11px] mt-0.5 ${theme.textSecondary}`}>{l.multLabel}</p>
                      {l.includes && (
                        <span className="mt-2 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {l.includes}
                        </span>
                      )}
                      <ul className="mt-3 space-y-0.5">
                        {l.bullets.map((b) => (
                          <li key={b} className={`text-[10px] pl-2.5 relative before:content-['·'] before:absolute before:left-0 ${theme.textSecondary}`}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* ── STEP 3 : Options ── */}
            <Step n="3" title="Options complémentaires" hint="par vidéo · optionnel" theme={theme}>
              <div className="grid gap-2 sm:grid-cols-2">
                {OPTIONS.map((o) => {
                  const on = !!opts[o.k];
                  return (
                    <button
                      type="button"
                      key={o.k}
                      onClick={() => setOpts((p) => ({ ...p, [o.k]: !p[o.k] }))}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition duration-300 ${getCardStyle(on, theme.isDark)}`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] ${
                        on
                          ? theme.isDark ? "bg-[#a78bfa] border-[#a78bfa] text-[#110922]" : "bg-[#a8632d] border-[#a8632d] text-white"
                          : "border-foreground/25"
                      }`}>
                        {on ? "✓" : ""}
                      </span>
                      <span className={`flex-1 text-xs font-semibold ${theme.textPrimary}`}>{o.k}</span>
                      <span className={`text-[11px] font-bold ${theme.isDark ? "text-[#c4b5fd]" : "text-[#a8632d]"}`}>
                        +{o.p}€
                      </span>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* ── STEP 4 : Durée de collaboration ── */}
            <Step n="4" title="Durée de collaboration" theme={theme}>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    key: "one-shot" as const,
                    label: "One shot",
                    hint: "Commande unique, sans engagement. Prix fermes, livraison ciblée.",
                  },
                  {
                    key: "multishoot" as const,
                    label: "Multishoot mensuel",
                    hint: "Collaboration enchaînée chaque mois. Réduction de 15% appliquée sur chaque commande.",
                  },
                ].map((d) => (
                  <button
                    type="button"
                    key={d.key}
                    onClick={() => setDuration(d.key)}
                    className={`rounded-xl border p-4 text-left transition-all ${duration === d.key ? theme.btnActive : theme.btnInactive}`}
                  >
                    <h4 className={`font-semibold text-sm ${theme.textPrimary}`}>{d.label}</h4>
                    {duration === d.key && d.key === "multishoot" && (
                      <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        −15% sur le total
                      </span>
                    )}
                    <p className={`text-xs mt-2 leading-relaxed ${theme.textSecondary}`}>{d.hint}</p>
                  </button>
                ))}
              </div>

              {/* Fréquence de livraison (multishoot seulement) */}
              <div className={`overflow-hidden transition-all duration-300 ${
                duration === "multishoot" ? "max-h-[200px] opacity-100 mt-5" : "max-h-0 opacity-0"
              }`}>
                <div className={`rounded-xl border ${theme.nestedBorder} p-4 sm:p-5`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${theme.textMuted}`}>
                    Fréquence des livraisons
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MULTISHOOT_FREQUENCIES.map((label) => (
                      <button
                        type="button"
                        key={label}
                        onClick={() => setFrequency(label)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${
                          frequency === label ? theme.btnActive : theme.btnInactive
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Step>

            {/* ── STEP 5 : Délai de livraison ── */}
            <Step n="5" title="Délai de livraison" theme={theme}>
              {(() => {
                const s1total = (quantities["s1"] ?? 0) + (quantities["s2"] ?? 0) + podShorts;
                const pbTotal = quantities["pb"] ?? 0;
                const l3Total = quantities["l3"] ?? 0;
                const pdTotal = quantities["pd"] ?? 0;
                const expressBlocked = s1total > 70 || pbTotal > 70 || l3Total > 4 || pdTotal > 6;

                // Si express était sélectionné mais que la commande est devenue trop lourde, on reset
                if (expressBlocked && express) {
                  // On ne peut pas appeler setExpress ici directement (render), on gère visuellement
                }

                return (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        e: false,
                        t: "Standard",
                        s: pricing.delivery,
                        sub: "Inclus",
                        blocked: false,
                      },
                      {
                        e: true,
                        t: "Express prioritaire",
                        s: expressBlocked
                          ? "Non disponible pour ce volume"
                          : calcDeliveryDays(quantities, podShorts, true),
                        sub: expressBlocked
                          ? "Volume trop important pour ce délai"
                          : `+${Math.round(EXPRESS_RATE * 100)}% du total`,
                        blocked: expressBlocked,
                      },
                    ].map((d) => {
                      const on = express === d.e && !d.blocked;
                      return (
                        <button
                          type="button"
                          key={d.t}
                          disabled={d.blocked}
                          onClick={() => !d.blocked && setExpress(d.e)}
                          className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                            d.blocked
                              ? theme.isDark
                                ? "border-white/5 bg-white/[0.01] opacity-40 cursor-not-allowed"
                                : "border-foreground/5 bg-foreground/[0.02] opacity-40 cursor-not-allowed"
                              : getCardStyle(on, theme.isDark)
                          }`}
                        >
                          <div className={`font-semibold text-sm ${theme.textPrimary}`}>{d.t}</div>
                          <div className={`text-sm mt-1 font-semibold ${theme.textPrimary}`}>{d.s}</div>
                          <div className={`text-xs mt-0.5 ${theme.textSecondary} opacity-90`}>{d.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </Step>
          </div>
        </div>

        {/* ── PANNEAU RÉCAP ── */}
        <div className={`rounded-[2rem] border ${theme.containerBg} p-6 sm:p-8 space-y-5 shadow-xl lg:sticky lg:top-28 ${theme.panelGlow}`}>
          <div>
            <h4 className={`font-display text-xl sm:text-2xl font-bold ${theme.textPrimary}`}>Votre estimation</h4>
            <p className={`text-xs mt-1 ${theme.mutedText}`}>{summaryLine}</p>
          </div>

          <div className={`rounded-2xl border ${theme.nestedBorder} ${theme.recapBg} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-foreground/10">
              <p className={`text-xs font-semibold ${theme.textPrimary}`}>Récapitulatif du devis</p>
            </div>
            <div className="p-4 space-y-0.5 text-xs">
              {pricing.lineItems.length === 0 ? (
                <p className={`opacity-50 py-2 text-center ${theme.textSecondary}`}>Aucun format sélectionné.</p>
              ) : (
                <>
                  {pricing.lineItems.map((l) => (
                    <RecapRow
                      key={l.key}
                      label={`${l.qty}× ${l.label} (${LEVELS[lvl].name})`}
                      value={`${l.total}€`}
                      theme={theme}
                    />
                  ))}
                  {pricing.selectedOptions.map((o) => (
                    <RecapRow
                      key={o.k}
                      label={`Option : ${o.k} ×${pricing.totalVideos}`}
                      value={`+${o.p * pricing.totalVideos}€`}
                      theme={theme}
                    />
                  ))}
                  {pricing.discAmt > 0 && (
                    <RecapRow
                      label="Réduction multishoot mensuel"
                      value={`−${pricing.discAmt}€`}
                      accent="disc"
                      theme={theme}
                    />
                  )}
                  {pricing.expressAdd > 0 && (
                    <RecapRow label="Supplément express prioritaire" value={`+${pricing.expressAdd}€`} accent="warn" theme={theme} />
                  )}
                </>
              )}
            </div>
            <div className="border-t border-foreground/10 px-4 py-4 flex items-end justify-between gap-3">
              <div className={`text-[11px] space-y-0.5 ${theme.textSecondary}`}>
                {pricing.subtotal > 0 && pricing.discAmt + pricing.expressAdd > 0 && (
                  <span className="line-through block opacity-60">{pricing.subtotal}€</span>
                )}
                {pricing.totalVideos > 0 && (
                  <span>
                    {pricing.totalVideos} vidéo{pricing.totalVideos > 1 ? "s" : ""} · {LEVELS[lvl].name}
                  </span>
                )}
              </div>
              <div className="text-right">
                {(pricing.discAmt > 0 || pricing.expressAdd > 0) && pricing.subtotal > 0 && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5 font-medium">
                    {[
                      pricing.discAmt > 0 ? "Collab −15%" : "",
                      pricing.expressAdd > 0 ? "Express +35%" : "",
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}
                <AnimatedPrice total={pricing.total} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.textMuted}`}>Vos coordonnées</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Inp theme={theme} v={name} set={setName} ph="Nom complet *" />
              <Inp theme={theme} v={email} set={setEmail} ph="Email *" type="email" />
              <Inp theme={theme} v={phone} set={setPhone} ph="Téléphone" type="tel" />
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Précisions sur votre projet (facultatif)..."
              rows={3}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${theme.inputBg}`}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || !name || !email || pricing.totalVideos === 0}
            className={`inline-flex w-full items-center justify-center rounded-full ${theme.submit} px-6 py-4 text-sm font-semibold transition disabled:opacity-40`}
          >
            {status === "loading" ? "Envoi en cours…" : "Envoyer mon devis complet →"}
          </button>

          {status === "success" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600">
              Devis envoyé. Récapitulatif détaillé transmis par mail — nous revenons vers vous très rapidement.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
              L&apos;envoi a échoué. Réessayez ou vérifiez vos informations.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

function RecapRow({
  label,
  value,
  accent,
  theme,
}: {
  label: string;
  value: string;
  accent?: "disc" | "warn";
  theme: Theme;
}) {
  const textColor = accent === "disc"
    ? "text-emerald-600 dark:text-emerald-400"
    : accent === "warn"
      ? "text-amber-600 dark:text-amber-400"
      : theme.textSecondary;
  return (
    <div className={`flex justify-between gap-3 py-1.5 ${textColor}`}>
      <span className="opacity-90">{label}</span>
      <span className="font-semibold tabular-nums shrink-0">{value}</span>
    </div>
  );
}

function AnimatedPrice({ total }: { total: number }) {
  return (
    <span className="font-display text-3xl sm:text-4xl font-bold text-brand-gradient tabular-nums">
      {total}€
    </span>
  );
}

function Step({
  n,
  title,
  hint,
  children,
  theme,
}: {
  n: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <section className="space-y-4">
      <p className={`text-xs font-bold uppercase tracking-[0.18em] flex items-center gap-2.5 flex-wrap ${theme.textPrimary}`}>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${theme.stepNumBg}`}>
          {n}
        </span>
        {title}
        {hint && <span className={`text-[10px] normal-case font-medium opacity-75 ${theme.textSecondary}`}>{hint}</span>}
      </p>
      <div>{children}</div>
    </section>
  );
}

function Inp({
  v,
  set,
  ph,
  type = "text",
  theme,
}: {
  v: string;
  set: (s: string) => void;
  ph: string;
  type?: string;
  theme: Theme;
}) {
  return (
    <input
      value={v}
      onChange={(e) => set(e.target.value)}
      type={type}
      placeholder={ph}
      className={`rounded-xl border px-3.5 py-3 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${theme.inputBg}`}
    />
  );
}
