import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserCircle, Activity, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAdminReports } from "@/hooks/use-admin-reports";
import { AdminHero, AdminKpiCard } from "@/components/admin/AdminPrimitives";
import { StudentListCard } from "@/components/admin/StudentListCard";
import { StudentDirectoryToolbar } from "@/components/admin/StudentDirectoryToolbar";

type ReadinessFilter = "all" | "ready" | "watch";
type SortMode = "progress" | "name" | "activity";

function getActivityScore(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("m ago") || normalized.includes("phút")) return 3;
  if (normalized.includes("h ago") || normalized.includes("giờ")) return 2;
  if (normalized.includes("d ago") || normalized.includes("ngày")) return 1;
  return 0;
}

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const { studentList, isLoading, error, fetchStudentList } = useAdminReports();
  const [searchQuery, setSearchQuery] = useState("");
  const [readinessFilter, setReadinessFilter] = useState<ReadinessFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("progress");
  const students = useMemo(() => studentList ?? [], [studentList]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchStudentList();
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };
    void fetchData();
  }, [fetchStudentList]);

  const stats = useMemo(() => {
    const readyCount = students.filter((s) => s.completionPercentage >= 80).length;
    const watchCount = students.filter((s) => s.completionPercentage < 50).length;
    return {
      total: students.length,
      readyCount,
      watchCount,
    };
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const bySearch = students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );

    const byReadiness = bySearch.filter((s) => {
      if (readinessFilter === "ready") return s.completionPercentage >= 80;
      if (readinessFilter === "watch") return s.completionPercentage < 50;
      return true;
    });

    return [...byReadiness].sort((a, b) => {
      if (sortMode === "name") return a.fullName.localeCompare(b.fullName);
      if (sortMode === "activity") {
        return getActivityScore(b.lastActive) - getActivityScore(a.lastActive);
      }
      return b.completionPercentage - a.completionPercentage;
    });
  }, [students, searchQuery, readinessFilter, sortMode]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8 space-y-8 animate-fade-in">
      <AdminHero
        eyebrow="Bảng Điều Khiển Quản Trị"
        title="Danh Sách Học Viên"
        description="Theo dõi mức độ sẵn sàng, phát hiện học viên cần hỗ trợ và mở hồ sơ chi tiết để đưa ra quyết định huấn luyện."
        right={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <AdminKpiCard
              label="Tổng số"
              value={stats.total.toString()}
              icon={<UserCircle className="h-4 w-4 text-primary" />}
            />
            <AdminKpiCard
              label="Sẵn sàng nhiệm vụ"
              value={stats.readyCount.toString()}
              icon={<ShieldCheck className="h-4 w-4 text-secondary" />}
            />
            <AdminKpiCard
              label="Cần hỗ trợ"
              value={stats.watchCount.toString()}
              icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            />
          </div>
        }
      />

      <div className="-mt-2 rounded-lg border border-border bg-card p-6 md:p-8 police-shadow">
        <StudentDirectoryToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          readinessFilter={readinessFilter}
          onReadinessFilterChange={setReadinessFilter}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
            <Activity className="h-8 w-8 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Đang tải dữ liệu học viên...
            </span>
          </div>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentListCard
              key={student.userId}
              student={student}
              onOpen={(userId) => navigate(`/admin/accounts/${userId}`)}
            />
          ))
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-border rounded-lg text-muted-foreground bg-muted/5">
            <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p className="font-bold text-sm uppercase tracking-widest">
              {error ? "Không thể tải danh sách học viên" : "Không có kết quả phù hợp"}
            </p>
            <p className="text-xs mt-1">
              {error ? error : "Hãy thử từ khóa hoặc bộ lọc khác."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
