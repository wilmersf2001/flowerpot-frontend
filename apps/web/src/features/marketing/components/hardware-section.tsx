import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Container } from "@/features/_shared";
import {
  ACCESS_RULES,
  COVERAGE,
  HARDWARE_ITEMS,
  HARDWARE_SECTION,
} from "../lib/hardware.content";
import { Reveal } from "./reveal";

/**
 * Hardware compatible + garantía de instalación. Las tarjetas muestran la foto
 * del equipo si `image` está definida; si no, un icono (nunca imagen rota).
 */
export function HardwareSection() {
  const CoverageIcon = COVERAGE.icon;

  return (
    <section id="hardware" className="scroll-mt-24 border-b border-border">
      <Container className="py-20 sm:py-28">
        <Reveal className="grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="display-label text-[12px] text-primary">
              {HARDWARE_SECTION.eyebrow}
            </span>
            <h2 className="display-heading mt-3 text-[clamp(2rem,5vw,3.25rem)]">
              {HARDWARE_SECTION.title}
            </h2>
          </div>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            {HARDWARE_SECTION.description}
          </p>
        </Reveal>

        <div className="hairline-grid mt-14 grid overflow-hidden border border-border md:grid-cols-3">
          {HARDWARE_ITEMS.map(
            ({
              icon: Icon,
              badge,
              title,
              model,
              description,
              highlights,
              image,
              imageAlt,
            }) => (
              <div key={title} className="bg-background p-6 sm:p-7">
                <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
                  {image ? (
                    <Image
                      src={image}
                      alt={imageAlt ?? `${title} ${model ?? ""}`.trim()}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-contain p-4"
                    />
                  ) : (
                    <Icon
                      className="size-14 text-primary"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  )}
                  {badge ? (
                    <span className="display-label absolute left-3 top-3 rounded-sm border border-primary/40 bg-background/80 px-2 py-1 text-[10px] text-primary">
                      {badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="display-label mt-5 text-[15px] text-foreground">
                  {title}
                </h3>
                {model ? (
                  <p className="mt-1 text-xs font-medium text-primary">
                    {model}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>

        {/* Reglas comunes */}
        <div className="mt-10 grid gap-6 rounded-md border border-border bg-card p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h3 className="display-label text-[15px] text-foreground">
              {ACCESS_RULES.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {ACCESS_RULES.description}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {ACCESS_RULES.rules.map((rule) => (
              <li
                key={rule}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Nosotros nos encargamos */}
        <div className="bg-brand-glow relative mt-10 overflow-hidden rounded-md border border-border bg-card p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <CoverageIcon className="size-5 text-primary" aria-hidden />
                <span className="display-label text-[12px] text-primary">
                  {COVERAGE.eyebrow}
                </span>
              </div>
              <h3 className="display-heading mt-4 text-[clamp(1.5rem,3.5vw,2.25rem)]">
                {COVERAGE.title}
              </h3>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
                {COVERAGE.description}
              </p>
              <Button
                size="lg"
                variant="outline"
                className="mt-7 rounded-lg"
                asChild
              >
                <Link href={COVERAGE.cta.href}>{COVERAGE.cta.label}</Link>
              </Button>
            </div>

            <div>
              <ol className="flex flex-col gap-4">
                {COVERAGE.steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="display-heading text-xl text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-pretty pt-1 text-sm leading-relaxed text-muted-foreground">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                {COVERAGE.footnote}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
