"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { NAV_LINKS } from "../lib/marketing.content";

/**
 * Navegación principal. Los enlaces a páginas (/seguridad, /preguntas-frecuentes)
 * se marcan como activos; los de sección (/#planes) llevan a la home y bajan
 * a su bloque, estés donde estés.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-7 md:flex">
      {NAV_LINKS.map((link) => {
        const active = !link.href.includes("#") && pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "display-label border-b-2 border-transparent py-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground",
              active && "border-primary text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
