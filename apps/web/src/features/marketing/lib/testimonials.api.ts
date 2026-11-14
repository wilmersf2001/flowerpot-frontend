// Solo se importa desde Server Components (`API_INTERNAL_URL` no llega al cliente).
import { TESTIMONIALS } from "./marketing.content";
import type { Testimonial } from "./marketing.types";

const API_BASE = process.env.API_INTERNAL_URL ?? "http://localhost:8000/api";

function toTestimonial(raw: Record<string, unknown>): Testimonial | null {
  const quote = String(raw.content ?? "").trim();
  const author = String(raw.author_name ?? "").trim();
  if (!quote || !author) return null;

  const role = String(raw.author_role ?? "").trim();
  const gym = String(raw.gym_name ?? "").trim();
  return {
    quote,
    author,
    role: [role, gym].filter(Boolean).join(", "),
    // `next/image` exige dominios declarados para URLs remotas, así que el
    // avatar sigue saliendo del placeholder determinista por autor.
    avatarSeed: `avatar-${author}`,
  };
}

/**
 * Testimonios destacados desde `GET /public/testimonials?featured=true`
 * (el backend ya los cachea 30 min). Si la API falla o no hay ninguno,
 * devuelve los testimonios estáticos para que la sección nunca quede vacía.
 */
export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${API_BASE}/public/testimonials?featured=true`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return TESTIMONIALS;

    const body: unknown = await res.json();
    const rows =
      body && typeof body === "object" && "data" in body
        ? (body as { data: unknown }).data
        : body;
    if (!Array.isArray(rows)) return TESTIMONIALS;

    const items = (rows as Record<string, unknown>[])
      .map(toTestimonial)
      .filter((t): t is Testimonial => t !== null);
    return items.length > 0 ? items : TESTIMONIALS;
  } catch {
    return TESTIMONIALS;
  }
}
