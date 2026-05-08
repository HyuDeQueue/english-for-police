import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserCircle, Activity, ShieldCheck, AlertTriangle } from "lucide-react";
import type { StudentProgressSummary } from "@/models/admin.model";
import { AdminHero, AdminKpiCard } from "@/components/admin/AdminPrimitives";
import { StudentListCard } from "@/components/admin/StudentListCard";
import { StudentDirectoryToolbar } from "@/components/admin/StudentDirectoryToolbar";
import { reportsService } from "@/services/reports.service";
import type { StudentProgressSummaryApi } from "@/models/reports.model";

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
  const [students, setStudents] = useState<StudentProgressSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [readinessFilter, setReadinessFilter] = useState<ReadinessFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("progress");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await reportsService.getStudents();
        setStudents(data.map(mapStudentSummary));
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="rounded-md border border-border bg-card px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-muted/20 transition-all"
              >
                Tổng quan
              </button>
              <button
                onClick={() => navigate("/admin/compare")}
                className="rounded-md border border-border bg-card px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-muted/20 transition-all"
              >
                So sánh
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
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
              Không có kết quả phù hợp
            </p>
            <p className="text-xs mt-1">
              Hãy thử từ khóa hoặc bộ lọc khác.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function mapStudentSummary(s: StudentProgressSummaryApi): StudentProgressSummary {
  return {
    userId: s.userId,
    fullName: s.fullName,
    rank: s.role,
    email: s.email,
    completionPercentage: Number(s.overallProgressPercent ?? 0),
    lastActive: s.lastActiveLabel ?? "Chưa hoạt động",
    role: s.role,
  };
}
