import { Section } from "@/features/_shared";
import { getPublicPlans } from "../lib/plans.api";
import { getActivePromotion } from "../lib/promotion.api";
import { PlanCard } from "./plan-card";

/**
 * Sección de precios. Server Component: obtiene los planes en el servidor
 * (datos reales de `GET /plans`, o el respaldo si la API no responde) y los
 * pinta. El plan del medio se marca como destacado.
 */
export async function PlansSection() {
  const [plans, promotion] = await Promise.all([
    getPublicPlans(),
    getActivePromotion(),
  ]);
  const featuredIndex = plans.length >= 3 ? Math.floor(plans.length / 2) : -1;

  return (
    <Section
      id="planes"
      eyebrow="Planes"
      title="Precios claros, sin letra chica"
      description="Elige según cuántas sedes y socios manejas. Cambia de plan cuando quieras; los datos se quedan contigo."
    >
      {promotion ? (
        <div className="mx-auto mb-10 max-w-2xl rounded-md border border-primary/40 bg-primary/5 p-4 text-center text-sm">
          <strong>{promotion.name || "Promoción vigente"}</strong>
          {" · "}
          {promotion.discountLabel} con el código{" "}
          <code className="rounded bg-primary px-2 py-0.5 font-mono text-primary-foreground">
            {promotion.code}
          </code>
          {promotion.validUntil ? (
            <span className="block text-muted-foreground">
              Hasta el{" "}
              {new Date(promotion.validUntil).toLocaleDateString("es-PE", {
                day: "numeric",
                month: "long",
              })}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            featured={i === featuredIndex}
            promoLabel={
              promotion &&
              (promotion.applicablePlans.length === 0 ||
                promotion.applicablePlans.includes(plan.id))
                ? promotion.discountLabel
                : undefined
            }
          />
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Todos los planes incluyen 14 días de prueba, datos cifrados y soporte
        24/7. IGV incluido.
      </p>
    </Section>
  );
}
