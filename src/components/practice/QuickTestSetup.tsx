import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, Play, CheckSquare, Square } from "lucide-react";
import type { Unit } from "@/types";

interface QuickTestSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessons: Unit[];
  onStart: (selectedUnitIds: number[]) => void;
}

export const QuickTestSetup: React.FC<QuickTestSetupProps> = ({
  open,
  onOpenChange,
  lessons,
  onStart,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg gap-0 overflow-hidden rounded-xl border-none p-0 ring-0 police-shadow sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="primary-gradient gap-2 rounded-none border-0 px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2 text-left">
              <DialogTitle className="text-2xl font-heading font-black text-white">
                Kiểm tra nhanh
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-white/80">
                Chọn các chương bạn muốn ôn tập. Hệ thống sẽ lấy ngẫu nhiên 10 câu
                hỏi từ các chương này.
              </DialogDescription>
            </div>
            <Zap className="h-12 w-12 shrink-0 text-white/20" aria-hidden />
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Danh sách chương ({selectedIds.length}/{lessons.length})
            </span>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-bold"
                onClick={selectAll}
              >
                <CheckSquare className="mr-1 h-3 w-3" /> TẤT CẢ
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-bold"
                onClick={deselectAll}
              >
                <Square className="mr-1 h-3 w-3" /> BỎ CHỌN
              </Button>
            </div>
          </div>

          <div className="custom-scrollbar mb-8 grid max-h-[300px] grid-cols-1 gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
            {lessons.map((unit) => (
              <div
                key={unit.id}
                className={`flex cursor-pointer items-center space-x-3 rounded-xl border-2 p-3 transition-all ${
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
                  className="h-5 w-5 rounded-md border-2"
                />
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-black uppercase leading-none text-primary/60">
                    Chương {unit.id}
                  </p>
                  <p className="truncate text-sm font-bold leading-tight text-slate-700">
                    {unit.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl font-bold"
              onClick={() => onOpenChange(false)}
            >
              HỦY BỎ
            </Button>
            <Button
              className="primary-gradient police-shadow h-12 flex-2 rounded-xl border-none font-black"
              disabled={selectedIds.length === 0}
              onClick={() => onStart(selectedIds)}
            >
              BẮT ĐẦU TEST <Play className="ml-2 h-4 w-4 fill-current" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
