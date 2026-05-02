import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { Question } from "@/types";

interface MatchingQuestionProps {
  question: Question;
  matchingAnswers: Record<string, string>;
  selectedLeft: string | null;
  onSelectLeft: (left: string) => void;
  onMatch: (left: string, right: string) => void;
  shuffledRightOptions: { left: string; right: string }[];
  showResults?: boolean;
  disabled?: boolean;
}

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  question,
  matchingAnswers,
  selectedLeft,
  onSelectLeft,
  onMatch,
  shuffledRightOptions,
  showResults = false,
  disabled = false,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Left Column */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">
            Tiếng Anh
          </p>
          {question.pairs?.map((pair) => {
            const isMatched = !!matchingAnswers[pair.left];
            const isSelected = selectedLeft === pair.left;
            return (
              <Button
                key={pair.left}
                variant={
                  isSelected ? "default" : isMatched ? "secondary" : "outline"
                }
                disabled={disabled || isMatched || showResults}
                onClick={() => onSelectLeft(pair.left)}
                className="w-full justify-start text-xs h-auto min-h-10 py-2 relative overflow-hidden font-bold whitespace-normal text-left leading-tight"
              >
                {pair.left}
                {isMatched && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">
            Nghĩa Tiếng Việt
          </p>
          {shuffledRightOptions.map((pair) => {
            const isMatched = Object.values(matchingAnswers).includes(
              pair.right,
            );
            return (
              <Button
                key={pair.right}
                variant={isMatched ? "secondary" : "outline"}
                disabled={disabled || isMatched || !selectedLeft || showResults}
                onClick={() => {
                  if (selectedLeft) {
                    onMatch(selectedLeft, pair.right);
                  }
                }}
                className="w-full justify-start text-xs h-auto min-h-10 py-2 font-medium whitespace-normal text-left leading-tight"
              >
                {pair.right}
              </Button>
            );
          })}
        </div>
      </div>

      {!showResults && (
        <p className="text-[11px] text-muted-foreground italic text-center bg-muted/30 py-1.5 rounded-lg">
          * Chọn một từ bên trái sau đó chọn nghĩa phù hợp bên phải
        </p>
      )}

      {showResults && (
        <div className="mt-4 p-4 rounded-xl bg-muted/50 space-y-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">
            Kết quả ghép đôi:
          </p>
          {question.pairs?.map((p) => {
            const userRight = matchingAnswers[p.left];
            const isCorrect = userRight === p.right;
            return (
              <div key={p.left} className="flex items-center gap-2 text-xs">
                <span className="font-bold">{p.left}</span>
                <span className="text-muted-foreground">→</span>
                <span
                  className={
                    isCorrect
                      ? "text-green-600 font-bold"
                      : "text-red-600 line-through"
                  }
                >
                  {userRight || "Chưa ghép"}
                </span>
                {!isCorrect && (
                  <span className="text-green-600 font-bold ml-2">
                    ({p.right})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
