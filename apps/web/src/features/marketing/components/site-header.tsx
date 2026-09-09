import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Container } from "@/features/_shared";
import { NAV_LINKS } from "../lib/marketing.content";
import { BrandMark } from "./brand-mark";

/** Barra superior fija, translúcida. Navegación por anclas de la landing. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label={`${"Flowerpot"} — inicio`}>
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="display-label text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            asChild
          >
            <a href="https://admin.localhost:3001">Iniciar sesión</a>
          </Button>
          <Button size="sm" className="rounded-lg" asChild>
            <a href="#planes">Empezar prueba</a>
          </Button>
        </div>
      </Container>
    </header>
  );
}
