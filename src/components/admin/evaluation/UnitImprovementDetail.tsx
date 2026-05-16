import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { effectiveScore } from "@/models/evaluation.model";
import type { UnitImprovementDetailResponse } from "@/models/evaluation.model";
import {
  deltaScoreClassName,
  formatDeltaScore,
  formatScore,
  trendBadgeClass,
  trendLabel,
} from "./evaluation-display";

interface UnitImprovementDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitDetail: UnitImprovementDetailResponse | null;
  isLoading: boolean;
}

export function UnitImprovementDetail({
  open,
  onOpenChange,
  unitDetail,
  isLoading,
}: UnitImprovementDetailProps) {
  const summary = unitDetail?.summary;
  const chartData =
    unitDetail?.attemptScores.map((p) => ({
      submittedAt: new Date(p.submittedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      score: effectiveScore(p),
      rawSubmittedAt: p.submittedAt,
    })) ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto rounded-none border-l border-slate-200 sm:max-w-[480px]">
        <SheetHeader className="border-b border-slate-200 pb-3">
          <SheetTitle className="text-left text-[15px] font-bold text-[#1e3a6e]">
            {summary
              ? `Chương ${summary.unitNumber}${summary.unitTitle ? ` — ${summary.unitTitle}` : ""}`
              : "Chi tiết cải thiện"}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-[#1e3a6e]" />
          </div>
        ) : summary ? (
          <div className="mt-4 space-y-5">
            {/* Status row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-[4px] border-slate-300 text-[11px] text-slate-600"
              >
                {summary.attemptCount} lần nộp
              </Badge>
              <Badge
                variant="outline"
                className={`rounded-[4px] text-[11px] font-bold ${trendBadgeClass(summary.trendDirection)}`}
              >
                {trendLabel(summary.trendDirection)}
              </Badge>
              <span
                className={`text-sm font-bold ${deltaScoreClassName(summary.deltaScore)}`}
              >
                Δ {formatDeltaScore(summary.deltaScore)}
              </span>
            </div>

            {/* Score tiles */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "ĐẦU", value: formatScore(summary.firstScore) },
                { label: "CUỐI", value: formatScore(summary.lastScore) },
                { label: "CAO", value: formatScore(summary.bestScore) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-[4px] border border-slate-200 bg-slate-50 p-3 text-center"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-[18px] font-black leading-none text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Line chart */}
            {chartData.length === 0 ? (
              <div className="rounded-[4px] border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                Chưa có lần nộp bài trong kỳ để vẽ biểu đồ.
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Điểm theo lần nộp
                </p>
                <div className="rounded-[4px] border border-slate-200 bg-white p-3">
                  <div className="h-[200px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="submittedAt"
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "4px",
                            fontSize: "12px",
                            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                          }}
                          formatter={(value) => [
                            typeof value === "number"
                              ? value.toFixed(2)
                              : String(value ?? ""),
                            "Điểm",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          name="Điểm"
                          stroke="#1e3a6e"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#1e3a6e", strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Không có dữ liệu chi tiết.
          </p>
        )}

        <div className="mt-6 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-[4px] border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Đóng
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
