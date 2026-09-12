import type { PanelKind } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import type { NavIconName } from "./nav-icons";

export interface NavItem {
  href: string;
  label: string;
  /** Clave del icono; se resuelve a un componente en `nav-icons.ts` (cliente). */
  icon: NavIconName;
  /**
   * Permiso requerido para ver el item (nombre técnico del catálogo, p. ej.
   * `"members.view"`). `undefined` = siempre visible (sin permiso asociado).
   * Solo aplica al panel tenant; el central no tiene sistema de permisos.
   */
  permission?: string;
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
  { href: ROUTES.tenant.members, label: "Socios", icon: "users", permission: "members.view" },
  {
    href: ROUTES.tenant.memberships,
    label: "Membresías",
    icon: "ticket",
    permission: "memberships.view",
  },
  {
    href: ROUTES.tenant.membershipPlans,
    label: "Planes de membresía",
    icon: "layers",
    permission: "plans.view",
  },
  { href: ROUTES.tenant.payments, label: "Pagos", icon: "banknote", permission: "payments.view" },
  { href: ROUTES.tenant.expenses, label: "Gastos", icon: "receipt", permission: "expenses.view" },
  {
    href: ROUTES.tenant.attendance,
    label: "Asistencia",
    icon: "calendarCheck",
    permission: "attendance.view",
  },
  { href: ROUTES.tenant.checkIn, label: "Check-in", icon: "qrCode", permission: "checkin.view" },
  { href: ROUTES.tenant.staff, label: "Personal", icon: "userCog", permission: "staff.view" },
  { href: ROUTES.tenant.users, label: "Usuarios", icon: "shieldCheck", permission: "users.view" },
  { href: ROUTES.tenant.branches, label: "Sedes", icon: "building", permission: "branches.view" },
  {
    href: ROUTES.tenant.cashRegister,
    label: "Caja",
    icon: "wallet",
    permission: "cash_register.view",
  },
];

export const NAV_BY_PANEL: Record<PanelKind, NavItem[]> = {
  central: CENTRAL_NAV,
  tenant: TENANT_NAV,
};
