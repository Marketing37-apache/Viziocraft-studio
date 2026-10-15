import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export type FaqItem = { q: string; a: string };

function Row({ item, value }: { item: FaqItem; value: string }) {
  return (
    <AccordionItem value={value} className="border-b border-ink/10">
      <AccordionTrigger className="group cursor-pointer gap-4 py-4 text-left hover:no-underline sm:py-[18px] [&>svg]:hidden">
        <span className="font-display text-[16px] font-semibold leading-snug tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-brand sm:text-[18px]">
          {item.q}
        </span>
        <span
          aria-hidden
          className="faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink group-hover:border-ink group-hover:bg-ink group-hover:text-white group-data-[state=open]:border-ink group-data-[state=open]:bg-ink group-data-[state=open]:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-5 pt-0">
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink/70">{item.a}</p>
      </AccordionContent>
    </AccordionItem>
  );
}

/* FAQ compacte : les questions qui comptent d'abord, le reste à la demande. */
export function Faq({ featured, more }: { featured: FaqItem[]; more: FaqItem[] }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div>
      <Accordion type="single" collapsible className="border-t border-ink/10">
        {featured.map((f, i) => (
          <Row key={f.q} item={f} value={`f-${i}`} />
        ))}
        {/* les autres questions restent dans la page (référencement), simplement repliées */}
        <div
          id="faq-more"
          hidden={!showAll}
          className={showAll ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}
        >
          {more.map((f, i) => (
            <Row key={f.q} item={f} value={`m-${i}`} />
          ))}
        </div>
      </Accordion>

      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-expanded={showAll}
        aria-controls="faq-more"
        className="group mt-5 inline-flex min-h-11 items-center gap-3 text-[14px] font-semibold text-ink"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 transition-transform duration-500 ${showAll ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </span>
        <span className="link-sweep">
          {showAll ? "Réduire la liste" : `Voir les ${more.length} autres questions`}
        </span>
      </button>
    </div>
  );
}
