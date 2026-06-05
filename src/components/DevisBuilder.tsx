import { useEffect, useMemo, useState } from "react";

const FORMSPREE = "https://formspree.io/f/maqkaznd";

const BASE_PRICES: Record<string, number> = {
  s1: 30,
  s2: 35,
  pb: 50,
  l1: 180,
  l2: 200,
  l3: 250,
  pd: 250,
};

/** Neuro = 1 · Cinetic = ×1.4 · Domination = ×2.24 (Cinetic ×1.6) */
const LEVEL_MULT = [1, 1.4, 2.24] as const;
const EXPRESS_RATE = 0.35;

/** 3 familles distinctes — podcast ≠ long YouTube +15 min (tarif dédié, travail différent) */
const FORMAT_CATEGORIES = [
  {
    id: "short",
    title: "Short / Reel",
    subtitle: "Reels, TikTok, facecam, UGC, pub",
    formats: [
      { key: "s1", name: "Short Classique", desc: "Inclut facecam & UGC — cut dynamique, sous-titres", dur: "−45s" },
      { key: "s2", name: "Short Développé", desc: "Storytelling vertical plus développé", dur: "+45s" },
      { key: "pb", name: "Short Publicitaire", desc: "Spot publicitaire — hook, CTA, rythme serré", dur: "−60s" },
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

const MULTISHOOT_PERIODS = [
  { label: "1 semaine", disc: 0 },
  { label: "2 semaines", disc: 5 },
  { label: "3 semaines", disc: 10 },
  { label: "1 mois complet", disc: 15 },
  { label: "Période à définir ensemble", disc: 0 },
];

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
    multLabel: "+40% vs Neuro",
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
    multLabel: "+60% vs Cinetic",
    includes: "Tout Cinetic inclus",
    bullets: ["Motion design", "Animations avancées", "Color grading cinéma", "Branding intégré"],
  },
];

const OPTIONS = [
  { k: "Sous-titres animés", p: 8 },
  { k: "Sound design", p: 10 },
  { k: "Script IA optimisé", p: 12 },
  { k: "Multi-format export", p: 15 },
  { k: "Voix-off / narration", p: 20 },
];

const ALL_KEYS = Object.keys(BASE_PRICES);
const EMPTY_QTY = Object.fromEntries(ALL_KEYS.map((k) => [k, 0]));

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

function calcDeliveryLabel(n: number): string {
  if (n <= 0) return "92h";
  if (n <= 3) return "92h ouvrées";
  if (n <= 6) return "4–5 jours";
  if (n <= 10) return "5–7 jours";
  return `~${Math.ceil(n / 3)} jours`;
}

function formatLabel(key: string): string {
  for (const cat of FORMAT_CATEGORIES) {
    const f = cat.formats.find((x) => x.key === key);
    if (f) return `${f.name} (${f.dur})`;
  }
  return key;
}

// ── Per-format hints (typographic only, no icons) ────────────────────────────
const FORMAT_HINTS: Record<string, string> = {
  s1: "Facecam · UGC · cut dynamique",
  s2: "Storytelling vertical développé",
  pb: "Spot pub · hook fort · CTA",
  l1: "Capsules · tutos courts · review",
  l2: "Vlog dense · entretien · docu court",
  l3: "Documentaire · masterclass · marque",
  pd: "Multi-cam · sync audio · chapitrage",
};

function FormatCard({
  fmt,
  qty,
  onAdd,
  onSub,
  theme,
  variant,
  solo = false,
}: {
  fmt: any;
  qty: number;
  onAdd: () => void;
  onSub: () => void;
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

  // ── Podcast solo — wide feature layout ────────────────────────────────────
  if (solo) {
    return (
      <div className={`flex flex-col sm:flex-row sm:items-center gap-6 rounded-2xl border p-6 transition-all duration-300 ${getCardStyle(active, theme.isDark)}`}>
        {/* Left — title block */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <h4 className={`text-base font-bold font-display ${theme.textPrimary}`}>{fmt.name}</h4>
            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border whitespace-nowrap ${durBadge}`}>
              {fmt.dur}
            </span>
          </div>
          <p className={`text-xs leading-relaxed mb-3 ${theme.textSecondary}`}>{fmt.desc}</p>
          <p className={`text-[10px] font-semibold tracking-wide ${active ? activeAccent : theme.textMuted}`}>{hint}</p>
          {/* Feature tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Multi-cam", "Sync audio", "Chapitrage", "Long format"].map((tag) => (
              <span key={tag} className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                theme.isDark ? "border-white/10 text-white/50" : "border-foreground/12 text-foreground/50"
              }`}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Right — stepper */}
        <div className={`flex flex-col items-center gap-2 shrink-0 pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l ${
          theme.isDark ? "border-white/[0.07]" : "border-foreground/8"
        }`}>
          <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.textMuted}`}>
            {"unitLabel" in fmt && fmt.unitLabel ? fmt.unitLabel : "Quantité"}
          </span>
          <div className={`flex items-center gap-2 rounded-full p-1 border ${theme.isDark ? "bg-white/5 border-white/5" : "bg-foreground/[0.03] border-foreground/5"}`}>
            <button type="button" onClick={onSub} disabled={qty === 0}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition disabled:opacity-20 cursor-pointer ${theme.isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-white border border-foreground/10 text-[#1a1410] hover:bg-foreground/5 shadow-xs"}`}>
              −
            </button>
            <span className={`w-7 text-center font-display text-base font-bold tabular-nums ${active ? theme.textPrimary : theme.textMuted}`}>{qty}</span>
            <button type="button" onClick={onAdd}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition cursor-pointer ${theme.isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white border border-foreground/10 text-[#1a1410] hover:bg-foreground/5 shadow-xs"}`}>
              +
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Standard card — typographic, no icon ─────────────────────────────────
  return (
    <div className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${getCardStyle(active, theme.isDark)}`}>
      <div className="space-y-2.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <h4 className={`text-sm font-bold leading-tight font-display ${theme.textPrimary}`}>{fmt.name}</h4>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold border whitespace-nowrap ${durBadge}`}>
            {fmt.dur}
          </span>
        </div>
        {/* Hint — usage label */}
        <p className={`text-[10px] font-semibold tracking-wide ${active ? activeAccent : theme.textMuted}`}>{hint}</p>
        {/* Description */}
        <p className={`text-[11px] leading-relaxed ${theme.textSecondary}`}>{fmt.desc}</p>
      </div>

      {/* Stepper */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-foreground/5 pt-4">
        <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.textMuted}`}>
          {"unitLabel" in fmt && fmt.unitLabel ? fmt.unitLabel : "Quantité"}
        </span>
        <div className={`flex items-center gap-2 rounded-full p-1 border shrink-0 ${theme.isDark ? "bg-white/5 border-white/5" : "bg-foreground/[0.03] border-foreground/5"}`}>
          <button type="button" onClick={onSub} disabled={qty === 0}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition disabled:opacity-20 cursor-pointer ${theme.isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-white border border-foreground/10 text-[#1a1410] hover:bg-foreground/5 shadow-xs"}`}>
            −
          </button>
          <span className={`w-6 text-center font-display text-sm font-bold tabular-nums ${active ? theme.textPrimary : theme.textMuted}`}>{qty}</span>
          <button type="button" onClick={onAdd}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer ${theme.isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white border border-foreground/10 text-[#1a1410] hover:bg-foreground/5 shadow-xs"}`}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<string>("short");
  const [lvl, setLvl] = useState(0);
  const [opts, setOpts] = useState<Record<string, boolean>>({});
  const [express, setExpress] = useState(false);
  const [duration, setDuration] = useState<"one-shot" | "multishoot">("one-shot");
  const [periodIdx, setPeriodIdx] = useState(3);
  const [frequency, setFrequency] = useState(MULTISHOOT_FREQUENCIES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pricePulse, setPricePulse] = useState(0);

  useEffect(() => {
    if (open) {
      const el = document.getElementById("devis-builder");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [open]);

  const theme = useMemo(() => buildTheme(variant === "surmesure"), [variant]);
  const period = MULTISHOOT_PERIODS[periodIdx];

  const pricing = useMemo(() => {
    const mult = LEVEL_MULT[lvl];
    const lineItems = ALL_KEYS.filter((k) => quantities[k] > 0).map((key) => {
      const qty = quantities[key];
      const unitBase = BASE_PRICES[key];
      const unitFinal = Math.round(unitBase * mult);
      const total = unitFinal * qty;
      return { key, label: formatLabel(key), qty, unitBase, unitFinal, total };
    });

    const totalVideos = lineItems.reduce((s, l) => s + l.qty, 0);
    const videoTotal = lineItems.reduce((s, l) => s + l.total, 0);
    const optPerVid = OPTIONS.reduce((s, o) => (opts[o.k] ? s + o.p : s), 0);
    const optionTotal = optPerVid * totalVideos;
    const subtotal = videoTotal + optionTotal;

    const multiDisc = duration === "multishoot" ? period.disc / 100 : 0;
    const discAmt = multiDisc > 0 ? Math.round(subtotal * multiDisc) : 0;
    const afterDisc = subtotal - discAmt;
    const expressAdd = express ? Math.round(afterDisc * EXPRESS_RATE) : 0;
    const total = afterDisc + expressAdd;

    const selectedOptions = OPTIONS.filter((o) => opts[o.k]);

    return {
      lineItems,
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
      delivery: calcDeliveryLabel(totalVideos),
    };
  }, [quantities, lvl, opts, express, duration, period]);

  useEffect(() => {
    setPricePulse((p) => p + 1);
  }, [pricing.total, pricing.totalVideos, lvl, express, duration, periodIdx]);

  function setQty(key: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] ?? 0) + delta),
    }));
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
          `    Base ${l.unitBase}€ × ${LEVEL_MULT[lvl]} (${LEVELS[lvl].name}) = ${l.unitFinal}€/u → ${l.total}€`
        );
      });
    }

    if (selectedOptions.length > 0 && totalVideos > 0) {
      lines.push("", "── OPTIONS COMPLÉMENTAIRES ──");
      selectedOptions.forEach((o) => {
        lines.push(`  • ${o.k}: +${o.p}€/vid × ${totalVideos} = +${o.p * totalVideos}€`);
      });
    }

    lines.push("", "── COLLABORATION ──", `  Mode: ${duration === "multishoot" ? "Multishoot" : "One shot"}`);
    if (duration === "multishoot") {
      lines.push(`  Période: ${period.label}`, `  Fréquence: ${frequency}`);
      if (discAmt > 0) {
        lines.push(`  Réduction multishoot: −${period.disc}% = −${discAmt}€`);
      }
    }

    lines.push(
      "",
      "── LIVRAISON ──",
      `  ${express ? `Express 24h (+${Math.round(EXPRESS_RATE * 100)}%) = +${expressAdd}€` : `Standard (${pricing.delivery})`}`,
      "",
      "── TOTAL ──",
      `  Sous-total vidéos + options: ${subtotal}€`
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
        ? `Multishoot — ${period.label} — ${frequency}${period.disc > 0 ? ` (−${period.disc}% sur le total)` : ""}`
        : "One shot — commande unique"
    );
    fd.append(
      "Livraison",
      express ? `Express 24h (+${Math.round(EXPRESS_RATE * 100)}%)` : `Standard (${pricing.delivery})`
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
          duration === "multishoot" ? ` — Multishoot (${period.label})` : " — One shot"
        }${express ? " — Express 24h" : ` — ${pricing.delivery}`}`;

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
            <Step n="1" title="Formats & quantités" theme={theme}>
              <p className={`text-xs mb-5 ${theme.mutedText}`}>
                Sélectionnez la catégorie de format, puis ajustez le nombre de vidéos souhaitées.
              </p>

              {/* 3 onglets : Short · Long · Podcast */}
              <div
                className={`flex p-1 rounded-full border mb-6 ${theme.isDark ? "bg-white/5 border-white/10" : "bg-foreground/[0.03] border-foreground/5"}`}
              >
                {FORMAT_CATEGORIES.map((cat) => {
                  const isActive = activeTab === cat.id;
                  const count = cat.formats.reduce((s, f) => s + (quantities[f.key] ?? 0), 0);

                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setActiveTab(cat.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${isActive
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
                        <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-extrabold ${isActive
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

              {/* 3-column Card Grid */}
              {(() => {
                const activeCategory = FORMAT_CATEGORIES.find((c) => c.id === activeTab);
                if (!activeCategory) return null;

                const isSolo = activeCategory.formats.length === 1;
                const gridCols = isSolo
                    ? "grid-cols-1"
                    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

                return (
                  <div key={activeTab}>
                    <p className={`text-sm mb-4 ${theme.mutedText}`}>{activeCategory.subtitle}</p>
                    <div className={`grid ${gridCols} gap-4`}>
                    {activeCategory.formats.map((fmt) => {
                      const qty = quantities[fmt.key] ?? 0;
                      return (
                        <FormatCard
                          key={fmt.key}
                          fmt={fmt}
                          qty={qty}
                          onAdd={() => setQty(fmt.key, 1)}
                          onSub={() => setQty(fmt.key, -1)}
                          theme={theme}
                          variant={variant}
                          solo={isSolo}
                        />
                      );
                    })}
                    </div>
                  </div>
                );
              })()}
            </Step>

            <Step n="2" title="Niveau de montage" theme={theme}>
              <div className="grid gap-4 sm:grid-cols-3">
                {LEVELS.map((l, idx) => {
                  const on = lvl === idx;
                  return (
                    <button
                      type="button"
                      key={l.name}
                      onClick={() => setLvl(idx)}
                      className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                        on ? theme.btnActive : theme.btnInactive
                      }`}
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
                          <li
                            key={b}
                            className={`text-[10px] pl-2.5 relative before:content-['·'] before:absolute before:left-0 ${theme.textSecondary}`}
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n="3" title="Options complémentaires" hint="par vidéo · optionnel" theme={theme}>
              <div className="grid gap-2 sm:grid-cols-2">
                {OPTIONS.map((o) => {
                  const on = !!opts[o.k];
                  return (
                    <button
                      type="button"
                      key={o.k}
                      onClick={() => setOpts((p) => ({ ...p, [o.k]: !p[o.k] }))}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition duration-300 ${getCardStyle(on, theme.isDark)
                        }`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] ${on
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
                    label: "Multishoot",
                    hint: "Collaboration sur plusieurs semaines. Réduction progressive sur le total.",
                  },
                ].map((d) => (
                  <button
                    type="button"
                    key={d.key}
                    onClick={() => setDuration(d.key)}
                    className={`rounded-xl border p-4 text-left transition-all ${duration === d.key ? theme.btnActive : theme.btnInactive}`}
                  >
                    <h4 className={`font-semibold text-sm ${theme.textPrimary}`}>{d.label}</h4>
                    <p className={`text-xs mt-2 leading-relaxed ${theme.textSecondary}`}>{d.hint}</p>
                  </button>
                ))}
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  duration === "multishoot" ? "max-h-[420px] opacity-100 mt-5" : "max-h-0 opacity-0"
                }`}
              >
                <div className={`rounded-xl border ${theme.nestedBorder} p-4 sm:p-5 space-y-5`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${theme.textMuted}`}>
                      Durée souhaitée
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MULTISHOOT_PERIODS.map((p, i) => (
                        <button
                          type="button"
                          key={p.label}
                          onClick={() => setPeriodIdx(i)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition ${
                            periodIdx === i ? theme.btnActive : theme.btnInactive
                          }`}
                        >
                          {p.label}
                          {p.disc > 0 && (
                            <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              −{p.disc}%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    {period.disc > 0 && (
                      <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                        Réduction −{period.disc}% appliquée sur le total
                      </p>
                    )}
                  </div>
                  <div>
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
              </div>
            </Step>

            <Step n="5" title="Délai de livraison" theme={theme}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { e: false, t: "Standard", s: pricing.delivery, sub: "Inclus" },
                  { e: true, t: "Express 24h", s: "Priorité maximale", sub: `+${Math.round(EXPRESS_RATE * 100)}% du total` },
                ].map((d) => {
                  const on = express === d.e;
                  return (
                    <button
                      type="button"
                      key={d.t}
                      onClick={() => setExpress(d.e)}
                      className={`rounded-2xl border p-4 text-left transition-all duration-300 ${getCardStyle(on, theme.isDark)
                        }`}
                    >
                      <div className={`font-semibold text-sm ${theme.textPrimary}`}>{d.t}</div>
                      <div className={`text-sm mt-1 font-semibold ${theme.textPrimary}`}>{d.s}</div>
                      <div className={`text-xs mt-0.5 ${theme.textSecondary} opacity-90`}>{d.sub}</div>
                    </button>
                  );
                })}
              </div>
            </Step>
          </div>
        </div>

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
                      label={`Réduction multishoot (${period.label})`}
                      value={`−${pricing.discAmt}€`}
                      accent="disc"
                      theme={theme}
                    />
                  )}
                  {pricing.expressAdd > 0 && (
                    <RecapRow label="Supplément express 24h" value={`+${pricing.expressAdd}€`} accent="warn" theme={theme} />
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
                      pricing.discAmt > 0 ? `Collab −${period.disc}%` : "",
                      pricing.expressAdd > 0 ? "Express +35%" : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
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
