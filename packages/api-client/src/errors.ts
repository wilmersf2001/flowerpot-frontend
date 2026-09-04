import { AxiosError } from "axios";
import type { ApiErrorBody } from "@repo/types";

/**
 * Normalized error thrown by the API client, so callers never branch on
 * `axios.isAxiosError`.
 */
export class ApiError extends Error {
  /** HTTP status, or 0 when the request never got a response. */
  readonly status: number;
  /** Laravel field validation bag (HTTP 422), when present. */
  readonly errors?: Record<string, string[]>;
  /** Parsed response body, when the server sent one. */
  readonly body?: ApiErrorBody;
  /** True when there was no response at all (offline, DNS, timeout, CORS). */
  readonly isNetworkError: boolean;

  constructor(args: {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
    body?: ApiErrorBody;
    isNetworkError?: boolean;
    cause?: unknown;
  }) {
    super(args.message, { cause: args.cause });
    this.name = "ApiError";
    this.status = args.status;
    this.errors = args.errors;
    this.body = args.body;
    this.isNetworkError = args.isNetworkError ?? false;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isValidationError(): boolean {
    return this.status === 422;
  }
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    const response = error.response;
    if (!response) {
      return new ApiError({
        message:
          error.code === "ECONNABORTED"
            ? "La solicitud tardó demasiado."
            : "No se pudo conectar con el servidor.",
        status: 0,
        isNetworkError: true,
        cause: error,
      });
    }
    const body =
      typeof response.data === "object" && response.data !== null
        ? (response.data as ApiErrorBody)
        : undefined;
    return new ApiError({
      message: body?.message ?? `Error ${response.status}.`,
      status: response.status,
      errors: body?.errors,
      body,
      cause: error,
    });
  }

  return new ApiError({
    message: error instanceof Error ? error.message : "Error desconocido.",
    status: 0,
    cause: error,
  });
}
