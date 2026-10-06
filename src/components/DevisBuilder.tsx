import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendDevisEmails } from "@/lib/brevo-email.server";

/**
 * SHOW_PRICES - contrôle l'affichage de tous les montants financiers dans le configurateur.
 * false = les prix sont masqués (logique de calcul conservée, email envoyé avec le total).
 * true  = comportement normal, tous les prix s'affichent.
 * Pour réactiver : passer à true.
 */
const SHOW_PRICES = false;

// Remplacé par API Brevo (voir /api/send-devis)
// const FORMSPREE = "https://formspree.io/f/maqkaznd";

const BASE_PRICES: Record<string, number> = {
  short: 45,
  ads: 48,
  podcast: 400,
  interview: 400,
  vlog: 150,
  documentaire: 150,
};
const EXPRESS_RATE = 0.35;

/**
 * Tranches marginales pour les shorts - ancre short = 45€.
 * Chaque unité est facturée au prix de sa tranche.
 * Le total est donc strictement croissant, sans rebond possible.
 *
 * Vérification clé (short) :
 *   10 shorts → 9×45 + 1×38 = 443€  (moy. 44,3€)
 *   20 shorts → +10×38 = 823€       (moy. 41,15€)
 *   30 shorts → +10×33+1×27 = 1186€ (one-shot) → ×0.85 = 1008€ multishoot ✓
 */
const SHORT_TIERS: { from: number; to: number; ref: number }[] = [
  { from: 1,   to: 9,        ref: 45   },
  { from: 10,  to: 19,       ref: 38   },
  { from: 20,  to: 29,       ref: 33   },
  { from: 30,  to: 49,       ref: 27   },
  { from: 50,  to: 79,       ref: 25   },
  { from: 80,  to: 119,      ref: 23   },
  { from: 120, to: 149,      ref: 22   },
  { from: 150, to: Infinity, ref: 21   },
];

/**
 * Calcule le total en tranches pour `qty` unités d'un short de prix de base `basePrice`.
 * Le ratio de chaque tranche est calculé par rapport à l'ancre s1=28€.
 * unitAvg = prix moyen arrondi (affiché en récap).
 */
