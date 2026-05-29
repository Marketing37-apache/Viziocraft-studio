import { Link } from "@tanstack/react-router";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 lg:pt-44 lg:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-20 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(123,45,142,0.18),transparent)] blur-3xl" />
      </div>
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
        <h1 className="mt-8 font-display text-4xl tracking-tight sm:text-5xl">{title}</h1>
        {updated && <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>}
        <div className="legal mt-10 space-y-5 text-foreground/85 leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}
