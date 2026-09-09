import { PlansSection } from "@/features/plans";
import { SiteHeader } from "./components/site-header";
import { Hero } from "./components/hero";
import { FeatureGrid } from "./components/feature-grid";
import { SecuritySection } from "./components/security-section";
import { MembersSection } from "./components/members-section";
import { CtaSection } from "./components/cta-section";
import { SiteFooter } from "./components/site-footer";

/**
 * Página pública de Flowerpot. Solo composición: cada bloque es su propio
 * componente y trae su contenido de `lib/marketing.content.ts`. La sección de
 * planes obtiene los datos reales en el servidor (`features/plans`).
 */
export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        <Hero />
        <FeatureGrid />
        <SecuritySection />
        <MembersSection />
        <PlansSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
