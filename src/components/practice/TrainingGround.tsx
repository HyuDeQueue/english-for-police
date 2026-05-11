import React, { useState, useRef, useCallback, useEffect } from "react";
import type { Unit, Question } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";

import { QuestionRenderer } from "./components/QuestionRenderer";
import { useQuestionAnswers } from "./hooks/useQuestionAnswers";
import {
  mapAnswersToBackendPayload,
  preparePracticeQuestions,
  shuffleArray,
} from "./utils/testUtils";
import { PracticeSidebar } from "./layout/PracticeSidebar";
import { PracticeResults } from "./results/PracticeResults";
import { useProgress } from "@/hooks/use-progress";
import { useSonner } from "@/hooks/use-sonner";
import { practiceQuestionService } from "@/services/practice-question.service";

interface TrainingGroundProps {
  unit: Unit;
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const TrainingGround: React.FC<TrainingGroundProps> = ({
  unit,
  onBack,
  onComplete,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const { submitAttempt, isLoading: isSubmitting } = useProgress();
  const { notifyError } = useSonner();
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

  const [timeLeft, setTimeLeft] = useState(600);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [hasReportedCompletion, setHasReportedCompletion] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const fetched = await practiceQuestionService.getQuestions({
          unitNumbers: [unit.id],
          sources: ["vocab", "phrase", "practice"],
          limitPerUnit: 20,
        });
        setQuestions(
          preparePracticeQuestions(shuffleArray(fetched).slice(0, 15)),
        );
      } catch (error) {
        console.error("Failed to load training questions", error);
        notifyError("Không tải được bộ câu hỏi", "Vui lòng thử lại sau.");
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    void loadQuestions();
  }, [notifyError, unit.id]);

  const handleFinish = useCallback(async () => {
    const correctCount = calculateCorrectCount(questions);
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const combinedAnswers = getCombinedAnswers();

    try {
      const backendAnswers = mapAnswersToBackendPayload(questions, combinedAnswers);
      if (backendAnswers.length === 0) {
        notifyError(
          "Không thể nộp bài",
          "Bài luyện này không có câu hỏi đồng bộ với hệ thống chấm điểm.",
        );
        return;
      }

      await submitAttempt({
        unitNumber: unit.id,
        answers: backendAnswers.map(({ questionId, answer }) => ({
          questionId,
          answer,
        })),
      });

      setIsFinished(true);
      setShowResults(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentScore(finalScore);
    } catch (error) {
      console.error("Failed to submit training results", error);
      notifyError(
        "Nộp bài thất bại",
        "Kết quả chưa được lưu. Vui lòng thử lại.",
      );
    }
  }, [
    calculateCorrectCount,
    questions,
    getCombinedAnswers,
    submitAttempt,
    notifyError,
    unit.id,
  ]);

  const handleBackToHome = () => {
    if (!hasReportedCompletion && currentScore !== null) {
      onComplete(currentScore);
      setHasReportedCompletion(true);
    }
    onBack();
  };

  useEffect(() => {
    if (isLoadingQuestions || questions.length === 0) {
      return;
    }
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          void handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleFinish, isLoadingQuestions, questions.length]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = questions.filter((q) => isQuestionAnswered(q)).length;
  const allQuestionsAnswered = answeredCount === questions.length;

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
          <p className="text-muted-foreground">Không có câu hỏi khả dụng cho bài luyện này.</p>
        </Card>
      </div>
    );
  }

  if (showResults && !isReviewMode) {
    const combinedAnswers = getCombinedAnswers();

    return (
      <PracticeResults
        score={currentScore || 0}
        totalQuestions={questions.length}
        questions={questions}
        userAnswers={combinedAnswers}
        onBack={handleBackToHome}
        onReview={() => setIsReviewMode(true)}
        title="KIỂM TRA NĂNG LỰC"
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl mx-auto px-4 pb-20">
      <PracticeSidebar
        title={showResults ? "KẾT QUẢ BÀI LÀM" : "THỜI GIAN CÒN LẠI"}
        icon={
          showResults ? (
            <CheckCircle2 className="h-4 w-4 text-secondary" />
          ) : (
            <Timer className="h-4 w-4 text-secondary" />
          )
        }
        progress={{
          current: answeredCount,
          total: questions.length,
          label: "TIẾN ĐỘ LÀM BÀI",
        }}
        footer={
          <>
            <Button
              variant="outline"
              className="w-full h-11 font-bold group"
              onClick={onBack}
            >
              <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              HỦY BỎ
            </Button>
            <Button
              className="w-full h-11 font-bold primary-gradient police-shadow group"
              disabled={
                (!isReviewMode && isFinished) ||
                (!isReviewMode && !allQuestionsAnswered)
              }
              onClick={() => {
                if (isReviewMode) {
                  setIsReviewMode(false);
                } else {
                  void handleFinish();
                }
              }}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isReviewMode
                ? "QUAY LẠI KẾT QUẢ"
                : isSubmitting
                  ? "ĐANG NỘP..."
                  : "NỘP BÀI"}
            </Button>
          </>
        }
      >
        <div className="text-3xl font-black text-primary mt-1 tabular-nums">
          {showResults ? `${currentScore}%` : formatTime(timeLeft)}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                isQuestionAnswered(q)
                  ? "bg-primary text-white border-primary"
                  : "bg-muted text-muted-foreground border-transparent"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </PracticeSidebar>

      <div className="flex-1 space-y-4 order-1 lg:order-2">
        <header className="mb-6">
          <Badge variant="outline" className="mb-2 border-primary text-primary">
            UNIT {unit.id}
          </Badge>
          <p className="text-muted-foreground mt-1">
            Hoàn thành các câu hỏi trắc nghiệm, viết câu và ghép đôi.
          </p>
        </header>

        <div className="space-y-6">
          {questions.map((q, i) => (
            <Card
              key={q.id}
              className={`police-shadow transition-all border-l-4 ${
                isQuestionAnswered(q)
                  ? "border-l-primary"
                  : "border-l-transparent"
              }`}
            >
              <CardHeader>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <CardTitle className="text-lg font-bold leading-tight pt-1">
                    {q.prompt}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pl-16 pr-6 pb-8">
                <div className="space-y-3">
                  <QuestionRenderer
                    question={q}
                    answers={answers}
                    matchingAnswers={matchingAnswers}
                    arrangementAnswers={arrangementAnswers}
                    selectedLeft={selectedLeft}
                    matchingRightOptions={
                      matchingRightOptionsByQuestionId[q.id] || []
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
