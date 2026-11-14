import type { CampaignBanner as Banner } from "../lib/site-settings.api";

/** Franja de campaña sobre el header. Colores y textos los define el admin. */
export function CampaignBanner({ banner }: { banner: Banner }) {
  return (
    <div
      className="bg-primary px-4 py-2 text-center text-sm text-primary-foreground"
      style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
    >
      {banner.title ? <strong className="mr-2">{banner.title}</strong> : null}
      <span>{banner.message}</span>
      {banner.ctaText && banner.ctaUrl ? (
        <a href={banner.ctaUrl} className="ml-3 font-medium underline">
          {banner.ctaText}
        </a>
      ) : null}
    </div>
  );
}
