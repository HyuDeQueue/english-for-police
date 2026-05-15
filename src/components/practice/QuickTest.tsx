import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Unit, Question } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Zap,
} from "lucide-react";

import { QuestionRenderer } from "./components/QuestionRenderer";
import { useQuestionAnswers } from "./hooks/useQuestionAnswers";
import {
  mapAnswersToBackendPayload,
  preparePracticeQuestions,
  shuffleArray,
} from "./utils/testUtils";
import { PracticeSidebar } from "./layout/PracticeSidebar";
import { PracticeHeader } from "./layout/PracticeHeader";
import { PracticeResults } from "./results/PracticeResults";
import { useProgress } from "@/hooks/use-progress";
import { Loader2 } from "lucide-react";
import { useSonner } from "@/hooks/use-sonner";
import { practiceQuestionService } from "@/services/practice-question.service";

export interface QuickTestProps {
  lessons: Unit[];
  completedUnitIds: number[];
  onBack: () => void;
  onComplete?: (score: number) => void;
}

export const QuickTest: React.FC<QuickTestProps> = ({
  completedUnitIds,
  onBack,
  onComplete,
}) => {
  const location = useLocation();
  const stateUnitIds = location.state?.selectedUnitIds as number[] | undefined;
  const effectiveUnitIds = useMemo(() => {
    const raw = stateUnitIds?.length ? stateUnitIds : completedUnitIds;
    return [...new Set(raw)].sort((a, b) => a - b);
  }, [stateUnitIds, completedUnitIds]);

  const chapterIdsKey = effectiveUnitIds.join(",");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    isQuestionAnswered,
    calculateCorrectCount,
    getCombinedAnswers,
  } = useQuestionAnswers(questions);

  const { submitAttempt, isLoading: isSubmitting } = useProgress();
  const { notifyError } = useSonner();
  const [submitted, setSubmitted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if (effectiveUnitIds.length === 0) {
        setQuestions([]);
        setIsLoadingQuestions(false);
        return;
      }
      setIsLoadingQuestions(true);
      try {
        let merged: Question[] = [];
        try {
          merged = await practiceQuestionService.postQuickTest(
            effectiveUnitIds,
          );
        } catch {
          const banks = await Promise.all(
            effectiveUnitIds.map((unitId) =>
              practiceQuestionService.getTestBank(unitId, "quick", 12),
            ),
          );
          merged = shuffleArray(banks.flat()).slice(0, 10);
        }
        const sliced = merged.slice(0, 10);
        setQuestions(preparePracticeQuestions(sliced));
      } catch (error) {
        console.error("Failed to load quick test questions", error);
        notifyError(
          "Không tải được bộ câu hỏi",
          "Vui lòng thử lại sau ít phút.",
        );
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    void loadQuestions();
  }, [chapterIdsKey, effectiveUnitIds, notifyError]);

  const currentQ = questions[currentIndex];

  if (isLoadingQuestions) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in px-4">
        <Card className="police-shadow border-none p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Đang tải câu hỏi từ hệ thống...</p>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in px-4">
        <Card className="police-shadow border-none p-12 flex flex-col items-center">
          <div className="h-20 w-20 bg-muted/10 rounded-full flex items-center justify-center mb-6">
            <Zap className="h-10 w-10 text-muted-foreground opacity-20" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Chưa có dữ liệu kiểm tra</h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Bạn cần hoàn thành ít nhất 1 bài học (đọc hết nội dung và nghe phát
            âm) để hệ thống tổng hợp câu hỏi cho bài test nhanh.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 h-12 font-bold"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> QUAY LẠI
            </Button>
            <Button
              onClick={onBack}
              className="flex-1 h-12 font-bold primary-gradient border-none police-shadow"
            >
              HỌC BÀI MỚI <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (submitted && !isReviewMode) {
    const scoreValue = calculateCorrectCount(questions);
    const percent = Math.round((scoreValue / questions.length) * 100);
    const combinedAnswers = getCombinedAnswers();

    return (
      <PracticeResults
        score={percent}
        totalQuestions={questions.length}
        questions={questions}
        userAnswers={combinedAnswers}
        onBack={onBack}
        onReview={() => setIsReviewMode(true)}
        title="⚡ KẾT QUẢ TEST NHANH"
      />
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PracticeHeader onBack={onBack} />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <PracticeSidebar
          title="DANH SÁCH CÂU HỎI"
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
          footer={
            <Button
              size="lg"
              className={`w-full h-16 text-lg font-black rounded-xl primary-gradient police-shadow transition-all ${
                isReviewMode || questions.every((q) => isQuestionAnswered(q))
                  ? "scale-100 opacity-100"
                  : "opacity-50 scale-95"
              }`}
              disabled={
                !isReviewMode && !questions.every((q) => isQuestionAnswered(q))
              }
              onClick={async () => {
                if (isReviewMode) {
                  setIsReviewMode(false);
                } else {
                  const combinedAnswers = getCombinedAnswers();
                  const scoreValue = calculateCorrectCount(questions);
                  const percent = Math.round(
                    (scoreValue / questions.length) * 100,
                  );

                  try {
                    const backendAnswers = mapAnswersToBackendPayload(
                      questions,
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

                    for (const [unitNumber, answers] of Object.entries(
                      answersByUnit,
                    )) {
                      if (answers.length === 0) continue;
                      await submitAttempt({
                        unitNumber: Number(unitNumber),
                        answers,
                      });
                    }

                    setSubmitted(true);
                    if (onComplete) onComplete(percent);
                  } catch (error) {
                    console.error("Failed to submit test results", error);
                    notifyError(
                      "Nộp bài thất bại",
                      "Kết quả chưa được lưu. Vui lòng thử lại.",
                    );
                  }
                }
              }}
            >
              {isSubmitting ? (
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              ) : (
                <Send className="mr-3 h-6 w-6" />
              )}
              {isReviewMode
                ? "XEM LẠI KẾT QUẢ"
                : isSubmitting
                  ? "ĐANG NỘP..."
                  : "NỘP BÀI"}
            </Button>
          }
        >
          <div className="grid grid-cols-6 gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                className={`h-12 w-12 rounded-lg font-bold text-sm border-2 transition-all ${
                  isQuestionAnswered(q)
                    ? "bg-primary text-white border-primary"
                    : i === currentIndex
                      ? "border-secondary bg-secondary/10 text-primary scale-110 shadow-sm"
                      : "border-muted text-muted-foreground hover:border-primary/30"
                }`}
                onClick={() => setCurrentIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </PracticeSidebar>

        <div className="flex-1 w-full space-y-6">
          <Card className="police-shadow border-none min-h-[400px] flex flex-col">
            <CardHeader className="border-b bg-muted/20 py-3">
              <div className="flex justify-between items-center">
                <Badge className="bg-secondary/20 text-secondary border-none px-2 py-0.5 font-bold text-[10px]">
                  <Zap className="h-3 w-3 mr-1 fill-current" /> TEST NHANH
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Câu {currentIndex + 1} / {questions.length}
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
              <div className="space-y-6 max-w-3xl mx-auto w-full">
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-heading font-black text-primary leading-tight">
                    {currentQ.prompt}
                  </h3>
                  {currentQ.vnPrompt && (
                    <div className="p-3 bg-secondary/10 border-l-4 border-secondary rounded-r-lg italic text-secondary text-sm font-medium">
                      {currentQ.vnPrompt}
                    </div>
                  )}
                </div>

                <div className="space-y-3 py-2">
                  <QuestionRenderer
                    question={currentQ}
                    answers={answers}
                    matchingAnswers={matchingAnswers}
                    arrangementAnswers={arrangementAnswers}
                    selectedLeft={selectedLeft}
                    matchingRightOptions={
                      matchingRightOptionsByQuestionId[currentQ.id] || []
                    }
                    onAnswerChange={(qid, val) =>
                      setAnswers((prev) => ({ ...prev, [qid]: val }))
                    }
                    onMatchingSelectLeft={(qid, left) =>
                      setSelectedLeft((prev) => ({ ...prev, [qid]: left }))
                    }
                    onMatchingMatch={(qid, left, right) => {
                      const current = matchingAnswers[qid] || {};
                      setMatchingAnswers((prev) => ({
                        ...prev,
                        [qid]: { ...current, [left]: right },
                      }));
                      setSelectedLeft((prev) => ({ ...prev, [qid]: null }));
                    }}
                    onArrangementAdd={(qid, word) => {
                      const current = arrangementAnswers[qid] || [];
                      setArrangementAnswers((prev) => ({
                        ...prev,
                        [qid]: [...current, word],
                      }));
                    }}
                    onArrangementRemove={(qid, idx) => {
                      const current = [...(arrangementAnswers[qid] || [])];
                      current.splice(idx, 1);
                      setArrangementAnswers((prev) => ({
                        ...prev,
                        [qid]: current,
                      }));
                    }}
                    onArrangementReset={(qid) =>
                      setArrangementAnswers((prev) => ({
                        ...prev,
                        [qid]: [],
                      }))
                    }
                    showResults={isReviewMode}
                  />
                </div>
              </div>
            </CardContent>

            <div className="p-4 bg-muted/10 border-t flex justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 font-bold rounded-lg"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((p) => p - 1)}
              >
                <ChevronLeft className="mr-1.5 h-4 w-4" /> Câu trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 font-bold rounded-lg"
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((p) => p + 1)}
              >
                Câu sau <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
