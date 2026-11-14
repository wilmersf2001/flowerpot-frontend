import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient, unwrapEnvelope } from "@repo/api-client";

export type SettingValue = Record<string, unknown>;

export type SettingFieldType =
  | "text"
  | "textarea"
  | "checkbox"
  | "number"
  | "color"
  | "datetime";

export interface SettingField {
  name: string;
  label: string;
  type: SettingFieldType;
  hint?: string;
  placeholder?: string;
}

export interface SettingGroup {
  /** `key` del registro en `site_settings`. */
  key: string;
  title: string;
  description: string;
  fields: SettingField[];
}

/** Configuraciones públicas que lee la web (`GET /public/settings`). */
export const SETTING_GROUPS: SettingGroup[] = [
  {
    key: "campaign_banner",
    title: "Banner de campaña",
    description: "Franja superior de la web pública.",
    fields: [
      { name: "enabled", label: "Mostrar banner", type: "checkbox" },
      { name: "title", label: "Título", type: "text", placeholder: "Promoción Navideña" },
      { name: "message", label: "Mensaje", type: "text", placeholder: "30% OFF con el código NAVIDAD2026" },
      { name: "cta_text", label: "Texto del botón", type: "text", placeholder: "Ver planes" },
      { name: "cta_url", label: "Enlace del botón", type: "text", placeholder: "/#planes", hint: "Ruta interna (/…) o URL https." },
      { name: "bg_color", label: "Color de fondo", type: "color" },
      { name: "text_color", label: "Color del texto", type: "color" },
      { name: "expires_at", label: "Vence", type: "datetime", hint: "Opcional. Después de esta fecha se oculta solo." },
    ],
  },
  {
    key: "whatsapp_support",
    title: "Soporte por WhatsApp",
    description: "Botón flotante de la web pública.",
    fields: [
      { name: "enabled", label: "Mostrar botón", type: "checkbox" },
      { name: "phone", label: "Teléfono", type: "text", placeholder: "+51987654321" },
      { name: "message", label: "Mensaje inicial", type: "textarea" },
    ],
  },
  {
    key: "feature_flags",
    title: "Flags de la web",
    description: "Interruptores de secciones y de la prueba gratuita.",
    fields: [
      { name: "show_testimonials", label: "Mostrar testimonios", type: "checkbox" },
      { name: "show_stats", label: "Mostrar estadísticas", type: "checkbox" },
      { name: "allow_trial", label: "Permitir prueba gratuita", type: "checkbox" },
      { name: "trial_days", label: "Días de prueba", type: "number" },
    ],
  },
];

const endpoint = (key: string) =>
  `/site-settings/${encodeURIComponent(key)}/value`;

/** El backend puede devolver `{ data: { value } }`, `{ data: valor }` o el valor. */
function toValue(body: unknown): SettingValue {
  let node = unwrapEnvelope<unknown>(body);
  if (node && typeof node === "object" && "value" in node) {
    node = (node as { value: unknown }).value;
  }
  if (typeof node === "string") {
    try {
      node = JSON.parse(node);
    } catch {
      /* no era JSON */
    }
  }
  return node && typeof node === "object" && !Array.isArray(node)
    ? (node as SettingValue)
    : {};
}

const settingKeys = { one: (key: string) => ["site-settings", key] as const };

export function useSetting(key: string) {
  return useQuery({
    queryKey: settingKeys.one(key),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<unknown>(endpoint(key));
        return toValue(data);
      } catch (error) {
        // Una clave sin sembrar responde 404: se trata como vacía.
        if ((error as { status?: number }).status === 404) return {};
        throw error;
      }
    },
  });
}

export function useSaveSetting(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (value: SettingValue) => {
      await apiClient.put(endpoint(key), { value });
      return value;
    },
    onSuccess: (value) =>
      queryClient.setQueryData(settingKeys.one(key), value),
  });
}
