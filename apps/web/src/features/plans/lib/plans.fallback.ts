import type { PublicPlan } from "./plans.types";

/**
 * Planes de respaldo: se usan solo si `GET /plans` no responde (API caída en
 * local, timeout en build, etc.). Así la landing SIEMPRE renderiza una sección
 * de precios coherente. Los datos reales, cuando hay API, siempre ganan.
 */
export const FALLBACK_PLANS: PublicPlan[] = [
  {
    id: "starter",
    name: "Semilla",
    slug: "starter",
    description: "Para el gimnasio de barrio que quiere ordenarse de una vez.",
    priceFormatted: "S/ 99",
    priceCents: 9900,
    currency: "PEN",
    billingPeriod: "monthly",
    maxLocations: 1,
    maxMembers: 250,
    hasUnlimitedMembers: false,
    hasUnlimitedLocations: false,
    sortOrder: 1,
    features: [
      "1 sede",
      "Hasta 250 socios",
      "Control de acceso y asistencia",
      "Cobros y caja diaria",
      "Soporte por chat 24/7",
    ],
  },
  {
    id: "growth",
    name: "Macetero",
    slug: "growth",
    description: "El plan que aguanta cuando el local se llena todos los días.",
    priceFormatted: "S/ 199",
    priceCents: 19900,
    currency: "PEN",
    billingPeriod: "monthly",
    maxLocations: 3,
    maxMembers: 1200,
    hasUnlimitedMembers: false,
    hasUnlimitedLocations: false,
    sortOrder: 2,
    features: [
      "Hasta 3 sedes",
      "Hasta 1200 socios",
      "Reportes de ingresos y retención",
      "Recordatorios de pago automáticos",
      "Roles y permisos por sede",
      "Soporte prioritario 24/7",
    ],
  },
  {
    id: "pro",
    name: "Power Maceta",
    slug: "pro",
    description: "Cadena en expansión, multi-sede y con todo bajo control.",
    priceFormatted: "S/ 399",
    priceCents: 39900,
    currency: "PEN",
    billingPeriod: "monthly",
    maxLocations: 0,
    maxMembers: 0,
    hasUnlimitedMembers: true,
    hasUnlimitedLocations: true,
    sortOrder: 3,
    features: [
      "Sedes ilimitadas",
      "Socios ilimitados",
      "Datos cifrados y respaldos diarios",
      "Exportación e integraciones por API",
      "Gerente de cuenta dedicado",
      "SLA y soporte 24/7",
    ],
  },
];
