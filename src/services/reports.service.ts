import { API_ROUTES } from "@/api/routes";
import { api } from "@/utils/api-client";
import type { ProgressResponse } from "@/models/progress.model";
import type {
  CompareDashboardApi,
  DashboardOverviewApi,
  StudentDashboardApi,
  StudentProgressSummaryApi,
} from "@/models/reports.model";

export const reportsService = {
  getOverview: async (from?: string, to?: string): Promise<DashboardOverviewApi> => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const endpoint =
      params.size > 0
        ? `${API_ROUTES.REPORTS.DASHBOARD_OVERVIEW}?${params.toString()}`
        : API_ROUTES.REPORTS.DASHBOARD_OVERVIEW;
    const response = await api.get<ProgressResponse<DashboardOverviewApi>>(endpoint);
    return response.data;
  },

  getStudents: async (): Promise<StudentProgressSummaryApi[]> => {
    const response = await api.get<ProgressResponse<StudentProgressSummaryApi[]>>(
      API_ROUTES.REPORTS.STUDENTS,
    );
    return response.data;
  },

  getStudentDashboard: async (userId: number): Promise<StudentDashboardApi> => {
    const endpoint = `${API_ROUTES.REPORTS.STUDENT_DETAIL}/${userId}`;
    const response = await api.get<ProgressResponse<StudentDashboardApi>>(endpoint);
    return response.data;
  },

  compare: async (
    userIds: number[],
    metric: "progress" | "score" = "progress",
    days = 30,
  ): Promise<CompareDashboardApi> => {
    const params = new URLSearchParams();
    params.set("userIds", userIds.join(","));
    params.set("metric", metric);
    params.set("days", days.toString());
    const endpoint = `${API_ROUTES.REPORTS.COMPARE}?${params.toString()}`;
    const response = await api.get<ProgressResponse<CompareDashboardApi>>(endpoint);
    return response.data;
  },
};

