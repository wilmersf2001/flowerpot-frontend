import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * `/sitemap.xml` generado. Lista solo rutas públicas y reales del sitio.
 * Al crear una página nueva (p. ej. `/precios`, `/terminos`) se agrega aquí
 * su entrada.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/seguridad"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/preguntas-frecuentes"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
