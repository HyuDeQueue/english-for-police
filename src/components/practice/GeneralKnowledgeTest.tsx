import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { LessonTestLane, Question, Unit } from "@/types";
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
  type SectionResult,
  type TestMode,
  QUESTIONS_PER_PAGE,
  SECTION_META,
  PRACTICE_MENU_LABEL_TO_LANE,
  buildSections,
  filterQuestionsByLane,
  filterVocabDrillQuestions,
  filterQuestionsBySubLesson,
  isLessonTestLane,
  mapAnswersToBackendPayload,
  preparePracticeQuestionsForSections,
  shuffleArray,
  generateGeneralQuestions,
} from "./utils/testUtils";
import { useGeneralTestState } from "./hooks/useGeneralTestState";
import { useSonner } from "@/hooks/use-sonner";
import { practiceQuestionService } from "@/services/practice-question.service";

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state as {
    mode?: TestMode;
    sectionTitle?: string;
  } | null;

  const testMode: TestMode =
    searchParams.get("mode") === "bank" || locationState?.mode === "bank"
      ? "bank"
      : "type";

  /** Single practice lane from URL (?lane=VOCAB_MCQ) or legacy navigation state. */
  const focusedLane: LessonTestLane | null = useMemo(() => {
    const param = searchParams.get("lane");
    if (param && isLessonTestLane(param)) return param;
    const st = locationState?.sectionTitle;
    if (st && PRACTICE_MENU_LABEL_TO_LANE[st]) {
      return PRACTICE_MENU_LABEL_TO_LANE[st];
    }
    return null;
  }, [searchParams, locationState?.sectionTitle]);

  const vocabDrillParam = searchParams.get("vocabDrill");
  const vocabDrill: "en-vi" | "vi-en" | "matching" | null =
    vocabDrillParam === "en-vi" ||
    vocabDrillParam === "vi-en" ||
    vocabDrillParam === "matching"
      ? vocabDrillParam
      : null;

  const subLessonIdParam = searchParams.get("subId")?.trim() || null;

  const effectiveLane = testMode === "type" ? focusedLane : null;

  const scopedQuestions = useMemo(() => {
    if (vocabDrill) {
      return filterVocabDrillQuestions(questions, vocabDrill);
    }
    return filterQuestionsByLane(questions, effectiveLane);
  }, [questions, effectiveLane, vocabDrill]);
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
  } = useGeneralTestState(scopedQuestions);

  const { submitAttempt, isLoading: isSubmitting } = useProgress();
  const { notifyError } = useSonner();

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const unit = mode === "unit" && lessons.length === 1 ? lessons[0] : null;

        if (unit && vocabDrill) {
          const sources =
            vocabDrill === "en-vi"
              ? (["vocab"] as const)
              : (["practice", "vocab"] as const);
          let fetched: Question[] = [];
          try {
            fetched = await practiceQuestionService.getQuestions({
              unitNumbers: [unit.id],
              sources: [...sources],
              limitPerUnit: 80,
            });
          } catch {
            fetched = [];
          }
          let merged = filterVocabDrillQuestions(fetched, vocabDrill);
          if (merged.length === 0) {
            const gen = generateGeneralQuestions([unit]);
            merged = filterVocabDrillQuestions(gen, vocabDrill);
          }
          const shuffled = shuffleArray(merged);
          const draftSections = buildSections(shuffled, testMode, bankLimit);
          setQuestions(
            preparePracticeQuestionsForSections(shuffled, draftSections),
          );
          return;
        }

        if (unit && subLessonIdParam && focusedLane === "PHRASE_SCENARIO") {
          let fetched: Question[] = [];
          try {
            fetched = await practiceQuestionService.getQuestions({
              unitNumbers: [unit.id],
              sources: ["practice"],
              subLessonId: subLessonIdParam,
            });
          } catch {
            fetched = [];
          }
          if (fetched.length === 0) {
            fetched = filterQuestionsBySubLesson(
              unit.practice,
              subLessonIdParam,
            );
          }
          const laneFiltered = filterQuestionsByLane(
            fetched,
            "PHRASE_SCENARIO",
          );
          const pool = laneFiltered.length > 0 ? laneFiltered : fetched;
          const shuffled = shuffleArray(pool);
          const draftSections = buildSections(shuffled, testMode, bankLimit);
          setQuestions(
            preparePracticeQuestionsForSections(shuffled, draftSections),
          );
          return;
        }

        const fetched =
          mode === "unit" && lessons.length === 1
            ? await practiceQuestionService.getTestBank(
                lessons[0].id,
                "general",
                bankLimit,
              )
            : await practiceQuestionService.getQuestions({
                unitNumbers: lessons.map((l) => l.id),
                sources: ["vocab", "phrase", "practice"],
                limitPerUnit: 20,
              });
        const shuffled = shuffleArray(fetched);
        const draftSections = buildSections(shuffled, testMode, bankLimit);
        setQuestions(
          preparePracticeQuestionsForSections(shuffled, draftSections),
        );
      } catch (error) {
        console.error("Failed to load general test questions", error);
        notifyError("Không tải được bộ câu hỏi", "Vui lòng thử lại sau.");
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    void loadQuestions();
  }, [
    lessons,
    notifyError,
    testMode,
    bankLimit,
    mode,
    vocabDrill,
    subLessonIdParam,
    focusedLane,
  ]);

  const sections: Section[] = useMemo(
    () => buildSections(scopedQuestions, testMode, bankLimit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopedQuestions, testMode, bankLimit, shuffleTrigger],
  );

  useEffect(() => {
    setCurrentSectionIndex(0);
    setExpandedSectionIndex(0);
    setCurrentPageIndex(0);
    setCurrentIndexInSection(0);
  }, [effectiveLane, testMode, vocabDrill, subLessonIdParam]);

  const currentSection = sections[currentSectionIndex];

  const sectionQuestions = useMemo(() => {
    if (!currentSection) return [];
    return scopedQuestions.filter((q) =>
      currentSection.questionIds.includes(q.id),
    );
  }, [currentSection, scopedQuestions]);

  const pagedSectionQuestions = useMemo(() => {
    const start = currentPageIndex * QUESTIONS_PER_PAGE;
    return sectionQuestions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [currentPageIndex, sectionQuestions]);

  const sectionProgress = useMemo(
    () =>
      sections.map((section) => {
        const sectionQs = scopedQuestions.filter((q) =>
          section.questionIds.includes(q.id),
        );
        const answered = sectionQs.filter((q) => isQuestionAnswered(q)).length;
        return {
          answered,
          total: sectionQs.length,
          isComplete: sectionQs.length > 0 && answered === sectionQs.length,
        };
      }),
    [sections, scopedQuestions, isQuestionAnswered],
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

  /** Một lần nộp toàn bài → chấm mọi phần, gửi API, màn kết quả. */
  const handleSubmitPractice = useCallback(async () => {
    if (scopedQuestions.length === 0 || sections.length === 0) return;

    const nextResults: Record<number, SectionResult> = {};
    sections.forEach((section, idx) => {
      const sq = scopedQuestions.filter((q) =>
        section.questionIds.includes(q.id),
      );
      const sc = calculateScore(sq);
      nextResults[idx] = { ...sc, submitted: true };
    });
    setSectionResults(nextResults);

    const overallCorrect = Object.values(nextResults).reduce(
      (sum, r) => sum + r.correctCount,
      0,
    );
    const calculatedOverallScore =
      scopedQuestions.length > 0
        ? Math.round((overallCorrect / scopedQuestions.length) * 100)
        : 0;
    setOverallScore(calculatedOverallScore);

    try {
      const combinedAnswers = getCombinedAnswers();
      const backendAnswers = mapAnswersToBackendPayload(
        scopedQuestions,
        combinedAnswers,
      );

      if (backendAnswers.length === 0) {
        notifyError(
          "Không thể nộp bài",
          "Bài test này không có câu hỏi đồng bộ với hệ thống chấm điểm.",
        );
        return;
      }

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

      setShowResults(true);
    } catch (error) {
      console.error("Failed to submit general test results", error);
      notifyError(
        "Nộp bài thất bại",
        "Kết quả chưa được lưu. Vui lòng thử lại.",
      );
    }
  }, [
    scopedQuestions,
    sections,
    calculateScore,
    setSectionResults,
    setOverallScore,
    getCombinedAnswers,
    notifyError,
    submitAttempt,
    setShowResults,
  ]);

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
    questions: scopedQuestions,
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
    onSubmitSection: handleSubmitPractice,
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
    inlineSubmit:
      !isReviewMode && scopedQuestions.length > 0
        ? {
            onSubmit: () => void handleSubmitPractice(),
            submitting: isSubmitting,
          }
        : undefined,
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
  if (isLoadingQuestions) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center px-4">
        <Card className="police-shadow border-none p-10">
          <CardTitle className="text-xl mb-3">
            Đang tải câu hỏi từ hệ thống...
          </CardTitle>
        </Card>
      </div>
    );
  }

  if (
    !isLoadingQuestions &&
    effectiveLane &&
    scopedQuestions.length === 0 &&
    !vocabDrill
  ) {
    const title = SECTION_META[effectiveLane].title;
    return (
      <div className="max-w-2xl mx-auto py-20 text-center px-4">
        <Card className="police-shadow border-none p-10">
          <CardTitle className="text-xl mb-3">
            Chưa có câu hỏi cho: {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground mb-6">
            Ngân hàng bài học chưa có dữ liệu cho dạng này. Thử luyện các phần
            khác hoặc liên hệ quản trị viên.
          </p>
          <Button onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> QUAY LẠI
          </Button>
        </Card>
      </div>
    );
  }

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
        totalQuestions={scopedQuestions.length}
        questions={scopedQuestions}
        userAnswers={getCombinedAnswers()}
        onBack={handleBack}
        onReview={() => setIsReviewMode(true)}
        title="KẾT QUẢ LUYỆN TẬP"
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
          setQuestions((prev) => {
            const draftSections = buildSections(prev, testMode, limit);
            return preparePracticeQuestionsForSections(prev, draftSections);
          });
          resetTestState();
        }}
        onShuffle={() => {
          setQuestions((prev) => {
            const shuffled = shuffleArray([...prev]);
            const draftSections = buildSections(shuffled, testMode, bankLimit);
            return preparePracticeQuestionsForSections(shuffled, draftSections);
          });
          setShuffleTrigger((prev) => prev + 1);
          resetTestState();
        }}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start px-4 w-full">
        <GeneralTestSectionSidebar
          vm={sectionSidebarVm}
          actions={sectionSidebarActions}
          hideSectionSubmit={isReviewMode}
        />

        <div className="flex-1 w-full space-y-6">
          {vocabDrill ? (
            <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                {vocabDrill === "en-vi" && "Trắc nghiệm Anh → Việt"}
                {vocabDrill === "vi-en" && "Trắc nghiệm Việt → Anh"}
                {vocabDrill === "matching" && "Ghép cặp từ vựng"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {vocabDrill === "en-vi" &&
                  "Chọn nghĩa tiếng Việt đúng cho từ/cụm từ tiếng Anh."}
                {vocabDrill === "vi-en" &&
                  "Chọn từ tiếng Anh đúng theo nghĩa hoặc mô tả tiếng Việt."}
                {vocabDrill === "matching" &&
                  "Ghép nối thuật ngữ tiếng Anh với nghĩa tiếng Việt tương ứng."}
              </p>
            </div>
          ) : effectiveLane ? (
            <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                {SECTION_META[effectiveLane].title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {SECTION_META[effectiveLane].description}
              </p>
            </div>
          ) : null}

          <GeneralTestQuestionPanel
            vm={questionPanelVm}
            actions={questionPanelActions}
          />
        </div>
      </div>
    </div>
  );
};
