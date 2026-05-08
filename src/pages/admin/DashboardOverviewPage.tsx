import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHero, AdminKpiCard } from "@/components/admin/AdminPrimitives";
import { reportsService } from "@/services/reports.service";
import type { DashboardOverviewApi } from "@/models/reports.model";

function BucketBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max <= 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-muted-foreground">{count}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 240;
  const h = 56;
  const max = Math.max(1, ...points);
  const min = Math.min(0, ...points);
  const range = Math.max(1, max - min);
  const d = points
    .map((v, i) => {
      const x = (i / Math.max(1, points.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-90">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
    </svg>
  );
}

export default function DashboardOverviewPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardOverviewApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const overview = await reportsService.getOverview();
      setData(overview);
    } catch (e) {
      console.error("Failed to load overview", e);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const maxProgressBucket = useMemo(() => {
    if (!data) return 0;
    return Math.max(0, ...data.progressDistributionBuckets.map((b) => b.count));
  }, [data]);

  const maxScoreBucket = useMemo(() => {
    if (!data) return 0;
    return Math.max(0, ...data.scoreDistributionBuckets.map((b) => b.count));
  }, [data]);

  const sparkPoints = useMemo(() => {
    if (!data) return [];
    return data.dailyActiveUsers.map((p) => p.activeStudents);
  }, [data]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8 space-y-8 animate-fade-in">
      <AdminHero
        eyebrow="Bảng Điều Khiển Quản Trị"
        title="Tổng Quan Hệ Thống"
        description="Số liệu tổng hợp giúp bạn nắm nhanh: ai đang học, ai cần hỗ trợ, và mức độ sẵn sàng của toàn hệ."
        right={
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              className="border-border font-black uppercase tracking-widest text-[10px]"
              onClick={() => navigate("/admin/accounts")}
            >
              Danh sách học viên
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Đang tải dashboard...
          </span>
        </div>
      ) : !data ? (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-lg text-muted-foreground bg-muted/5">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p className="font-black text-sm uppercase tracking-widest">
            Không thể tải dữ liệu
          </p>
          <p className="text-xs mt-2 max-w-xl mx-auto">
            Hãy đăng nhập admin và kiểm tra kết nối API backend.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <AdminKpiCard
              label="Tổng học viên"
              value={data.totalStudents.toString()}
              icon={<Users className="h-4 w-4 text-primary" />}
            />
            <AdminKpiCard
              label="Hoạt động 7 ngày"
              value={data.activeStudents7d.toString()}
              icon={<Activity className="h-4 w-4 text-secondary" />}
            />
            <AdminKpiCard
              label="Tiến độ TB"
              value={`${Math.round(data.avgOverallProgressPercent)}%`}
              icon={<BarChart3 className="h-4 w-4 text-primary" />}
            />
            <AdminKpiCard
              label="Cần hỗ trợ"
              value={data.studentsAtRiskCount.toString()}
              icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="bg-card border border-border police-shadow rounded-lg overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
                <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">
                  Phân phối tiến độ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {data.progressDistributionBuckets.map((b) => (
                  <BucketBar key={b.label} label={`${b.label}%`} count={b.count} max={maxProgressBucket} />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border border-border police-shadow rounded-lg overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
                <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">
                  Phân phối điểm
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {data.scoreDistributionBuckets.map((b) => (
                  <BucketBar key={b.label} label={`${b.label}%`} count={b.count} max={maxScoreBucket} />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border border-border police-shadow rounded-lg overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
                <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">
                  Học viên hoạt động theo ngày
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                    30 ngày
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Max: {Math.max(0, ...sparkPoints)} / ngày
                  </span>
                </div>
                <div className="text-muted-foreground">
                  <Sparkline points={sparkPoints.length ? sparkPoints : [0]} />
                </div>
                <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-xs text-muted-foreground space-y-2">
                  <p className="font-black uppercase tracking-widest text-[10px]">
                    Cách hiểu nhanh
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    {data.explain.slice(0, 3).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

