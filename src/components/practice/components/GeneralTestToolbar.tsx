import React from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PracticeHeader } from "../layout/PracticeHeader";

interface GeneralTestToolbarProps {
  onBack: () => void;
  sectionsCount: number;
  currentSectionIndex: number;
  testMode: "type" | "bank";
  bankLimit: number;
  onSetBankLimit: (limit: number) => void;
  onShuffle: () => void;
}

export const GeneralTestToolbar: React.FC<GeneralTestToolbarProps> = ({
  onBack,
  sectionsCount,
  currentSectionIndex,
  testMode,
  bankLimit,
  onSetBankLimit,
  onShuffle,
}) => {
  return (
    <>
      <PracticeHeader onBack={onBack}>
        {Array.from({ length: sectionsCount }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-12 rounded-full transition-all ${i === currentSectionIndex ? "bg-primary w-20" : i < currentSectionIndex ? "bg-green-500" : "bg-muted"}`}
          />
        ))}
      </PracticeHeader>

      <div className="flex flex-wrap items-center gap-4 px-4">
        {testMode === "bank" && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex bg-muted/30 p-1 rounded-lg">
              <Button
                variant={bankLimit === 40 ? "secondary" : "ghost"}
                size="sm"
                className={`text-xs font-bold px-3 h-8 rounded-md ${bankLimit === 40 ? "shadow-sm" : ""}`}
                onClick={() => onSetBankLimit(40)}
              >
                40 Câu
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 font-bold text-primary border-primary/20 hover:bg-primary/10 gap-2"
              onClick={onShuffle}
            >
              <Shuffle className="h-3 w-3" />
              Trộn câu hỏi
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
