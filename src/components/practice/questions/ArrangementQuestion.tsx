import React from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import type { Question } from "@/types";

interface ArrangementQuestionProps {
  question: Question;
  selectedWords: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (index: number) => void;
  onReset: () => void;
  showResults?: boolean;
  disabled?: boolean;
}

export const ArrangementQuestion: React.FC<ArrangementQuestionProps> = ({
  question,
  selectedWords,
  onAddWord,
  onRemoveWord,
  onReset,
  showResults = false,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl border-2 border-dashed bg-muted/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
          Khu vực sắp xếp
        </p>
        <div className="min-h-14 p-2.5 rounded-xl bg-white border flex flex-wrap gap-2">
          {selectedWords.length > 0 ? (
            selectedWords.map((word, idx) => (
              <Button
                key={`${word}-${idx}`}
                type="button"
                variant="secondary"
                disabled={disabled || showResults}
                className="h-9 px-3 text-xs font-bold animate-in zoom-in-50 duration-200"
                onClick={() => onRemoveWord(idx)}
              >
                {word}
              </Button>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic self-center mx-auto">
              Chạm vào các từ bên dưới để xây dựng câu hoàn chỉnh
            </span>
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-secondary/5 border-2 border-secondary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">
          Các từ cho sẵn
        </p>
        <div className="flex flex-wrap gap-2">
          {question.options?.map((word, idx) => {
            const usedCount = selectedWords.filter((w) => w === word).length;
            const availableCount = (question.options || [])
              .slice(0, idx + 1)
              .filter((w) => w === word).length;
            const isWordDisabled =
              disabled || showResults || usedCount >= availableCount;

            return (
              <Button
                key={`${word}-${idx}`}
                type="button"
                variant="outline"
                disabled={isWordDisabled}
                className={`h-9 px-3 text-xs font-bold border-2 transition-all ${
                  isWordDisabled
                    ? "opacity-30 scale-90"
                    : "hover:border-primary hover:text-primary"
                }`}
                onClick={() => onAddWord(word)}
              >
                {word}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || showResults || selectedWords.length === 0}
          className="text-muted-foreground hover:text-red-500 font-bold"
          onClick={onReset}
        >
          <XCircle className="mr-2 h-4 w-4" /> Xóa toàn bộ sắp xếp
        </Button>
      </div>

      {showResults && (
        <div className="p-4 rounded-xl bg-green-100 border border-green-200">
          <p className="text-xs font-bold text-green-700 uppercase mb-1">
            Đáp án đúng:
          </p>
          <p className="text-sm font-bold text-green-800">{question.answer}</p>
        </div>
      )}
    </div>
  );
};
