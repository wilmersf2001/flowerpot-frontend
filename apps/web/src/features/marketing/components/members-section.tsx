import { MapPin } from "lucide-react";
import { Section, PlaceholderImage } from "@/features/_shared";
import {
  MEMBERS_SECTION,
  MEMBER_GYMS,
} from "../lib/marketing.content";
import { getFeaturedTestimonials } from "../lib/testimonials.api";

/**
 * Sección "Socios": gimnasios que usan Flowerpot + testimonios.
 *
 * Los testimonios vienen de `GET /public/testimonials` (con respaldo estático).
 * `MEMBER_GYMS` sigue siendo data de PRUEBA (ver `marketing.content.ts`): falta
 * el flag de visibilidad del gimnasio en el backend.
 */
export async function MembersSection() {
  const testimonials = await getFeaturedTestimonials();
  return (
    <Section
      id="socios"
      eyebrow={MEMBERS_SECTION.eyebrow}
      title={MEMBERS_SECTION.title}
      description={MEMBERS_SECTION.description}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MEMBER_GYMS.map((gym) => (
          <li
            key={gym.name}
            className="group overflow-hidden rounded-md border border-border bg-card"
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <PlaceholderImage
                seed={gym.imageSeed}
                width={800}
                height={600}
                alt={`Gimnasio ${gym.name}`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="display-label absolute right-3 top-3 rounded-lg bg-primary px-2.5 py-1 text-[11px] text-primary-foreground">
                {gym.members}
              </span>
            </div>
            <div className="p-5">
              <h3 className="display-label text-[14px] text-foreground">
                {gym.name}
              </h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {gym.city}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {testimonials.map((t) => (
          <figure
            key={t.author}
            className="flex flex-col justify-between rounded-md border border-border bg-card p-8"
          >
            <blockquote className="text-pretty text-lg leading-relaxed">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <PlaceholderImage
                seed={t.avatarSeed}
                width={96}
                height={96}
                alt={t.author}
                className="size-10 rounded-full object-cover"
              />
              <div className="text-sm">
                <div className="font-medium">{t.author}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
