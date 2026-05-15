import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Play, CheckSquare, Square } from "lucide-react";
import type { Unit } from "@/types";
import { Badge } from "@/components/ui/badge";

interface QuickTestSetupProps {
  lessons: Unit[];
  onStart: (selectedUnitIds: number[]) => void;
  onCancel: () => void;
}

export const QuickTestSetup: React.FC<QuickTestSetupProps> = ({
  lessons,
  onStart,
  onCancel,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    lessons.map((u) => u.id),
  );

  const toggleUnit = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => setSelectedIds(lessons.map((u) => u.id));
  const deselectAll = () => setSelectedIds([]);

  return (
    <Card className="police-shadow border-none overflow-hidden animate-in fade-in zoom-in duration-300">
      <CardHeader className="primary-gradient text-white pb-6">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="bg-white/20 text-white border-none mb-2 font-bold">
              <Zap className="h-3 w-3 mr-1 fill-current" /> CẤU HÌNH TEST
            </Badge>
            <CardTitle className="text-2xl font-heading font-black">
              Kiểm tra nhanh
            </CardTitle>
          </div>
          <Zap className="h-12 w-12 text-white/20" />
        </div>
        <p className="text-white/80 text-sm mt-2">
          Chọn các chương bạn muốn ôn tập. Hệ thống sẽ lấy ngẫu nhiên 10 câu hỏi
          từ các chương này.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Danh sách chương ({selectedIds.length}/{lessons.length})
          </span>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] font-bold"
              onClick={selectAll}
            >
              <CheckSquare className="h-3 w-3 mr-1" /> TẤT CẢ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] font-bold"
              onClick={deselectAll}
            >
              <Square className="h-3 w-3 mr-1" /> BỎ CHỌN
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {lessons.map((unit) => (
            <div
              key={unit.id}
              className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedIds.includes(unit.id)
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-slate-100 hover:border-slate-200"
              }`}
              onClick={() => toggleUnit(unit.id)}
            >
              <Checkbox
                id={`unit-${unit.id}`}
                checked={selectedIds.includes(unit.id)}
                onCheckedChange={() => toggleUnit(unit.id)}
                className="rounded-md h-5 w-5 border-2"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-black text-primary/60 uppercase leading-none mb-1">
                  Chương {unit.id}
                </p>
                <p className="font-bold text-sm text-slate-700 truncate leading-tight">
                  {unit.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 font-bold rounded-xl"
            onClick={onCancel}
          >
            HỦY BỎ
          </Button>
          <Button
            className="flex-2 h-12 font-black rounded-xl primary-gradient border-none police-shadow"
            disabled={selectedIds.length === 0}
            onClick={() => onStart(selectedIds)}
          >
            BẮT ĐẦU TEST <Play className="ml-2 h-4 w-4 fill-current" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
