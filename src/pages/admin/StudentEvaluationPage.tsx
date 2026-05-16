import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Activity, ArrowLeft, RefreshCw } from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvaluationPeriodFilter } from "@/components/admin/evaluation/EvaluationPeriodFilter";
import { ParticipationPanel } from "@/components/admin/evaluation/ParticipationPanel";
import { ImprovementSummaryPanel } from "@/components/admin/evaluation/ImprovementSummaryPanel";
import { UnitImprovementDetail } from "@/components/admin/evaluation/UnitImprovementDetail";
import { useStudentEvaluation } from "@/hooks/use-student-evaluation";

export default function StudentEvaluationPage() {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = userIdParam ? Number.parseInt(userIdParam, 10) : undefined;

  const {
    period,
    setPeriod,
    applyPreset,
    summary,
    meta,
    improvementDetail,
    selectedUnitNumber,
    isLoadingSummary,
    isLoadingDetail,
    error,
    loadSummary,
    loadImprovementDetail,
    clearImprovementDetail,
  } = useStudentEvaluation(userId);

  const selectedUnitDetail = useMemo(() => {
    if (!improvementDetail || selectedUnitNumber === null) return null;
    return (
      improvementDetail.units.find(
        (u) => u.summary.unitNumber === selectedUnitNumber,
      ) ?? null
    );
  }, [improvementDetail, selectedUnitNumber]);

  const sheetOpen = selectedUnitNumber !== null;

  return (
    <AdminPageLayout
      title={summary?.fullName ?? "Đánh giá học viên"}
      description="Tham gia và cải thiện theo kỳ — dữ liệu từ API đánh giá."
      actions={
        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-[4px] border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          <Link to="/admin/units">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Tiến độ chương trình
          </Link>
        </Button>
      }
    >
      <div className="max-w-full min-w-0 space-y-4 overflow-x-hidden">
        {/* ── Filter bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Kỳ đánh giá:
            </span>
            <EvaluationPeriodFilter
              period={period}
              onPeriodChange={setPeriod}
              onPreset={applyPreset}
            />
          </div>
          <div className="flex items-center gap-2">
            {meta?.source === "legacy-adapter" ? (
              <Badge
                variant="outline"
                className="rounded-[4px] border-amber-300 bg-amber-50 text-[10px] font-bold text-amber-800"
              >
                API cũ (ước lượng)
              </Badge>
            ) : meta?.source === "evaluation-api" ? (
              <Badge
                variant="outline"
                className="rounded-[4px] border-emerald-300 bg-emerald-50 text-[10px] font-bold text-emerald-800"
              >
                API đánh giá
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-[4px] border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              disabled={isLoadingSummary}
              onClick={() => void loadSummary()}
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isLoadingSummary ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </div>
        </div>

        {/* ── Content states ── */}
        {isLoadingSummary ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[4px] border border-slate-200 bg-white text-slate-500 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
            <Activity className="h-7 w-7 animate-spin text-[#1e3a6e]" />
            <span className="text-sm font-medium text-slate-600">
              Đang tải đánh giá...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-[4px] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        ) : summary ? (
          <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
            <ParticipationPanel participation={summary.participation} />
            <ImprovementSummaryPanel
              improvement={summary.improvement}
              selectedUnitNumber={selectedUnitNumber}
              onSelectUnit={(unitNumber) => {
                void loadImprovementDetail(unitNumber);
              }}
            />
          </div>
        ) : (
          <div className="rounded-[4px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
            Không tìm thấy dữ liệu học viên.
          </div>
        )}
      </div>

      <UnitImprovementDetail
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) clearImprovementDetail();
        }}
        unitDetail={selectedUnitDetail}
        isLoading={isLoadingDetail}
      />
    </AdminPageLayout>
  );
}
