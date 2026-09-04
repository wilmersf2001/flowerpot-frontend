import Link from "next/link";

export function PanelShell({
  label,
  nav,
  footer,
  children,
}: {
  label: string;
  nav: { href: string; label: string }[];
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar p-4 text-sidebar-foreground md:flex">
        <div className="mb-6 px-2">
          <span className="text-sm font-bold tracking-tight">Flowerpot</span>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {footer && <div className="mt-auto pt-4">{footer}</div>}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
