import {
  Banknote,
  Building,
  Building2,
  CalendarCheck,
  CreditCard,
  Layers,
  QrCode,
  Settings,
  Ticket,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { PanelKind } from "@/lib/session";
import { ROUTES } from "@/lib/routes";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const CENTRAL_NAV: NavItem[] = [
  { href: ROUTES.central.tenants, label: "Gimnasios", icon: Building2 },
  { href: ROUTES.central.plans, label: "Planes", icon: Layers },
  {
    href: ROUTES.central.subscriptions,
    label: "Suscripciones",
    icon: CreditCard,
  },
  { href: ROUTES.central.gymSettings, label: "Configuración", icon: Settings },
];

const TENANT_NAV: NavItem[] = [
  { href: ROUTES.tenant.members, label: "Socios", icon: Users },
  { href: ROUTES.tenant.memberships, label: "Membresías", icon: Ticket },
  { href: ROUTES.tenant.payments, label: "Pagos", icon: Banknote },
  { href: ROUTES.tenant.attendance, label: "Asistencia", icon: CalendarCheck },
  { href: ROUTES.tenant.checkIn, label: "Check-in", icon: QrCode },
  { href: ROUTES.tenant.staff, label: "Personal", icon: UserCog },
  { href: ROUTES.tenant.branches, label: "Sedes", icon: Building },
  { href: ROUTES.tenant.cashRegister, label: "Caja", icon: Wallet },
];

export const NAV_BY_PANEL: Record<PanelKind, NavItem[]> = {
  central: CENTRAL_NAV,
  tenant: TENANT_NAV,
};
