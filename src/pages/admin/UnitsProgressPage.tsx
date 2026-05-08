import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { reportsService } from "@/services/reports.service";
import type {
  StudentDashboardApi,
  StudentProgressSummaryApi,
} from "@/models/reports.model";
import type { UnitGroupedData } from "@/components/admin/units-progress/types";
import {
  ChartsAndStudentsCard,
  OverviewStatsCard,
  UnitCardsList,
  UnitDetailsDialog,
} from "@/components/admin/units-progress/UnitsProgressSections";
import { userService } from "@/services/user.service";

const STUDENT_PAGE_SIZE = 10;

export default function UnitsProgressPage() {
  const [students, setStudents] = useState<StudentProgressSummaryApi[]>([]);
  const [studentDetails, setStudentDetails] = useState<
    Map<number, StudentDashboardApi>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [activeUnit, setActiveUnit] = useState<UnitGroupedData | null>(null);
  const [studentPage, setStudentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setStudentPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const users = await userService.getUsers({
          page: 0,
          size: 200,
          searchName: debouncedSearchQuery || undefined,
        });
        const studentUsers = users.items.filter((u) => u.role === "STUDENT");

        const detailsMap = new Map<number, StudentDashboardApi>();
        for (const user of studentUsers) {
          try {
            const dashboard = await reportsService.getStudentDashboard(
              user.userId,
            );
            detailsMap.set(user.userId, dashboard);
          } catch (error) {
            console.error(
              `Failed to load dashboard for student ${user.userId}`,
              error,
            );
          }
        }
        setStudentDetails(detailsMap);
        setStudents(
          studentUsers.map((user) => {
            const dashboard = detailsMap.get(user.userId);
            return {
              userId: user.userId,
              fullName: user.fullName,
              email: user.email,
              role: user.role,
              overallProgressPercent: dashboard?.overallProgressPercent ?? 0,
              overallScorePercent: dashboard?.overallScorePercent ?? 0,
              lastActivityAt: dashboard?.lastActivityAt ?? null,
              lastActiveLabel: dashboard?.lastActivityAt ?? "",
            } satisfies StudentProgressSummaryApi;
          }),
        );
      } catch (error) {
        console.error("Failed to load students", error);
        setStudents([]);
        setStudentDetails(new Map());
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [debouncedSearchQuery]);

  const unitsGrouped = useMemo(() => {
    const unitMap = new Map<number, UnitGroupedData>();

    for (const [userId, dashboard] of studentDetails) {
      const student = students.find((s) => s.userId === userId);
      if (!student) continue;

      for (const chapter of dashboard.chapters) {
        if (!unitMap.has(chapter.unitNumber)) {
          unitMap.set(chapter.unitNumber, {
            unitNumber: chapter.unitNumber,
            title: chapter.title,
            students: [],
            avgProgress: 0,
            avgScore: 0,
            completedCount: 0,
          });
        }

        unitMap.get(chapter.unitNumber)!.students.push({ student, chapter });
      }
    }

    for (const unit of unitMap.values()) {
      const progressSum = unit.students.reduce(
        (sum, sp) => sum + sp.chapter.progressPercent,
        0,
      );
      const scoreSum = unit.students.reduce(
        (sum, sp) => sum + sp.chapter.scorePercent,
        0,
      );

      unit.avgProgress =
        unit.students.length > 0 ? progressSum / unit.students.length : 0;
      unit.avgScore =
        unit.students.length > 0 ? scoreSum / unit.students.length : 0;
      unit.completedCount = unit.students.filter(
        (sp) => sp.chapter.status === "completed",
      ).length;
    }

    return Array.from(unitMap.values()).sort(
      (a, b) => a.unitNumber - b.unitNumber,
    );
  }, [studentDetails, students]);

  const getStatusColor = (progress: number) => {
    if (progress >= 80) return "text-emerald-600 bg-emerald-50";
    if (progress >= 50) return "text-blue-600 bg-blue-50";
    if (progress > 0) return "text-orange-600 bg-orange-50";
    return "text-slate-600 bg-slate-50";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-4 w-4" />;
    if (status === "locked") return <Lock className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const aggregateStats = useMemo(() => {
    let completedChapters = 0;
    let totalProgress = 0;
    let totalScore = 0;
    let totalRows = 0;
    const inProgressUserIds = new Set<number>();

    for (const unit of unitsGrouped) {
      completedChapters += unit.students.filter(
        (sp) => sp.chapter.status === "completed",
      ).length;
      totalRows += unit.students.length;
      totalProgress += unit.students.reduce(
        (sum, sp) => sum + sp.chapter.progressPercent,
        0,
      );
      totalScore += unit.students.reduce(
        (sum, sp) => sum + sp.chapter.scorePercent,
        0,
      );
      for (const sp of unit.students) {
        if (sp.chapter.status === "in-progress") {
          inProgressUserIds.add(sp.student.userId);
        }
      }
    }

    return {
      totalStudents: students.length,
      totalChapters: unitsGrouped.length,
      completedChapters,
      avgProgress: totalRows > 0 ? totalProgress / totalRows : 0,
      avgScore: totalRows > 0 ? totalScore / totalRows : 0,
      inProgressCount: inProgressUserIds.size,
    };
  }, [students.length, unitsGrouped]);

  const unitAverageProgress = useMemo(
    () =>
      unitsGrouped.map((unit) => ({
        unitNumber: unit.unitNumber,
        title: unit.title,
        avgProgress: unit.avgProgress,
        avgScore: unit.avgScore,
        avgScoreOnTen: unit.avgScore / 10,
      })),
    [unitsGrouped],
  );

  const totalStudentPages = Math.max(
    1,
    Math.ceil(students.length / STUDENT_PAGE_SIZE),
  );
  const currentStudentPage = Math.min(studentPage, totalStudentPages);

  const paginatedStudents = useMemo(() => {
    const start = (currentStudentPage - 1) * STUDENT_PAGE_SIZE;
    return students.slice(start, start + STUDENT_PAGE_SIZE);
  }, [students, currentStudentPage]);

  const studentUnitProgressMap = useMemo(() => {
    const progressMap: Record<
      number,
      Array<{
        unitNumber: number;
        title: string;
        progressPercent: number;
        scorePercent: number;
        status: string;
      }>
    > = {};

    for (const student of paginatedStudents) {
      const dashboard = studentDetails.get(student.userId);
      progressMap[student.userId] = dashboard
        ? dashboard.chapters
            .map((chapter) => ({
              unitNumber: chapter.unitNumber,
              title: chapter.title,
              progressPercent: chapter.progressPercent,
              scorePercent: chapter.scorePercent,
              status: chapter.status,
            }))
            .sort((a, b) => a.unitNumber - b.unitNumber)
        : [];
    }

    return progressMap;
  }, [paginatedStudents, studentDetails]);

  return (
    <AdminPageLayout
      title="Tiến độ các chương trình học"
      description="Xem tất cả học viên đang học chương nào, tiến độ và điểm số của họ cho từng chương."
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
          <Activity className="h-8 w-8 animate-spin text-slate-700" />
          <span className="text-sm font-medium">Đang tải dữ liệu...</span>
        </div>
      ) : unitsGrouped.length === 0 ? (
        <div className="text-center py-24 border border-slate-200 rounded-lg bg-white text-slate-600">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-base">Không có dữ liệu</p>
          <p className="text-sm mt-2">Chưa có học viên hoặc chương nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.8fr_0.8fr] gap-6 items-start">
          <div className="space-y-4 xl:sticky xl:top-20 self-start">
            <OverviewStatsCard
              stats={aggregateStats}
              getStatusColor={getStatusColor}
            />
          </div>

          <div className="space-y-4">
            <ChartsAndStudentsCard
              unitAverageProgress={unitAverageProgress}
              studentsCount={students.length}
              paginatedStudents={paginatedStudents}
              studentUnitProgressMap={studentUnitProgressMap}
              currentStudentPage={currentStudentPage}
              totalStudentPages={totalStudentPages}
              onPrevPage={() => setStudentPage((prev) => Math.max(1, prev - 1))}
              onNextPage={() =>
                setStudentPage((prev) => Math.min(totalStudentPages, prev + 1))
              }
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
          </div>

          <UnitCardsList
            unitsGrouped={unitsGrouped}
            onOpenUnit={(unit) => setActiveUnit(unit)}
          />

          <UnitDetailsDialog
            activeUnit={activeUnit}
            onOpenChange={(open) => {
              if (!open) setActiveUnit(null);
            }}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </div>
      )}
    </AdminPageLayout>
  );
}
