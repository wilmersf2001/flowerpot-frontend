import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * `/robots.txt` generado. Todo el sitio público es indexable; se bloquean
 * rutas internas de Next y cualquier endpoint de API. El sitemap se anuncia
 * con la URL absoluta del dominio activo (`NEXT_PUBLIC_SITE_URL`).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
