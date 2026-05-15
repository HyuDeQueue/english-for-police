import React, { useState } from "react";
import { ChevronRight, Lock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requestOpenLoginDialog } from "@/lib/auth-ui-events";
import { PRACTICE_MENU_LABEL_TO_LANE } from "@/components/practice/utils/testUtils";
import type { LessonTestLane } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PRACTICE_TYPES = Object.keys(PRACTICE_MENU_LABEL_TO_LANE);

interface LessonShortcutButtonsProps {
  readonly testsLocked: boolean;
  readonly availableLanes: Set<LessonTestLane>;
  readonly onStartPractice: () => void;
  readonly onStartFlashcards: () => void;
  readonly onStartGeneralTest: (
    mode?: "type" | "bank",
    sectionTitle?: string,
  ) => void;
}

export const LessonShortcutButtons: React.FC<LessonShortcutButtonsProps> = ({
  testsLocked,
  availableLanes,
  onStartPractice,
  onStartFlashcards,
  onStartGeneralTest,
}) => {
  const [isTypeExpanded, setIsTypeExpanded] = useState(false);

  return (
    <TooltipProvider>
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
                  {PRACTICE_TYPES.map((type) => {
                    const lane = PRACTICE_MENU_LABEL_TO_LANE[type];
                    const isAvailable = availableLanes.has(lane);

                    return (
                      <Tooltip key={type} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <Button
                              variant="ghost"
                              disabled={!isAvailable}
                              className={cn(
                                "w-full justify-between h-8 font-medium text-[11px] px-2 transition-all",
                                isAvailable
                                  ? "text-muted-foreground hover:text-primary"
                                  : "text-muted-foreground/30 line-through cursor-not-allowed",
                              )}
                              onClick={() =>
                                isAvailable && onStartGeneralTest("type", type)
                              }
                            >
                              <span className="truncate">• {type}</span>
                              {!isAvailable && (
                                <HelpCircle className="h-3 w-3 opacity-40 shrink-0" />
                              )}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!isAvailable && (
                          <TooltipContent side="right" className="max-w-200px">
                            <p className="text-[10px] font-medium">
                              Phần luyện tập này hiện chưa có nội dung cho
                              chương này.
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
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
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LessonShortcutButtons;
