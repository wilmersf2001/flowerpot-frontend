import { headers } from "next/headers";
import type { PanelTarget } from "./domain";

/**
 * Panel actual visto desde un Server Component / route handler.
 *
 * `proxy.ts` ya resolvió el panel desde el subdominio y lo dejó en las cabeceras
 * de la petición (`x-panel`, `x-tenant-slug`). Aquí solo se leen.
 */
export async function currentPanel(): Promise<PanelTarget> {
  const h = await headers();

  if (h.get("x-panel") === "tenant") {
    return { kind: "tenant", slug: h.get("x-tenant-slug") ?? "" };
  }
  return { kind: "central" };
}
