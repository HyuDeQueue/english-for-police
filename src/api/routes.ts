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
  },
  REPORTS: {
    DASHBOARD_OVERVIEW: "/api/v1/reports/dashboard/overview",
    STUDENTS: "/api/v1/reports/dashboard/students",
    STUDENT_DETAIL: "/api/v1/reports/dashboard/students", // + /{userId}
    COMPARE: "/api/v1/reports/dashboard/compare",
  },
} as const;
