import React, { useState } from "react";
import { ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requestOpenLoginDialog } from "@/lib/auth-ui-events";
import { PRACTICE_MENU_LABEL_TO_LANE } from "@/components/practice/utils/testUtils";

const PRACTICE_TYPES = Object.keys(PRACTICE_MENU_LABEL_TO_LANE);

interface LessonShortcutButtonsProps {
  readonly testsLocked: boolean;
  readonly onStartPractice: () => void;
  readonly onStartFlashcards: () => void;
  readonly onStartGeneralTest: (
    mode?: "type" | "bank",
    sectionTitle?: string,
  ) => void;
  readonly onStartQuickTest: () => void;
}

export const LessonShortcutButtons: React.FC<LessonShortcutButtonsProps> = ({
  testsLocked,
  onStartPractice,
  onStartFlashcards,
  onStartGeneralTest,
  onStartQuickTest,
}) => {
  const [isTypeExpanded, setIsTypeExpanded] = useState(false);
  return (
    <div className="mt-4 space-y-2">
      <Button
        variant="outline"
        className="w-full h-10 justify-between font-bold"
        onClick={onStartFlashcards}
      >
        Flashcard
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="relative rounded-md">
        {testsLocked ? (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-primary/25 bg-background/85 px-3 py-5 text-center backdrop-blur-[2px] shadow-sm"
            aria-live="polite"
          >
            <Lock className="h-7 w-7 text-primary/70" aria-hidden />
            <p className="text-xs font-semibold text-foreground leading-snug">
              Đăng nhập để làm bài kiểm tra và luyện tập có chấm điểm
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-1"
              onClick={() => requestOpenLoginDialog()}
            >
              Đăng nhập
            </Button>
          </div>
        ) : null}
        <div
          className={cn(
            "space-y-2 rounded-md transition-opacity",
            testsLocked && "pointer-events-none select-none opacity-[0.22]",
          )}
        >
          <Button
            variant="default"
            className="w-full h-10 justify-between font-bold"
            onClick={onStartPractice}
          >
            Kiểm tra
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full h-10 justify-between font-bold"
              onClick={() => setIsTypeExpanded(!isTypeExpanded)}
            >
              Luyện tập
              <ChevronRight
                className={`h-4 w-4 transition-transform ${isTypeExpanded ? "rotate-180" : ""}`}
              />
            </Button>

            {isTypeExpanded && (
              <div className="pl-3 pr-1 space-y-1 animate-fade-in border-l-2 border-muted ml-2 mb-2">
                {PRACTICE_TYPES.map((type) => (
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
            Kiểm tra tổng quát
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
      </div>
    </div>
  );
};

export default LessonShortcutButtons;
