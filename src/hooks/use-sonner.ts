import { useCallback } from "react";
import { toast } from "sonner";

type ErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function toToastId(message: string, description?: string) {
  return `${normalizeText(message)}::${normalizeText(description ?? "")}`;
}

function toAuthErrorMessage(error: unknown) {
  const err = (error ?? {}) as ErrorLike;
  const raw = err.message?.trim() || "";
  const text = normalizeText(raw);

  if (!raw) {
    return "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.";
  }

  if (text.includes("wrong password") || text.includes("invalid password")) {
    return "Mật khẩu không đúng. Vui lòng thử lại.";
  }

  if (text.includes("user not found") || text.includes("email not found")) {
    return "Email hoặc mật khẩu không đúng.";
  }

  if (
    text.includes("invalid credentials") ||
    text.includes("bad credentials")
  ) {
    return "Email hoặc mật khẩu không đúng.";
  }

  if (text.includes("unauthorized") || err.status === 401) {
    return "Email hoặc mật khẩu không đúng.";
  }

  return raw;
}

export function useSonner() {
  const notifySuccess = useCallback(
    (message: string, description?: string) =>
      toast.success(message, { description, position: "bottom-right" }),
    [],
  );

  const notifyError = useCallback(
    (message: string, description?: string) =>
      toast.error(message, {
        id: toToastId(message, description),
        description,
        position: "bottom-right",
      }),
    [],
  );

  const notifyInfo = useCallback(
    (message: string, description?: string) =>
      toast.info(message, { description, position: "bottom-right" }),
    [],
  );

  const notifyWarning = useCallback(
    (message: string, description?: string) =>
      toast.warning(message, { description, position: "bottom-right" }),
    [],
  );

  const notifyAuthError = useCallback(
    (error: unknown, fallback?: string) => {
      const message = toAuthErrorMessage(error);
      notifyError(fallback ?? "Đăng nhập thất bại", message);
    },
    [notifyError],
  );

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    notifyAuthError,
  };
}
