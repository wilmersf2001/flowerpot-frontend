// Solo se importa desde Server Components.
const API_BASE = process.env.API_INTERNAL_URL ?? "http://localhost:8000/api";

export interface CampaignBanner {
  title: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
  bgColor?: string;
  textColor?: string;
}

export interface WhatsAppSupport {
  phone: string;
  message: string;
}

export interface PublicSiteSettings {
  banner: CampaignBanner | null;
  whatsapp: WhatsAppSupport | null;
}

const EMPTY: PublicSiteSettings = { banner: null, whatsapp: null };
const HEX = /^#[0-9a-fA-F]{3,8}$/;

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** El valor puede llegar como objeto o como JSON en string. */
function asObject(v: unknown): Record<string, unknown> | null {
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return null;
    }
  }
  return isObject(v) ? v : null;
}

/** Solo rutas internas o http(s): descarta `javascript:` y similares. */
function safeUrl(url: unknown): string {
  const s = String(url ?? "").trim();
  return s.startsWith("/") || /^https?:\/\//i.test(s) ? s : "";
}

function parseBanner(raw: unknown): CampaignBanner | null {
  const b = asObject(raw);
  if (!b || b.enabled !== true) return null;
  if (typeof b.expires_at === "string" && Date.parse(b.expires_at) < Date.now())
    return null;

  const message = String(b.message ?? "").trim();
  if (!message) return null;

  const color = (v: unknown) =>
    typeof v === "string" && HEX.test(v) ? v : undefined;
  return {
    title: String(b.title ?? "").trim(),
    message,
    ctaText: String(b.cta_text ?? "").trim(),
    ctaUrl: safeUrl(b.cta_url),
    bgColor: color(b.bg_color),
    textColor: color(b.text_color),
  };
}

function parseWhatsApp(raw: unknown): WhatsAppSupport | null {
  const w = asObject(raw);
  if (!w || w.enabled !== true) return null;
  const phone = String(w.phone ?? "").replace(/\D/g, "");
  return phone
    ? { phone, message: String(w.message ?? "").trim() }
    : null;
}

/**
 * `GET /public/settings` (cache del backend: 30 min). Devuelve el banner y el
 * soporte por WhatsApp ya validados; ante cualquier fallo, nada que mostrar.
 */
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const res = await fetch(`${API_BASE}/public/settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return EMPTY;

    const body: unknown = await res.json();
    const data = asObject(isObject(body) && "data" in body ? body.data : body);
    if (!data) return EMPTY;

    return {
      banner: parseBanner(data.campaign_banner),
      whatsapp: parseWhatsApp(data.whatsapp_support),
    };
  } catch {
    return EMPTY;
  }
}
