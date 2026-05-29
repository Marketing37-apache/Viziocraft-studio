import { useState } from "react";

const FORMSPREE = "https://formspree.io/f/maqkaznd";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("loading");
    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) { setStatus("success"); form.reset(); }
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="_subject" value="🎬 Nouveau projet VizioCraft" />
      <input type="hidden" name="Formule" value="Réservation d'appel" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Votre nom" name="Nom" required maxLength={100} placeholder="Jean Dupont" />
        <Field label="Email" name="Email" type="email" required maxLength={255} placeholder="vous@marque.com" />
      </div>

      <Field label="Téléphone (optionnel)" name="Téléphone" type="tel" maxLength={30} placeholder="+33 6 12 34 56 78" />

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Parlez-nous de votre projet
        </label>
        <textarea
          name="Message"
          required
          maxLength={2000}
          rows={5}
          placeholder="Quel type de contenu ? Quel volume ? Quels délais ? Plus c'est précis, mieux on prépare l'appel."
          className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-4 text-sm font-semibold text-white glow-brand transition hover:opacity-95 disabled:opacity-60"
      >
        {status === "loading" ? "Envoi en cours…" : "Réserver mon appel"}
        <span className="transition group-hover:translate-x-1">→</span>
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Réponse sous 24h ouvrées · aucun engagement
      </p>

      {status === "success" && (
        <p className="rounded-2xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Merci ! Votre message est bien arrivé — on revient vers vous sous 24h.
        </p>
      )}
      {status === "error" && (
        <p className="rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-800">
          Oups, un souci à l'envoi. Réessayez ou écrivez-nous directement.
        </p>
      )}
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        {...rest}
        className="mt-2 w-full rounded-2xl border border-foreground/15 bg-white px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
