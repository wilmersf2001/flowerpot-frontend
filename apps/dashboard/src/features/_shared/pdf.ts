import { ApiError, apiClient } from "@repo/api-client";

/**
 * Utilidades para endpoints que responden un PDF (contratos, recibos, órdenes,
 * reportes y vista previa de marca).
 *
 * La respuesta es binaria, así que se pide como `blob`. Ojo: cuando falla, el
 * backend contesta JSON, pero con `responseType: "blob"` ese JSON también llega
 * como `Blob`; `pdfErrorMessage` lo lee para mostrar el mensaje real.
 */

export interface PdfFile {
  blob: Blob;
  /** Nombre sugerido por el backend (`Content-Disposition`), si lo envió. */
  filename: string | null;
}

/** Extrae `filename` de una cabecera `Content-Disposition`. */
function filenameFromDisposition(header: unknown): string | null {
  if (typeof header !== "string") return null;
  const match = header.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** GET de un PDF. `path` es relativo al API (p. ej. `/payments/3/receipt`). */
export async function fetchPdf(
  path: string,
  params?: Record<string, string | undefined>,
): Promise<PdfFile> {
  const response = await apiClient.get<Blob>(path, {
    params,
    responseType: "blob",
    headers: { Accept: "application/pdf" },
  });
  return {
    blob: response.data,
    filename: filenameFromDisposition(response.headers["content-disposition"]),
  };
}

/** Dispara la descarga de un `Blob` en el navegador. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Margen para que el navegador inicie la descarga antes de liberar la URL.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Mensaje legible de un error al pedir un PDF. Lee el JSON de error que viene
 * dentro del blob (422 con `errors.documentable_id`, 403, 404…).
 */
export async function pdfErrorMessage(
  err: unknown,
  fallback: string,
): Promise<string> {
  if (!(err instanceof ApiError)) return fallback;

  const data = (err.cause as { response?: { data?: unknown } } | undefined)
    ?.response?.data;
  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };
      const firstError = Object.values(body.errors ?? {})[0]?.[0];
      if (firstError) return firstError;
      if (body.message) return body.message;
    } catch {
      // El cuerpo no era JSON: cae al mensaje genérico de abajo.
    }
  }
  if (err.status === 403) return "No tienes permiso para esta acción.";
  return err.isNetworkError || err.status === 0 ? err.message : fallback;
}
