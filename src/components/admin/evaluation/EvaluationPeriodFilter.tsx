import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EvaluationPeriodResponse } from "@/models/evaluation.model";

interface EvaluationPeriodFilterProps {
  period: EvaluationPeriodResponse;
  onPeriodChange: (period: EvaluationPeriodResponse) => void;
  onPreset: (days: number) => void;
}

export function EvaluationPeriodFilter({
  period,
  onPeriodChange,
  onPreset,
}: EvaluationPeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Date range inputs */}
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <Label
            htmlFor="eval-from"
            className="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
          >
            Từ ngày
          </Label>
          <Input
            id="eval-from"
            type="date"
            className="h-8 w-[140px] rounded-[4px] border-slate-300 text-xs focus-visible:border-[#1e3a6e] focus-visible:ring-0"
            value={period.from}
            onChange={(e) =>
              onPeriodChange({ ...period, from: e.target.value })
            }
          />
        </div>
        <span className="mb-1.5 text-xs text-slate-400">→</span>
        <div className="space-y-1">
          <Label
            htmlFor="eval-to"
            className="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
          >
            Đến ngày
          </Label>
          <Input
            id="eval-to"
            type="date"
            className="h-8 w-[140px] rounded-[4px] border-slate-300 text-xs focus-visible:border-[#1e3a6e] focus-visible:ring-0"
            value={period.to}
            onChange={(e) => onPeriodChange({ ...period, to: e.target.value })}
          />
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-[4px] border-slate-300 px-3 text-xs font-semibold text-slate-600 hover:border-[#1e3a6e] hover:text-[#1e3a6e]"
          onClick={() => onPreset(7)}
        >
          7 ngày
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-[4px] border-slate-300 px-3 text-xs font-semibold text-slate-600 hover:border-[#1e3a6e] hover:text-[#1e3a6e]"
          onClick={() => onPreset(30)}
        >
          30 ngày
        </Button>
      </div>
    </div>
  );
}
