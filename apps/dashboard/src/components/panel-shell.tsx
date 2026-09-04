import Link from "next/link";

export function PanelShell({
  label,
  nav,
  children,
}: {
  label: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar p-4 text-sidebar-foreground md:block">
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
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
