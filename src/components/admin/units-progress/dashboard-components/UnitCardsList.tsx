import { CheckCircle2, Eye, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { UnitGroupedData } from "@/components/admin/units-progress/types";

interface UnitCardsListProps {
  unitsGrouped: UnitGroupedData[];
  onOpenUnit: (unit: UnitGroupedData) => void;
}

export function UnitCardsList({
  unitsGrouped,
  onOpenUnit,
}: UnitCardsListProps) {
  return (
    <div className="space-y-4">
      {unitsGrouped.map((unit) => (
        <Card
          key={unit.unitNumber}
          className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md"
        >
          <CardHeader className="border-b border-slate-100 px-5 py-4 flex flex-row items-start justify-between gap-3 bg-slate-50/80">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="shrink-0 h-8 w-8 bg-slate-800 border border-slate-700 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {unit.unitNumber}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    {unit.title}
                  </CardTitle>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <Badge className="bg-slate-800 text-white font-medium">
                  <Users className="h-3 w-3 mr-1" />
                  {unit.students.length} học viên
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {unit.completedCount} hoàn thành
                </Badge>
                <Badge className="bg-slate-100 text-slate-700 font-medium">
                  Tiến độ TB: {Math.round(unit.avgProgress)}%
                </Badge>
                <Badge className="bg-slate-100 text-slate-700 font-medium">
                  Điểm TB: {Math.round(unit.avgScore)}%
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0"
              onClick={() => onOpenUnit(unit)}
              title={`Xem chi tiết chương ${unit.unitNumber}`}
              aria-label={`Xem chi tiết chương ${unit.unitNumber}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
