import type { PanelKind } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import type { NavIconName } from "./nav-icons";

export interface NavItem {
  href: string;
  label: string;
  /** Clave del icono; se resuelve a un componente en `nav-icons.ts` (cliente). */
  icon: NavIconName;
}

const CENTRAL_NAV: NavItem[] = [
  { href: ROUTES.central.tenants, label: "Gimnasios", icon: "building2" },
  { href: ROUTES.central.plans, label: "Planes", icon: "layers" },
  {
    href: ROUTES.central.subscriptions,
    label: "Suscripciones",
    icon: "creditCard",
  },
  { href: ROUTES.central.gymSettings, label: "Configuración", icon: "settings" },
];

const TENANT_NAV: NavItem[] = [
  { href: ROUTES.tenant.members, label: "Socios", icon: "users" },
  { href: ROUTES.tenant.memberships, label: "Membresías", icon: "ticket" },
  { href: ROUTES.tenant.payments, label: "Pagos", icon: "banknote" },
  { href: ROUTES.tenant.attendance, label: "Asistencia", icon: "calendarCheck" },
  { href: ROUTES.tenant.checkIn, label: "Check-in", icon: "qrCode" },
  { href: ROUTES.tenant.staff, label: "Personal", icon: "userCog" },
  { href: ROUTES.tenant.users, label: "Usuarios", icon: "shieldCheck" },
  { href: ROUTES.tenant.branches, label: "Sedes", icon: "building" },
  { href: ROUTES.tenant.cashRegister, label: "Caja", icon: "wallet" },
];

export const NAV_BY_PANEL: Record<PanelKind, NavItem[]> = {
  central: CENTRAL_NAV,
  tenant: TENANT_NAV,
};
