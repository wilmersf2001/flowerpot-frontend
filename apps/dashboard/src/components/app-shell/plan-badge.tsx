"use client";

import { Badge, type BadgeTone } from "@repo/ui/badge";
import { useCurrentUser } from "@/features/tenant/auth";

/**
 * Tono por estado de la suscripción del gimnasio. `trial`/`expired`/`cancelled`
 * usan colores de urgencia a propósito: son los estados donde el dueño del
 * gimnasio necesita actuar (pagar, renovar) antes de perder acceso.
 */
const SUBSCRIPTION_STATUS_TONE: Record<string, BadgeTone> = {
  trial: "warning",
  active: "primary",
  cancelled: "danger",
  expired: "danger",
};

/** Badge del plan contratado, visible solo en el panel tenant (hay un `subscription` en `/auth/me`). */
export function PlanBadge() {
  const { data: currentUser } = useCurrentUser();
  const subscription = currentUser?.subscription;

  if (!subscription || !subscription.plan) return null;

  const tone = SUBSCRIPTION_STATUS_TONE[subscription.status] ?? "neutral";
  const label = subscription.isTrial
    ? `${subscription.plan} · Prueba (${subscription.daysRemaining}d)`
    : subscription.status === "cancelled"
      ? `${subscription.plan} · Cancelada`
      : subscription.status === "expired"
        ? `${subscription.plan} · Expirada`
        : subscription.plan;

  return <Badge tone={tone}>{label}</Badge>;
}
