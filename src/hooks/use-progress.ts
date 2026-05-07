import { useState, useCallback } from "react";
import {
  progressService,
  type ProgressFilters,
} from "@/services/progress.service";
import { useAuth } from "./use-auth";
import type {
  QuizAttemptRequest,
  QuizAttemptResponse,
  ProgressData,
  DashboardSummary,
} from "@/models/progress.model";

export function useProgress() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null,
  );

  const submitAttempt = async (
    data: QuizAttemptRequest,
  ): Promise<QuizAttemptResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await progressService.submitAttempt(data);
      return result;
    } catch (err) {
      const apiError = err as { message?: string };
      const message = apiError.message || "Không thể gửi kết quả làm bài.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = useCallback(
    async (filters?: Omit<ProgressFilters, "userId">) => {
      if (!user?.userId) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await progressService.getProgress({
          userId: user.userId,
          ...filters,
        });
        setProgressData(data);
        return data;
      } catch (err) {
        const apiError = err as { message?: string };
        const message = apiError.message || "Không thể tải dữ liệu tiến độ.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const fetchDashboard = useCallback(async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getDashboard(user.userId);
      setDashboardData(data);
      return data;
    } catch (err) {
      const apiError = err as { message?: string };
      const message = apiError.message || "Không thể tải bảng điều khiển.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    error,
    progressData,
    dashboardData,
    submitAttempt,
    fetchProgress,
    fetchDashboard,
  };
}
