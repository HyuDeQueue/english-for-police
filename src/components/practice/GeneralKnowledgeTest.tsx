import React, { useState } from "react";
import type { Unit, Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Send,
  Home,
  Brain,
} from "lucide-react";

type MatchingAnswer = Record<string, string>;

interface GeneralKnowledgeTestProps {
  lessons: Unit[];
  mode?: "unit" | "all";
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

function generateGeneralQuestions(lessons: Unit[]): Question[] {
  const pool: Question[] = [];

  lessons.forEach((unit) => {
    unit.vocabulary.forEach((vocab, idx) => {
      const wrongOptions = shuffleArray(
        unit.vocabulary
          .filter((v) => v.word !== vocab.word)
          .slice(0, 3)
          .map((v) => v.meaning),
      );

      pool.push({
        id: `gk-vocab-${unit.id}-${idx}`,
        type: "MCQ",
        prompt: `[UNIT ${unit.id}] "${vocab.word}" nghĩa là gì?`,
        options: shuffleArray([vocab.meaning, ...wrongOptions]),
        answer: vocab.meaning,
      });
    });

    unit.phrases.forEach((phrase, idx) => {
      const wrongOptions = shuffleArray(
        unit.phrases
          .filter((p) => p.text !== phrase.text)
          .slice(0, 3)
          .map((p) => p.translation),
      );

      pool.push({
        id: `gk-phrase-mcq-${unit.id}-${idx}`,
        type: "MCQ",
        prompt: `[UNIT ${unit.id}] Chọn nghĩa đúng cho câu: "${phrase.text}"`,
        options: shuffleArray([phrase.translation, ...wrongOptions]),
        answer: phrase.translation,
      });
    });

    unit.phrases.forEach((phrase, idx) => {
      pool.push({
        id: `gk-phrase-dictation-${unit.id}-${idx}`,
        type: "Dictation",
        prompt: `[UNIT ${unit.id}] Dịch sang tiếng Anh: "${phrase.translation}"`,
        vnPrompt: phrase.translation,
        answer: phrase.text,
      });
    });

    // Keep all curated lesson practice questions too.
    unit.practice.forEach((question, idx) => {
      pool.push({
        ...question,
        id: `gk-practice-${unit.id}-${idx}-${question.id}`,
      });
    });

    // Build multiple matching sets so more vocabulary is covered.
    const matchingChunkSize = 4;
    for (let i = 0; i < unit.vocabulary.length; i += matchingChunkSize) {
      const matchingItems = unit.vocabulary.slice(i, i + matchingChunkSize);
      if (matchingItems.length >= 3) {
        pool.push({
          id: `gk-match-${unit.id}-${i}`,
          type: "Matching",
          prompt: `[UNIT ${unit.id}] Ghép từ và nghĩa tương ứng`,
          pairs: matchingItems.map((item) => ({
            left: item.word,
            right: item.meaning,
          })),
          answer: matchingItems.map((item) => `${item.word}:${item.meaning}`),
        });
      }
    }
  });

  return shuffleArray(pool);
}

export const GeneralKnowledgeTest: React.FC<GeneralKnowledgeTestProps> = ({
  lessons,
  mode = "all",
  onBack,
  onComplete,
}) => {
  const [questions] = useState<Question[]>(() =>
    generateGeneralQuestions(lessons),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | MatchingAnswer>
  >({});
  const [matchingAnswers, setMatchingAnswers] = useState<
    Record<string, MatchingAnswer>
  >({});
  const [selectedLeft, setSelectedLeft] = useState<
    Record<string, string | null>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const questionsPerPage = 20;

  const currentQuestion = questions[currentIndex];
  const questionListPage = Math.floor(currentIndex / questionsPerPage);
  const totalQuestionListPages = Math.ceil(questions.length / questionsPerPage);
  const pageStart = questionListPage * questionsPerPage;
  const pageEnd = pageStart + questionsPerPage;
  const pagedQuestions = questions.slice(pageStart, pageEnd);

  const isQuestionAnswered = (q: Question): boolean => {
    if (q.type === "MCQ" || q.type === "Dictation") {
      return (
        typeof answers[q.id] === "string" &&
        (answers[q.id] as string).trim().length > 0
      );
    }
    if (q.type === "Matching") {
      const pairCount = q.pairs?.length || 0;
      if (pairCount === 0) return false;
      return Object.keys(matchingAnswers[q.id] || {}).length === pairCount;
    }
    return false;
  };

  const answeredCount = questions.filter((q) => isQuestionAnswered(q)).length;
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (q.type === "Matching") {
        const userPairs = matchingAnswers[q.id] || {};
        const allCorrect = (q.pairs || []).every(
          (pair) => userPairs[pair.left] === pair.right,
        );
        if (allCorrect) correctCount++;
        return;
      }

      const userAnswer =
        typeof answers[q.id] === "string"
          ? (answers[q.id] as string).trim().toLowerCase()
          : "";
      const correctAnswer = String(q.answer || "")
        .trim()
        .toLowerCase();
      if (userAnswer === correctAnswer) correctCount++;
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const handleBack = () => {
    if (showResults && onComplete) onComplete(score);
    onBack();
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center px-4">
        <Card className="police-shadow border-none p-10">
          <CardTitle className="text-xl mb-3">
            Chưa có dữ liệu cho bài kiểm tra tổng hợp
          </CardTitle>
          <p className="text-muted-foreground mb-6">
            Vui lòng quay lại và kiểm tra dữ liệu bài học.
          </p>
          <Button onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            QUAY LẠI
          </Button>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-8 animate-fade-in">
        <Card className="police-shadow border-none overflow-hidden text-center">
          <div className="primary-gradient p-8">
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-widest">
              KẾT QUẢ TEST TỔNG HỢP
            </h2>
            <div className="mt-5 inline-flex flex-col items-center justify-center h-28 w-28 rounded-full bg-white/10 border-4 border-white/20">
              <span className="text-4xl font-black text-white">{score}%</span>
              <span className="text-[10px] font-bold text-white/70">
                {Math.round((score / 100) * questions.length)}/
                {questions.length} CÂU
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, i) => {
            let isCorrect = false;
            let userDisplay = "";
            let answerDisplay = "";

            if (q.type === "Matching") {
              const userPairs = matchingAnswers[q.id] || {};
              isCorrect = (q.pairs || []).every(
                (pair) => userPairs[pair.left] === pair.right,
              );
              userDisplay = "Bài ghép đôi";
              answerDisplay = (q.pairs || [])
                .map((pair) => `${pair.left} - ${pair.right}`)
                .join(", ");
            } else {
              const userAnswer =
                typeof answers[q.id] === "string"
                  ? (answers[q.id] as string)
                  : "(Chưa trả lời)";
              const correctAnswer = String(q.answer || "");
              isCorrect =
                userAnswer.trim().toLowerCase() ===
                correctAnswer.trim().toLowerCase();
              userDisplay = `Bạn: ${userAnswer || "(Chưa trả lời)"}`;
              answerDisplay = `Đáp án: ${correctAnswer}`;
            }

            return (
              <Card
                key={q.id}
                className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"} police-shadow`}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      CÂU {i + 1} ({q.type})
                    </p>
                    <p className="text-sm font-bold leading-snug">{q.prompt}</p>
                    <p
                      className={
                        isCorrect
                          ? "text-green-600 text-xs"
                          : "text-red-600 text-xs"
                      }
                    >
                      {userDisplay}
                    </p>
                    {!isCorrect && (
                      <p className="text-green-600 text-xs font-medium">
                        {answerDisplay}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          size="lg"
          className="w-full h-12 font-bold"
          onClick={handleBack}
        >
          <Home className="mr-2 h-4 w-4" />
          QUAY LẠI ({score}%)
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="group text-primary font-bold"
      >
        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        QUAY LẠI
      </Button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-80 space-y-6 shrink-0 lg:sticky lg:top-24">
          <Card className="police-shadow border-none overflow-hidden">
            <CardHeader className="bg-muted/50 border-b p-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                {mode === "unit" ? "TEST THEO BÀI" : "TEST TỔNG HỢP"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-4 gap-3">
                {pagedQuestions.map((q, idxInPage) => {
                  const i = pageStart + idxInPage;
                  return (
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
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs font-bold"
                  disabled={questionListPage === 0}
                  onClick={() =>
                    setCurrentIndex(
                      Math.max(0, (questionListPage - 1) * questionsPerPage),
                    )
                  }
                >
                  <ChevronLeft className="mr-1 h-3 w-3" />
                  Trước
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs font-bold"
                  disabled={questionListPage >= totalQuestionListPages - 1}
                  onClick={() =>
                    setCurrentIndex(
                      Math.min(
                        questions.length - 1,
                        (questionListPage + 1) * questionsPerPage,
                      ),
                    )
                  }
                >
                  Sau
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>

              <Button
                size="lg"
                className={`w-full h-16 text-lg font-black rounded-xl primary-gradient police-shadow transition-all ${
                  allAnswered ? "scale-100 opacity-100" : "opacity-50 scale-95"
                }`}
                disabled={!allAnswered}
                onClick={handleSubmit}
              >
                <Send className="mr-3 h-6 w-6" />
                NỘP BÀI
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 w-full space-y-6">
          <Card className="police-shadow border-none min-h-[420px] flex flex-col">
            <CardHeader className="border-b bg-muted/20 py-3">
              <div className="flex justify-between items-center">
                <Badge className="bg-secondary/20 text-secondary border-none px-2 py-0.5 font-bold text-[10px]">
                  <Brain className="h-3 w-3 mr-1" />
                  {mode === "unit" ? "THEO BÀI" : "TOÀN BỘ"}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Câu {currentIndex + 1} / {questions.length}
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
              <div className="space-y-6 max-w-xl mx-auto w-full">
                <h3 className="text-xl sm:text-2xl font-heading font-black text-primary leading-tight">
                  {currentQuestion.prompt}
                </h3>
                {currentQuestion.vnPrompt && (
                  <div className="p-3 bg-secondary/10 border-l-4 border-secondary rounded-r-lg italic text-secondary text-sm font-medium">
                    {currentQuestion.vnPrompt}
                  </div>
                )}

                <div className="space-y-3 py-2">
                  {currentQuestion.type === "MCQ" ? (
                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.options?.map((opt, i) => (
                        <Button
                          key={i}
                          variant={
                            answers[currentQuestion.id] === opt
                              ? "default"
                              : "outline"
                          }
                          className={`h-auto py-3.5 px-6 justify-start text-left text-sm font-bold transition-all border-2 ${
                            answers[currentQuestion.id] === opt
                              ? "ring-2 ring-primary ring-offset-1 police-shadow"
                              : "hover:bg-primary/5 hover:border-primary/20"
                          }`}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: opt,
                            }))
                          }
                        >
                          <span
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 text-[10px] ${
                              answers[currentQuestion.id] === opt
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
                  ) : currentQuestion.type === "Matching" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {currentQuestion.pairs?.map((pair) => {
                            const current =
                              matchingAnswers[currentQuestion.id] || {};
                            const isMatched = !!current[pair.left];
                            const isSelected =
                              selectedLeft[currentQuestion.id] === pair.left;
                            return (
                              <Button
                                key={pair.left}
                                variant={
                                  isSelected
                                    ? "default"
                                    : isMatched
                                      ? "secondary"
                                      : "outline"
                                }
                                disabled={isMatched}
                                onClick={() =>
                                  setSelectedLeft((prev) => ({
                                    ...prev,
                                    [currentQuestion.id]: pair.left,
                                  }))
                                }
                                className="w-full justify-start text-xs h-10 relative overflow-hidden"
                              >
                                {pair.left}
                                {isMatched && (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 absolute right-1 top-1" />
                                )}
                              </Button>
                            );
                          })}
                        </div>
                        <div className="space-y-2">
                          {shuffleArray(currentQuestion.pairs || []).map(
                            (pair) => {
                              const current =
                                matchingAnswers[currentQuestion.id] || {};
                              const isMatched = Object.values(current).includes(
                                pair.right,
                              );
                              return (
                                <Button
                                  key={pair.right}
                                  variant={isMatched ? "secondary" : "outline"}
                                  disabled={
                                    isMatched ||
                                    !selectedLeft[currentQuestion.id]
                                  }
                                  onClick={() => {
                                    const left =
                                      selectedLeft[currentQuestion.id];
                                    if (!left) return;
                                    const newMatches = {
                                      ...current,
                                      [left]: pair.right,
                                    };
                                    setMatchingAnswers((prev) => ({
                                      ...prev,
                                      [currentQuestion.id]: newMatches,
                                    }));
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [currentQuestion.id]: newMatches,
                                    }));
                                    setSelectedLeft((prev) => ({
                                      ...prev,
                                      [currentQuestion.id]: null,
                                    }));
                                  }}
                                  className="w-full justify-start text-xs h-10"
                                >
                                  {pair.right}
                                </Button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Nhập câu trả lời của bạn:
                      </label>
                      <Input
                        type="text"
                        value={
                          typeof answers[currentQuestion.id] === "string"
                            ? (answers[currentQuestion.id] as string)
                            : ""
                        }
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [currentQuestion.id]: e.target.value,
                          }))
                        }
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
