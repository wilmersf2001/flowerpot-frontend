import {
  Activity,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  DoorOpen,
  Headset,
  KeyRound,
  LineChart,
  Lock,
  ServerCog,
  ShieldCheck,
  Users,
} from "lucide-react";
import type {
  Feature,
  MemberGym,
  NavLink,
  SecurityPoint,
  Stat,
  Testimonial,
} from "./marketing.types";

/**
 * Todo el contenido de la landing en un solo lugar y tipado. Las secciones
 * son declarativas: mapean sobre estas constantes, no llevan texto embebido.
 */

export const BRAND = {
  name: "Flowerpot",
  tagline: "El sistema operativo de tu gimnasio",
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "Producto", href: "#producto" },
  { label: "Seguridad", href: "#seguridad" },
  { label: "Socios", href: "#socios" },
  { label: "Planes", href: "#planes" },
];

export const HERO = {
  eyebrow: "Software de gestión para gimnasios · Perú",
  title: "Tu gimnasio en su mejor forma.",
  highlight: "su mejor forma.",
  description:
    "Socios, membresías, cobros, control de acceso y caja en una sola plataforma. Multi-sede, con datos cifrados y soporte 24/7. Elegante por fuera, potente por dentro.",
  primaryCta: "Empezar prueba gratis",
  secondaryCta: "Ver planes",
  note: "14 días gratis · sin tarjeta · migración asistida",
  imageSeed: "flowerpot-gym-hero",
} as const;

export const HERO_STATS: Stat[] = [
  { value: "120", unit: "+", label: "gimnasios activos" },
  { value: "48", unit: "k", label: "socios gestionados" },
  { value: "99.9", unit: "%", label: "uptime" },
  { value: "24", unit: "/7", label: "soporte real" },
];

export const FEATURES_SECTION = {
  eyebrow: "Producto",
  title: "Todo lo que hace mover tu gimnasio, en un panel",
  description:
    "Deja las hojas de cálculo y los cuadernos. Flowerpot ordena la operación diaria para que te dediques a que la gente entrene.",
} as const;

export const FEATURES: Feature[] = [
  {
    icon: Users,
    title: "Socios y membresías",
    description:
      "Altas en segundos, planes, congelamientos y vencimientos. Sabes al toque quién está al día y quién no.",
  },
  {
    icon: DoorOpen,
    title: "Control de acceso",
    description:
      "Torniquete, QR o huella. Solo entra quien tiene membresía activa; el resto queda registrado.",
  },
  {
    icon: CreditCard,
    title: "Cobros y caja",
    description:
      "Cobra con Yape, tarjeta o efectivo. Cierre de caja diario cuadrado y sin sustos.",
  },
  {
    icon: CalendarClock,
    title: "Asistencia y aforo",
    description:
      "Mira el aforo en vivo, horas pico y qué sede rinde más. Decide con datos, no con corazonadas.",
  },
  {
    icon: LineChart,
    title: "Reportes de negocio",
    description:
      "Ingresos, retención y proyección de renovaciones. El pulso de tu gimnasio, actualizado solo.",
  },
  {
    icon: BadgeCheck,
    title: "Multi-sede real",
    description:
      "Una cuenta, todas tus sedes. Permisos por local y consolidado del grupo en una vista.",
  },
];

export const SECURITY_SECTION = {
  eyebrow: "Seguridad y respaldo",
  title: "Tus datos y los de tus socios, blindados",
  description:
    "La información de tu gimnasio es tu activo más valioso. La tratamos como tal: cifrada, respaldada y siempre disponible.",
  imageSeed: "flowerpot-datacenter-secure",
} as const;

