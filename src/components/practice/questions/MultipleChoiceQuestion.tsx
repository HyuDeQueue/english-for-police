import React from "react";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types";

interface MultipleChoiceQuestionProps {
  question: Question;
  selectedAnswer: string | undefined;
  onSelect: (answer: string) => void;
  showResults?: boolean;
  disabled?: boolean;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  selectedAnswer,
  onSelect,
  showResults = false,
  disabled = false,
}) => {
  const isCorrect = (opt: string) => opt === question.answer;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options?.map((opt, i) => {
          const isSelected = selectedAnswer === opt;
          let stateClasses = isSelected
            ? "ring-2 ring-primary ring-offset-2 police-shadow bg-primary text-white"
            : "hover:bg-primary/5 hover:border-primary/20";

          if (showResults) {
            const correct = isCorrect(opt);
            if (correct) {
              stateClasses =
                "bg-green-600 text-white ring-green-600 ring-2 ring-offset-2";
            } else if (isSelected && !correct) {
              stateClasses =
                "bg-red-600 text-white ring-red-600 ring-2 ring-offset-2";
            } else {
              stateClasses = "opacity-50";
            }
          }

          return (
            <Button
              key={i}
              variant={isSelected ? "default" : "outline"}
              disabled={disabled || showResults}
              className={`h-auto min-h-14 py-3 px-4 justify-start text-left text-sm font-bold transition-all border-2 whitespace-normal leading-normal ${stateClasses}`}
              onClick={() => onSelect(opt)}
            >
              <span
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 text-[11px] ${
                  isSelected
                    ? "bg-white text-primary border-white"
                    : "text-muted-foreground border-muted"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </Button>
          );
        })}
      </div>
      {showResults && (
        <div className="p-4 rounded-xl bg-green-100 border border-green-200 mt-2">
          <p className="text-xs font-bold text-green-700 uppercase mb-1">
            Đáp án đúng:
          </p>
          <p className="text-sm font-bold text-green-800">
            {question.answer as string}
          </p>
        </div>
      )}
    </div>
  );
};
