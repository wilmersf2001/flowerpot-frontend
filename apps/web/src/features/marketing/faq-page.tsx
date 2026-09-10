import { Plus } from "lucide-react";
import { Container } from "@/features/_shared";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { FAQ_GROUPS, FAQ_INTRO } from "./lib/faq.content";

/**
 * Página de Preguntas Frecuentes. Acordeones nativos (`<details>`/`<summary>`):
 * sin JavaScript, accesibles y con el contenido siempre en el HTML (que es lo
 * que indexa Google). El JSON-LD `FAQPage` se inyecta desde la ruta.
 */
export function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        <section className="border-b border-border">
          <Container className="py-16 sm:py-24">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="display-label text-[12px] text-primary">
                {FAQ_INTRO.eyebrow}
              </span>
            </div>
            <h1 className="display-heading mt-6 max-w-3xl text-[clamp(2rem,5vw,3.5rem)]">
              {FAQ_INTRO.title}
            </h1>
            <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              {FAQ_INTRO.description}
            </p>
          </Container>
        </section>

        <Container className="py-16 sm:py-24">
          <div className="flex flex-col gap-16">
            {FAQ_GROUPS.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <h2 className="display-label text-[13px] text-muted-foreground">
                  {group.title}
                </h2>
                <div className="mt-5 border-t border-border">
                  {group.items.map((item) => (
                    <details
                      key={item.question}
                      className="group border-b border-border"
                    >
                      <summary className="flex cursor-pointer items-start justify-between gap-6 py-5 text-pretty text-base font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <Plus
                          className="mt-0.5 size-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </summary>
                      <p className="max-w-2xl pb-6 text-pretty leading-relaxed text-muted-foreground">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-16 text-sm text-muted-foreground">
            ¿Sigues con dudas? Escríbenos por el chat del sitio o desde{" "}
            <a
              href="#"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              contacto
            </a>
            . {/* TODO: enlazar a /contacto cuando exista la página. */}
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
