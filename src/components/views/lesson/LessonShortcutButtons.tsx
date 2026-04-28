import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonShortcutButtonsProps {
  readonly onStartPractice: () => void;
  readonly onStartFlashcards: () => void;
  readonly onStartGeneralTest: (
    mode?: "type" | "bank",
    sectionTitle?: string,
  ) => void;
  readonly onStartQuickTest: () => void;
}

export const LessonShortcutButtons: React.FC<LessonShortcutButtonsProps> = ({
  onStartPractice,
  onStartFlashcards,
  onStartGeneralTest,
  onStartQuickTest,
}) => {
  const [isTypeExpanded, setIsTypeExpanded] = useState(false);
  return (
    <div className="mt-4 space-y-2">
      <Button
        variant="default"
        className="w-full h-10 justify-between font-bold"
        onClick={onStartPractice}
      >
        Kiểm tra
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="w-full h-10 justify-between font-bold"
        onClick={onStartFlashcards}
      >
        Ôn tập
        <ChevronRight className="h-4 w-4" />
      </Button>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full h-10 justify-between font-bold"
          onClick={() => setIsTypeExpanded(!isTypeExpanded)}
        >
          Theo dạng
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isTypeExpanded ? "rotate-180" : ""}`}
          />
        </Button>

        {isTypeExpanded && (
          <div className="pl-3 pr-1 space-y-1 animate-fade-in border-l-2 border-muted ml-2 mb-2">
            {[
              "Trắc nghiệm từ vựng",
              "Ghép từ - nghĩa",
              "Mẫu câu & tình huống",
              "Điền từ & sắp xếp câu",
            ].map((type) => (
              <Button
                key={type}
                variant="ghost"
                className="w-full justify-start h-8 font-medium text-[11px] text-muted-foreground hover:text-primary px-2"
                onClick={() => onStartGeneralTest("type", type)}
              >
                • {type}
              </Button>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full h-10 justify-between font-bold"
        onClick={() => onStartGeneralTest("bank")}
      >
        Trộn ngân hàng
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="w-full h-10 justify-between font-bold"
        onClick={onStartQuickTest}
      >
        Kiểm tra nhanh
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LessonShortcutButtons;
