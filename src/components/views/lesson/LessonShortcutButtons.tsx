import React, { useMemo, useState } from "react";
import { ChevronRight, Lock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requestOpenLoginDialog } from "@/lib/auth-ui-events";
import {
  PRACTICE_MENU_LABEL_TO_LANE,
  PRACTICE_TYPE_LABELS,
  getPhraseSubNavItems,
  practiceTypesForSubLesson,
  type VocabDrillMode,
} from "@/components/practice/utils/testUtils";
import type { LessonTestLane, Question, Unit } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const VOCAB_TOOL_ITEMS: {
  id: VocabDrillMode;
  label: string;
  lane: LessonTestLane;
}[] = [
  { id: "en-vi", label: "Anh → Việt", lane: "VOCAB_MCQ" },
  { id: "vi-en", label: "Việt → Anh", lane: "VOCAB_MCQ" },
  { id: "matching", label: "Ghép cặp", lane: "MATCHING" },
];

interface LessonShortcutButtonsProps {
  readonly unit: Unit;
  readonly practiceQuestions: Question[];
  readonly testsLocked: boolean;
  readonly availableLanes: Set<LessonTestLane>;
  readonly onStartFlashcards: () => void;
  readonly onStartGeneralTest: (
    mode?: "type" | "bank",
    sectionTitle?: string,
    subLessonId?: string,
  ) => void;
  readonly onStartVocabDrill: (drill: VocabDrillMode) => void;
}

export const LessonShortcutButtons: React.FC<LessonShortcutButtonsProps> = ({
  unit,
  practiceQuestions,
  testsLocked,
  availableLanes,
  onStartFlashcards,
  onStartGeneralTest,
  onStartVocabDrill,
}) => {
  const [isTypeExpanded, setIsTypeExpanded] = useState(false);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const subNavItems = useMemo(() => getPhraseSubNavItems(unit), [unit]);

  const toggleSubLesson = (subId: string) => {
    setExpandedSubId((prev) => (prev === subId ? null : subId));
  };

  const renderPracticeTypeButton = (
    typeLabel: string,
    subLessonId?: string,
  ) => {
    const lane = PRACTICE_MENU_LABEL_TO_LANE[typeLabel];
    const isAvailable = subLessonId
      ? practiceTypesForSubLesson(practiceQuestions, subLessonId).some(
          (t) => t.label === typeLabel,
        )
      : availableLanes.has(lane);

    return (
      <Tooltip key={`${subLessonId ?? "all"}-${typeLabel}`} delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              variant="ghost"
              disabled={!isAvailable}
              className={cn(
                "h-8 w-full justify-between px-2 text-[11px] font-medium transition-all",
                isAvailable
                  ? "text-muted-foreground hover:text-primary"
                  : "cursor-not-allowed text-muted-foreground/30 line-through",
              )}
              onClick={() =>
                isAvailable &&
                onStartGeneralTest("type", typeLabel, subLessonId)
              }
            >
              <span className="truncate">• {typeLabel}</span>
              {!isAvailable && (
                <HelpCircle className="h-3 w-3 shrink-0 opacity-40" />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        {!isAvailable && (
          <TooltipContent side="right" className="max-w-[200px]">
            <p className="text-[10px] font-medium">
              {subLessonId
                ? `Phần ${subLessonId} chưa có bài tập dạng này.`
                : "Phần luyện tập này hiện chưa có nội dung cho chương này."}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className="mt-4 space-y-2">
        <Button
          variant="outline"
          className="h-10 w-full justify-between font-bold"
          onClick={onStartFlashcards}
        >
          Flashcard
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="h-10 w-full justify-between font-bold"
            onClick={() => setIsToolsExpanded(!isToolsExpanded)}
          >
            Công cụ
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isToolsExpanded && "rotate-180",
              )}
            />
          </Button>

          {isToolsExpanded ? (
            <div className="mb-2 ml-2 animate-in space-y-1 border-l-2 border-muted pl-3 pr-1 fade-in">
              {VOCAB_TOOL_ITEMS.map(({ id, label, lane }) => {
                const isAvailable = availableLanes.has(lane);
                return (
                  <Tooltip key={id} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Button
                          variant="ghost"
                          disabled={!isAvailable}
                          className={cn(
                            "h-8 w-full justify-between px-2 text-[11px] font-medium transition-all",
                            isAvailable
                              ? "text-muted-foreground hover:text-primary"
                              : "cursor-not-allowed text-muted-foreground/30 line-through",
                          )}
                          onClick={() => isAvailable && onStartVocabDrill(id)}
                        >
                          <span className="truncate">• {label}</span>
                          {!isAvailable && (
                            <HelpCircle className="h-3 w-3 shrink-0 opacity-40" />
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!isAvailable && (
                      <TooltipContent side="right" className="max-w-[200px]">
                        <p className="text-[10px] font-medium">
                          Phần luyện tập này hiện chưa có nội dung cho chương
                          này.
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="relative rounded-md">
          {testsLocked ? (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-primary/25 bg-background/85 px-3 py-5 text-center backdrop-blur-[2px] shadow-sm"
              aria-live="polite"
            >
              <Lock className="h-7 w-7 text-primary/70" aria-hidden />
              <p className="text-xs font-semibold leading-snug text-foreground">
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
            <div className="space-y-2">
              <Button
                variant="outline"
                className="h-10 w-full justify-between font-bold"
                onClick={() => {
                  setIsTypeExpanded(!isTypeExpanded);
                  if (isTypeExpanded) setExpandedSubId(null);
                }}
              >
                Luyện tập
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isTypeExpanded && "rotate-180",
                  )}
                />
              </Button>

              {isTypeExpanded ? (
                <div className="mb-2 ml-2 animate-in space-y-1 border-l-2 border-muted pl-3 pr-1 fade-in">
                  {subNavItems.length > 0 ? (
                    subNavItems.map((item) => {
                      const types = practiceTypesForSubLesson(
                        practiceQuestions,
                        item.id,
                      );
                      const isSubOpen = expandedSubId === item.id;

                      return (
                        <div key={item.id} className="space-y-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-full justify-between px-2 text-left text-[11px] font-semibold text-primary hover:text-primary"
                            onClick={() => toggleSubLesson(item.id)}
                          >
                            <span className="min-w-0 truncate">
                              • {item.id}
                              <span className="ml-1 font-normal text-muted-foreground">
                                {item.title}
                              </span>
                            </span>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-transform",
                                isSubOpen && "rotate-90",
                              )}
                            />
                          </Button>

                          {isSubOpen ? (
                            <div className="ml-2 space-y-0.5 border-l-2 border-muted/80 pl-2">
                              {types.length > 0 ? (
                                types.map((t) =>
                                  renderPracticeTypeButton(t.label, item.id),
                                )
                              ) : (
                                <p className="px-2 py-1.5 text-[10px] italic text-muted-foreground">
                                  Chưa có bài tập cho phần {item.id}
                                </p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-0.5">
                      {PRACTICE_TYPE_LABELS.map((type) =>
                        renderPracticeTypeButton(type),
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <Button
              variant="outline"
              className="h-10 w-full justify-between font-bold"
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