export const SECURITY_POINTS: SecurityPoint[] = [
  {
    icon: Lock,
    title: "Cifrado de extremo a extremo",
    description:
      "Conexión HTTPS y datos cifrados en tránsito y en reposo. Nadie más ve tu información.",
  },
  {
    icon: ServerCog,
    title: "Respaldos automáticos diarios",
    description:
      "Copias de seguridad cada día con retención histórica. Si algo pasa, se restaura sin drama.",
  },
  {
    icon: KeyRound,
    title: "Roles y permisos finos",
    description:
      "Cada persona ve solo lo suyo. Recepción no toca finanzas; finanzas no toca accesos.",
  },
  {
    icon: ShieldCheck,
    title: "Tú eres el dueño de tus datos",
    description:
      "Exporta todo cuando quieras. Sin candados: tu información sale contigo si lo decides.",
  },
];

export const SUPPORT = {
  eyebrow: "Soporte 24/7",
  title: "Gente real, a cualquier hora",
  description:
    "Chat, correo y teléfono todos los días del año. Tiempo de primera respuesta menor a 5 minutos en horario pico.",
  points: [
    "Onboarding y migración de tus datos sin costo",
    "Centro de ayuda y videos paso a paso",
    "Gerente de cuenta dedicado en el plan superior",
  ],
  icon: Headset,
  responseIcon: Activity,
} as const;

/**
 * Sección "Socios": gimnasios que ya usan Flowerpot.
 * TODO(estado): data HARCODEADA a propósito. Falta el flag de visibilidad del
 * gimnasio en el backend para saber si quiere aparecer en este directorio.
 * Cuando exista, esto se reemplaza por una carga desde la API.
 */
export const MEMBERS_SECTION = {
  eyebrow: "Socios",
  title: "Gimnasios que ya crecen con Flowerpot",
  description:
    "De estudios boutique a cadenas multi-sede. Distinto tamaño, la misma base ordenada.",
} as const;

export const MEMBER_GYMS: MemberGym[] = [
  {
    name: "Power Maceta Lima",
    city: "Miraflores, Lima",
    imageSeed: "gym-power-maceta-lima",
    members: "1.4k socios",
  },
  {
    name: "Hierro Norte",
    city: "Trujillo",
    imageSeed: "gym-hierro-norte",
    members: "820 socios",
  },
  {
    name: "Cumbre Fitness",
    city: "Arequipa",
    imageSeed: "gym-cumbre-fitness",
    members: "610 socios",
  },
  {
    name: "Box 021",
    city: "Barranco, Lima",
    imageSeed: "gym-box-021",
    members: "240 socios",
  },
  {
    name: "Altura Climbing & Gym",
    city: "Cusco",
    imageSeed: "gym-altura-cusco",
    members: "390 socios",
  },
  {
    name: "Delta Strength",
    city: "San Isidro, Lima",
    imageSeed: "gym-delta-strength",
    members: "1.1k socios",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Pasamos de tres cuadernos y un Excel a una sola pantalla. El cierre de caja que antes tomaba una hora ahora sale en cinco minutos.",
    author: "Renzo Palacios",
    role: "Dueño, Power Maceta Lima",
    avatarSeed: "avatar-renzo",
  },
  {
    quote:
      "Abrimos la segunda sede sin contratar a nadie de administración. Los permisos por local nos salvaron.",
    author: "Camila Ortega",
    role: "Gerente, Cumbre Fitness",
    avatarSeed: "avatar-camila",
  },
];

export const FINAL_CTA = {
  title: "Ordena tu gimnasio esta semana",
  description:
    "Migramos tus socios y tu historial sin costo. En un día estás operando con Flowerpot.",
  primaryCta: "Empezar prueba gratis",
  secondaryCta: "Hablar con ventas",
} as const;

export const FOOTER = {
  description:
    "Software de gestión para gimnasios en Perú. Hecho para que la maceta crezca ordenada.",
  columns: [
    {
      title: "Producto",
      links: [
        { label: "Funciones", href: "#producto" },
        { label: "Seguridad", href: "#seguridad" },
        { label: "Planes", href: "#planes" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { label: "Socios", href: "#socios" },
        { label: "Contacto", href: "#" },
        { label: "Estado del servicio", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Términos", href: "#" },
        { label: "Privacidad", href: "#" },
        { label: "Tratamiento de datos", href: "#" },
      ],
    },
  ],
} as const;
