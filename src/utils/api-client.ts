import { API_BASE_URL } from "@/api/routes";
import type { ApiError } from "@/models/auth.model";
import {
  assertValidAuthToken,
  getAuthToken,
  handleUnauthorizedSession,
  shouldHandleUnauthorizedApi,
} from "@/utils/auth-session";

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set("Accept", "*/*");
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) {
    if (!assertValidAuthToken()) {
      const error: ApiError = {
        message: "Phiên đăng nhập đã hết hạn",
        status: 401,
        code: "SESSION_EXPIRED",
      };
      throw error;
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (shouldHandleUnauthorizedApi(endpoint, response.status)) {
        handleUnauthorizedSession({ reason: "api" });
      }

      const message =
        data.message ||
        data.detail ||
        data.title ||
        "An unexpected error occurred";
      const error: ApiError = {
        message,
        status: response.status,
        code: data.code || data.errorCode,
      };
      throw error;
    }

    return data as T;
  } catch (error) {
    if ((error as ApiError).message) {
      throw error;
    }
    throw {
      message: "Network error or server unreachable",
      status: 500,
    } as ApiError;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
