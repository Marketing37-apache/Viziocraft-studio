import { useEffect } from "react";

export function CalendlyWidget() {
  useEffect(() => {
    // Charger le script Calendly de manière dynamique
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Nettoyer le script au démontage du composant
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Widget Calendly intégré */}
      <div 
        className="calendly-inline-widget rounded-2xl overflow-hidden border border-foreground/15 bg-white shadow-sm" 
        data-url="https://calendly.com/viziocraft-marketing/30min"
        style={{ minWidth: "320px", height: "700px" }}
      />
      
      {/* Message informatif sous le widget */}
      <p className="text-center text-xs text-muted-foreground">
        Réservation directe · Réponse automatique · Aucun engagement
      </p>
    </div>
  );
}