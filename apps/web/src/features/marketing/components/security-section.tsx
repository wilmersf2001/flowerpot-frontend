import { Section, PlaceholderImage } from "@/features/_shared";
import {
  SECURITY_POINTS,
  SECURITY_SECTION,
  SUPPORT,
} from "../lib/marketing.content";

/**
 * Seguridad + respaldo + soporte 24/7. El bloque que da tranquilidad al
 * cliente: sus datos y los de sus socios están cuidados y siempre hay alguien.
 */
export function SecuritySection() {
  const { icon: SupportIcon, responseIcon: ResponseIcon } = SUPPORT;

  return (
    <Section
      id="seguridad"
      eyebrow={SECURITY_SECTION.eyebrow}
      title={SECURITY_SECTION.title}
      description={SECURITY_SECTION.description}
      align="start"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <ul className="hairline-grid grid overflow-hidden border border-border sm:grid-cols-2">
          {SECURITY_POINTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="bg-background p-6">
              <Icon className="size-5 text-primary" strokeWidth={2} />
              <h3 className="display-label mt-4 text-[14px] text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>

        <div className="overflow-hidden rounded-md border border-border">
          <PlaceholderImage
            seed={SECURITY_SECTION.imageSeed}
            width={1200}
            height={1000}
            alt="Infraestructura segura y respaldos de Flowerpot"
            sizes="(max-width: 1024px) 100vw, 512px"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-6 rounded-md border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <span className="display-label inline-flex items-center gap-2 text-[12px] text-primary">
            <SupportIcon className="size-4" />
            {SUPPORT.eyebrow}
          </span>
          <h3 className="display-heading mt-3 text-2xl">{SUPPORT.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {SUPPORT.description}
          </p>
        </div>
        <ul className="flex shrink-0 flex-col gap-3 text-sm">
          {SUPPORT.points.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <ResponseIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-pretty">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
