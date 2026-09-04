import axios, {
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from "axios";
import { readTenantFromContext, handleUnauthorized } from "./context";
import { normalizeError } from "./errors";

function applyInterceptors(instance: AxiosInstance): AxiosInstance {
  // Request: attach the tenant discriminator. The auth token is NOT set here;
  // it rides along as an httpOnly cookie (`withCredentials`).
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const tenant = readTenantFromContext();
    if (tenant) config.headers.set("X-Tenant", tenant);
    return config;
  });

  // Response: on 401, clear the session and bounce to /login; always reject
  // with a normalized ApiError.
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleUnauthorized();
      }
      return Promise.reject(normalizeError(error));
    },
  );

  return instance;
}

const baseConfig: CreateAxiosDefaults = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 20_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
};

/** Shared browser-side axios instance. */
export const apiClient: AxiosInstance = applyInterceptors(
  axios.create(baseConfig),
);

/**
 * Build a separate instance with overrides — e.g. server-side code passing
 * `baseURL: process.env.API_INTERNAL_URL` and a forwarded cookie header.
 */
export function createApiClient(
  overrides: CreateAxiosDefaults = {},
): AxiosInstance {
  return applyInterceptors(
    axios.create({ ...baseConfig, ...overrides }),
  );
}
