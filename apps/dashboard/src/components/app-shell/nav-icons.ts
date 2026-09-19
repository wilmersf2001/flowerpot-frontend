import {
  Banknote,
  Building,
  Building2,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  GraduationCap,
  Layers,
  Package,
  QrCode,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  UserCog,
  Users,
  Wallet,
  Wrench,
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
  dumbbell: Dumbbell,
  graduationCap: GraduationCap,
  layers: Layers,
  package: Package,
  qrCode: QrCode,
  receipt: Receipt,
  settings: Settings,
  shieldCheck: ShieldCheck,
  shoppingCart: ShoppingCart,
  ticket: Ticket,
  userCog: UserCog,
  users: Users,
  wallet: Wallet,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof NAV_ICONS;
