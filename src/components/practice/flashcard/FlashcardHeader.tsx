import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, MessageSquare } from "lucide-react";

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
    <div className="w-full flex items-center justify-between mb-6">
      <Button
        variant="ghost"
        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span className="font-semibold">Quay lại bài học</span>
      </Button>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
        <Button
          variant="ghost"
          className={`h-9 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${
            deckMode === "vocabulary"
              ? "primary-gradient text-white shadow-md scale-100"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95"
          }`}
          onClick={() => onModeChange("vocabulary")}
        >
          <Book
            className={`mr-2 h-4 w-4 ${deckMode === "vocabulary" ? "text-white" : "text-slate-400"}`}
          />
          Từ vựng
        </Button>
        <Button
          variant="ghost"
          className={`h-9 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${
            deckMode === "sentencePatterns"
              ? "primary-gradient text-white shadow-md scale-100"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95"
          }`}
          onClick={() => onModeChange("sentencePatterns")}
        >
          <MessageSquare
            className={`mr-2 h-4 w-4 ${deckMode === "sentencePatterns" ? "text-white" : "text-slate-400"}`}
          />
          Mẫu câu
        </Button>
      </div>
    </div>
  );
};
