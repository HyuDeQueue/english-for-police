import { API_ROUTES } from "@/api/routes";
import { api } from "@/utils/api-client";
import type {
  QuizAttemptRequest,
  QuizAttemptResponse,
  ProgressData,
  DashboardSummary,
  ProgressResponse,
} from "@/models/progress.model";

export interface ProgressFilters {
  userId: number;
  view?: "all" | "overview" | "units" | "scores" | "typeScores" | "typeHistory";
  unitNumber?: number;
  questionType?: string;
  page?: number;
  size?: number;
}

export const progressService = {
  submitAttempt: async (
    data: QuizAttemptRequest,
  ): Promise<QuizAttemptResponse> => {
    const response = await api.post<ProgressResponse<QuizAttemptResponse>>(
      API_ROUTES.PROGRESS.SUBMIT_ATTEMPT,
      data,
    );
    return response.data;
  },

  /**
   * Get progress data with filters
   */
  getProgress: async (filters: ProgressFilters): Promise<ProgressData> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `${API_ROUTES.PROGRESS.GET_PROGRESS}?${params.toString()}`;
    const response = await api.get<ProgressResponse<ProgressData>>(endpoint);
    return response.data;
  },

  getDashboard: async (userId: number): Promise<DashboardSummary> => {
    const endpoint = `${API_ROUTES.PROGRESS.GET_DASHBOARD}?userId=${userId}`;
    const response =
      await api.get<ProgressResponse<DashboardSummary>>(endpoint);
    return response.data;
  },
};
