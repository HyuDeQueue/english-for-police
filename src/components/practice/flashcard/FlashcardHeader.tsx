import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FlashcardHeaderProps {
  onBack: () => void;
  deckMode: "vocabulary" | "sentencePatterns";
  onModeChange: (mode: "vocabulary" | "sentencePatterns") => void;
}

export const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({
  onBack,
  deckMode,
  onModeChange,
}) => {
  return (
    <div className="w-full max-w-3xl flex items-center justify-between mb-6">
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-primary"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại bài học
      </Button>
      <div className="flex bg-muted p-1 rounded-lg">
        <Button
          variant={deckMode === "vocabulary" ? "secondary" : "ghost"}
          size="sm"
          className={`text-xs font-bold ${deckMode === "vocabulary" ? "bg-white shadow-sm" : ""}`}
          onClick={() => onModeChange("vocabulary")}
        >
          Từ vựng
        </Button>
        <Button
          variant={deckMode === "sentencePatterns" ? "secondary" : "ghost"}
          size="sm"
          className={`text-xs font-bold ${deckMode === "sentencePatterns" ? "bg-white shadow-sm" : ""}`}
          onClick={() => onModeChange("sentencePatterns")}
        >
          Mẫu câu
        </Button>
      </div>
    </div>
  );
};
