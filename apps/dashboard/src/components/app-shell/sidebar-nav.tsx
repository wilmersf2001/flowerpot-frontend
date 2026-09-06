"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import type { NavItem } from "./nav.config";

/** ¿La ruta actual cae dentro de este item? (`/members` activo en `/members/123`) */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  items,
  orientation = "vertical",
}: {
  items: NavItem[];
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1",
        orientation === "vertical"
          ? "flex-col"
          : "flex-row overflow-x-auto pb-1",
      )}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
