import {
  Banknote,
  Building,
  Building2,
  CalendarCheck,
  CreditCard,
  Layers,
  QrCode,
  Receipt,
  Settings,
  ShieldCheck,
  Ticket,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapa de iconos de navegación. La config (`nav.config.ts`) referencia iconos
 * por clave string para poder cruzar la frontera Server -> Client Component;
 * aquí se resuelven al componente real, ya en el cliente.
 */
export const NAV_ICONS = {
  banknote: Banknote,
  building: Building,
  building2: Building2,
  calendarCheck: CalendarCheck,
  creditCard: CreditCard,
  layers: Layers,
  qrCode: QrCode,
  receipt: Receipt,
  settings: Settings,
  shieldCheck: ShieldCheck,
  ticket: Ticket,
  userCog: UserCog,
  users: Users,
  wallet: Wallet,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof NAV_ICONS;
