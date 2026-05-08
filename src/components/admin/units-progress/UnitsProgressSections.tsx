import { Fragment, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  AggregateStats,
  UnitAverageProgress,
  UnitGroupedData,
} from "@/components/admin/units-progress/types";

interface OverviewStatsCardProps {
  stats: AggregateStats;
  getStatusColor: (progress: number) => string;
}

export function OverviewStatsCard({
  stats,
  getStatusColor,
}: OverviewStatsCardProps) {
  return (
    <Card className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50">
        <CardTitle className="text-lg font-bold text-slate-900">
          Tổng Quan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Tổng Học Viên</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalStudents}
            </p>
          </div>
          <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-slate-700" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Tổng Chương</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalChapters}
            </p>
          </div>
          <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <BarChart3 className="h-6 w-6 text-slate-700" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Đã Hoàn Thành</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.completedChapters}
            </p>
          </div>
          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Đang Học</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats.inProgressCount}
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Tiến Độ Trung Bình
              </span>
              <span className="text-sm font-bold text-slate-900">
                {Math.round(stats.avgProgress)}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-700 transition-all"
                style={{ width: `${stats.avgProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Điểm Trung Bình
              </span>
              <span
                className={`text-sm font-bold ${getStatusColor(stats.avgScore).split(" ")[0]}`}
              >
                {Math.round(stats.avgScore)}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.avgScore >= 80
                    ? "bg-emerald-600"
                    : stats.avgScore >= 50
                      ? "bg-blue-600"
                      : "bg-orange-600"
                }`}
                style={{ width: `${stats.avgScore}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartsAndStudentsCardProps {
  unitAverageProgress: UnitAverageProgress[];
  studentsCount: number;
  paginatedStudents: Array<{
    userId: number;
    fullName: string;
    email: string;
    overallProgressPercent: number;
    overallScorePercent: number;
  }>;
  studentUnitProgressMap: Record<
    number,
    Array<{
      unitNumber: number;
      title: string;
      progressPercent: number;
      scorePercent: number;
      status: string;
    }>
  >;
  currentStudentPage: number;
  totalStudentPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function ChartsAndStudentsCard({
  unitAverageProgress,
  studentsCount,
  paginatedStudents,
  studentUnitProgressMap,
  currentStudentPage,
  totalStudentPages,
  onPrevPage,
  onNextPage,
}: ChartsAndStudentsCardProps) {
  const [expandedStudents, setExpandedStudents] = useState<
    Record<number, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return paginatedStudents;
    return paginatedStudents.filter(
      (student) =>
        student.fullName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [paginatedStudents, searchQuery]);

  const toggleStudentDetails = (userId: number) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <Card className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50">
        <CardTitle className="text-lg font-bold text-slate-900">
          Biểu đồ theo chương
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {unitAverageProgress.length > 0 ? (
          <>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Tiến độ trung bình
              </h3>
              <div className="border border-slate-200 rounded-md bg-slate-50 p-4 space-y-3">
                {unitAverageProgress.map((unit) => (
                  <div
                    key={`progress-${unit.unitNumber}`}
                    className="grid grid-cols-[46px_1fr_44px] items-center gap-3"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      Chương {unit.unitNumber}
                    </span>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{
                          width: `${Math.max(0, Math.min(100, unit.avgProgress))}%`,
                        }}
                        title={`Chương ${unit.unitNumber} - Tiến độ: ${Math.round(unit.avgProgress)}%`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 tabular-nums text-right">
                      {Math.round(unit.avgProgress)}%
                    </span>
                  </div>
                ))}
                <div className="pt-1 text-[11px] text-slate-500">
                  Thang đo: 0% - 100%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Điểm trung bình
              </h3>
              <div className="border border-slate-200 rounded-md bg-slate-50 p-4 space-y-3">
                {unitAverageProgress.map((unit) => (
                  <div
                    key={`score-${unit.unitNumber}`}
                    className="grid grid-cols-[46px_1fr_52px] items-center gap-3"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      Chương {unit.unitNumber}
                    </span>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{
                          width: `${Math.max(0, Math.min(10, unit.avgScoreOnTen)) * 10}%`,
                        }}
                        title={`Chương ${unit.unitNumber} - Điểm: ${unit.avgScoreOnTen.toFixed(1)}/10`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 tabular-nums text-right">
                      {unit.avgScoreOnTen.toFixed(1)}/10
                    </span>
                  </div>
                ))}
                <div className="pt-1 text-[11px] text-slate-500">
                  Thang đo: 0 - 10
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-500">
            Chưa có dữ liệu để vẽ biểu đồ.
          </div>
        )}

        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Danh sách học viên
            </h3>
            <Badge className="bg-slate-100 text-slate-700 font-medium">
              {studentsCount} học viên
            </Badge>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="pl-9 border-slate-300 focus-visible:ring-slate-400"
            />
          </div>

          {studentsCount > 0 ? (
            filteredStudents.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-md border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">
                          Học viên
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">
                          Email
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-900">
                          Tiến độ
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-900">
                          Điểm
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-900">
                          Chi tiết
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => {
                        const unitProgressList =
                          studentUnitProgressMap[student.userId] ?? [];
                        const isExpanded =
                          expandedStudents[student.userId] ?? false;

                        return (
                          <Fragment key={student.userId}>
                            <tr className="border-b border-slate-100">
                              <td className="py-3 px-4 font-medium text-slate-900">
                                {student.fullName}
                              </td>
                              <td className="py-3 px-4 text-slate-600">
                                {student.email}
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-slate-700 tabular-nums">
                                {Math.round(student.overallProgressPercent)}%
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-slate-700 tabular-nums">
                                {(student.overallScorePercent / 10).toFixed(1)}/10
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-slate-300 text-slate-700 hover:bg-slate-50"
                                  onClick={() =>
                                    toggleStudentDetails(student.userId)
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                            {isExpanded ? (
                              <tr className="border-b border-slate-100 last:border-b-0 bg-slate-50/60">
                                <td colSpan={5} className="px-4 py-4">
                                  {unitProgressList.length > 0 ? (
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Danh sách tiến độ theo chương
                                      </p>
                                      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
                                        <table className="w-full text-xs">
                                          <thead>
                                            <tr className="border-b border-slate-200 bg-slate-100">
                                              <th className="px-3 py-2 text-left font-semibold text-slate-700">
                                                Chương
                                              </th>
                                              <th className="px-3 py-2 text-center font-semibold text-slate-700">
                                                Tiến độ
                                              </th>
                                              <th className="px-3 py-2 text-center font-semibold text-slate-700">
                                                Điểm
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {unitProgressList.map((unit) => (
                                              <tr
                                                key={`${student.userId}-${unit.unitNumber}`}
                                                className="border-b border-slate-100 last:border-b-0"
                                              >
                                                <td className="px-3 py-2 text-slate-800">
                                                  Chương {unit.unitNumber} -{" "}
                                                  {unit.title}
                                                </td>
                                                <td className="px-3 py-2 text-center font-semibold text-slate-700 tabular-nums">
                                                  {Math.round(
                                                    unit.progressPercent,
                                                  )}
                                                  %
                                                </td>
                                                <td className="px-3 py-2 text-center font-semibold text-slate-700 tabular-nums">
                                                  {(
                                                    unit.scorePercent / 10
                                                  ).toFixed(1)}
                                                  /10
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500">
                                      Chưa có dữ liệu tiến độ theo chương.
                                    </p>
                                  )}
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Trang {currentStudentPage}/{totalStudentPages} - Hiển thị{" "}
                    {filteredStudents.length} mục
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={onPrevPage}
                      disabled={currentStudentPage === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={onNextPage}
                      disabled={currentStudentPage === totalStudentPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">
                Không tìm thấy học viên phù hợp.
              </div>
            )
          ) : (
            <div className="text-sm text-slate-500">
              Chưa có học viên từ API.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface UnitCardsListProps {
  unitsGrouped: UnitGroupedData[];
  onOpenUnit: (unit: UnitGroupedData) => void;
}

export function UnitCardsList({
  unitsGrouped,
  onOpenUnit,
}: UnitCardsListProps) {
  return (
    <div className="space-y-4">
      {unitsGrouped.map((unit) => (
        <Card
          key={unit.unitNumber}
          className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md"
        >
          <CardHeader className="border-b border-slate-100 px-5 py-4 flex flex-row items-start justify-between gap-3 bg-slate-50/80">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="shrink-0 h-8 w-8 bg-slate-800 border border-slate-700 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {unit.unitNumber}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    {unit.title}
                  </CardTitle>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <Badge className="bg-slate-800 text-white font-medium">
                  <Users className="h-3 w-3 mr-1" />
                  {unit.students.length} học viên
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {unit.completedCount} hoàn thành
                </Badge>
                <Badge className="bg-slate-100 text-slate-700 font-medium">
                  Tiến độ TB: {Math.round(unit.avgProgress)}%
                </Badge>
                <Badge className="bg-slate-100 text-slate-700 font-medium">
                  Điểm TB: {Math.round(unit.avgScore)}%
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0"
              onClick={() => onOpenUnit(unit)}
              title={`Xem chi tiết chương ${unit.unitNumber}`}
              aria-label={`Xem chi tiết chương ${unit.unitNumber}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

interface UnitDetailsDialogProps {
  activeUnit: UnitGroupedData | null;
  onOpenChange: (open: boolean) => void;
  getStatusColor: (progress: number) => string;
  getStatusIcon: (status: string) => ReactNode;
}

export function UnitDetailsDialog({
  activeUnit,
  onOpenChange,
  getStatusColor,
  getStatusIcon,
}: UnitDetailsDialogProps) {
  return (
    <Dialog open={activeUnit !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] min-w-[1400px] p-0 overflow-hidden border-slate-300 bg-white shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white">
          <DialogTitle>
            {activeUnit
              ? `Chương ${activeUnit.unitNumber}: ${activeUnit.title}`
              : "Chi tiết chương"}
          </DialogTitle>
        </DialogHeader>
        {activeUnit ? (
          <div className="overflow-x-auto max-h-[78vh] p-2 md:p-4 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Học Viên
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Trạng Thái
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">
                    Nỗ Lực
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">
                    Tiến Độ
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">
                    Điểm Số
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeUnit.students.map((sp) => (
                  <tr
                    key={sp.student.userId}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {sp.student.fullName}
                        </p>
                        <p className="text-xs text-slate-600 font-mono">
                          {sp.student.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(sp.chapter.status)}
                        <span className="text-xs font-medium capitalize text-slate-600">
                          {sp.chapter.status === "locked"
                            ? "Khóa"
                            : sp.chapter.status === "completed"
                              ? "Hoàn Thành"
                              : "Đang Học"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        variant="outline"
                        className="font-mono font-semibold"
                      >
                        {sp.chapter.attemptCount}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-700 transition-all"
                            style={{ width: `${sp.chapter.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          {Math.round(sp.chapter.progressPercent)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`px-3 py-1.5 rounded font-semibold text-sm ${getStatusColor(
                            sp.chapter.scorePercent,
                          )}`}
                        >
                          {Math.round(sp.chapter.scorePercent)}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
