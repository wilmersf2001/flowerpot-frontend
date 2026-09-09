import type { PublicPlan } from "./plans.types";

const PERIOD_LABELS: Record<string, string> = {
  monthly: "/ mes",
  yearly: "/ año",
};

/** Sufijo legible del periodo de facturación ("/ mes"). */
export function billingSuffix(plan: PublicPlan): string {
  return PERIOD_LABELS[plan.billingPeriod] ?? "";
}

/** Texto del límite de socios ("Socios ilimitados" | "Hasta 1200 socios"). */
export function membersLimitLabel(plan: PublicPlan): string {
  return plan.hasUnlimitedMembers
    ? "Socios ilimitados"
    : `Hasta ${plan.maxMembers.toLocaleString("es-PE")} socios`;
}

/** Texto del límite de sedes ("Sedes ilimitadas" | "1 sede" | "3 sedes"). */
export function locationsLimitLabel(plan: PublicPlan): string {
  if (plan.hasUnlimitedLocations) return "Sedes ilimitadas";
  return plan.maxLocations === 1 ? "1 sede" : `${plan.maxLocations} sedes`;
}
