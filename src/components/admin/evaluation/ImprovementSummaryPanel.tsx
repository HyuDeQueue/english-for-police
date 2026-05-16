import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ImprovementBlockResponse,
  UnitImprovementResponse,
} from "@/models/evaluation.model";
import { EvaluationEmptyState } from "./EvaluationEmptyState";
import {
  deltaScoreClassName,
  formatDeltaScore,
  formatScore,
  trendBadgeClass,
  trendLabel,
} from "./evaluation-display";
import { UnitScoresBarChart } from "./UnitScoresBarChart";

interface ImprovementSummaryPanelProps {
  improvement: ImprovementBlockResponse;
  selectedUnitNumber: number | null;
  onSelectUnit: (unitNumber: number) => void;
}

export function ImprovementSummaryPanel({
  improvement,
  selectedUnitNumber,
  onSelectUnit,
}: ImprovementSummaryPanelProps) {
  const units = improvement.units;
  const empty = units.length === 0;

  return (
    <Card className="flex h-full min-w-0 flex-col rounded-[4px] border border-slate-200 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <CardHeader className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-bold text-[#1e3a6e]">
            Cải thiện
          </CardTitle>
          {improvement.overallDeltaPercent !== null ? (
            <Badge
              variant="outline"
              className={`rounded-[4px] text-[11px] font-bold ${deltaScoreClassName(improvement.overallDeltaPercent)}`}
            >
              Δ trung bình: {formatDeltaScore(improvement.overallDeltaPercent)}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {empty ? (
          <EvaluationEmptyState variant="improvement" />
        ) : (
          <>
            <UnitScoresBarChart units={units} />
            <div className="overflow-x-auto rounded-[4px] border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Chương
                    </TableHead>
                    <TableHead className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Lần
                    </TableHead>
                    <TableHead className="py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Đầu
                    </TableHead>
                    <TableHead className="py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Cuối
                    </TableHead>
                    <TableHead className="py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Cao
                    </TableHead>
                    <TableHead className="py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Δ
                    </TableHead>
                    <TableHead className="py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Xu hướng
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <UnitRow
                      key={unit.unitNumber}
                      unit={unit}
                      selected={selectedUnitNumber === unit.unitNumber}
                      onSelect={() => onSelectUnit(unit.unitNumber)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function UnitRow({
  unit,
  selected,
  onSelect,
}: {
  unit: UnitImprovementResponse;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TableRow
      className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-[#eff6ff] ${
        selected ? "bg-[#eff6ff]" : ""
      }`}
      onClick={onSelect}
    >
      <TableCell className="py-2 text-xs font-semibold text-slate-800">
        {unit.unitNumber}
        {unit.unitTitle ? (
          <span className="ml-1 font-normal text-slate-500">
            — {unit.unitTitle}
          </span>
        ) : null}
      </TableCell>
      <TableCell className="py-2 text-center text-xs tabular-nums text-slate-700">
        {unit.attemptCount}
      </TableCell>
      <TableCell className="py-2 text-right text-xs tabular-nums text-slate-700">
        {formatScore(unit.firstScore)}
      </TableCell>
      <TableCell className="py-2 text-right text-xs tabular-nums text-slate-700">
        {formatScore(unit.lastScore)}
      </TableCell>
      <TableCell className="py-2 text-right text-xs tabular-nums text-slate-700">
        {formatScore(unit.bestScore)}
      </TableCell>
      <TableCell
        className={`py-2 text-right text-xs font-bold tabular-nums ${deltaScoreClassName(unit.deltaScore)}`}
      >
        {formatDeltaScore(unit.deltaScore)}
      </TableCell>
      <TableCell className="py-2">
        <Badge
          variant="outline"
          className={`rounded-[4px] text-[10px] font-bold ${trendBadgeClass(unit.trendDirection)}`}
          title={
            unit.trendDirection === "INSUFFICIENT_DATA"
              ? "Cần ít nhất 2 lần làm trong kỳ"
              : undefined
          }
        >
          {trendLabel(unit.trendDirection)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
