import { JsonLd, LandingPage } from "@/features/marketing";
import { getPublicPlans } from "@/features/plans";
import {
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/structured-data";

export default async function HomePage() {
  // Mismos datos que `PlansSection` (fetch deduplicado por Next): sirven para
  // declarar el precio de entrada real en el JSON-LD del producto.
  const plans = await getPublicPlans();
  const priceFrom = Math.min(
    ...plans.map((p) => p.priceCents / 100).filter((n) => n > 0),
  );

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          websiteSchema(),
          softwareApplicationSchema({
            priceFrom: Number.isFinite(priceFrom) ? priceFrom : undefined,
          }),
        ]}
      />
      <LandingPage />
    </>
  );
}
