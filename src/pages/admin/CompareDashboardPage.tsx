import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeftRight, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminHero } from "@/components/admin/AdminPrimitives";
import { reportsService } from "@/services/reports.service";
import type { CompareDashboardApi, StudentProgressSummaryApi } from "@/models/reports.model";

function LineChart({
  series,
}: {
  series: { label: string; points: (number | null)[] }[];
}) {
  const w = 820;
  const h = 220;
  const flat = series.flatMap((s) => s.points).filter((v): v is number => v !== null);
  const max = flat.length ? Math.max(...flat) : 100;
  const min = flat.length ? Math.min(...flat) : 0;
  const range = Math.max(1, max - min);

  const colors = ["text-primary", "text-secondary", "text-destructive", "text-emerald-500", "text-sky-500"];

  return (
    <div className="w-full overflow-x-auto">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="min-w-[820px]">
        <line x1="0" y1={h - 1} x2={w} y2={h - 1} stroke="hsl(var(--border))" />
        {series.map((s, idx) => {
          const d = s.points
            .map((v, i) => {
              const x = (i / Math.max(1, s.points.length - 1)) * w;
              if (v === null) return null;
              const y = h - ((v - min) / range) * h;
              return { x, y, i };
            })
            .filter(Boolean) as { x: number; y: number; i: number }[];
          const path = d
            .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
            .join(" ");
          return (
            <path
              key={s.label}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className={colors[idx % colors.length]}
              opacity={0.9}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function CompareDashboardPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProgressSummaryApi[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [metric, setMetric] = useState<"progress" | "score">("progress");
  const [compare, setCompare] = useState<CompareDashboardApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await reportsService.getStudents();
        setStudents(list);
        setSelected(list.slice(0, 3).map((s) => s.userId));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const selectedLabels = useMemo(() => {
    const byId = new Map(students.map((s) => [s.userId, s.fullName]));
    return selected.map((id) => byId.get(id) ?? `#${id}`);
  }, [students, selected]);

  const runCompare = async () => {
    if (selected.length < 2) return;
    setIsComparing(true);
    try {
      const data = await reportsService.compare(selected, metric, 30);
      setCompare(data);
    } finally {
      setIsComparing(false);
    }
  };

  useEffect(() => {
    if (selected.length >= 2) runCompare();
  }, [metric]);

  const chartSeries = useMemo(() => {
    if (!compare) return [];
    return compare.series.map((s) => ({
      label: s.fullName,
      points: s.points.map((p) => p.value),
    }));
  }, [compare]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8 space-y-8 animate-fade-in">
      <AdminHero
        eyebrow="Bảng Điều Khiển Quản Trị"
        title="So Sánh Học Viên"
        description="Chọn 2–5 học viên để so sánh tiến độ hoặc điểm theo thời gian. Dùng phần này để giải thích với khách hàng về sự cải thiện."
        right={
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              className="border-border font-black uppercase tracking-widest text-[10px]"
              onClick={() => navigate("/admin/dashboard")}
            >
              <Users className="h-4 w-4 mr-2" />
              Tổng quan
            </Button>
            <Button
              className="font-black uppercase tracking-widest text-[10px]"
              onClick={runCompare}
              disabled={selected.length < 2 || isComparing}
            >
              <ArrowLeftRight className={`h-4 w-4 mr-2 ${isComparing ? "animate-spin" : ""}`} />
              So sánh
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Đang tải danh sách...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6">
          <Card className="bg-card border border-border police-shadow rounded-lg overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
              <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">
                Chọn học viên
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={metric === "progress" ? "default" : "outline"}
                  className="font-black uppercase tracking-widest text-[10px]"
                  onClick={() => setMetric("progress")}
                >
                  Tiến độ
                </Button>
                <Button
                  variant={metric === "score" ? "default" : "outline"}
                  className="font-black uppercase tracking-widest text-[10px]"
                  onClick={() => setMetric("score")}
                >
                  Điểm
                </Button>
              </div>

              <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-xs text-muted-foreground">
                Đang chọn:{" "}
                <span className="font-black text-foreground">
                  {selectedLabels.join(", ")}
                </span>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-auto pr-2">
                {students.map((s) => {
                  const isOn = selected.includes(s.userId);
                  return (
                    <button
                      key={s.userId}
                      onClick={() => {
                        setSelected((prev) => {
                          if (prev.includes(s.userId)) return prev.filter((id) => id !== s.userId);
                          if (prev.length >= 5) return prev;
                          return [...prev, s.userId];
                        });
                      }}
                      className={`w-full text-left rounded-md border px-3 py-2 transition-all ${
                        isOn
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-black uppercase tracking-widest text-[10px] truncate">
                            {s.fullName}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono truncate">
                            {s.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-black uppercase">
                            {Math.round(s.overallProgressPercent)}%
                          </Badge>
                          {isOn && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                Tip: chọn tối đa 5 học viên (để chart dễ đọc)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border police-shadow rounded-lg overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
              <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">
                Biểu đồ so sánh 30 ngày
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isComparing ? (
                <div className="flex flex-col items-center justify-center h-56 text-muted-foreground gap-4">
                  <Activity className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Đang so sánh...
                  </span>
                </div>
              ) : compare ? (
                <>
                  <LineChart series={chartSeries} />
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {compare.series.map((s) => (
                      <Badge key={s.userId} variant="outline" className="text-[10px] font-black uppercase">
                        {s.fullName}
                      </Badge>
                    ))}
                  </div>
                  <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-xs text-muted-foreground space-y-2">
                    <p className="font-black uppercase tracking-widest text-[10px]">
                      Gợi ý trình bày cho khách hàng
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {compare.explain.slice(0, 3).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-24 text-muted-foreground">
                  Chọn ít nhất 2 học viên để so sánh.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

