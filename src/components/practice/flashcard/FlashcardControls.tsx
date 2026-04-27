import React from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Undo2 } from "lucide-react";
import type { FlashcardStatus } from "@/types";

interface FlashcardControlsProps {
  onMark: (status: FlashcardStatus) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const FlashcardControls: React.FC<FlashcardControlsProps> = ({
  onMark,
  onUndo,
  canUndo,
}) => {
  return (
    <div className="w-full max-w-3xl mt-6 flex items-center justify-center gap-12 relative">
      <div className="flex items-center gap-6">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border-2 border-orange-500/20 text-orange-500 hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onMark("review");
          }}
        >
          <X className="h-7 w-7" />
        </Button>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/20 text-emerald-500 hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onMark("known");
          }}
        >
          <Check className="h-7 w-7" />
        </Button>
      </div>

      <div className="absolute right-2 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary h-9 w-9"
          onClick={(e) => {
            e.stopPropagation();
            onUndo();
          }}
          disabled={!canUndo}
        >
          <Undo2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
