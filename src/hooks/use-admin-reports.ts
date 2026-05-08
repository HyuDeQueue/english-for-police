import { useCallback, useState } from "react";
import { adminService } from "@/services/admin.service";
import { useSonner } from "@/hooks/use-sonner";
import type {
  AdminReportCompare,
  AdminReportOverview,
  AdminReportStudentDashboard,
  AdminReportStudentSummary,
  StudentDossier,
  StudentProgressSummary,
} from "@/models/admin.model";
import type {
  AdminCompareFilters,
  AdminOverviewFilters,
} from "@/services/admin.service";

export function useAdminReports() {
  const { notifyError } = useSonner();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentSummaries, setStudentSummaries] = useState<
    AdminReportStudentSummary[] | null
  >(null);
  const [studentDashboard, setStudentDashboard] =
    useState<AdminReportStudentDashboard | null>(null);
  const [dashboardOverview, setDashboardOverview] =
    useState<AdminReportOverview | null>(null);
  const [compareData, setCompareData] = useState<AdminReportCompare | null>(
    null,
  );

  const [studentList, setStudentList] = useState<
    StudentProgressSummary[] | null
  >(null);
  const [studentDossier, setStudentDossier] = useState<StudentDossier | null>(
    null,
  );

  const run = useCallback(async <T>(fn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const apiError = err as { message?: string };
      const message =
        apiError.message || "Không thể tải dữ liệu quản trị. Vui lòng thử lại.";
      setError(message);
      notifyError("Tải dữ liệu quản trị thất bại", message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [notifyError]);

  const fetchStudentSummaries = useCallback(async () => {
    return run(async () => {
      const data = await adminService.getStudentSummaries();
      setStudentSummaries(data);
      return data;
    });
  }, [run]);

  const fetchStudentDashboard = useCallback(
    async (userId: number) => {
      return run(async () => {
        const data = await adminService.getStudentDashboard(userId);
        setStudentDashboard(data);
        return data;
      });
    },
    [run],
  );

  const fetchDashboardOverview = useCallback(
    async (filters?: AdminOverviewFilters) => {
      return run(async () => {
        const data = await adminService.getDashboardOverview(filters);
        setDashboardOverview(data);
        return data;
      });
    },
    [run],
  );

  const fetchComparedStudents = useCallback(
    async (filters: AdminCompareFilters) => {
      return run(async () => {
        const data = await adminService.getComparedStudents(filters);
        setCompareData(data);
        return data;
      });
    },
    [run],
  );

  // Backward-compatible wrappers for existing admin pages.
  const fetchStudentList = useCallback(async () => {
    return run(async () => {
      const data = await adminService.getStudentList();
      setStudentList(data);
      return data;
    });
  }, [run]);

  const fetchStudentDossier = useCallback(
    async (userId: number) => {
      return run(async () => {
        const data = await adminService.getStudentDossier(userId);
        setStudentDossier(data);
        return data;
      });
    },
    [run],
  );

  return {
    isLoading,
    error,
    setError,

    studentSummaries,
    studentDashboard,
    dashboardOverview,
    compareData,
    studentList,
    studentDossier,

    fetchStudentSummaries,
    fetchStudentDashboard,
    fetchDashboardOverview,
    fetchComparedStudents,
    fetchStudentList,
    fetchStudentDossier,
  };
}
