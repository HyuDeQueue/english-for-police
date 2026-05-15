import { API_BASE_URL } from "@/config/api";

export { API_BASE_URL };

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
  },
  USER: {
    LIST: "/api/v1/user",
    DETAIL: (userId: number) => `/api/v1/user/${userId}`,
    CONTRIBUTIONS: (userId: number) => `/api/v1/users/${userId}/contributions`,
  },
  LESSONS: {
    IMPORT: "/api/v1/lessons/import",
    LIST: "/api/v1/lessons",
    DETAIL: (unitNumber: number) => `/api/v1/lessons/${unitNumber}`,
    DETAIL_INCLUDE_ANSWERS: (unitNumber: number) =>
      `/api/v1/lessons/${unitNumber}?includeAnswers=true`,
    PHRASE_TEMPLATES: (unitNumber: number) =>
      `/api/v1/lessons/${unitNumber}/phrase-templates`,
    PHRASE_TEMPLATE: (unitNumber: number, id: number) =>
      `/api/v1/lessons/${unitNumber}/phrase-templates/${id}`,
    GRAMMAR_STRUCTURES: (unitNumber: number) =>
      `/api/v1/lessons/${unitNumber}/structures`,
    GRAMMAR_STRUCTURE: (unitNumber: number, id: number) =>
      `/api/v1/lessons/${unitNumber}/structures/${id}`,
    TEST_BANK: (unitNumber: number) =>
      `/api/v1/lessons/${unitNumber}/tests/bank`,
    TESTS: (unitNumber: number) => `/api/v1/lessons/${unitNumber}/tests`,
  },
  PROGRESS: {
    SUBMIT_ATTEMPT: "/api/v1/progress/attempts",
    GET_PROGRESS: "/api/v1/progress",
    LEADERBOARD_STREAKS: "/api/v1/progress/leaderboard/streaks",
  },
  PRACTICE: {
    QUESTIONS: "/api/v1/practice/questions",
    QUICK_TEST: "/api/v1/practice/quick-test",
  },
  REPORTS: {
    DASHBOARD_OVERVIEW: "/api/v1/reports/dashboard/overview",
    STUDENTS: "/api/v1/reports/dashboard/students",
    STUDENT_DETAIL: "/api/v1/reports/dashboard/students",
    COMPARE: "/api/v1/reports/dashboard/compare",
    DASHBOARD_STUDENTS: "/api/v1/reports/dashboard/students",
    DASHBOARD_STUDENT_BY_ID: (userId: number) =>
      `/api/v1/reports/dashboard/students/${userId}`,
    DASHBOARD_COMPARE: "/api/v1/reports/dashboard/compare",
  },
} as const;
