import { Button } from "@repo/ui/button";
import { Container } from "@/features/_shared";
import { HERO, HERO_STATS } from "../lib/marketing.content";
import { LiveCapacity } from "./live-capacity";
import { StatCounter } from "./stat-counter";

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
            <div className="fp-rise flex items-center gap-3" style={{ "--i": 0 } as React.CSSProperties}>
              <span className="h-px w-8 bg-primary" />
              <span className="display-label text-[12px] text-primary">
                {HERO.eyebrow}
              </span>
            </div>

            <h1
              className="fp-rise display-heading mt-7 text-[clamp(2.75rem,8vw,5.75rem)]"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              {headline}
              <span className="text-primary">{HERO.highlight}</span>
              {tail}
            </h1>

            <p
              className="fp-rise mt-7 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              {HERO.description}
            </p>

            <div
              className="fp-rise mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <Button size="lg" className="fp-cta rounded-lg" asChild>
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

              {/* Pulso cardíaco recorriendo el panel */}
              <svg
                viewBox="0 0 400 80"
                fill="none"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-1/3 h-20 w-full text-primary/70"
                aria-hidden
              >
                <path
                  className="fp-ecg"
                  d="M0 40h120l12-26 16 52 14-40 10 14h58l12-22 14 44 12-22h132"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <LiveCapacity />
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
                <StatCounter value={stat.value} />
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
