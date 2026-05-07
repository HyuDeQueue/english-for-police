import { API_BASE_URL } from "@/config/api";

export { API_BASE_URL };

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
  },
  PROGRESS: {
    SUBMIT_ATTEMPT: "/api/v1/progress/attempts",
    GET_PROGRESS: "/api/v1/progress",
    GET_DASHBOARD: "/api/v1/progress/dashboard",
  },
} as const;
