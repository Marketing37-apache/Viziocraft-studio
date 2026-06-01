import { useEffect, useMemo, useState } from "react";

const FORMSPREE = "https://formspree.io/f/maqkaznd";

const TYPES = ["Réseaux sociaux", "Podcast", "Facecam / UGC", "Publicité", "Gaming", "Interview", "Documentaire"];
const LEVELS = [
  { name: "Neuro", short: 12, long: 40, bullets: ["Cuts propres", "Sous-titres simples", "Sound design léger"] },
  { name: "Cinetic", short: 22, long: 65, bullets: ["Animations & zooms", "B-roll intégré", "Rythme travaillé"] },
  { name: "Domination", short: 38, long: 100, bullets: ["Motion design", "VFX & storytelling", "Hooks optimisés"] },
];
const OPTIONS = [
  { k: "Sous-titres premium", p: 5 },
  { k: "Recherche b-roll", p: 8 },
  { k: "Motion design", p: 12 },
  { k: "Sound design avancé", p: 8 },
  { k: "Thumbnail", p: 7 },
  { k: "Script IA", p: 12 },
  { k: "Hook optimization", p: 8 },
  { k: "Multi-format", p: 15 },
];

export function DevisBuilder({
  open,
  variant = "essentiel",
  onClose,
}: {
  open: boolean;
  variant?: "essentiel" | "surmesure";
  onClose?: () => void;
}) {
  const [type, setType] = useState(TYPES[0]);
  const [qS, setQS] = useState(3);
  const [qL, setQL] = useState(1);
  const [lvl, setLvl] = useState(1);
  const [opts, setOpts] = useState<Record<string, boolean>>({});
  const [express, setExpress] = useState(false);
  const [first, setFirst] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Auto-scroll when opened
  useEffect(() => {
    if (open) {
      const el = document.getElementById("devis-builder");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [open]);

  const optExtra = useMemo(() => OPTIONS.reduce((s, o) => (opts[o.k] ? s + o.p : s), 0), [opts]);
  const delivExtra = express ? 10 : 0;

  const base = (LEVELS[lvl].short + optExtra + delivExtra) * qS + (LEVELS[lvl].long + optExtra + delivExtra) * qL;
  const total = first ? Math.round(base * 0.85) : base;

  const summary = useMemo(() => {
    const parts = [];
    if (qS > 0) parts.push(`${qS} short${qS > 1 ? "s" : ""}`);
    if (qL > 0) parts.push(`${qL} long${qL > 1 ? "s" : ""}`);
    if (!parts.length) parts.push("0 vidéo");
    return `${parts.join(" + ")} — ${LEVELS[lvl].name} — ${express ? "24h express" : "48h"}`;
  }, [qS, qL, lvl, express]);

  const theme = useMemo(() => {
    const isDark = variant === "surmesure";
    return {
      isDark,
      // Containers
      containerBg: isDark ? "bg-[#110922] border-white/[0.08]" : "bg-white border-foreground/10",
      textColor: isDark ? "text-white" : "text-[#1a1410]",
      mutedText: isDark ? "text-white/60" : "text-muted-foreground",
      badgeText: isDark ? "text-[#c4b5fd]" : "text-[#a8632d]",
      
      // Step numbers
      stepNumBg: isDark 
        ? "bg-gradient-to-r from-[#a78bfa] to-[#ec4899] text-white" 
        : "bg-[#a8632d] text-white",
      
      // Interactive steps buttons
      btnActive: isDark 
        ? "border-[#a78bfa] bg-[#221344] text-[#c4b5fd]" 
        : "border-[#a8632d] bg-[#a8632d]/10 text-[#a8632d]",
      btnInactive: isDark 
        ? "border-white/10 bg-white/5 text-white/80 hover:border-[#a78bfa]/40 hover:bg-white/10" 
        : "border-foreground/15 bg-white text-foreground/75 hover:border-[#a8632d]/40 hover:bg-[#f7f5f0]",
      
      // Nested layouts inside pricing card
      nestedBg: isDark ? "bg-white/[0.03]" : "bg-[#f7f5f0]",
      nestedBorder: isDark ? "border-white/10" : "border-foreground/10",
      
      // Inputs
      inputBg: isDark 
        ? "bg-white/5 border-white/10 focus:border-[#a78bfa] text-white focus:bg-white/10" 
        : "bg-[#f7f5f0] border-foreground/15 focus:border-[#a8632d] text-[#1a1410] focus:bg-white",
      
      // Options checkbox
      optActive: isDark 
        ? "border-emerald-500/60 bg-emerald-950/20 text-emerald-400" 
        : "border-emerald-500/60 bg-emerald-50 text-emerald-800",
      optInactive: isDark 
        ? "border-white/10 bg-white/5 text-white/80 hover:border-[#a78bfa]/30" 
        : "border-foreground/12 bg-white text-foreground/80 hover:border-primary/30",
      optCheck: "border-emerald-500 bg-emerald-500 text-white",

      // Submit Button
      submit: isDark 
        ? "bg-gradient-to-r from-[#a78bfa] to-[#ec4899] text-white hover:opacity-90 shadow-[0_40px_80px_-30px_rgba(123,45,142,0.3)] glow-brand" 
        : "bg-[#1a1410] text-white hover:bg-[#2e2620] shadow-md",
    };
  }, [variant]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setStatus("loading");
    const fd = new FormData();
    fd.append("_subject", `🎬 Devis VizioCraft — ${total}€ (${summary})`);
    fd.append("Formule", variant === "surmesure" ? "Sur mesure" : "Montage essentiel");
    fd.append("Nom", name);
    fd.append("Email", email);
    fd.append("Téléphone", phone);
    fd.append("Réseaux sociaux", social);
    fd.append("Type de contenu", type);
    fd.append("Shorts", String(qS));
    fd.append("Longs formats", String(qL));
    fd.append("Niveau de montage", LEVELS[lvl].name);
    fd.append(
      "Options",
      Object.keys(opts)
        .filter((k) => opts[k])
        .join(", ") || "—"
    );
    fd.append("Livraison", express ? "24h express (+10€/vidéo)" : "Standard 48h");
    fd.append("Première commande", first ? "Oui (−15%)" : "Non");
    fd.append("Récapitulatif", summary);
    fd.append("Total estimé", `${total}€${first ? ` (au lieu de ${base}€)` : ""}`);
    fd.append("Message", message);
    try {
      const res = await fetch(FORMSPREE, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div id="devis-builder" className="w-full">
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.3fr_1fr] items-start">
        
        {/* LEFT COLUMN: Config steps */}
        <div className={`rounded-[2rem] border ${theme.containerBg} p-6 sm:p-8 space-y-8 shadow-xl relative`}>
          {onClose && (
            <button 
              type="button" 
              onClick={onClose} 
              aria-label="Fermer le configurateur" 
              className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-card text-foreground/70 hover:bg-muted"
            >
              ×
            </button>
          )}

          <div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] ${theme.badgeText}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {variant === "surmesure" ? "Production Prestige" : "Montage Essentiel"}
            </span>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold">Configurez vos options</h3>
            <p className={`mt-1.5 text-sm ${theme.mutedText}`}>
              Choisissez vos volumes, le style de montage et les finitions souhaitées.
            </p>
          </div>

          <div className="space-y-8 border-t border-foreground/10 pt-8">
            {/* Step 1: Type */}
            <Step n="1" title="Type de contenu" theme={theme}>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      type === t ? theme.btnActive : theme.btnInactive
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Step>

            {/* Step 2: Quantities */}
            <Step n="2" title="Combien de vidéos ?" theme={theme}>
              <div className="grid gap-4 sm:grid-cols-2">
                <QtyBlock label="Shorts / Reels" sub="Jusqu'à ~90 secondes" v={qS} set={setQS} theme={theme} />
                <QtyBlock label="Longs formats" sub="Vidéos de 5 min et plus" v={qL} set={setQL} theme={theme} />
              </div>
            </Step>

            {/* Step 3: Level */}
            <Step n="3" title="Niveau de montage" theme={theme}>
              <div className="grid gap-4 sm:grid-cols-3">
                {LEVELS.map((l, idx) => {
                  const on = lvl === idx;
                  return (
                    <button
                      type="button"
                      key={l.name}
                      onClick={() => setLvl(idx)}
                      className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between ${
                        on ? theme.btnActive : theme.btnInactive
                      }`}
                    >
                      <div>
                        <h4 className="font-display text-lg font-bold">{l.name}</h4>
                        <p className={`mt-0.5 text-xs ${theme.mutedText}`}>
                          Short {l.short}€ · Long {l.long}€
                        </p>
                      </div>
                      <ul className="mt-4 space-y-1.5 border-t border-foreground/5 pt-3 text-[11px] opacity-75">
                        {l.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-current" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* Step 4: Options */}
            <Step n="4" title="Options avancées" hint="(prix par vidéo)" theme={theme}>
              <div className="grid gap-3 sm:grid-cols-2">
                {OPTIONS.map((o) => {
                  const on = !!opts[o.k];
                  return (
                    <button
                      type="button"
                      key={o.k}
                      onClick={() => setOpts((p) => ({ ...p, [o.k]: !p[o.k] }))}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        on ? theme.optActive : theme.optInactive
                      }`}
                    >
                      <span
                        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border text-[9px] transition ${
                          on ? theme.optCheck : "border-foreground/25"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                      <span className="flex-1 text-xs font-medium">{o.k}</span>
                      <span className="text-[11px] font-semibold tracking-wider">+{o.p}€</span>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* Step 5: Delivery */}
            <Step n="5" title="Livraison" theme={theme}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { e: false, t: "Standard", s: "48h · Inclus" },
                  { e: true, t: "Rapide", s: "24h express · +10€/vidéo" },
                ].map((d) => {
                  const on = express === d.e;
                  return (
                    <button
                      type="button"
                      key={d.t}
                      onClick={() => setExpress(d.e)}
                      className={`rounded-xl border p-4 text-left transition ${
                        on ? theme.btnActive : theme.btnInactive
                      }`}
                    >
                      <div className="font-semibold text-sm">{d.t}</div>
                      <div className={`text-xs mt-0.5 opacity-75`}>{d.s}</div>
                    </button>
                  );
                })}
              </div>
            </Step>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky summary and contact */}
        <div className={`rounded-[2rem] border ${theme.containerBg} p-6 sm:p-8 space-y-6 shadow-xl lg:sticky lg:top-28`}>
          <div>
            <h4 className="font-display text-xl sm:text-2xl font-bold">Récapitulatif & Devis</h4>
            <p className={`text-xs mt-1 ${theme.mutedText}`}>Calculé instantanément en fonction de vos choix.</p>
          </div>

          {/* Pricing detail box */}
          <div className={`rounded-2xl border ${theme.nestedBorder} ${theme.nestedBg} p-5 space-y-4`}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Estimation</span>
                <p className="mt-1 text-sm font-semibold tracking-tight">{summary}</p>
              </div>
              <div className="text-right">
                {first && base > 0 && (
                  <span className="mr-2 text-sm opacity-50 line-through">{base}€</span>
                )}
                <span className="font-display text-3xl sm:text-4xl font-bold text-brand-gradient">{total}€</span>
              </div>
            </div>
            {first && base > 0 && (
              <p className="text-right text-xs font-semibold text-emerald-500">Réduction première commande −15% appliquée</p>
            )}

            <div className="border-t border-foreground/10 pt-4 space-y-2 text-xs opacity-80">
              <div className="flex justify-between">
                <span>Contenu sélectionné :</span>
                <span>{type}</span>
              </div>
              {qS > 0 && (
                <div className="flex justify-between">
                  <span>Tarif unitaire Shorts :</span>
                  <span>{LEVELS[lvl].short + optExtra + delivExtra}€</span>
                </div>
              )}
              {qL > 0 && (
                <div className="flex justify-between">
                  <span>Tarif unitaire Longs :</span>
                  <span>{LEVELS[lvl].long + optExtra + delivExtra}€</span>
                </div>
              )}
            </div>
          </div>

          {/* First Order Box */}
          <label className={`flex cursor-pointer items-center gap-3 rounded-xl border ${theme.nestedBorder} ${theme.nestedBg} p-3.5 text-xs transition hover:opacity-90`}>
            <input type="checkbox" checked={first} onChange={(e) => setFirst(e.target.checked)} className="h-4.5 w-4.5 rounded accent-primary" />
            <span className="flex-1 font-semibold">C'est ma première commande chez VizioCraft</span>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">−15%</span>
          </label>

          {/* Contact inputs */}
          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Vos coordonnées</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Inp theme={theme} v={name} set={setName} ph="Nom complet *" />
              <Inp theme={theme} v={email} set={setEmail} ph="Email *" type="email" />
              <Inp theme={theme} v={phone} set={setPhone} ph="Téléphone" type="tel" />
              <Inp theme={theme} v={social} set={setSocial} ph="Réseaux (@...)" />
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre projet (DA, rythme, livrables)..."
              rows={3}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${theme.inputBg}`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading" || !name || !email}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full ${theme.submit} px-6 py-4 text-sm font-semibold transition disabled:opacity-40`}
          >
            {status === "loading" ? "Traitement..." : "Envoyer le devis par mail →"}
          </button>

          {/* Messages */}
          {status === "success" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 leading-relaxed">
              ✓ Devis reçu ! Un récapitulatif détaillé vous a été envoyé par mail. On revient vers vous très vite pour lancer le projet.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              Oups, l'envoi a échoué. Veuillez vérifier vos informations ou réessayer.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

/* ——— Internal Helpers ——— */

function Step({ 
  n, 
  title, 
  hint, 
  children, 
  theme 
}: { 
  n: string; 
  title: string; 
  hint?: string; 
  children: React.ReactNode; 
  theme: any 
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80 flex items-center gap-2.5">
        <span className={`flex h-6.5 w-6.5 items-center justify-center rounded-full text-xs font-black shadow-sm ${theme.stepNumBg}`}>
          {n}
        </span>
        {title} 
        {hint && <span className="ml-1 text-[10px] normal-case opacity-60 font-medium">{hint}</span>}
      </p>
      <div>{children}</div>
    </div>
  );
}

function QtyBlock({ 
  label, 
  sub, 
  v, 
  set, 
  theme 
}: { 
  label: string; 
  sub: string; 
  v: number; 
  set: (n: number) => void; 
  theme: any 
}) {
  return (
    <div className={`rounded-2xl border ${theme.nestedBorder} ${theme.nestedBg} p-4 flex flex-col justify-between`}>
      <div>
        <h4 className="text-sm font-semibold">{label}</h4>
        <p className={`text-xs mt-0.5 opacity-60`}>{sub}</p>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button 
          type="button" 
          onClick={() => set(Math.max(0, v - 1))} 
          className={`h-9 w-9 rounded-lg border flex items-center justify-center transition ${theme.btnInactive}`}
        >
          −
        </button>
        <div className="min-w-[28px] text-center font-display text-lg font-bold">{v}</div>
        <button 
          type="button" 
          onClick={() => set(v + 1)} 
          className={`h-9 w-9 rounded-lg border flex items-center justify-center transition ${theme.btnInactive}`}
        >
          +
        </button>
        <span className="text-xs opacity-60">vidéos</span>
      </div>
    </div>
  );
}

function Inp({ 
  v, 
  set, 
  ph, 
  type = "text", 
  theme 
}: { 
  v: string; 
  set: (s: string) => void; 
  ph: string; 
  type?: string; 
  theme: any 
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
