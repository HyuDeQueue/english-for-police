import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Question } from "@/types";
import type { Section, SectionResult } from "../utils/testUtils";

interface SectionAccordionItemProps {
  idx: number;
  section: Section;
  isActive: boolean;
  isExpanded: boolean;
  progress: { answered: number; total: number; isComplete: boolean };
  result?: SectionResult;
  allQuestions: Question[];
  currentIndexInSection: number;
  currentPageIndex: number;
  questionsPerPage: number;
  isQuestionAnswered: (q: Question) => boolean;
  onToggle: (idx: number) => void;
  onSelectSection: (idx: number, page?: number, qIdx?: number) => void;
  onSelectQuestion: (qIdx: number) => void;
  onPageChange: (dir: "prev" | "next") => void;
  onSubmit: () => void;
}

export const SectionAccordionItem: React.FC<SectionAccordionItemProps> = ({
  idx,
  section,
  isActive,
  isExpanded,
  progress,
  result,
  allQuestions,
  currentIndexInSection,
  currentPageIndex,
  questionsPerPage,
  isQuestionAnswered,
  onToggle,
  onSelectSection,
  onSelectQuestion,
  onPageChange,
  onSubmit,
}) => {
  const sectionQuestions = React.useMemo(() => {
    return allQuestions.filter((q) => section.questionIds.includes(q.id));
  }, [allQuestions, section.questionIds]);

  const pagedQuestions = React.useMemo(() => {
    const page = isActive ? currentPageIndex : 0;
    const start = page * questionsPerPage;
    return sectionQuestions.slice(start, start + questionsPerPage);
  }, [isActive, currentPageIndex, sectionQuestions, questionsPerPage]);

  const activePage = isActive ? currentPageIndex : 0;
  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={isActive ? "default" : "outline"}
        className={`w-full h-12 justify-between text-xs font-bold transition-all rounded-xl ${
          isActive ? "text-white shadow-md" : "text-slate-800"
        }`}
        onClick={() => {
          onToggle(idx);
          if (!isActive) onSelectSection(idx);
        }}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="shrink-0">{idx + 1}.</span>
          <span className="truncate">{section.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={result?.submitted ? "secondary" : "outline"}
            className={`shrink-0 border text-[10px] ${
              isActive
                ? "border-white/30 bg-white/15 text-white"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {result?.submitted
              ? `${result.score}%`
              : `${progress?.answered ?? 0}/${progress?.total ?? 0}`}
          </Badge>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </Button>

      {isExpanded && (
        <div className="pl-1 pr-1 py-1 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-muted/30 rounded-xl p-3 border border-muted-foreground/10">
            <p className="text-[10px] text-muted-foreground italic mb-3 line-clamp-2">
              {section.description}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {pagedQuestions.map((q, qIdx) => {
                const globalIdx = activePage * questionsPerPage + qIdx;
                const answered = isQuestionAnswered(q);
                const isCurrent =
                  isActive && globalIdx === currentIndexInSection;
                return (
                  <button
                    key={q.id}
                    className={`h-10 w-10 rounded-lg font-bold text-[11px] border-2 transition-all ${
                      answered
                        ? "bg-primary text-white border-primary"
                        : isCurrent
                          ? "border-secondary bg-secondary/10 text-primary scale-110 shadow-sm"
                          : "border-muted text-muted-foreground hover:border-primary/30"
                    }`}
                    onClick={() => {
                      if (!isActive) {
                        onSelectSection(idx, activePage, qIdx);
                      } else {
                        onSelectQuestion(qIdx);
                      }
                    }}
                  >
                    {globalIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {sectionQuestions.length > questionsPerPage && (
            <div className="flex items-center justify-between gap-1 rounded-lg border bg-muted/20 px-2 py-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 text-[10px] font-bold"
                disabled={activePage === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isActive) {
                    onSelectSection(idx, Math.max(0, activePage - 1), 0);
                  } else {
                    onPageChange("prev");
                  }
                }}
              >
                <ChevronLeft className="mr-1 h-3 w-3" />
                Trước
              </Button>
              <span className="text-[9px] font-black text-muted-foreground">
                {activePage + 1}/
                {Math.ceil(sectionQuestions.length / questionsPerPage)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 text-[10px] font-bold"
                disabled={
                  (activePage + 1) * questionsPerPage >= sectionQuestions.length
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isActive) {
                    onSelectSection(idx, activePage + 1, 0);
                  } else {
                    onPageChange("next");
                  }
                }}
              >
                Sau
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
          <Button
            size="sm"
            className={`w-full h-10 text-[11px] font-black rounded-xl transition-all ${isActive ? "primary-gradient police-shadow" : "bg-muted text-muted-foreground opacity-60"}`}
            disabled={!isActive}
            onClick={(e) => {
              e.stopPropagation();
              onSubmit();
            }}
          >
            {result?.submitted ? "NỘP LẠI PHẦN NÀY" : "NỘP PHẦN NÀY"}
          </Button>
        </div>
      )}
    </div>
  );
};