function calcShortTotal(basePrice: number, qty: number): { total: number; unitAvg: number } {
  if (qty <= 0) return { total: 0, unitAvg: basePrice };
  const anchor = 45; // Nouveau prix de référence pour short
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
 * Ratios appliqués sur le prix de base de chaque format (podcast=400, interview=400, vlog=150, documentaire=150).
 *
 *  1-2  -> prix plein
 *  3-5  -> -5%
 *  6-10 -> -8%
 * 11-15 -> -11%
 * 16+   -> -14%
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



/** 2 familles distinctes */
const FORMAT_CATEGORIES = [
  {
    id: "short",
    title: "Formats Courts",
    subtitle: "Reels, TikTok, Ads",
    formats: [
      { key: "short", name: "Short", desc: "Contenu vertical - Reels, TikTok, facecam, UGC", dur: "" },
      { key: "ads", name: "Ads", desc: "Spot publicitaire - hook, CTA, rythme serré", dur: "" },
    ],
  },
  {
    id: "long",
    title: "Formats Longs",
    subtitle: "Contenus 0-15min",
    formats: [
      { key: "podcast", name: "Podcast", desc: "Épisode podcast filmé", dur: "0-15 min" },
      { key: "interview", name: "Interview", desc: "Entretien filmé", dur: "0-15 min" },
      { key: "vlog", name: "Vlog", desc: "Vlog personnel ou lifestyle", dur: "0-15 min" },
      { key: "documentaire", name: "Documentaire", desc: "Contenu documentaire court", dur: "0-15 min" },
    ],
  },
] as const;

const MULTISHOOT_FREQUENCIES = [
  "Continue au fil du montage",
  "Hebdomadaire",
  "En lot unique à la fin",
];

const OPTIONS = [
  { k: "Sous-titres animés", p: 15 },
  { k: "Motion design", p: 30 },
  { k: "Voix-off / narration", p: 20 },
  { k: "Illustration", p: 15 },
];

const ALL_KEYS = Object.keys(BASE_PRICES);
const EMPTY_QTY = Object.fromEntries(ALL_KEYS.map((k) => [k, 0]));

/* --- useHoldCounter - incrément continu au maintien ---- */
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

/* --- StepperButton - bouton + / - avec long-press ----------------------- */
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
 * Délais de livraison - 12 monteurs en relais 7j/7
 * (logique par famille de contenu, goulot d'étranglement = le max)
 */
function calcDeliveryStandard(quantities: Record<string, number>): number {
  const short = (quantities["short"] ?? 0);
  const ads = quantities["ads"] ?? 0;
  const podcast = quantities["podcast"] ?? 0;
  const interview = quantities["interview"] ?? 0;
  const vlog = quantities["vlog"] ?? 0;
  const documentaire = quantities["documentaire"] ?? 0;

  // Délais pour formats courts
  let dShort = 0;
  const totalShorts = short + ads;
  if (totalShorts > 0) {
    if      (totalShorts <= 8)   dShort = 2;
    else if (totalShorts <= 20)  dShort = 3;
    else if (totalShorts <= 35)  dShort = 4;
    else if (totalShorts <= 50)  dShort = 5;
    else if (totalShorts <= 70)  dShort = 6;
    else                         dShort = 8 + Math.floor((totalShorts - 70) / 15);
  }

  // Délais pour podcasts
  let dPodcast = 0;
  if (podcast > 0) {
    if      (podcast <= 2)   dPodcast = 3;
    else if (podcast <= 6)   dPodcast = 5;
    else if (podcast <= 12)  dPodcast = 7;
    else                     dPodcast = 8 + Math.ceil((podcast - 12) / 2);
  }

  // Délais pour interviews
  let dInterview = 0;
  if (interview > 0) {
    if      (interview <= 2)   dInterview = 3;
    else if (interview <= 6)   dInterview = 5;
    else if (interview <= 12)  dInterview = 7;
    else                       dInterview = 8 + Math.ceil((interview - 12) / 2);
  }

  // Délais pour vlogs
  let dVlog = 0;
  if (vlog > 0) {
    if      (vlog <= 3)   dVlog = 2;
    else if (vlog <= 8)   dVlog = 4;
    else if (vlog <= 12)  dVlog = 6;
    else                  dVlog = 6 + Math.ceil((vlog - 12) / 3);
  }

  // Délais pour documentaires
  let dDoc = 0;
  if (documentaire > 0) {
    if      (documentaire === 1)  dDoc = 6;
    else if (documentaire <= 4)   dDoc = 10;
    else if (documentaire <= 8)   dDoc = 14;
    else                          dDoc = 14 + Math.ceil((documentaire - 8) * 2);
  }

  return Math.max(dShort, dPodcast, dInterview, dVlog, dDoc);
}

function calcDeliveryDays(
  quantities: Record<string, number>,
  isExpress: boolean,
): string {
  const standard = calcDeliveryStandard(quantities);
  if (standard === 0) return "-";

  if (!isExpress) {
    if (standard <= 1) return "24h";
    if (standard === 2) return "48h";
    return `${standard} jours`;
  }

  const totalShorts = (quantities["short"] ?? 0) + (quantities["ads"] ?? 0);
  const documentaire = quantities["documentaire"] ?? 0;
  const podcast = quantities["podcast"] ?? 0;

  const expressBlocked = totalShorts > 70 || documentaire > 4 || podcast > 6;
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
  short: "Facecam · UGC · cut dynamique",
  ads: "Spot pub · hook fort · CTA",
  podcast: "Multi-cam · sync audio · chapitrage",
  interview: "Entretien professionnel · 2 caméras",
  vlog: "Lifestyle · storytelling · montage fluide",
  documentaire: "Enquête · voix-off · montage narratif",
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
    const numW = size === "lg" ? "w-10 text-sm sm:text-base" : "w-8 text-xs sm:text-sm";
    return (
      <div className={`flex items-center gap-2 rounded-full p-1 border ${theme.isDark ? "bg-white/5 border-white/5" : "bg-foreground/[0.03] border-foreground/5"}`}>
        <StepperButton
          delta={-1}
          onTick={onTick}
          disabled={qty === 0}
          className={`${h} rounded-full flex items-center justify-center ${textSz} font-bold transition disabled:opacity-20 cursor-pointer select-none ${stepperBtnBase}`}
        >
          -
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
      <div className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${getCardStyle(active, theme.isDark)}`}>
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
    <div className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 lg:p-6 transition-all duration-300 ${getCardStyle(active, theme.isDark)} min-h-[180px] sm:min-h-[200px]`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className={`text-sm sm:text-base font-bold leading-tight font-display ${theme.textPrimary}`}>{fmt.name}</h4>
          {"dur" in fmt && fmt.dur && (
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold border whitespace-nowrap ${durBadge}`}>
              {fmt.dur}
            </span>
          )}
        </div>
        <p className={`text-[10px] sm:text-[11px] font-semibold tracking-wide ${active ? activeAccent : theme.textMuted}`}>{hint}</p>
        <p className={`text-[11px] sm:text-xs leading-relaxed ${theme.textSecondary}`}>{fmt.desc}</p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/5 pt-4">
        <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.textMuted}`}>
          {"unitLabel" in fmt && fmt.unitLabel ? fmt.unitLabel : "Quantité"}
        </span>
        <Stepper size="sm" />
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export function DevisBuilder({
  open,
  variant = "essentiel",
  onClose,
  adminMode = false,
}: {
  open: boolean;
  variant?: "essentiel" | "surmesure";
  onClose?: () => void;
  adminMode?: boolean;
}) {
  // En mode admin, on force l'affichage des prix
  const showPrices = adminMode || SHOW_PRICES;
  // Initialize with defaults first (server-side safe)
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial = { ...EMPTY_QTY };
    initial["short"] = 1; // Default: short = 1, everything else = 0
    return initial;
  });
  
  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('devis-quantities');
    if (saved) {
      try {
        setQuantities(JSON.parse(saved));
      } catch (e) {
        // If parsing fails, keep defaults
      }
    }
  }, []);
  
  // Shorts dérivés du podcast (section spéciale) - SUPPRIMÉ

  const [activeTab, setActiveTab] = useState<string>("short");
  
  useEffect(() => {
    const saved = localStorage.getItem('devis-activeTab');
    if (saved) setActiveTab(saved);
  }, []);
  
  // Niveau supprimé - plus utilisé
  
  const [opts, setOpts] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const saved = localStorage.getItem('devis-opts');
    if (saved) setOpts(JSON.parse(saved));
  }, []);
  
  const [express, setExpress] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('devis-express');
    if (saved) setExpress(saved === 'true');
  }, []);
  
  const [duration, setDuration] = useState<"one-shot" | "multishoot">("multishoot");
  
  useEffect(() => {
    const saved = localStorage.getItem('devis-duration');
    if (saved === 'one-shot' || saved === 'multishoot') setDuration(saved);
  }, []);
  
  const [frequency, setFrequency] = useState(MULTISHOOT_FREQUENCIES[0]);
  
  useEffect(() => {
    const saved = localStorage.getItem('devis-frequency');
    if (saved && MULTISHOOT_FREQUENCIES.includes(saved)) setFrequency(saved);
  }, []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formStarted, setFormStarted] = useState(false);

  useEffect(() => {
    if (open) {
      const el = document.getElementById("devis-builder");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [open]);

  // Save form state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('devis-quantities', JSON.stringify(quantities));
  }, [quantities]);

  useEffect(() => {
    localStorage.setItem('devis-activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('devis-opts', JSON.stringify(opts));
  }, [opts]);

  useEffect(() => {
    localStorage.setItem('devis-express', express.toString());
  }, [express]);

  useEffect(() => {
    localStorage.setItem('devis-duration', duration);
  }, [duration]);

  useEffect(() => {
    localStorage.setItem('devis-frequency', frequency);
  }, [frequency]);

  // Track when user starts filling the form
  useEffect(() => {
    if (!formStarted && (name || email)) {
      setFormStarted(true);
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'devis_form_start',
          form_variant: variant,
        });
      }
    }
  }, [name, email, formStarted, variant]);

  // Reset express si la commande devient trop lourde pour l'offrir
  useEffect(() => {
    if (!express) return;
    const totalShorts = (quantities["short"] ?? 0) + (quantities["ads"] ?? 0);
    const documentaire = quantities["documentaire"] ?? 0;
    const podcast = quantities["podcast"] ?? 0;
    if (totalShorts > 70 || documentaire > 4 || podcast > 6) {
      setExpress(false);
    }
  }, [quantities, express]);

  const theme = useMemo(() => buildTheme(variant === "surmesure"), [variant]);

  const pricing = useMemo(() => {
    const lineItems = ALL_KEYS.filter((k) => quantities[k] > 0).map((key) => {
      const qty = quantities[key];
      const basePrice = BASE_PRICES[key];

      let calcResult: { total: number; unitAvg: number };
      if (key === "short" || key === "ads") {
        calcResult = calcShortTotal(basePrice, qty);
      } else if (key === "podcast" || key === "interview" || key === "vlog" || key === "documentaire") {
        calcResult = calcLongTotal(basePrice, qty);
      } else {
        calcResult = { total: basePrice * qty, unitAvg: basePrice };
      }

      const total = calcResult.total;
      const unitFinal = calcResult.unitAvg;
      return { key, label: formatLabel(key), qty, unitBase: basePrice, unitFinal, total };
    });

    const allItems = lineItems;
    const totalVideos = allItems.reduce((s, l) => s + l.qty, 0);
    const videoTotal = allItems.reduce((s, l) => s + l.total, 0);

    const optPerVid = OPTIONS.reduce((s, o) => (opts[o.k] ? s + o.p : s), 0);
    const optionTotal = optPerVid * totalVideos;
    const subtotal = videoTotal + optionTotal;

    // Multishoot : -15% fixe si collaboration mensuelle enchainee
    const multiDisc = duration === "multishoot" ? 0.15 : 0;
    const discAmt = multiDisc > 0 ? Math.round(subtotal * multiDisc) : 0;
    const afterDisc = subtotal - discAmt;
    const expressAdd = express ? Math.round(afterDisc * EXPRESS_RATE) : 0;
    const total = afterDisc + expressAdd;

    const selectedOptions = OPTIONS.filter((o) => opts[o.k]);
    const delivery = calcDeliveryDays(quantities, express);

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
  }, [quantities, opts, express, duration]);

  function setQty(key: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] ?? 0) + delta),
    }));
  }

  /**
   * Corps du mail interne (reçu par VizioCraft) - version structurée.
   * Lisible d'un coup d'œil, sans bruit.
   */
  function buildInternalEmailBody(): string {
    const { lineItems, selectedOptions, discAmt, expressAdd, total, totalVideos } = pricing;
    const prenom = name.split(" ")[0];

    const sep = "────────────────────────────────────";
    const lines: string[] = [
      `Nouveau devis de ${name} <${email}>`,
      sep,
      "",
      "FORMATS SÉLECTIONNÉS",
    ];

    if (lineItems.length === 0) {
      lines.push("  (aucun format)");
    } else {
      lineItems.forEach((l) => {
        lines.push(`  • ${l.qty}× ${l.label}`);
      });
    }

    if (selectedOptions.length > 0) {
      lines.push("", "OPTIONS");
      selectedOptions.forEach((o) => lines.push(`  • ${o.k}`));
    }

    lines.push(
      "",
      "COLLABORATION",
      `  ${duration === "multishoot" ? `Multishoot mensuel - ${frequency}` : "One shot"}`,
      "",
      "DÉLAI DE LIVRAISON",
      `  ${express ? `Express prioritaire` : `Standard - ${pricing.delivery}`}`,
      "",
      sep,
      `TOTAL ESTIME : ${total}€`,
      `(${totalVideos} video${totalVideos > 1 ? "s" : ""}${discAmt > 0 ? " - reduction multishoot -15% appliquee" : ""}${expressAdd > 0 ? " - majoration express +35%" : ""})`,
      sep,
    );

    if (message.trim()) {
      lines.push("", "MESSAGE DU CLIENT", message.trim());
    }

    lines.push(
      "",
      "─── Répondre directement à cet email pour contacter le client ───",
      `Reply-To : ${name} <${email}>`,
    );

    // Unused variable suppression
    void prenom;
    return lines.join("\n");
  }

  /**
   * Corps du mail envoyé en copie au client (CC).
   * Ton propre, chaleureux, avec récap clair et CTA appel.
   */
  function buildClientEmailBody(): string {
    const { lineItems, selectedOptions, total, totalVideos } = pricing;
    const prenom = name.split(" ")[0];

    const lines: string[] = [
      `Salut ${prenom},`,
      "",
      "Merci d'avoir configuré ton projet sur VizioCraft !",
      "Voici le récapitulatif de ton estimation personnalisée.",
      "",
      "════════════════════════════════════",
      "   TON ESTIMATION VIZIOCRAFT 🎬",
      "════════════════════════════════════",
      "",
    ];

    // Tableau récap
    const col1 = 26;
    function row(label: string, value: string) {
      return `  ${label.padEnd(col1, ".")} ${value}`;
    }

    if (lineItems.length > 0) {
      lines.push("  FORMATS");
      lineItems.forEach((l) => {
        lines.push(row(`  ${l.qty}× ${l.label}`, `${l.total}€`));
      });
    }

    if (selectedOptions.length > 0) {
      lines.push("", "  OPTIONS");
      selectedOptions.forEach((o) => lines.push(`    • ${o.k}`));
    }

    lines.push(
      "",
      row("  Collaboration", duration === "multishoot" ? `Mensuelle - ${frequency}` : "One shot"),
      row("  Délai estimé", express ? "Express prioritaire" : pricing.delivery),
      "",
      "────────────────────────────────────",
      `  Prix estimé : ${total}€`,
      "────────────────────────────────────",
      "",
      "Cette estimation est calculée sur la base de tes choix.",
      "Elle peut être ajustée selon les détails de ton projet.",
      "",
      "════════════════════════════════════",
      "",
      "Envie d'affiner le projet ensemble ?",
      "Réservons 15 minutes pour valider les détails et",
      "répondre à toutes tes questions.",
      "",
      "  → Réserver un appel gratuit",
      "     https://viziocraft.com/#contact",
      "",
      "════════════════════════════════════",
      "",
      "Une question avant l'appel ?",
      "Réponds directement à cet email - on te revient sous 24h.",
      "",
      "À très vite,",
      "L'équipe VizioCraft",
      "contact@viziocraft.com | viziocraft.com",
    );

    // Unused variable suppression
    void totalVideos;
    return lines.join("\n");
  }

  // Function to reset form to defaults
  function resetForm() {
    const initial = { ...EMPTY_QTY };
    initial["short"] = 1;
    setQuantities(initial);
    setActiveTab("short");
    setOpts({});
    setExpress(false);
    setDuration("multishoot");
    setFrequency(MULTISHOOT_FREQUENCIES[0]);
    setName("");
    setEmail("");
    setMessage("");
    setStatus("idle");
    setFormStarted(false);
    
    // Clear localStorage
    localStorage.removeItem('devis-quantities');
    localStorage.removeItem('devis-activeTab');
    localStorage.removeItem('devis-opts');
    localStorage.removeItem('devis-express');
    localStorage.removeItem('devis-duration');
    localStorage.removeItem('devis-frequency');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || pricing.totalVideos === 0) return;
    setStatus("loading");

    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'devis_form_submit',
        form_variant: variant,
        total_videos: pricing.totalVideos,
        total_price: pricing.total,
      });
    }

    // Préparation des données pour Brevo
    const devisData = {
      formula: variant === "surmesure" ? "Production sur mesure" : "Montage essentiel",
      collaboration: duration === "multishoot" ? `Multishoot mensuel - ${frequency}` : "One shot",
      videos: pricing.lineItems.map((l) => ({
        type: l.label,
        qty: l.qty,
        unitPrice: l.unitFinal, // Prix moyen après remises (pour compatibilité)
        total: l.total,
        // Prix de depart avant remise de volume, et montant de la remise.
        // Servent uniquement a l'affichage (PDF + recap interne) : le total
        // et le prix final restent strictement inchanges.
        unitBase: l.unitBase, // Prix unitaire de base AVANT remises
        baseTotal: Math.round(l.unitBase * l.qty), // Total au prix de base
        discount: Math.round((l.unitBase * l.qty) - l.total), // Remise appliquée
      })),
      options: pricing.selectedOptions.map((o) => o.k),
      totalVideos: pricing.totalVideos,
      subtotal: pricing.subtotal,
      reduction: pricing.discAmt,
      express: express ? pricing.expressAdd : 0,
      totalFinal: pricing.total,
    };

    try {
      await sendDevisEmails({
        data: {
          name,
          email,
          company: "", // Pas de champ entreprise dans le form actuel
          message: message.trim(),
          devisData,
        },
      });

      setStatus("success");
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'devis_form_success',
          form_variant: variant,
          total_videos: pricing.totalVideos,
          total_price: pricing.total,
        });
      }
      resetForm();
    } catch (error) {
      console.error("Erreur envoi:", error);
      setStatus("error");
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({ event: 'devis_form_error', form_variant: variant });
      }
    }
  }

  if (!open) return null;

  const summaryLine =
    pricing.totalVideos === 0
      ? "Sélectionnez vos formats ci-dessus."
      : `${pricing.totalVideos} vidéo${pricing.totalVideos > 1 ? "s" : ""}${
          duration === "multishoot" ? " - Multishoot mensuel" : " - One shot"
        }${express ? " - Express" : ` - ${pricing.delivery}`}`;

  return (
    <div id="devis-builder" className="w-full pb-24 lg:pb-0 max-w-[100rem] mx-auto px-4 sm:px-6">
      <form onSubmit={submit} className="grid gap-6 sm:gap-8 lg:grid-cols-[1.3fr_1fr] xl:grid-cols-[1.4fr_1fr] items-start">
        <div className={`rounded-2xl sm:rounded-[2rem] border ${theme.containerBg} p-6 sm:p-8 lg:p-12 xl:p-14 space-y-8 sm:space-y-12 shadow-xl relative`}>
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] ${theme.badgeText}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {variant === "surmesure" ? "Production sur mesure" : "Montage essentiel"}
                </span>
                <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold">Configurez votre production</h3>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className={`p-2 rounded-full border ${theme.isDark ? "border-white/10 text-white/60 hover:text-white hover:bg-white/5" : "border-foreground/10 text-foreground/60 hover:text-foreground hover:bg-foreground/5"} transition`}
                aria-label="Réinitialiser"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          <div className="space-y-8 sm:space-y-12 border-t border-foreground/10 pt-6 sm:pt-10">

            {/* ── STEP 1 : Formats & quantités ── */}
            <Step n="1" title="Formats & quantités" theme={theme}>

              {adminMode ? (
                /* Mode Admin : Tous les formats affichés dans une grille complète */
                <div className="space-y-8">
                  {/* Prix unitaires affichés */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {FORMAT_CATEGORIES.flatMap((cat) =>
                      cat.formats.map((fmt) => {
                        const qty = quantities[fmt.key] ?? 0;
                        const basePrice = BASE_PRICES[fmt.key] ?? 0;
                        const tickFn = (d: number) => setQty(fmt.key, d);
                        
                        return (
                          <div key={fmt.key} className="relative">
                            <FormatCard
                              fmt={fmt}
                              qty={qty}
                              onTick={tickFn}
                              theme={theme}
                              variant={variant}
                            />
                            {/* Prix unitaire en badge admin */}
                            <div className="absolute -top-2 -right-2 bg-[#a78bfa] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              {basePrice}€
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Shorts podcast - supprimé car plus de système de clips dérivés */}
                </div>
              ) : (
                /* Mode Normal : Navigation par onglets */
                <>
                  {/* Onglets */}
                  <div className={`flex p-1.5 rounded-full border mb-6 sm:mb-8 ${theme.isDark ? "bg-white/5 border-white/10" : "bg-foreground/[0.03] border-foreground/5"}`}>
                    {FORMAT_CATEGORIES.map((cat) => {
                      const isActive = activeTab === cat.id;
                      const count = cat.formats.reduce((s, f) => s + (quantities[f.key] ?? 0), 0);
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setActiveTab(cat.id)}
                          className={`flex-1 flex items-center justify-center gap-2 sm:gap-2.5 py-2 sm:py-2.5 px-3 sm:px-4 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                            isActive
                              ? variant === "surmesure"
                                ? "bg-gradient-to-r from-[#a78bfa] to-[#ec4899] text-white shadow-md"
                                : "bg-[#a8632d] text-white shadow-md"
                              : theme.isDark
                                ? "text-white/60 hover:text-white"
                                : "text-[#1a1410]/60 hover:text-[#1a1410]"
                          }`}
                        >
                          <CatIcon id={cat.id} className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">{cat.title}</span>
                          <span className="sm:hidden">
                            {cat.id === "short" ? "Courts" : "Longs"}
                          </span>
                          {count > 0 && (
                            <span className={`min-w-[1.25rem] px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-extrabold ${
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
                    const isSolo = false; // Plus de formats solo maintenant
                    // Optimisation des grilles pour une meilleure utilisation de l'espace
                    const gridCols = activeCategory.id === "long" 
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2" 
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2";
                    return (
                      <div key={activeTab}>
                        <p className={`text-sm mb-6 ${theme.mutedText}`}>{activeCategory.subtitle}</p>
                        <div className={`grid ${gridCols} gap-5 sm:gap-6`}>
                          {activeCategory.formats.map((fmt) => {
                            const qty = quantities[fmt.key] ?? 0;
                            const tickFn = (d: number) => setQty(fmt.key, d);
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

                        {/* Section shorts podcast - supprimée */}
                      </div>
                    );
                  })()}
                </>
              )}
            </Step>

            {/* ── STEP 2 : Options ── */}
            <Step n="2" title="Options complémentaires" hint="par vidéo · optionnel" theme={theme}>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {OPTIONS.map((o) => {
                  const on = !!opts[o.k];
                  return (
                    <button
                      type="button"
                      key={o.k}
                      onClick={() => setOpts((p) => ({ ...p, [o.k]: !p[o.k] }))}
                      className={`flex items-center gap-3 sm:gap-4 rounded-xl border px-4 py-3.5 text-left transition duration-300 ${getCardStyle(on, theme.isDark)}`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] ${
                        on
                          ? theme.isDark ? "bg-[#a78bfa] border-[#a78bfa] text-[#110922]" : "bg-[#a8632d] border-[#a8632d] text-white"
                          : "border-foreground/25"
                      }`}>
                        {on ? "✓" : ""}
                      </span>
                      <span className={`flex-1 text-xs font-semibold ${theme.textPrimary}`}>{o.k}</span>
                      {/* SHOW_PRICES: prix option - masqué si false */}
                      {showPrices && (
                        <span className={`text-[11px] font-bold ${theme.isDark ? "text-[#c4b5fd]" : "text-[#a8632d]"}`}>
                          +{o.p}€
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* ── STEP 3 : Durée de collaboration ── */}
            <Step n="3" title="Durée de collaboration" theme={theme}>
              <div className="grid gap-4 sm:gap-5 lg:grid-cols-1 xl:grid-cols-2">
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
                    className={`rounded-xl border p-4 sm:p-5 text-left transition-all ${duration === d.key ? theme.btnActive : theme.btnInactive}`}
                  >
                    <h4 className={`font-semibold text-sm ${theme.textPrimary}`}>{d.label}</h4>
                    {duration === d.key && d.key === "multishoot" && (
                      <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        -15% sur le total
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

            {/* ── STEP 5 : Délai de livraison ── MASQUÉ */}
            {false && (
            <Step n="5" title="Délai de livraison" theme={theme}>
              {(() => {
                const totalShorts = (quantities["short"] ?? 0) + (quantities["ads"] ?? 0);
                const documentaire = quantities["documentaire"] ?? 0;
                const podcast = quantities["podcast"] ?? 0;
                const expressBlocked = totalShorts > 70 || documentaire > 4 || podcast > 6;

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
                          : calcDeliveryDays(quantities, true),
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
            )}
          </div>
        </div>

        {/* ── PANNEAU RÉCAP ── */}
        <div id="devis-recap" className={`rounded-2xl sm:rounded-[2rem] border ${theme.containerBg} p-6 sm:p-8 lg:p-10 xl:p-12 space-y-5 sm:space-y-6 shadow-xl lg:sticky lg:top-28 ${theme.panelGlow}`}>
          <div>
            <h4 className={`font-display text-xl sm:text-2xl font-bold ${theme.textPrimary}`}>Votre estimation</h4>
            <p className={`text-xs mt-1 ${theme.mutedText}`}>{summaryLine}</p>
          </div>

          <div className={`rounded-2xl border ${theme.nestedBorder} ${theme.recapBg} overflow-hidden`}>
            <div className="px-5 py-4 border-b border-foreground/10">
              <p className={`text-sm font-semibold ${theme.textPrimary}`}>Récapitulatif du devis</p>
            </div>
            <div className="p-5 space-y-1 text-sm">
              {pricing.lineItems.length === 0 ? (
                <p className={`opacity-50 py-3 text-center ${theme.textSecondary}`}>Aucun format sélectionné.</p>
              ) : (
                <>
                  {pricing.lineItems.map((l) => (
                    <RecapRow
                      key={l.key}
                      label={`${l.qty}× ${l.label}`}
                      value={showPrices ? `${l.total}€` : ""}
                      theme={theme}
                    />
                  ))}
                  {pricing.selectedOptions.map((o) => (
                    <RecapRow
                      key={o.k}
                      label={`Option : ${o.k} ×${pricing.totalVideos}`}
                      value={showPrices ? `+${o.p * pricing.totalVideos}€` : ""}
                      theme={theme}
                    />
                  ))}
                  {/* SHOW_PRICES: ligne réduction - masquée si false */}
                  {SHOW_PRICES && pricing.discAmt > 0 && (
                    <RecapRow
                      label="Reduction multishoot mensuel"
                      value={`-${pricing.discAmt}€`}
                      accent="disc"
                      theme={theme}
                    />
                  )}
                  {/* SHOW_PRICES: supplément express - masqué si false */}
                  {SHOW_PRICES && pricing.expressAdd > 0 && (
                    <RecapRow label="Supplément express prioritaire" value={`+${pricing.expressAdd}€`} accent="warn" theme={theme} />
                  )}
                </>
              )}
            </div>
            <div className="border-t border-foreground/10 px-5 py-5 flex items-end justify-between gap-4">
              <div className={`text-xs space-y-1 ${theme.textSecondary}`}>
                {/* SHOW_PRICES: sous-total barré - masqué si false */}
                {SHOW_PRICES && pricing.subtotal > 0 && pricing.discAmt + pricing.expressAdd > 0 && (
                  <span className="line-through block opacity-60">{pricing.subtotal}€</span>
                )}
                {pricing.totalVideos > 0 && (
                  <span>
                    {pricing.totalVideos} vidéo{pricing.totalVideos > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="text-right">
                {/* SHOW_PRICES: badges collab/express et total animé - masqués si false */}
                {showPrices && (pricing.discAmt > 0 || pricing.expressAdd > 0) && pricing.subtotal > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 font-medium">
                    {[
                      pricing.discAmt > 0 ? "Collab -15%" : "",
                      pricing.expressAdd > 0 ? "Express +35%" : "",
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}
                {showPrices && <AnimatedPrice total={pricing.total} />}
              </div>
            </div>
          </div>

          {/* Section formulaire - cachée en mode admin */}
          {!adminMode && (
            <>
              <div className="space-y-4">
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.textMuted}`}>Vos coordonnées</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Inp theme={theme} v={name} set={setName} ph="Nom complet *" />
                  <Inp theme={theme} v={email} set={setEmail} ph="Email *" type="email" />
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Précisions sur votre projet (facultatif)..."
                  rows={4}
                  className={`w-full rounded-xl border px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${theme.inputBg}`}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !name || !email || pricing.totalVideos === 0}
                className={`inline-flex w-full items-center justify-center rounded-full ${theme.submit} px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold transition disabled:opacity-40`}
              >
                {status === "loading" ? "Envoi en cours…" : "Envoyer mon devis complet →"}
              </button>

              {status === "success" && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                  <div className="mb-3 text-3xl">✓</div>
                  <p className="font-semibold text-emerald-700 mb-2 text-base">Votre devis a bien été envoyé</p>
                  <p className="text-sm text-emerald-600 leading-relaxed">
                    Vous recevrez votre devis détaillé par email d'ici quelques instants. Nous reviendrons vers vous sous 24 heures pour échanger sur votre projet.
                  </p>
                </div>
              )}
              {status === "error" && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-500">
                  L&apos;envoi a échoué. Réessayez ou vérifiez vos informations.
                </div>
              )}
            </>
          )}

          {/* Mode admin - Message informatif */}
          {adminMode && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5 text-center">
              <p className="font-semibold text-purple-300 mb-2 text-base">Prix unitaires affichés</p>
              <p className="text-sm text-purple-400">
                Tarifs de base sans réductions appliquées.
              </p>
            </div>
          )}
        </div>
      </form>

      {pricing.totalVideos > 0 && status !== "success" && (
        <div
          className={`lg:hidden fixed bottom-0 inset-x-0 z-50 border-t backdrop-blur-xl flex items-center justify-between gap-4 px-5 py-4 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.2)] ${
            variant === "surmesure"
              ? "bg-[#0d0a1a]/95 border-white/10"
              : "bg-white/95 border-foreground/10"
          }`}
        >
          <div className="flex flex-col min-w-0">
            <span className={`text-[11px] font-medium ${theme.textMuted}`}>
              {pricing.totalVideos} vidéo{pricing.totalVideos > 1 ? "s" : ""}
            </span>
            {/* SHOW_PRICES: total barre mobile - masqué si false */}
            {showPrices && (
              <span className={`font-display text-2xl font-bold tabular-nums ${theme.isDark ? "text-[#c4b5fd]" : "text-[#a8632d]"}`}>
                {pricing.total}€
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("devis-recap")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold text-white ${
              variant === "surmesure"
                ? "bg-gradient-to-r from-[#a78bfa] to-[#ec4899]"
                : "bg-[#1a1410]"
            }`}
          >
            Voir le récap →
          </button>
        </div>
      )}
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
    <div className={`flex justify-between gap-3 sm:gap-4 py-1.5 sm:py-2 ${textColor}`}>
      <span className="opacity-90 min-w-0 flex-1 leading-snug">{label}</span>
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
    <section className="space-y-5 sm:space-y-6">
      <p className={`text-xs sm:text-sm font-bold uppercase tracking-[0.18em] flex items-center gap-3 flex-wrap ${theme.textPrimary}`}>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${theme.stepNumBg}`}>
          {n}
        </span>
        {title}
        {hint && <span className={`text-[10px] sm:text-[11px] normal-case font-medium opacity-75 ${theme.textSecondary}`}>{hint}</span>}
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
      className={`rounded-xl border px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${theme.inputBg}`}
    />
  );
}
