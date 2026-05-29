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
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const closeBuilder = () => {
    if (closing) return;
    setClosing(true);
    setMounted(false);
    setTimeout(() => {
      onClose?.();
      setClosing(false);
    }, 260);
  };

  // Auto-scroll and reset details state when opened
  useEffect(() => {
    if (open) {
      setClosing(false);
      setMounted(false);
      setDetailsOpen(true);
      const el = document.getElementById("devis-builder");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      setTimeout(() => setMounted(true), 15);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBuilder();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closing]);

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

  const formule = variant === "surmesure" ? "Production personnalisée" : "Montage essentiel";

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
    <div
      id="devis-builder"
      className={`mt-10 overflow-hidden rounded-[2rem] border border-foreground/10 bg-card shadow-[0_40px_80px_-30px_rgba(123,45,142,0.3)] transition-all duration-250 ease-out ${
        closing || !mounted ? "opacity-0 -translate-y-6" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="border-b border-foreground/10 bg-brand-soft px-6 py-5 sm:px-10 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Configurateur de devis</p>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl">Composez votre devis en 1 minute.</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Pas de surprises, pas de frais cachés. Récapitulatif envoyé par mail.</p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={closeBuilder}
              className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-card px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:border-primary hover:text-primary"
              aria-label="Fermer le configurateur de devis"
            >
              Fermer
            </button>
          ) : null}
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-8 p-6 sm:p-10">
        <div className="grid gap-4 rounded-3xl border border-foreground/10 bg-muted/40 p-5 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Résumé rapide</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{summary}</p>
            <p className="mt-1 text-sm text-muted-foreground">{formule} · {variant === "surmesure" ? "À la carte" : "Pack standard"}</p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-3xl bg-card p-3 text-sm text-muted-foreground">
            <span>{express ? "Livraison 24h express" : "Livraison 48h"}</span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground/80">{first ? "Première commande −15%" : "Client existant"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDetailsOpen((prev) => !prev)}
          className="inline-flex items-center justify-between rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm font-medium text-foreground/85 transition hover:border-primary/50"
        >
          <span>{detailsOpen ? "Masquer les détails du devis" : "Afficher les détails du devis"}</span>
          <span className="text-primary">{detailsOpen ? "−" : "+"}</span>
        </button>

        {detailsOpen && (
          <>
            {/* Type */}
            <Step n="1" title="Type de contenu">
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                      type === t
                        ? "border-primary bg-brand-gradient text-white"
                        : "border-foreground/15 bg-card text-foreground/75 hover:border-primary/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Step>

            {/* Quantities */}
            <Step n="2" title="Combien de vidéos ?">
              <div className="grid gap-3 sm:grid-cols-2">
                <QtyBlock label="Shorts / Reels" sub="Jusqu'à ~90 secondes" v={qS} set={setQS} />
                <QtyBlock label="Longs formats" sub="Vidéos de 5 min et plus" v={qL} set={setQL} />
              </div>
            </Step>

            {/* Level */}
            <Step n="3" title="Niveau de montage">
              <div className="grid gap-3 sm:grid-cols-3">
                {LEVELS.map((l, idx) => {
                  const on = lvl === idx;
                  return (
                    <button
                      type="button"
                      key={l.name}
                      onClick={() => setLvl(idx)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        on ? "border-primary bg-brand-soft" : "border-foreground/12 bg-card hover:border-primary/30"
                      }`}
                    >
                      <h4 className={`font-display text-lg ${on ? "text-primary" : ""}`}>{l.name}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">Short {l.short}€ · Long {l.long}€</p>
                      <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                        {l.bullets.map((b) => (
                          <li key={b}>• {b}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* Options */}
            <Step n="4" title="Options avancées" hint="(prix par vidéo)">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {OPTIONS.map((o) => {
                  const on = !!opts[o.k];
                  return (
                    <button
                      type="button"
                      key={o.k}
                      onClick={() => setOpts((p) => ({ ...p, [o.k]: !p[o.k] }))}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                        on ? "border-emerald-500/60 bg-emerald-50" : "border-foreground/12 bg-card hover:border-primary/30"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-md border text-[9px] ${
                          on ? "border-emerald-500 bg-emerald-500 text-white" : "border-foreground/25"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                      <span className="flex-1 text-xs text-foreground/85">{o.k}</span>
                      <span className={`text-[11px] font-medium ${on ? "text-emerald-700" : "text-muted-foreground"}`}>+{o.p}€</span>
                    </button>
                  );
                })}
              </div>
            </Step>

            {/* Delivery */}
            <Step n="5" title="Livraison">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { e: false, t: "Standard", s: "48h" },
                  { e: true, t: "Rapide", s: "24h · +10€/vidéo" },
                ].map((d) => {
                  const on = express === d.e;
                  return (
                    <button
                      type="button"
                      key={d.t}
                      onClick={() => setExpress(d.e)}
                      className={`rounded-xl border p-4 text-left transition ${
                        on ? "border-primary bg-brand-soft" : "border-foreground/12 bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className={`font-medium ${on ? "text-primary" : ""}`}>{d.t}</div>
                      <div className="text-xs text-muted-foreground">{d.s}</div>
                    </button>
                  );
                })}
              </div>
            </Step>
          </>
        )}

        {/* Total */}
        <div className="rounded-2xl border border-foreground/10 bg-muted/40 p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Récapitulatif</p>
              <p className="mt-1 text-sm">{summary}</p>
            </div>
            <div className="text-right">
              {first && base > 0 && (
                <span className="mr-2 text-sm text-muted-foreground line-through">{base}€</span>
              )}
              <span className="font-display text-4xl">{total}€</span>
              {first && base > 0 && (
                <p className="mt-1 text-xs font-medium text-emerald-600">Réduction 1re commande −15%</p>
              )}
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-foreground/10 bg-card p-3 text-sm">
            <input type="checkbox" checked={first} onChange={(e) => setFirst(e.target.checked)} className="h-4 w-4" />
            <span className="flex-1">C'est ma première commande</span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">−15%</span>
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Inp v={name} set={setName} ph="Nom complet" />
            <Inp v={email} set={setEmail} ph="Email" type="email" />
            <Inp v={phone} set={setPhone} ph="Téléphone" type="tel" />
            <Inp v={social} set={setSocial} ph="Réseaux sociaux (@...)" />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre projet en quelques mots…"
              rows={3}
              className="sm:col-span-2 rounded-xl border border-foreground/15 bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || !name || !email}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white glow-brand transition hover:opacity-95 disabled:opacity-50"
          >
            {status === "loading" ? "Envoi…" : "Envoyer mon devis →"}
          </button>

          {status === "success" && (
            <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 text-sm text-emerald-800">
              Devis reçu ! Un récapitulatif détaillé vous a été envoyé par mail. On revient vers vous très vite.
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-50 p-4 text-sm text-red-800">
              Oups, l'envoi a échoué. Réessayez ou contactez-nous directement.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function Step({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Étape {n} — {title} {hint && <span className="ml-1 text-[10px] normal-case text-muted-foreground/70">{hint}</span>}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function QtyBlock({ label, sub, v, set }: { label: string; sub: string; v: number; set: (n: number) => void }) {
  return (
    <div className="rounded-2xl border border-foreground/12 bg-card p-4">
      <h4 className="text-sm font-medium">{label}</h4>
      <p className="text-xs text-muted-foreground">{sub}</p>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={() => set(Math.max(0, v - 1))} className="h-9 w-9 rounded-lg border border-foreground/15 hover:bg-muted">−</button>
        <div className="min-w-[28px] text-center font-display text-lg">{v}</div>
        <button type="button" onClick={() => set(v + 1)} className="h-9 w-9 rounded-lg border border-foreground/15 hover:bg-muted">+</button>
        <span className="text-xs text-muted-foreground">vidéos</span>
      </div>
    </div>
  );
}

function Inp({ v, set, ph, type = "text" }: { v: string; set: (s: string) => void; ph: string; type?: string }) {
  return (
    <input
      value={v}
      onChange={(e) => set(e.target.value)}
      type={type}
      placeholder={ph}
      className="rounded-xl border border-foreground/15 bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  );
}
