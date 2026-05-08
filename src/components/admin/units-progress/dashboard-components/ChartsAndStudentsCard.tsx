import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/common/PaginationControls";
import type { UnitAverageProgress } from "@/components/admin/units-progress/types";

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
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
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
  searchQuery,
  onSearchQueryChange,
}: ChartsAndStudentsCardProps) {
  const [expandedStudents, setExpandedStudents] = useState<
    Record<number, boolean>
  >({});

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
                    className="grid grid-cols-[60px_1fr_44px] items-center gap-3"
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
                    className="grid grid-cols-[60px_1fr_52px] items-center gap-3"
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
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="pl-9 border-slate-300 focus-visible:ring-slate-400"
            />
          </div>

          {studentsCount > 0 ? (
            paginatedStudents.length > 0 ? (
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
                      {paginatedStudents.map((student) => {
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
                                {(student.overallScorePercent / 10).toFixed(1)}
                                /10
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

                <PaginationControls
                  currentPage={currentStudentPage}
                  totalPages={totalStudentPages}
                  currentItemsCount={paginatedStudents.length}
                  onPrevPage={onPrevPage}
                  onNextPage={onNextPage}
                />
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
