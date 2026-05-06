import { useState } from "react";
import { authService } from "@/services/auth.service";
import type { LoginRequest, RegisterRequest } from "@/models/auth.model";
import type { User } from "@/models/user.model";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      setUser(response.user);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      return response;
    } catch (err) {
      const apiError = err as { message?: string };
      const message =
        apiError.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(message);
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
      return response;
    } catch (err) {
      const apiError = err as { message?: string };
      const message =
        apiError.message || "Đăng ký thất bại. Vui lòng thử lại sau.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("auth_user");
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
