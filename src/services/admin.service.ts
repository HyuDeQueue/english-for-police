import type {
  AdminApiResponse,
  AdminReportCompare,
  AdminReportOverview,
  AdminReportStudentDashboard,
  AdminReportStudentSummary,
  CompareMetric,
  StudentProgressSummary,
  StudentDossier,
} from "@/models/admin.model";
import { API_ROUTES } from "@/api/routes";
import { api } from "@/utils/api-client";

function toLastActiveLabel(
  lastActiveLabel: string,
  lastActivityAt: string,
): string {
  if (lastActiveLabel) return lastActiveLabel;
  if (!lastActivityAt) return "Không rõ";

  const timestamp = new Date(lastActivityAt).getTime();
  if (Number.isNaN(timestamp)) return "Không rõ";

  const now = Date.now();
  const diffMinutes = Math.max(0, Math.floor((now - timestamp) / 60000));

  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

function toUnitStatus(status: string): "locked" | "in-progress" | "completed" {
  const normalized = status.toLowerCase();
  if (normalized.includes("complete")) return "completed";
  if (normalized.includes("progress") || normalized.includes("ongoing")) {
    return "in-progress";
  }
  return "locked";
}

export interface AdminOverviewFilters {
  from?: string;
  to?: string;
}

export interface AdminCompareFilters {
  userIds: number[];
  metric?: CompareMetric;
  days?: number;
}

export const adminService = {
  getStudentSummaries: async (): Promise<AdminReportStudentSummary[]> => {
    const response = await api.get<
      AdminApiResponse<AdminReportStudentSummary[]>
    >(API_ROUTES.REPORTS.DASHBOARD_STUDENTS);
    return response.data;
  },

  getStudentDashboard: async (
    userId: number,
  ): Promise<AdminReportStudentDashboard> => {
    const response = await api.get<
      AdminApiResponse<AdminReportStudentDashboard>
    >(API_ROUTES.REPORTS.DASHBOARD_STUDENT_BY_ID(userId));
    return response.data;
  },

  getDashboardOverview: async (
    filters?: AdminOverviewFilters,
  ): Promise<AdminReportOverview> => {
    const params = new URLSearchParams();
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);

    const endpoint = params.size
      ? `${API_ROUTES.REPORTS.DASHBOARD_OVERVIEW}?${params.toString()}`
      : API_ROUTES.REPORTS.DASHBOARD_OVERVIEW;

    const response =
      await api.get<AdminApiResponse<AdminReportOverview>>(endpoint);
    return response.data;
  },

  getComparedStudents: async (
    filters: AdminCompareFilters,
  ): Promise<AdminReportCompare> => {
    const params = new URLSearchParams();
    params.append("userIds", filters.userIds.join(","));
    params.append("metric", filters.metric ?? "progress");
    params.append("days", String(filters.days ?? 30));

    const endpoint = `${API_ROUTES.REPORTS.DASHBOARD_COMPARE}?${params.toString()}`;
    const response =
      await api.get<AdminApiResponse<AdminReportCompare>>(endpoint);
    return response.data;
  },

  getStudentList: async (): Promise<StudentProgressSummary[]> => {
    const students = await adminService.getStudentSummaries();
    return students.map((student) => ({
      userId: student.userId,
      fullName: student.fullName,
      rank: student.role,
      email: student.email,
      completionPercentage: student.overallProgressPercent,
      lastActive: toLastActiveLabel(
        student.lastActiveLabel,
        student.lastActivityAt,
      ),
      role: student.role,
    }));
  },

  getStudentDossier: async (userId: number): Promise<StudentDossier> => {
    const dashboard = await adminService.getStudentDashboard(userId);

    return {
      userId: dashboard.userId,
      shownId: `STU-${dashboard.userId}`,
      fullName: dashboard.fullName,
      email: dashboard.email,
      role: "STUDENT",
      dateOfBirth: "",
      rank: "STUDENT",
      proficiencyScore: Math.round(dashboard.overallProgressPercent),
      totalStudyTime: dashboard.activity.totalAttempts,
      accuracyRate: Math.round(dashboard.overallScorePercent),
      unitProgress: dashboard.chapters.map((chapter) => {
        const status = toUnitStatus(chapter.status);
        return {
          unitId: chapter.unitNumber,
          title: chapter.title,
          progress: chapter.progressPercent,
          status,
          hasBadge: status === "completed",
        };
      }),
      testHistory: dashboard.chapters
        .filter((chapter) => chapter.attemptCount > 0)
        .map((chapter) => ({
          testId: `unit-${chapter.unitNumber}`,
          title: `Bài kiểm tra Chương ${chapter.unitNumber}`,
          score: Math.round(chapter.scorePercent),
          total: 100,
          percentage: Math.round(chapter.scorePercent),
          date: chapter.lastAttemptAt
            ? new Date(chapter.lastAttemptAt).toLocaleDateString("vi-VN")
            : "-",
        })),
    };
  },
};
