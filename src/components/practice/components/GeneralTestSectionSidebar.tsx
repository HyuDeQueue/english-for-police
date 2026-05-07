import React from "react";
import type { Question } from "@/types";
import type { Section, SectionResult } from "../utils/testUtils";
import { PracticeSidebar } from "../layout/PracticeSidebar";
import { SectionAccordionItem } from "./SectionAccordionItem";

interface SectionProgress {
  answered: number;
  total: number;
  isComplete: boolean;
}

export interface GeneralTestSectionSidebarViewModel {
  sections: Section[];
  currentSectionIndex: number;
  expandedSectionIndex: number | null;
  sectionProgress: SectionProgress[];
  sectionResults: Record<number, SectionResult>;
  questions: Question[];
  currentIndexInSection: number;
  currentPageIndex: number;
  questionsPerPage: number;
  isQuestionAnswered: (q: Question) => boolean;
  isSubmitting: boolean;
  isReviewMode: boolean;
}

export interface GeneralTestSectionSidebarActions {
  onToggleSection: (index: number) => void;
  onSelectSection: (
    index: number,
    page?: number,
    questionIndex?: number,
  ) => void;
  onSelectQuestion: (indexInSection: number) => void;
  onPageChange: (direction: "prev" | "next") => void;
  onSubmitSection: () => void;
  onExitReview: () => void;
}

interface GeneralTestSectionSidebarProps {
  vm: GeneralTestSectionSidebarViewModel;
  actions: GeneralTestSectionSidebarActions;
}

export const GeneralTestSectionSidebar: React.FC<
  GeneralTestSectionSidebarProps
> = ({ vm, actions }) => {
  const {
    sections,
    currentSectionIndex,
    expandedSectionIndex,
    sectionProgress,
    sectionResults,
    questions,
    currentIndexInSection,
    currentPageIndex,
    questionsPerPage,
    isQuestionAnswered,
    isSubmitting,
    isReviewMode,
  } = vm;

  const {
    onToggleSection,
    onSelectSection,
    onSelectQuestion,
    onPageChange,
    onSubmitSection,
    onExitReview,
  } = actions;

  return (
    <PracticeSidebar
      title="DANH SÁCH CÂU HỎI"
      description="Chọn từng phần để bắt đầu làm bài. Bạn có thể nộp bài riêng cho từng phần."
    >
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <SectionAccordionItem
            key={section.title}
            idx={idx}
            section={section}
            isActive={idx === currentSectionIndex}
            isExpanded={expandedSectionIndex === idx}
            progress={sectionProgress[idx]}
            result={sectionResults[idx]}
            allQuestions={questions}
            currentIndexInSection={currentIndexInSection}
            currentPageIndex={currentPageIndex}
            questionsPerPage={questionsPerPage}
            isQuestionAnswered={isQuestionAnswered}
            onToggle={onToggleSection}
            onSelectSection={onSelectSection}
            onSelectQuestion={onSelectQuestion}
            onPageChange={onPageChange}
            onSubmit={onSubmitSection}
            isSubmitting={isSubmitting}
            isReviewMode={isReviewMode}
            onExitReview={onExitReview}
          />
        ))}
      </div>
    </PracticeSidebar>
  );
};
