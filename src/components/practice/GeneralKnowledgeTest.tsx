import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Unit, Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

import { MultipleChoiceQuestion } from "./questions/MultipleChoiceQuestion";
import { MatchingQuestion } from "./questions/MatchingQuestion";
import { ArrangementQuestion } from "./questions/ArrangementQuestion";
import { InputQuestion } from "./questions/InputQuestion";
import { PracticeSidebar } from "./layout/PracticeSidebar";
import { PracticeHeader } from "./layout/PracticeHeader";
import { PracticeResults } from "./results/PracticeResults";

// Modularized imports
import {
  type Section,
  type TestMode,
  type MatchingPair,
  QUESTIONS_PER_PAGE,
  generateGeneralQuestions,
  buildSections,
  shuffleArray,
} from "./utils/testUtils";
import { useGeneralTestState } from "./hooks/useGeneralTestState";
import { SectionAccordionItem } from "./components/SectionAccordionItem";

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
    showResults,
    setShowResults,
    overallScore,
    setOverallScore,
    sectionResults,
    setSectionResults,
    isQuestionAnswered,
    calculateScore,
    resetBaseState,
  } = useGeneralTestState();

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

  const matchingRightOptionsByQuestionId = useMemo(() => {
    const stableOrders: Record<string, MatchingPair[]> = {};
    questions.forEach((q) => {
      if (q.type === "Matching") {
        stableOrders[q.id] = shuffleArray([...(q.pairs || [])]);
      }
    });
    return stableOrders;
  }, [questions]);

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
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults && onComplete) onComplete(overallScore);
    onBack();
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

  if (showResults) {
    return (
      <PracticeResults
        score={overallScore}
        totalQuestions={questions.length}
        questions={questions}
        userAnswers={{ ...answers, ...matchingAnswers, ...arrangementAnswers }}
        onBack={handleBack}
        title="KẾT QUẢ TEST TỔNG HỢP"
      />
    );
  }

  return (
    <div className="w-full space-y-2 animate-fade-in pb-20">
      <PracticeHeader onBack={handleBack}>
        {sections.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-12 rounded-full transition-all ${i === currentSectionIndex ? "bg-primary w-20" : i < currentSectionIndex ? "bg-green-500" : "bg-muted"}`}
          />
        ))}
      </PracticeHeader>

      <div className="flex flex-wrap items-center gap-4 px-4">
        {testMode === "bank" && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex bg-muted/30 p-1 rounded-lg">
              <Button
                variant={bankLimit === 40 ? "secondary" : "ghost"}
                size="sm"
                className={`text-xs font-bold px-3 h-8 rounded-md ${bankLimit === 40 ? "shadow-sm" : ""}`}
                onClick={() => {
                  setBankLimit(40);
                  resetTestState();
                }}
              >
                40 Câu
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 font-bold text-primary border-primary/20 hover:bg-primary/10 gap-2"
              onClick={() => {
                setShuffleTrigger((prev) => prev + 1);
                resetTestState();
              }}
            >
              <Shuffle className="h-3 w-3" />
              Trộn câu hỏi
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start px-4">
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
                questionsPerPage={QUESTIONS_PER_PAGE}
                isQuestionAnswered={isQuestionAnswered}
                onToggle={(i) =>
                  setExpandedSectionIndex(expandedSectionIndex === i ? null : i)
                }
                onSelectSection={(i, page = 0, qIdx = 0) => {
                  setCurrentSectionIndex(i);
                  setExpandedSectionIndex(i);
                  setCurrentPageIndex(page);
                  setCurrentIndexInSection(qIdx);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onSelectQuestion={(qIdx) => setCurrentIndexInSection(qIdx)}
                onPageChange={(dir) => {
                  setCurrentPageIndex((prev) =>
                    dir === "prev" ? Math.max(0, prev - 1) : prev + 1,
                  );
                  setCurrentIndexInSection(0);
                }}
                onSubmit={handleSubmitSection}
              />
            ))}
          </div>
        </PracticeSidebar>

        <div className="flex-1 w-full space-y-6">
          <Card className="police-shadow border-none min-h-360px flex flex-col">
            <CardHeader className="border-b bg-muted/20 py-2.5 px-4 sm:px-5 flex flex-row justify-between items-center">
              <Badge className="bg-primary/10 text-primary border-none px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider">
                {currentSection?.title}
              </Badge>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Câu{" "}
                {currentPageIndex * QUESTIONS_PER_PAGE +
                  currentIndexInSection +
                  1}{" "}
                / {sectionQuestions.length}
              </span>
            </CardHeader>

            <CardContent className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
              <div className="space-y-6 max-w-3xl mx-auto w-full">
                {currentQuestion && (
                  <>
                    <h3 className="text-xl sm:text-2xl font-heading font-black text-primary leading-tight">
                      {currentQuestion.prompt}
                    </h3>
                    {currentQuestion.vnPrompt && (
                      <div className="p-3 bg-secondary/5 border-l-4 border-secondary rounded-r-xl italic text-secondary text-sm font-medium">
                        {currentQuestion.vnPrompt}
                      </div>
                    )}

                    <div className="space-y-3 py-1">
                      {(currentQuestion.type === "MCQ" ||
                        currentQuestion.type === "Scenario") && (
                        <MultipleChoiceQuestion
                          question={currentQuestion}
                          selectedAnswer={answers[currentQuestion.id]}
                          onSelect={(ans) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: ans,
                            }))
                          }
                        />
                      )}
                      {currentQuestion.type === "Matching" && (
                        <MatchingQuestion
                          question={currentQuestion}
                          matchingAnswers={
                            matchingAnswers[currentQuestion.id] || {}
                          }
                          selectedLeft={
                            selectedLeft[currentQuestion.id] || null
                          }
                          onSelectLeft={(left) =>
                            setSelectedLeft((prev) => ({
                              ...prev,
                              [currentQuestion.id]: left,
                            }))
                          }
                          onMatch={(l, r) => {
                            const newMatches = {
                              ...(matchingAnswers[currentQuestion.id] || {}),
                              [l]: r,
                            };
                            setMatchingAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: newMatches,
                            }));
                            setSelectedLeft((prev) => ({
                              ...prev,
                              [currentQuestion.id]: null,
                            }));
                          }}
                          shuffledRightOptions={
                            matchingRightOptionsByQuestionId[
                              currentQuestion.id
                            ] || []
                          }
                        />
                      )}
                      {currentQuestion.type === "Arrangement" && (
                        <ArrangementQuestion
                          question={currentQuestion}
                          selectedWords={
                            arrangementAnswers[currentQuestion.id] || []
                          }
                          onAddWord={(w) =>
                            setArrangementAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: [
                                ...(prev[currentQuestion.id] || []),
                                w,
                              ],
                            }))
                          }
                          onRemoveWord={(idx) => {
                            const nextArr = [
                              ...(arrangementAnswers[currentQuestion.id] || []),
                            ];
                            nextArr.splice(idx, 1);
                            setArrangementAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: nextArr,
                            }));
                          }}
                          onReset={() =>
                            setArrangementAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: [],
                            }))
                          }
                        />
                      )}
                      {(currentQuestion.type === "Dictation" ||
                        currentQuestion.type === "FillInBlank" ||
                        currentQuestion.type === "Speaking") && (
                        <InputQuestion
                          question={currentQuestion}
                          value={answers[currentQuestion.id] || ""}
                          onChange={(ans) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: ans,
                            }))
                          }
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>

            {/* In-card prev/next navigation for mobile-friendly UX */}
            {currentQuestion && (
              <div className="border-t bg-muted/10 px-5 py-3 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 font-bold text-xs border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-30"
                  disabled={
                    currentIndexInSection === 0 && currentPageIndex === 0
                  }
                  onClick={() => {
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
                  }}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Câu Trước
                </Button>

                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {currentPageIndex * QUESTIONS_PER_PAGE +
                    currentIndexInSection +
                    1}
                  {" / "}
                  {sectionQuestions.length}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 font-bold text-xs border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-30"
                  disabled={
                    currentPageIndex * QUESTIONS_PER_PAGE +
                      currentIndexInSection >=
                    sectionQuestions.length - 1
                  }
                  onClick={() => {
                    const lastIndexOnPage = pagedSectionQuestions.length - 1;
                    if (currentIndexInSection < lastIndexOnPage) {
                      setCurrentIndexInSection(currentIndexInSection + 1);
                    } else {
                      setCurrentPageIndex(currentPageIndex + 1);
                      setCurrentIndexInSection(0);
                    }
                  }}
                >
                  Câu Sau
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
