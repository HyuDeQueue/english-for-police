import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Unit, Question } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PracticeResults } from "./results/PracticeResults";
import { useProgress } from "@/hooks/use-progress";
import { GeneralTestToolbar } from "./components/GeneralTestToolbar";
import {
  GeneralTestSectionSidebar,
  type GeneralTestSectionSidebarActions,
  type GeneralTestSectionSidebarViewModel,
} from "./components/GeneralTestSectionSidebar";
import {
  GeneralTestQuestionPanel,
  type GeneralTestQuestionPanelActions,
  type GeneralTestQuestionPanelViewModel,
} from "./components/GeneralTestQuestionPanel";

import {
  type Section,
  type TestMode,
  QUESTIONS_PER_PAGE,
  generateGeneralQuestions,
  buildSections,
  extractQuestion,
  serializeAnswerForApi,
} from "./utils/testUtils";
import { useGeneralTestState } from "./hooks/useGeneralTestState";

interface GeneralKnowledgeTestProps {
  lessons: Unit[];
  mode?: "unit" | "all";
  onBack: () => void;
  onComplete?: (score: number) => void;
}

export const GeneralKnowledgeTest: React.FC<GeneralKnowledgeTestProps> = ({
  lessons,
  mode = "all",
  onBack,
  onComplete,
}) => {
  // 1. Initial State & Questions
  const [questions] = useState<Question[]>(() =>
    generateGeneralQuestions(lessons),
  );
  const location = useLocation();
  const locationState = location.state as {
    mode?: TestMode;
    sectionTitle?: string;
  } | null;
  const testMode: TestMode =
    locationState?.mode || (mode === "unit" ? "type" : "type");
  const [bankLimit, setBankLimit] = useState<number>(40);
  const [shuffleTrigger, setShuffleTrigger] = useState<number>(0);

  // 2. Navigation State
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<
    number | null
  >(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentIndexInSection, setCurrentIndexInSection] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // 3. Test Logic Hook
  const {
    answers,
    setAnswers,
    matchingAnswers,
    setMatchingAnswers,
    arrangementAnswers,
    setArrangementAnswers,
    selectedLeft,
    setSelectedLeft,
    matchingRightOptionsByQuestionId,
    showResults,
    setShowResults,
    overallScore,
    setOverallScore,
    sectionResults,
    setSectionResults,
    isQuestionAnswered,
    calculateScore,
    getCombinedAnswers,
    resetBaseState,
  } = useGeneralTestState(questions);

  const { submitAttempt, isLoading: isSubmitting } = useProgress();

  const sections: Section[] = useMemo(
    () => buildSections(questions, testMode, bankLimit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, testMode, bankLimit, shuffleTrigger],
  );

  useEffect(() => {
    if (locationState?.sectionTitle && sections.length > 0) {
      const idx = sections.findIndex(
        (s) => s.title === locationState.sectionTitle,
      );
      if (idx !== -1) {
        setTimeout(() => {
          setCurrentSectionIndex(idx);
          setExpandedSectionIndex(idx);
        }, 0);
      }
    }
  }, [locationState?.sectionTitle, sections]);

  const currentSection = sections[currentSectionIndex];

  const sectionQuestions = useMemo(() => {
    if (!currentSection) return [];
    return questions.filter((q) => currentSection.questionIds.includes(q.id));
  }, [currentSection, questions]);

  const pagedSectionQuestions = useMemo(() => {
    const start = currentPageIndex * QUESTIONS_PER_PAGE;
    return sectionQuestions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [currentPageIndex, sectionQuestions]);

  const sectionProgress = useMemo(
    () =>
      sections.map((section) => {
        const sectionQs = questions.filter((q) =>
          section.questionIds.includes(q.id),
        );
        const answered = sectionQs.filter((q) => isQuestionAnswered(q)).length;
        return {
          answered,
          total: sectionQs.length,
          isComplete: sectionQs.length > 0 && answered === sectionQs.length,
        };
      }),
    [sections, questions, isQuestionAnswered],
  );

  const currentQuestion = pagedSectionQuestions[currentIndexInSection];

  // 5. Handlers
  const resetTestState = useCallback(() => {
    setCurrentSectionIndex(0);
    setExpandedSectionIndex(0);
    setCurrentPageIndex(0);
    setCurrentIndexInSection(0);
    resetBaseState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetBaseState]);

  const handleSubmitSection = () => {
    const scoreInfo = calculateScore(sectionQuestions);
    const nextResults = {
      ...sectionResults,
      [currentSectionIndex]: { ...scoreInfo, submitted: true },
    };

    setSectionResults(nextResults);

    const overallCorrect = Object.values(nextResults).reduce(
      (sum, r) => sum + r.correctCount,
      0,
    );
    const calculatedOverallScore =
      questions.length > 0
        ? Math.round((overallCorrect / questions.length) * 100)
        : 0;

    if (
      sections.length > 0 &&
      sections.every((_, idx) => nextResults[idx]?.submitted)
    ) {
      setOverallScore(calculatedOverallScore);

      const submit = async () => {
        try {
          const combinedAnswers = getCombinedAnswers();
          const backendAnswers = Object.entries(combinedAnswers)
            .map(([id, answer]) => {
              const parsed = extractQuestion(id);
              if (!parsed) return null;
              return {
                unitNumber: parsed.unitNumber,
                questionId: parsed.questionId,
                answer: serializeAnswerForApi(answer),
              };
            })
            .filter((item): item is NonNullable<typeof item> => !!item);

          if (backendAnswers.length > 0) {
            const answersByUnit = backendAnswers.reduce(
              (acc, item) => {
                if (!acc[item.unitNumber]) {
                  acc[item.unitNumber] = [];
                }
                acc[item.unitNumber].push({
                  questionId: item.questionId,
                  answer: item.answer,
                });
                return acc;
              },
              {} as Record<number, { questionId: string; answer: string }[]>,
            );

            for (const [unitNumber, answers] of Object.entries(answersByUnit)) {
              if (answers.length === 0) continue;
              await submitAttempt({
                unitNumber: Number(unitNumber),
                answers,
              });
            }
          }
        } catch (error) {
          console.error("Failed to submit general test results", error);
        } finally {
          setShowResults(true);
        }
      };

      void submit();
    }
  };

  const handleBack = () => {
    if (isReviewMode) {
      setIsReviewMode(false);
      return;
    }
    if (showResults && onComplete) onComplete(overallScore);
    onBack();
  };

  const sectionSidebarVm: GeneralTestSectionSidebarViewModel = {
    sections,
    currentSectionIndex,
    expandedSectionIndex,
    sectionProgress,
    sectionResults,
    questions,
    currentIndexInSection,
    currentPageIndex,
    questionsPerPage: QUESTIONS_PER_PAGE,
    isQuestionAnswered,
    isSubmitting,
    isReviewMode,
  };

  const sectionSidebarActions: GeneralTestSectionSidebarActions = {
    onToggleSection: (i) =>
      setExpandedSectionIndex(expandedSectionIndex === i ? null : i),
    onSelectSection: (i, page = 0, qIdx = 0) => {
      setCurrentSectionIndex(i);
      setExpandedSectionIndex(i);
      setCurrentPageIndex(page);
      setCurrentIndexInSection(qIdx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onSelectQuestion: (qIdx) => setCurrentIndexInSection(qIdx),
    onPageChange: (dir) => {
      setCurrentPageIndex((prev) =>
        dir === "prev" ? Math.max(0, prev - 1) : prev + 1,
      );
      setCurrentIndexInSection(0);
    },
    onSubmitSection: handleSubmitSection,
    onExitReview: () => setIsReviewMode(false),
  };

  const questionPanelVm: GeneralTestQuestionPanelViewModel = {
    currentSectionTitle: currentSection?.title,
    currentQuestion,
    currentPageIndex,
    currentIndexInSection,
    questionsPerPage: QUESTIONS_PER_PAGE,
    sectionQuestionsLength: sectionQuestions.length,
    pagedSectionQuestionsLength: pagedSectionQuestions.length,
    answers,
    matchingAnswers,
    arrangementAnswers,
    selectedLeft,
    matchingRightOptionsByQuestionId,
    showResults: isReviewMode || sectionResults[currentSectionIndex]?.submitted,
  };

  const questionPanelActions: GeneralTestQuestionPanelActions = {
    onAnswerChange: (qid, val) =>
      setAnswers((prev) => ({ ...prev, [qid]: val })),
    onMatchingSelectLeft: (qid, left) =>
      setSelectedLeft((prev) => ({ ...prev, [qid]: left })),
    onMatchingMatch: (qid, left, right) => {
      const newMatches = {
        ...(matchingAnswers[qid] || {}),
        [left]: right,
      };
      setMatchingAnswers((prev) => ({
        ...prev,
        [qid]: newMatches,
      }));
      setSelectedLeft((prev) => ({ ...prev, [qid]: null }));
    },
    onArrangementAdd: (qid, w) =>
      setArrangementAnswers((prev) => ({
        ...prev,
        [qid]: [...(prev[qid] || []), w],
      })),
    onArrangementRemove: (qid, idx) => {
      const nextArr = [...(arrangementAnswers[qid] || [])];
      nextArr.splice(idx, 1);
      setArrangementAnswers((prev) => ({
        ...prev,
        [qid]: nextArr,
      }));
    },
    onArrangementReset: (qid) =>
      setArrangementAnswers((prev) => ({
        ...prev,
        [qid]: [],
      })),
    onPrevQuestion: () => {
      if (currentIndexInSection > 0) {
        setCurrentIndexInSection(currentIndexInSection - 1);
      } else if (currentPageIndex > 0) {
        const prevPage = currentPageIndex - 1;
        setCurrentPageIndex(prevPage);
        const prevPageStart = prevPage * QUESTIONS_PER_PAGE;
        const prevPageQuestions = sectionQuestions.slice(
          prevPageStart,
          prevPageStart + QUESTIONS_PER_PAGE,
        );
        setCurrentIndexInSection(prevPageQuestions.length - 1);
      }
    },
    onNextQuestion: () => {
      const lastIndexOnPage = pagedSectionQuestions.length - 1;
      if (currentIndexInSection < lastIndexOnPage) {
        setCurrentIndexInSection(currentIndexInSection + 1);
      } else {
        setCurrentPageIndex(currentPageIndex + 1);
        setCurrentIndexInSection(0);
      }
    },
  };

  // 6. Render Logic
  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center px-4">
        <Card className="police-shadow border-none p-10">
          <CardTitle className="text-xl mb-3">
            Chưa có dữ liệu cho bài kiểm tra
          </CardTitle>
          <Button onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> QUAY LẠI
          </Button>
        </Card>
      </div>
    );
  }

  if (showResults && !isReviewMode) {
    return (
      <PracticeResults
        score={overallScore}
        totalQuestions={questions.length}
        questions={questions}
        userAnswers={getCombinedAnswers()}
        onBack={handleBack}
        onReview={() => setIsReviewMode(true)}
        title="KẾT QUẢ TEST TỔNG HỢP"
      />
    );
  }

  return (
    <div className="w-full space-y-2 animate-fade-in pb-20">
      <GeneralTestToolbar
        onBack={handleBack}
        sectionsCount={sections.length}
        currentSectionIndex={currentSectionIndex}
        testMode={testMode}
        bankLimit={bankLimit}
        onSetBankLimit={(limit) => {
          setBankLimit(limit);
          resetTestState();
        }}
        onShuffle={() => {
          setShuffleTrigger((prev) => prev + 1);
          resetTestState();
        }}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start px-4">
        <GeneralTestSectionSidebar
          vm={sectionSidebarVm}
          actions={sectionSidebarActions}
        />

        <div className="flex-1 w-full space-y-6">
          <GeneralTestQuestionPanel vm={questionPanelVm} actions={questionPanelActions} />
        </div>
      </div>
    </div>
  );
};
