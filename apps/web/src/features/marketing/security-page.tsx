import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Container } from "@/features/_shared";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import {
  CONTRAST,
  ISOLATION,
  OWNERSHIP,
  SECURITY_CTA,
  SECURITY_INTRO,
  SECURITY_LAYERS,
} from "./lib/security.content";

/**
 * Página /seguridad. Explica el aislamiento por gimnasio (multi-tenant) en
 * lenguaje simple y lo contrasta con "cuaderno / Excel / WhatsApp".
 * Composición de bloques; el contenido vive en `lib/security.content.ts`.
 */
export function SecurityPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        {/* Intro */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="bg-brand-glow pointer-events-none absolute inset-0" />
          <Container className="relative py-16 sm:py-24">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="display-label text-[12px] text-primary">
                {SECURITY_INTRO.eyebrow}
              </span>
            </div>
            <h1 className="display-heading mt-6 max-w-3xl text-[clamp(2rem,5.5vw,3.75rem)]">
              {SECURITY_INTRO.title}
            </h1>
            <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              {SECURITY_INTRO.description}
            </p>
          </Container>
        </section>

        {/* Aislamiento por gimnasio */}
        <section id="aislamiento" className="scroll-mt-24 border-b border-border">
          <Container className="py-20 sm:py-28">
            <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <span className="display-label text-[12px] text-primary">
                  {ISOLATION.eyebrow}
                </span>
                <h2 className="display-heading mt-3 text-[clamp(1.75rem,4vw,2.75rem)]">
                  {ISOLATION.title}
                </h2>

                <div className="mt-8 rounded-md border border-border bg-card p-6">
                  <p className="display-label text-[12px] text-muted-foreground">
                    {ISOLATION.analogyTitle}
                  </p>
                  <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                    {ISOLATION.analogy}
                  </p>
                </div>

                {/*
                  Diagrama: tres gimnasios, cada uno en su caja cerrada, sin
                  nada que los conecte. Comunica "aislado" sin necesidad de
                  imagen. Ver nota en security.content.ts por si a futuro se
                  reemplaza por una ilustración.
                */}
                <div
                  className="mt-8 grid grid-cols-3 gap-3"
                  aria-hidden
                >
                  {["Gimnasio A", "Tu gimnasio", "Gimnasio B"].map((name, i) => (
                    <div
                      key={name}
                      className={`rounded-md border p-4 text-center ${
                        i === 1
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="mx-auto flex size-8 items-center justify-center gap-0.5 rounded-md border border-border bg-background">
                        <span className="h-2.5 w-0.5 rounded-full bg-primary" />
                        <span className="h-3.5 w-0.5 rounded-full bg-primary" />
                        <span className="h-3.5 w-0.5 rounded-full bg-primary" />
                        <span className="h-2.5 w-0.5 rounded-full bg-primary" />
                      </div>
                      <p className="display-label mt-3 text-[10px] text-muted-foreground">
                        {name}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        datos propios
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Sin puentes entre cajas: cada gimnasio solo ve lo suyo.
                </p>
              </div>

              <ol className="flex flex-col gap-px overflow-hidden rounded-md border border-border bg-border">
                {ISOLATION.steps.map((step, i) => (
                  <li key={step.title} className="bg-background p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <span className="display-heading text-2xl text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="display-label text-[15px] text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>

        {/* Capas de protección */}
        <section id="capas" className="scroll-mt-24 border-b border-border">
          <Container className="py-20 sm:py-28">
            <h2 className="display-heading max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)]">
              Y encima del aislamiento, varias capas más
            </h2>
            <ul className="hairline-grid mt-12 grid overflow-hidden border border-border sm:grid-cols-2 lg:grid-cols-3">
              {SECURITY_LAYERS.map(({ icon: Icon, title, description }) => (
                <li key={title} className="bg-background p-6">
                  <Icon className="size-5 text-primary" strokeWidth={2} />
                  <h3 className="display-label mt-4 text-[14px] text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Contraste */}
        <section id="contraste" className="scroll-mt-24 border-b border-border">
          <Container className="py-20 sm:py-28">
            <span className="display-label text-[12px] text-primary">
              {CONTRAST.eyebrow}
            </span>
            <h2 className="display-heading mt-3 max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)]">
              {CONTRAST.title}
            </h2>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-160 border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-2/5 py-4 pr-4 align-bottom" />
                    <th className="display-label px-4 py-4 align-bottom text-[12px] text-muted-foreground">
                      {CONTRAST.columns.before}
                    </th>
                    <th className="display-label px-4 py-4 align-bottom text-[12px] text-primary">
                      {CONTRAST.columns.after}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CONTRAST.rows.map((row) => (
                    <tr
                      key={row.question}
                      className="border-b border-border align-top"
                    >
                      <th
                        scope="row"
                        className="py-5 pr-4 text-pretty text-sm font-medium text-foreground"
                      >
                        {row.question}
                      </th>
                      <td className="px-4 py-5 text-pretty text-sm text-muted-foreground">
                        <span className="flex gap-2">
                          <X
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground/60"
                            aria-hidden
                          />
                          {row.before}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-pretty text-sm text-muted-foreground">
                        <span className="flex gap-2">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            aria-hidden
                          />
                          {row.after}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* Propiedad de los datos */}
        <section id="propiedad" className="scroll-mt-24 border-b border-border">
          <Container className="py-20 sm:py-28">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <span className="display-label text-[12px] text-primary">
                  {OWNERSHIP.eyebrow}
                </span>
                <h2 className="display-heading mt-3 text-[clamp(1.75rem,4vw,2.75rem)]">
                  {OWNERSHIP.title}
                </h2>
              </div>
              <ul className="flex flex-col gap-4">
                {OWNERSHIP.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="text-pretty leading-relaxed text-muted-foreground">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <Container>
            <div className="bg-brand-glow relative overflow-hidden rounded-md border border-border bg-card px-8 py-14 sm:px-14">
              <h2 className="display-heading max-w-2xl text-[clamp(1.5rem,3.5vw,2.25rem)]">
                {SECURITY_CTA.title}
              </h2>
              <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                {SECURITY_CTA.description}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="rounded-lg" asChild>
                  <Link href={SECURITY_CTA.primaryHref}>
                    {SECURITY_CTA.primaryCta}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg"
                  asChild
                >
                  <Link href={SECURITY_CTA.secondaryHref}>
                    {SECURITY_CTA.secondaryCta}
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
