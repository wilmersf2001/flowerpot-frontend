/**
 * Constructores de JSON-LD (schema.org). Devuelven objetos planos que el
 * componente `<JsonLd>` serializa dentro de un `<script type="application/ld+json">`.
 *
 * Qué cubre y por qué:
 *  - `Organization` + `WebSite`: identidad de la marca para el Knowledge Panel.
 *  - `SoftwareApplication`: Flowerpot ES el producto; con esto Google entiende
 *    que la home es la ficha de un software B2B, no un blog.
 *  - `FAQPage`: habilita el rich snippet de preguntas frecuentes.
 *
 * NOTA: no incluimos `AggregateRating` ni `Review` porque los testimonios de
 * la landing todavía son data de prueba. Marcar reseñas falsas como schema es
 * penalizable por Google — se agrega cuando haya reseñas reales verificables.
 */
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./site";

// Rutas generadas por Next desde `app/icon.tsx` y `app/opengraph-image.tsx`.
const LOGO_URL = absoluteUrl("/icon");
const OG_URL = absoluteUrl("/opengraph-image");

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description: SITE_DESCRIPTION,
    foundingLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "PE" },
    },
    areaServed: { "@type": "Country", name: "Perú" },
    // TODO(marca): completar cuando existan los perfiles oficiales.
    // sameAs: ["https://www.instagram.com/...", "https://www.linkedin.com/company/..."],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es-PE",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * Ficha del producto. `offers` refleja SOLO lo que es verificable hoy:
 * la prueba gratuita de 14 días. Si se pasa `priceFrom` (en soles), se añade
 * un `AggregateOffer` con el precio de entrada real de los planes.
 */
export function softwareApplicationSchema(opts?: { priceFrom?: number }) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Gym management software",
    operatingSystem: "Web",
    url: SITE_URL,
    image: OG_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "es-PE",
    publisher: { "@id": `${SITE_URL}/#organization` },
    featureList: [
      "Gestión de socios y membresías",
      "Control de acceso (QR, huella, torniquete)",
      "Cobros y cierre de caja",
      "Asistencia y aforo en vivo",
      "Reportes de negocio",
      "Multi-sede con permisos por local",
    ],
  };

  schema.offers =
    typeof opts?.priceFrom === "number"
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "PEN",
          lowPrice: opts.priceFrom,
          offerCount: 3,
          availability: "https://schema.org/InStock",
        }
      : {
          "@type": "Offer",
          price: 0,
          priceCurrency: "PEN",
          description: "14 días de prueba gratis, sin tarjeta",
          availability: "https://schema.org/InStock",
        };

  return schema;
}

/** Migas de pan para páginas internas (mejora cómo se ve la URL en resultados). */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
