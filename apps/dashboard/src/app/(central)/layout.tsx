import { PanelShell } from "@/components/panel-shell";
import { LogoutButton } from "@/components/logout-button";

// Served at admin.flowerpot.pe once middleware.ts routes by subdomain (M1).
const NAV = [
  { href: "/tenants", label: "Gimnasios (tenants)" },
  { href: "/plans", label: "Planes" },
  { href: "/subscriptions", label: "Suscripciones" },
  { href: "/gym-settings", label: "Configuración de gyms" },
];

export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PanelShell
      label="Administración central"
      nav={NAV}
      footer={<LogoutButton />}
    >
      {children}
    </PanelShell>
  );
}
