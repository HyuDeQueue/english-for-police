import React, { useMemo, useState } from "react";
import type { Unit, Question } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  XCircle,
  Zap,
  Home,
} from "lucide-react";

type QuestionAnswer = string | Record<string, string>;

export interface QuickTestProps {
  lessons: Unit[];
  completedUnitIds: number[];
  onBack: () => void;
  onComplete?: (score: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuickTestQuestions(
  lessons: Unit[],
  completedUnitIds: number[],
): Question[] {
  const pool: Question[] = [];
  for (const unit of lessons) {
    if (!completedUnitIds.includes(unit.id)) continue;

    // 1. Vocabulary MCQ
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

    // 2. Sentence Pattern MCQ
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

    // 3. Dictation (Viết câu)
    for (const phrase of unit.phrases.slice(0, 2)) {
      pool.push({
        id: `qt_phrase_write_${unit.id}_${phrase.text.slice(0, 20)}`,
        type: "Dictation",
        prompt: `Dịch sang tiếng Anh: "${phrase.translation}"`,
        vnPrompt: phrase.translation,
        answer: phrase.text,
      });
    }

    // 4. Matching (Ghép đôi)
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
  const matchingRightOptionsByQuestionId = useMemo(() => {
    const stableOrders: Record<string, { left: string; right: string }[]> = {};
    questions.forEach((q) => {
      if (q.type === "Matching") {
        stableOrders[q.id] = shuffleArray([...(q.pairs || [])]);
      }
    });
    return stableOrders;
  }, [questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentQ = questions[currentIndex];

  const setAnswer = (qId: string, ans: QuestionAnswer) => {
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  const score = questions.filter((q) => {
    if (q.type === "Matching") {
      const userMatches = (answers[q.id] as Record<string, string>) || {};
      return q.pairs?.every((p) => userMatches[p.left] === p.right);
    }
    const userAns = (answers[q.id] as string) || "";
    const correctAns = (q.answer as string) || "";
    return userAns.trim().toLowerCase() === correctAns.toLowerCase();
  }).length;

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

  if (submitted) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8 animate-fade-in">
        <Card className="police-shadow border-none overflow-hidden text-center">
          <div className="primary-gradient p-10">
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-widest">
              ⚡ KẾT QUẢ TEST NHANH
            </h2>
            <div className="mt-6 inline-flex flex-col items-center justify-center h-32 w-32 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/20">
              <span className="text-4xl font-black text-white">{percent}%</span>
              <span className="text-[10px] font-bold text-white/70">
                {score}/{questions.length} CÂU
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, i) => {
            let isCorrect = false;
            let displayUserAns = "";
            let displayCorrectAns = "";

            if (q.type === "Matching") {
              const userMatches =
                (answers[q.id] as Record<string, string>) || {};
              isCorrect = !!q.pairs?.every(
                (p) => userMatches[p.left] === p.right,
              );
              displayUserAns = "Bài tập ghép đôi";
              displayCorrectAns = "Dựa trên danh sách từ vựng";
            } else {
              const userAns = (answers[q.id] as string) || "(Chưa trả lời)";
              const correctAns = (q.answer as string) || "";
              isCorrect =
                userAns.trim().toLowerCase() === correctAns.toLowerCase();
              displayUserAns = `Bạn: ${userAns}`;
              displayCorrectAns = `Đáp án: ${correctAns}`;
            }

            return (
              <Card
                key={q.id}
                className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"} police-shadow`}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      CÂU {i + 1} ({q.type})
                    </p>
                    <p className="font-bold text-sm leading-snug">{q.prompt}</p>
                    <div className="text-xs space-y-1 pt-1">
                      <p
                        className={
                          isCorrect ? "text-green-600" : "text-red-600"
                        }
                      >
                        {displayUserAns}
                      </p>
                      {!isCorrect && (
                        <p className="text-green-600 font-medium">
                          {displayCorrectAns}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            className="h-14 px-10 rounded-xl primary-gradient police-shadow font-bold"
            onClick={onBack}
          >
            <Home className="mr-2 h-5 w-5" /> QUAY LẠI TRANG CHỦ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <Button
        variant="ghost"
        onClick={onBack}
        className="group text-primary font-bold"
      >
        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
        QUAY LẠI
      </Button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar - Swapped to LEFT */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0 lg:sticky lg:top-24">
          <Card className="police-shadow border-none overflow-hidden">
            <CardHeader className="bg-muted/50 border-b p-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                DANH SÁCH CÂU HỎI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-4 gap-3">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    className={`h-12 w-12 rounded-lg font-bold text-sm border-2 transition-all ${
                      answers[q.id]
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

              <Button
                size="lg"
                className={`w-full h-16 text-lg font-black rounded-xl primary-gradient police-shadow transition-all ${
                  Object.keys(answers).length === questions.length
                    ? "scale-100 opacity-100"
                    : "opacity-50 scale-95"
                }`}
                disabled={Object.keys(answers).length < questions.length}
                onClick={() => {
                  setSubmitted(true);
                  if (onComplete) onComplete(score);
                }}
              >
                <Send className="mr-3 h-6 w-6" />
                NỘP BÀI
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Card - Swapped to RIGHT */}
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
              <div className="space-y-6 max-w-xl mx-auto w-full">
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
                  {currentQ.type === "MCQ" ? (
                    <div className="grid grid-cols-1 gap-3">
                      {currentQ.options?.map((opt, i) => (
                        <Button
                          key={i}
                          variant={
                            answers[currentQ.id] === opt ? "default" : "outline"
                          }
                          className={`h-auto py-3.5 px-6 justify-start text-left text-sm font-bold transition-all border-2 ${
                            answers[currentQ.id] === opt
                              ? "ring-2 ring-primary ring-offset-1 police-shadow"
                              : "hover:bg-primary/5 hover:border-primary/20"
                          }`}
                          onClick={() => setAnswer(currentQ.id, opt)}
                        >
                          <span
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 text-[10px] ${
                              answers[currentQ.id] === opt
                                ? "bg-white text-primary border-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </Button>
                      ))}
                    </div>
                  ) : currentQ.type === "Matching" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {currentQ.pairs?.map((p) => {
                            const userMatches =
                              (answers[currentQ.id] as Record<
                                string,
                                string
                              >) || {};
                            const isMatched = !!userMatches[p.left];
                            const isSelected = selectedLeft === p.left;
                            return (
                              <Button
                                key={p.left}
                                variant={
                                  isSelected
                                    ? "default"
                                    : isMatched
                                      ? "secondary"
                                      : "outline"
                                }
                                disabled={isMatched}
                                onClick={() => setSelectedLeft(p.left)}
                                className="w-full justify-start text-xs h-10 relative overflow-hidden"
                              >
                                {p.left}
                                {isMatched && (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 absolute right-1 top-1" />
                                )}
                              </Button>
                            );
                          })}
                        </div>
                        <div className="space-y-2">
                          {(matchingRightOptionsByQuestionId[currentQ.id] || []).map((p) => {
                            const userMatches =
                              (answers[currentQ.id] as Record<
                                string,
                                string
                              >) || {};
                            const isMatched = Object.values(
                              userMatches,
                            ).includes(p.right);
                            return (
                              <Button
                                key={p.right}
                                variant={isMatched ? "secondary" : "outline"}
                                disabled={isMatched || !selectedLeft}
                                onClick={() => {
                                  if (selectedLeft) {
                                    const newMatches = {
                                      ...userMatches,
                                      [selectedLeft]: p.right,
                                    };
                                    setAnswer(currentQ.id, newMatches);
                                    setSelectedLeft(null);
                                  }
                                }}
                                className="w-full justify-start text-xs h-10"
                              >
                                {p.right}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic text-center">
                        * Chọn một từ bên trái sau đó chọn nghĩa bên phải
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Nhập câu trả lời của bạn:
                      </label>
                      <Input
                        type="text"
                        value={(answers[currentQ.id] as string) || ""}
                        onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                        placeholder="Type the English text here..."
                        className="h-14 text-base font-bold border-2 focus-visible:ring-primary police-shadow"
                      />
                    </div>
                  )}
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
