import { BarChart3, Users } from "lucide-react";

interface EvaluationEmptyStateProps {
  variant: "participation" | "improvement";
}

export function EvaluationEmptyState({ variant }: EvaluationEmptyStateProps) {
  const Icon = variant === "participation" ? Users : BarChart3;
  const title =
    variant === "participation"
      ? "Chưa có hoạt động trong kỳ"
      : "Chưa có bài nộp trong kỳ";
  const description =
    variant === "participation"
      ? "Học sinh chưa ghi nhận hoạt động trong khoảng thời gian đã chọn."
      : "Học sinh chưa nộp bài chương nào trong khoảng thời gian đã chọn.";

  return (
    <div className="flex flex-col items-center justify-center rounded-[4px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <Icon className="mb-3 h-10 w-10 text-slate-300" />
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
    </div>
  );
}
