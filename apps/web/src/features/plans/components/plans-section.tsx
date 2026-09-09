import { Section } from "@/features/_shared";
import { getPublicPlans } from "../lib/plans.api";
import { PlanCard } from "./plan-card";

/**
 * Sección de precios. Server Component: obtiene los planes en el servidor
 * (datos reales de `GET /plans`, o el respaldo si la API no responde) y los
 * pinta. El plan del medio se marca como destacado.
 */
export async function PlansSection() {
  const plans = await getPublicPlans();
  const featuredIndex = plans.length >= 3 ? Math.floor(plans.length / 2) : -1;

  return (
    <Section
      id="planes"
      eyebrow="Planes"
      title="Precios claros, sin letra chica"
      description="Elige según cuántas sedes y socios manejas. Cambia de plan cuando quieras; los datos se quedan contigo."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} featured={i === featuredIndex} />
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Todos los planes incluyen 14 días de prueba, datos cifrados y soporte
        24/7. IGV incluido.
      </p>
    </Section>
  );
}
