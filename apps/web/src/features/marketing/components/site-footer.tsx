import { Container } from "@/features/_shared";
import { BRAND, FOOTER } from "../lib/marketing.content";
import { BrandMark } from "./brand-mark";

/** Pie del sitio: marca, columnas de enlaces y línea legal. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <BrandMark />
            <p className="mt-4 text-sm text-muted-foreground">
              {FOOTER.description}
            </p>
          </div>

          {FOOTER.columns.map((col) => (
            <div key={col.title}>
              <h3 className="display-label text-[12px] text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.name}. Hecho en Perú.
          </p>
          <p>{BRAND.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
