import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Lock,
  Mail,
  Shield,
  Target,
} from "lucide-react";
import { reportsService } from "@/services/reports.service";
import type { StudentDashboardApi } from "@/models/reports.model";
import {
  AdminInsightRow,
  AdminMetricCard,
} from "@/components/admin/AdminPrimitives";

export default function StudentDossierPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<StudentDashboardApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const data = await reportsService.getStudentDashboard(parseInt(userId, 10));
        setDossier(data);
      } catch (error) {
        console.error("Failed to fetch dossier", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground gap-4">
        <Activity className="h-10 w-10 animate-spin text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          Đang tải hồ sơ học viên...
        </span>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen bg-background p-6 text-center flex flex-col items-center justify-center gap-4">
        <Lock className="h-12 w-12 text-destructive opacity-50" />
        <p className="text-destructive font-black uppercase tracking-widest">
          Không thể truy cập: không tìm thấy hồ sơ
        </p>
        <Button
          onClick={() => navigate("/admin/accounts")}
          variant="outline"
          className="mt-4 border-border font-bold"
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/accounts")}
          className="w-fit text-muted-foreground hover:text-primary p-0 hover:bg-transparent transition-all group font-black text-[10px] uppercase tracking-widest"
        >
          <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách học viên
        </Button>

        <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 md:p-8 police-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-primary/5 rounded-bl-[130px]" />
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
            <div className="flex gap-5 md:gap-8 items-center">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-lg bg-primary flex items-center justify-center border-4 border-white shadow-2xl relative">
                <span className="text-3xl md:text-4xl font-black text-white">
                  {dossier.fullName.charAt(0)}
                </span>
                <div className="absolute -bottom-2 -right-2 bg-secondary text-primary h-8 w-8 rounded-full border-4 border-white flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground uppercase">
                    {dossier.fullName}
                  </h1>
                  <Badge className="bg-secondary text-primary font-black tracking-widest text-[10px] border-none px-3 py-1 rounded-full">
                    Top {dossier.rank?.percentileInCohort ?? 0}%
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono">ID #{dossier.userId}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono">{dossier.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:text-right flex flex-col items-start xl:items-end gap-1.5">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">
                Điểm tổng (ước lượng)
              </p>
              <div className="text-6xl md:text-7xl font-black text-primary tabular-nums tracking-tighter leading-none">
                {Math.round(dossier.overallScorePercent)}%
              </div>
              <div className="h-1.5 w-full max-w-[220px] bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-secondary transition-all duration-1000"
                  style={{ width: `${Math.round(dossier.overallScorePercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminMetricCard
          label="Tiến độ khóa học"
          value={`${dossier.chapters.filter((u) => u.status === "COMPLETED").length}/${dossier.chapters.length}`}
          icon={<CheckCircle2 className="h-6 w-6 text-primary" />}
          unit="CHƯƠNG"
        />
        <AdminMetricCard
          label="Tổng thời gian học"
          value={Math.round(dossier.activity.totalAttempts / 2).toString()}
          icon={<Clock className="h-6 w-6 text-primary" />}
          unit="GIỜ"
        />
        <AdminMetricCard
          label="Độ chính xác"
          value={Math.round(dossier.overallScorePercent).toString()}
          icon={<Target className="h-6 w-6 text-primary" />}
          unit="PHẦN TRĂM"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6">
        <Card className="bg-card border border-border police-shadow rounded-lg overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">
                Tiến trình chương trình
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {dossier.chapters.map((unit) => (
              <div
                key={unit.unitNumber}
                className="space-y-4 rounded-lg border border-border/60 bg-background p-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-8 w-8 rounded-md flex items-center justify-center border transition-all ${
                        unit.status === "NOT_STARTED"
                          ? "bg-muted border-border text-muted-foreground/30"
                          : "bg-primary/5 border-primary/20 text-primary"
                      }`}
                    >
                      {unit.status === "NOT_STARTED" ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-black">{unit.unitNumber}</span>
                      )}
                    </div>
                    <div
                      className={`font-bold text-sm tracking-tight ${
                        unit.status === "NOT_STARTED"
                          ? "text-muted-foreground/40"
                          : "text-foreground"
                      }`}
                    >
                      {unit.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider font-bold"
                    >
                      {Math.round(unit.progressPercent)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-[3px] h-2.5">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-[1.5px] transition-all duration-700 ${
                        i < (unit.progressPercent / 100) * 20 ? "bg-primary" : "bg-muted/50"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-black uppercase tracking-widest">
                    Điểm tốt nhất: {Math.round(unit.scorePercent)}%
                  </span>
                  <span className="font-mono">
                    Lần làm: {unit.attemptCount}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border border-border rounded-lg overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">
                  Gợi ý huấn luyện
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <AdminInsightRow
                label="Điểm tổng (trung bình best score)"
                value={`${Math.round(dossier.overallScorePercent)}%`}
              />
              <AdminInsightRow
                label="Độ chính xác"
                value={`${Math.round(dossier.overallScorePercent)}%`}
              />
              <AdminInsightRow
                label="Hoạt động 7 ngày"
                value={`${dossier.activity.attemptsLast7Days} lượt làm`}
              />
              <AdminInsightRow
                label="Tiến độ (7 ngày)"
                value={`${Math.round(dossier.trend.last7Days.progressDeltaPercent)}%`}
              />
              <AdminInsightRow
                label="Điểm (7 ngày)"
                value={`${Math.round(dossier.trend.last7Days.scoreDeltaPercent)}%`}
              />
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
                Gợi ý: ưu tiên kèm các chương chưa hoàn thành và có điểm {"<"} 80%.
              </div>
              <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-xs text-muted-foreground space-y-2">
                <p className="font-black uppercase tracking-widest text-[10px]">
                  Cách tính (để admin dễ kiểm tra)
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  {dossier.explain.slice(0, 3).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
