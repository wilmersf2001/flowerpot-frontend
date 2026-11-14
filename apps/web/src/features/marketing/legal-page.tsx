import Link from "next/link";
import { Container } from "@/features/_shared";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import {
  DATA_PROCESSING_DOC,
  LEGAL_UPDATED,
  PRIVACY_DOC,
  TERMS_DOC,
  type LegalDoc,
} from "./lib/legal.content";

const LEGAL_DOCS = [TERMS_DOC, PRIVACY_DOC, DATA_PROCESSING_DOC];

/**
 * Plantilla de las páginas legales: encabezado, índice lateral y secciones.
 * Una sola vista para las tres políticas; el texto vive en `legal.content.ts`.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        <section className="border-b border-border">
          <Container className="py-16 sm:py-24">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="display-label text-[12px] text-primary">
                Legal
              </span>
            </div>
            <h1 className="display-heading mt-6 max-w-3xl text-[clamp(2rem,5vw,3.5rem)]">
              {doc.title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Última actualización: {LEGAL_UPDATED}
            </p>
            <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              {doc.intro}
            </p>
          </Container>
        </section>

        <Container className="py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[16rem_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="display-label text-[12px] text-muted-foreground">
                En este documento
              </p>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>

              <p className="display-label mt-10 text-[12px] text-muted-foreground">
                Otros documentos
              </p>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {LEGAL_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/${d.slug}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>

            <article className="max-w-3xl">
              {doc.sections.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-24 border-b border-border py-8 first:pt-0 last:border-b-0"
                >
                  <h2 className="display-label text-[16px] text-foreground">
                    {s.title}
                  </h2>
                  {s.paragraphs?.map((p) => (
                    <p
                      key={p}
                      className="mt-4 text-pretty leading-relaxed text-muted-foreground"
                    >
                      {p}
                    </p>
                  ))}
                  {s.list ? (
                    <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 marker:text-primary">
                      {s.list.map((item) => (
                        <li
                          key={item}
                          className="text-pretty leading-relaxed text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </article>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
