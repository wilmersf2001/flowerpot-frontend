import { Container } from "@/features/_shared";
import { FEATURES, FEATURES_SECTION } from "../lib/marketing.content";

/**
 * Rejilla de funciones (dirección "Iron & Lime"): encabezado asimétrico
 * título / bajada, tarjetas separadas por hairlines de 1px y numeradas.
 * Sin iconito en pastilla redondeada.
 */
export function FeatureGrid() {
  return (
    <section id="producto" className="scroll-mt-24 border-b border-border">
      <Container className="py-20 sm:py-28">
        <div className="grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <h2 className="display-heading text-[clamp(2rem,5vw,3.25rem)]">
            {FEATURES_SECTION.title}
          </h2>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            {FEATURES_SECTION.description}
          </p>
        </div>

        <div className="hairline-grid mt-14 grid overflow-hidden border border-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className="group bg-background p-7 pb-9 transition-colors hover:bg-card"
            >
              <div className="flex items-start justify-between">
                <span className="display-label text-[12px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon className="size-[22px] text-primary" strokeWidth={2} />
              </div>
              <h3 className="display-label mt-6 text-[15px] text-foreground">
                {title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
