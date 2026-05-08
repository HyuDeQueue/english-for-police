import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import type { LoginRequest, RegisterRequest } from "@/models/auth.model";
import type { User } from "@/models/user.model";
import { useSonner } from "@/hooks/use-sonner";

const AUTH_CHANGED_EVENT = "auth-changed";

function getStoredUser() {
  const savedUser = localStorage.getItem("auth_user");
  return savedUser ? (JSON.parse(savedUser) as User) : null;
}

export function useAuth() {
  const { notifySuccess, notifyAuthError, notifyError, notifyInfo } = useSonner();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  useEffect(() => {
    const syncAuth = () => setUser(getStoredUser());
    window.addEventListener("storage", syncAuth);
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
    };
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      setUser(response.user);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      notifySuccess("Đăng nhập thành công", "Chào mừng bạn quay trở lại hệ thống.");
      return response;
    } catch (err) {
      const apiError = err as { message?: string };
      const message =
        apiError.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(message);
      notifyAuthError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      notifySuccess(
        "Đăng ký thành công",
        "Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.",
      );
      return response;
    } catch (err) {
      const apiError = err as { message?: string };
      const message =
        apiError.message || "Đăng ký thất bại. Vui lòng thử lại sau.";
      setError(message);
      notifyError("Đăng ký thất bại", message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("auth_user");
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    notifyInfo("Đăng xuất thành công");
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    setError,
  };
}
