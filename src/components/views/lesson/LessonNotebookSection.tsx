import React from "react";
import { BookMarked } from "lucide-react";
import type { FlaggedItem } from "@/types";

interface LessonNotebookSectionProps {
  readonly unitId: number;
  readonly flaggedItems: FlaggedItem[];
}

export const LessonNotebookSection: React.FC<LessonNotebookSectionProps> = ({
  unitId,
  flaggedItems,
}) => {
  const unitFlaggedItems = flaggedItems.filter((f) => f.unitId === unitId);

  return (
    <div className="bg-card rounded-xl border police-shadow overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <h4 className="font-heading font-bold flex items-center gap-2 text-sm">
          <BookMarked className="h-4 w-4 text-secondary" />
          SỔ TAY BÀI HỌC
        </h4>
      </div>
      <div className="p-4">
        {unitFlaggedItems.length > 0 ? (
          <div className="space-y-3 max-h-240px overflow-y-auto pr-2 custom-scrollbar">
            {unitFlaggedItems.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-2 group cursor-default py-1 border-b border-dashed last:border-0 pb-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    {f.type === "vocabulary"
                      ? "Từ vựng"
                      : f.type === "phrase"
                        ? "Mẫu câu"
                        : "Công thức"}
                  </p>
                  <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                    {f.key}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Chưa có mục nào được lưu vào sổ tay.
          </p>
        )}
      </div>
    </div>
  );
};

export default LessonNotebookSection;
