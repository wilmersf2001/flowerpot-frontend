import type { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  /** Parte principal de la cifra, p. ej. "120". */
  value: string;
  /** Sufijo que se pinta en color lima, p. ej. "+", "k", "/7". Opcional. */
  unit?: string;
  label: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface SecurityPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Gimnasio mostrado en la sección "Socios". HOY es data de prueba y estática.
 * TODO(estado): cuando exista el flag de visibilidad del gimnasio
 * (`appears_in_directory` o similar) esto sale de la API, no de aquí.
 */
export interface MemberGym {
  name: string;
  city: string;
  /** `seed` para `PlaceholderImage` — se cambia por el logo/foto real luego. */
  imageSeed: string;
  members: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatarSeed: string;
}
