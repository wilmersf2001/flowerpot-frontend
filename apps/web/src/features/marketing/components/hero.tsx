import { Button } from "@repo/ui/button";
import { Container } from "@/features/_shared";
import { HERO, HERO_STATS } from "../lib/marketing.content";

/**
 * Portada editorial (dirección "Iron & Lime"): headline condensado gigante a
 * la izquierda, panel de dato en vivo a la derecha, franja de métricas con
 * hairlines abajo. Nada centrado.
 */
export function Hero() {
  const [headline, tail] = HERO.title.split(HERO.highlight);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-brand-glow pointer-events-none absolute inset-0" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />

      <Container className="relative">
        <div className="grid items-end gap-14 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Columna de texto */}
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="display-label text-[12px] text-primary">
                {HERO.eyebrow}
              </span>
            </div>

            <h1 className="display-heading mt-7 text-[clamp(2.75rem,8vw,5.75rem)]">
              {headline}
              <span className="text-primary">{HERO.highlight}</span>
              {tail}
            </h1>

            <p className="mt-7 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {HERO.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="rounded-lg" asChild>
                <a href="#planes">{HERO.primaryCta}</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg"
                asChild
              >
                <a href="#planes">{HERO.secondaryCta}</a>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">{HERO.note}</p>
          </div>

          {/* Panel de dato en vivo */}
          <div className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-md border border-border bg-card">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 27px, color-mix(in oklab, var(--foreground) 4%, transparent) 27px, color-mix(in oklab, var(--foreground) 4%, transparent) 28px)",
                }}
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="absolute left-6 top-6 size-6 text-muted-foreground"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>

              <div className="absolute inset-x-6 bottom-6">
                <div className="display-label text-[11px] text-muted-foreground">
                  Aforo en vivo · Sede Miraflores
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="display-heading text-5xl text-primary">
                    68
                  </span>
                  <span className="display-label text-sm text-muted-foreground">
                    / 120
                  </span>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-[57%] bg-primary" />
                </div>
              </div>
            </div>

            <div className="display-label absolute -right-3 -top-3 rounded-lg bg-primary px-3 py-1.5 text-[11px] text-primary-foreground">
              99.9% uptime
            </div>
          </div>
        </div>

        {/* Franja de métricas */}
        <dl className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-border py-7 not-first:border-t sm:border-t-0 sm:px-7 sm:not-last:border-r sm:first:pl-0"
            >
              <dt className="display-heading text-4xl">
                {stat.value}
                {stat.unit ? (
                  <span className="text-primary">{stat.unit}</span>
                ) : null}
              </dt>
              <dd className="display-label mt-1 text-[11px] text-muted-foreground">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
