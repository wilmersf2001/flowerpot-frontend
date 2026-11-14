import { PlansSection } from "@/features/plans";
import { SiteHeader } from "./components/site-header";
import { Hero } from "./components/hero";
import { MottoTicker } from "./components/motto-ticker";
import { FeatureGrid } from "./components/feature-grid";
import { HardwareSection } from "./components/hardware-section";
import { SecuritySection } from "./components/security-section";
import { MembersSection } from "./components/members-section";
import { CtaSection } from "./components/cta-section";
import { SiteFooter } from "./components/site-footer";
import { CampaignBanner } from "./components/campaign-banner";
import { WhatsAppButton } from "./components/whatsapp-button";
import { getPublicSiteSettings } from "./lib/site-settings.api";

/**
 * Página pública de Flowerpot. Solo composición: cada bloque es su propio
 * componente y trae su contenido de `lib/marketing.content.ts`. La sección de
 * planes obtiene los datos reales en el servidor (`features/plans`).
 */
export async function LandingPage() {
  const { banner, whatsapp } = await getPublicSiteSettings();
  return (
    <>
      {banner ? <CampaignBanner banner={banner} /> : null}
      <SiteHeader />
      <main className="flex flex-col">
        <Hero />
        <MottoTicker />
        <FeatureGrid />
        <HardwareSection />
        <SecuritySection />
        <MembersSection />
        <PlansSection />
        <CtaSection />
      </main>
      <SiteFooter />
      {whatsapp ? <WhatsAppButton support={whatsapp} /> : null}
    </>
  );
}
