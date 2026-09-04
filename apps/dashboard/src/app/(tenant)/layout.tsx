import { PanelShell } from "@/components/panel-shell";

// Served at {gym}.flowerpot.pe once middleware.ts routes by subdomain (M1).
const NAV = [
  { href: "/members", label: "Socios" },
  { href: "/memberships", label: "Membresías" },
  { href: "/payments", label: "Pagos" },
  { href: "/attendance", label: "Asistencia" },
  { href: "/check-in", label: "Check-in" },
  { href: "/staff", label: "Personal" },
  { href: "/branches", label: "Sedes" },
  { href: "/cash-register", label: "Caja" },
];

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PanelShell label="Panel del gimnasio" nav={NAV}>
      {children}
    </PanelShell>
  );
}
