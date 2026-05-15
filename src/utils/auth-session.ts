import { requestOpenLoginDialog } from "@/lib/auth-ui-events";
import { toast } from "sonner";

export const AUTH_SESSION_CHANGED_EVENT = "auth-changed";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

const DEFAULT_EXPIRY_LEEWAY_SECONDS = 30;

let handlingUnauthorized = false;

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAuthUserRaw(): string | null {
  return localStorage.getItem(AUTH_USER_KEY);
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function parseJwtPayload(token: string): { exp?: number } | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

export function isJwtExpired(
  token: string,
  leewaySeconds: number = DEFAULT_EXPIRY_LEEWAY_SECONDS,
): boolean {
  const payload = parseJwtPayload(token);
  if (payload?.exp == null || Number.isNaN(payload.exp)) {
    return false;
  }
  const expiresAtMs = payload.exp * 1000;
  return Date.now() >= expiresAtMs - leewaySeconds * 1000;
}

export function assertValidAuthToken(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  if (isJwtExpired(token)) {
    handleUnauthorizedSession({ reason: "expired" });
    return false;
  }

  return true;
}

export function isAuthApiEndpoint(endpoint: string): boolean {
  const path = endpoint.split("?")[0];
  return (
    path.endsWith("/api/v1/auth/login") ||
    path.endsWith("/api/v1/auth/register")
  );
}

export function shouldHandleUnauthorizedApi(
  endpoint: string,
  status: number,
): boolean {
  if (status !== 401) return false;
  if (isAuthApiEndpoint(endpoint)) return false;
  return !!getAuthToken() || !!getStoredAuthUserRaw();
}

export interface HandleUnauthorizedOptions {
  reason?: "expired" | "api";
  silent?: boolean;
}

export function handleUnauthorizedSession(
  options: HandleUnauthorizedOptions = {},
): void {
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;

  const hadSession = !!getAuthToken() || !!getStoredAuthUserRaw();
  clearAuthSession();

  if (hadSession) {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));

    if (!options.silent) {
      const title =
        options.reason === "expired"
          ? "Phiên đăng nhập đã hết hạn"
          : "Phiên đăng nhập không còn hợp lệ";
      toast.warning(title, {
        description: "Vui lòng đăng nhập lại để tiếp tục.",
        position: "bottom-right",
      });
      requestOpenLoginDialog();
    }
  }

  window.setTimeout(() => {
    handlingUnauthorized = false;
  }, 800);
}
