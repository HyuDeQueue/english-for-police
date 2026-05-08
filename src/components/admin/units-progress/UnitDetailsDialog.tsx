import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/common/PaginationControls";
import type { UnitGroupedData } from "@/components/admin/units-progress/types";
import { usePagination } from "@/hooks/app/use-pagination";

interface UnitDetailsDialogProps {
  activeUnit: UnitGroupedData | null;
  onOpenChange: (open: boolean) => void;
  getStatusColor: (progress: number) => string;
}

export function UnitDetailsDialog({
  activeUnit,
  onOpenChange,
  getStatusColor,
}: UnitDetailsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const PAGE_SIZE = 8;

  const filteredStudents = useMemo(() => {
    if (!activeUnit) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activeUnit.students;
    return activeUnit.students.filter(
      ({ student }) =>
        student.fullName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [activeUnit, searchQuery]);

  const {
    currentPage,
    totalPages,
    pagedItems: paginatedStudents,
    goPrev,
    goNext,
    resetPage,
  } = usePagination(filteredStudents, { pageSize: PAGE_SIZE });

  return (
    <Dialog open={activeUnit !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] min-w-[700px] p-0 overflow-hidden border-slate-300 bg-white shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white">
          <DialogTitle>
            {activeUnit
              ? `Chương ${activeUnit.unitNumber}: ${activeUnit.title}`
              : "Chi tiết chương"}
          </DialogTitle>
        </DialogHeader>
        {activeUnit ? (
          <div className="max-h-[78vh] p-2 md:p-4 bg-white space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  resetPage();
                }}
                placeholder="Tìm theo tên hoặc email..."
                className="pl-9 border-slate-300 focus-visible:ring-slate-400"
              />
            </div>

            {filteredStudents.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-md border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">
                          Học Viên
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
                      {paginatedStudents.map((sp) => (
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
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-slate-700 transition-all"
                                  style={{
                                    width: `${sp.chapter.progressPercent}%`,
                                  }}
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

                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  currentItemsCount={paginatedStudents.length}
                  onPrevPage={goPrev}
                  onNextPage={goNext}
                />
              </>
            ) : (
              <div className="text-sm text-slate-500">
                Không tìm thấy học viên phù hợp.
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
