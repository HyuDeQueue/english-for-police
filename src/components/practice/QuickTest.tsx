import React, { useState, useMemo } from "react";
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

export const QuickTest: React.FC<QuickTestProps> = ({
  lessons,
  completedUnitIds,
  onBack,
  onComplete,
}) => {
  const questions = useMemo<Question[]>(() => {
    const pool: Question[] = [];
    for (const unit of lessons) {
      if (!completedUnitIds.includes(unit.id)) continue;

      // Generate MCQ from vocabulary
      for (const vocab of unit.vocabulary.slice(0, 5)) {
        const wrongOptions = unit.vocabulary
          .filter((v) => v.word !== vocab.word)
          .slice(0, 3)
          .map((v) => v.meaning);

        pool.push({
          id: `qt_vocab_${unit.id}_${vocab.word}`,
          type: "MCQ",
          prompt: `"${vocab.word}" nghĩa là gì?`,
          options: shuffleArray([vocab.meaning, ...wrongOptions]),
          answer: vocab.meaning,
        });
      }

      for (const phrase of unit.phrases.slice(0, 3)) {
        pool.push({
          id: `qt_phrase_${unit.id}_${phrase.text.slice(0, 20)}`,
          type: "Dictation",
          prompt: phrase.translation,
          vnPrompt: phrase.translation,
          answer: phrase.text,
        });
      }
    }
    return shuffleArray(pool).slice(0, 8);
  }, [lessons, completedUnitIds]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentQ = questions[currentIndex];

  const setAnswer = (qId: string, ans: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  const score = questions.filter(
    (q) =>
      (answers[q.id] || "").trim().toLowerCase() ===
      (q.answer as string).toLowerCase(),
  ).length;

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
        <Button variant="ghost" onClick={onBack} className="mb-8">
          <ChevronLeft className="mr-2 h-4 w-4" /> QUAY LẠI
        </Button>
        <Card className="police-shadow border-none p-10">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h2 className="text-2xl font-bold">Chưa có dữ liệu</h2>
          <p className="text-muted-foreground mt-2">
            Hãy hoàn thành ít nhất 1 bài học để mở bài test nhanh.
          </p>
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
            const userAns = answers[q.id] || "(Chưa trả lời)";
            const isCorrect =
              userAns.trim().toLowerCase() ===
              (q.answer as string).toLowerCase();
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
                      CÂU {i + 1}
                    </p>
                    <p className="font-bold text-sm leading-snug">{q.prompt}</p>
                    {!isCorrect && (
                      <div className="text-xs space-y-1 pt-1">
                        <p className="text-red-600">Bạn: {userAns}</p>
                        <p className="text-green-600 font-medium">
                          Đáp án: {q.answer as string}
                        </p>
                      </div>
                    )}
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

          <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20 text-[10px] font-bold text-secondary text-center uppercase tracking-widest">
            Hoàn thành tất cả các câu để nộp bài
          </div>
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
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Nhập câu trả lời của bạn:
                      </label>
                      <Input
                        type="text"
                        value={answers[currentQ.id] || ""}
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
