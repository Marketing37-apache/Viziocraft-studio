import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-12">
      <Accordion type="single" collapsible className="overflow-hidden rounded-3xl border border-foreground/10 bg-card divide-y divide-foreground/10">
        {items.map((f, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border-b-0 transition-all"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 600ms ease ${i * 80}ms, transform 600ms cubic-bezier(.2,.7,.2,1) ${i * 80}ms`,
            }}
          >
            <AccordionTrigger className="px-5 py-4 sm:px-8 sm:py-6 text-[15px] sm:text-base lg:text-lg font-display hover:no-underline hover:bg-muted/40 [&[data-state=open]]:bg-brand-soft text-left">
              <span className="flex items-center gap-3 sm:gap-4">
                <span className="shrink-0 text-xs font-semibold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span>{f.q}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 sm:px-8 sm:pb-7 pt-0">
              <p className="ml-0 sm:ml-10 max-w-3xl text-[14px] sm:text-base text-muted-foreground leading-relaxed">{f.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
