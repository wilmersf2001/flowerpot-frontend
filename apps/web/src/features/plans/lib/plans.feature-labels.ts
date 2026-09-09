/**
 * El backend guarda las features como claves (`check_in_qr`), no como texto.
 * Este mapa las vuelve legibles para la landing. Si llega una clave que no
 * está aquí, se muestra "humanizada" (guiones -> espacios, Capitalizada).
 */
const FEATURE_LABELS: Record<string, string> = {
  check_in_qr: "Check-in por QR",
  check_in_zkteco: "Check-in con lector ZKTeco",
  reportes_basicos: "Reportes básicos",
  reportes_avanzados: "Reportes avanzados",
  multisede: "Multi-sede",
  api_acceso: "Acceso por API",
  soporte_prioritario: "Soporte prioritario",
  dashboard_gerencial: "Dashboard gerencial",
  reportes_con_ia: "Reportes con IA",
  chatbot: "Asistente con IA",
  // El backend tiene algunas claves con typo; se mapean igual para no
  // mostrar "Chabot" en la landing.
  chabot: "Asistente con IA",
};

export function featureLabel(key: string): string {
  const known = FEATURE_LABELS[key.toLowerCase().trim()];
  if (known) return known;
  const words = key.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
