import { API_ROUTES } from "@/api/routes";
import { api } from "@/utils/api-client";
import { clearAuthSession } from "@/utils/auth-session";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/models/auth.model";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
      API_ROUTES.AUTH.LOGIN,
      credentials,
    );

    if (response.token) {
      localStorage.setItem("auth_token", response.token);
    }
    return response;
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>(API_ROUTES.AUTH.REGISTER, userData);
  },

  logout: () => {
    clearAuthSession();
  },
};
