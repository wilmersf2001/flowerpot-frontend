import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Container } from "@/features/_shared";
import { ADMIN_URL } from "@/lib/site";
import { BrandMark } from "./brand-mark";
import { NavLinks } from "./nav-links";

/** Barra superior fija, translúcida. Enlaces absolutos: sirven en cualquier página. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label={`${"Flowerpot"} — inicio`}>
            <BrandMark />
          </Link>

          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            asChild
          >
            <a href={ADMIN_URL}>Iniciar sesión</a>
          </Button>
          <Button size="sm" className="rounded-lg" asChild>
            <Link href="/#planes">Empezar prueba</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
