import { Button } from "@repo/ui/button";
import { Container } from "@/features/_shared";
import { FINAL_CTA } from "../lib/marketing.content";

/** Llamada final a la acción antes del footer (dirección "Iron & Lime"). */
export function CtaSection() {
  return (
    <section className="border-b border-border py-20 sm:py-28">
      <Container>
        <div className="bg-brand-glow relative overflow-hidden rounded-md border border-border bg-card px-8 py-16 sm:px-14">
          <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="display-heading text-[clamp(1.875rem,4.5vw,2.75rem)]">
                {FINAL_CTA.title}
              </h2>
              <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                {FINAL_CTA.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button size="lg" className="rounded-lg" asChild>
                <a href="#planes">{FINAL_CTA.primaryCta}</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg"
                asChild
              >
                <a href="#">{FINAL_CTA.secondaryCta}</a>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
