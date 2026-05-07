import React, { useState } from "react";
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
import { shuffleArray } from "./utils/testUtils";
import { PracticeSidebar } from "./layout/PracticeSidebar";
import { PracticeHeader } from "./layout/PracticeHeader";
import { PracticeResults } from "./results/PracticeResults";
import { useProgress } from "@/hooks/use-progress";
import { Loader2 } from "lucide-react";

export interface QuickTestProps {
  lessons: Unit[];
  completedUnitIds: number[];
  onBack: () => void;
  onComplete?: (score: number) => void;
}

function generateQuickTestQuestions(
  lessons: Unit[],
  completedUnitIds: number[],
): Question[] {
  const pool: Question[] = [];
  for (const unit of lessons) {
    if (!completedUnitIds.includes(unit.id)) continue;

    for (const vocab of unit.vocabulary.slice(0, 3)) {
      const wrongOptions = unit.vocabulary
        .filter((v) => v.word !== vocab.word)
        .slice(0, 2)
        .map((v) => v.meaning);

      pool.push({
        id: `qt_vocab_${unit.id}_${vocab.word}`,
        type: "MCQ",
        prompt: `"${vocab.word}" nghĩa là gì?`,
        options: shuffleArray([vocab.meaning, ...wrongOptions]),
        answer: vocab.meaning,
      });
    }

    for (const phrase of unit.phrases.slice(0, 2)) {
      const otherPhrases = unit.phrases.filter((p) => p.text !== phrase.text);
      const wrongOptions = shuffleArray(otherPhrases)
        .slice(0, 2)
        .map((p) => p.translation);

      pool.push({
        id: `qt_phrase_recog_${unit.id}_${phrase.text.slice(0, 20)}`,
        type: "MCQ",
        prompt: `Chọn nghĩa đúng cho câu: "${phrase.text}"`,
        options: shuffleArray([phrase.translation, ...wrongOptions]),
        answer: phrase.translation,
      });
    }

    for (const phrase of unit.phrases.slice(0, 2)) {
      pool.push({
        id: `qt_phrase_write_${unit.id}_${phrase.text.slice(0, 20)}`,
        type: "Dictation",
        prompt: `Dịch sang tiếng Anh: "${phrase.translation}"`,
        vnPrompt: phrase.translation,
        answer: phrase.text,
      });
    }

    const matchingItems = unit.vocabulary.slice(0, 4);
    if (matchingItems.length >= 3) {
      pool.push({
        id: `qt_match_${unit.id}`,
        type: "Matching",
        prompt: `Ghép từ và nghĩa bài UNIT ${unit.id}`,
        pairs: matchingItems.map((v) => ({
          left: v.word,
          right: v.meaning,
        })),
        answer: matchingItems.map((v) => `${v.word}:${v.meaning}`),
      });
    }

    const extraPracticeQuestions = unit.practice
      .filter((q) =>
        ["Scenario", "FillInBlank", "Arrangement"].includes(q.type),
      )
      .slice(0, 3)
      .map((q, idx) => ({ ...q, id: `qt_extra_${unit.id}_${idx}_${q.id}` }));
    pool.push(...extraPracticeQuestions);
  }
  return shuffleArray(pool).slice(0, 10);
}

export const QuickTest: React.FC<QuickTestProps> = ({
  lessons,
  completedUnitIds,
  onBack,
  onComplete,
}) => {
  const [questions] = useState<Question[]>(() =>
    generateQuickTestQuestions(lessons, completedUnitIds),
  );
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
  const [submitted, setSubmitted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const currentQ = questions[currentIndex];

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
                    await submitAttempt({
                      unitNumber: 0, // Quick test uses 0
                      answers: Object.entries(combinedAnswers).map(
                        ([id, answer]) => ({
                          questionId: id,
                          answer: String(answer),
                        }),
                      ),
                    });

                    setSubmitted(true);
                    if (onComplete) onComplete(percent);
                  } catch (error) {
                    console.error("Failed to submit test results", error);
                    // Still set submitted to true to show local results if API fails
                    setSubmitted(true);
                    if (onComplete) onComplete(percent);
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
