import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import type { Unit, Question } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, ChevronLeft, Send, CheckCircle2, Home } from "lucide-react";

type MatchingPair = NonNullable<Question["pairs"]>[number];

interface TrainingGroundProps {
  unit: Unit;
  onBack: () => void;
  onComplete: (score: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateTrainingGroundQuestions(unit: Unit): Question[] {
  const pool: Question[] = [];

  // 1. Vocabulary MCQ (Nghĩa của từ)
  unit.vocabulary.forEach((v, i) => {
    const options = shuffleArray([
      v.meaning,
      ...unit.vocabulary
        .filter((_, idx) => idx !== i)
        .slice(0, 3)
        .map((item) => item.meaning),
    ]);

    pool.push({
      id: `vocab-${i}`,
      type: "MCQ",
      prompt: `Nghĩa của từ chuyên ngành "${v.word}" là gì?`,
      options,
      answer: v.meaning,
    });
  });

  // 2. Sentence Recognition (Nhận diện mẫu câu)
  unit.phrases.forEach((p, i) => {
    const options = shuffleArray([
      p.translation,
      ...unit.phrases
        .filter((_, idx) => idx !== i)
        .slice(0, 3)
        .map((item) => item.translation),
    ]);

    pool.push({
      id: `phrase-recog-${i}`,
      type: "MCQ",
      prompt: `Chọn nghĩa đúng cho mẫu câu: "${p.text}"`,
      options,
      answer: p.translation,
    });
  });

  // 3. Situation-based (Chọn câu phù hợp tình huống)
  unit.phrases.forEach((p, i) => {
    if (p.context) {
      const options = shuffleArray([
        p.text,
        ...unit.phrases
          .filter((_, idx) => idx !== i)
          .slice(0, 3)
          .map((item) => item.text),
      ]);

      pool.push({
        id: `phrase-context-${i}`,
        type: "MCQ",
        prompt: `Trong tình huống: "${p.context}", bạn nên nói câu nào?`,
        options,
        answer: p.text,
      });
    }
  });

  // 4. True/False (Phân biệt Đúng - Sai)
  unit.phrases.slice(0, 3).forEach((p, i) => {
    const isTrue = Math.random() > 0.5;
    let promptText = p.text;

    if (!isTrue) {
      const words = p.text.split(" ");
      if (words.length > 3) {
        // Swap words to create error
        [words[1], words[2]] = [words[2], words[1]];
        promptText = words.join(" ");
      } else {
        promptText = p.text + " (incorrect usage)";
      }
    }

    pool.push({
      id: `phrase-tf-${i}`,
      type: "MCQ",
      prompt: `Mẫu câu sau đây có cấu trúc ĐÚNG hay SAI: "${promptText}"`,
      options: ["ĐÚNG", "SAI"],
      answer: isTrue ? "ĐÚNG" : "SAI",
    });
  });

  // 5. Sentence Writing (Viết câu)
  unit.phrases.slice(0, 3).forEach((p, i) => {
    pool.push({
      id: `phrase-write-${i}`,
      type: "Dictation",
      prompt: `Viết lại câu sau bằng tiếng Anh: "${p.translation}"`,
      vnPrompt: p.translation,
      answer: p.text,
    });
  });

  // 6. Matching (Ghép đôi)
  const matchingItems = unit.vocabulary.slice(0, 4);
  if (matchingItems.length >= 3) {
    pool.push({
      id: `vocab-match-${unit.id}`,
      type: "Matching",
      prompt: "Ghép các từ vựng sau với nghĩa tương ứng",
      pairs: matchingItems.map((v) => ({
        left: v.word,
        right: v.meaning,
      })),
      answer: matchingItems.map((v) => `${v.word}:${v.meaning}`),
    });
  }

  return shuffleArray(pool).slice(0, 15);
}

export const TrainingGround: React.FC<TrainingGroundProps> = ({
  unit,
  onBack,
  onComplete,
}) => {
  const [questions] = useState<Question[]>(() =>
    generateTrainingGroundQuestions(unit),
  );
  const matchingRightOptionsByQuestionIndex = useMemo(() => {
    const stableOrders: Record<number, MatchingPair[]> = {};
    questions.forEach((q, idx) => {
      if (q.type === "Matching") {
        stableOrders[idx] = shuffleArray([...(q.pairs || [])]);
      }
    });
    return stableOrders;
  }, [questions]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [textAnswers, setTextAnswers] = useState<{ [key: number]: string }>({});
  const [matchingAnswers, setMatchingAnswers] = useState<{
    [key: number]: { [left: string]: string };
  }>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [hasReportedCompletion, setHasReportedCompletion] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const handleFinish = useCallback(() => {
    setIsFinished(true);
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    questions.forEach((q, i) => {
      if (q.type === "MCQ") {
        const correctIdx = q.options?.indexOf(q.answer as string) ?? -1;
        if (answers[i] === correctIdx) correctCount++;
      } else if (q.type === "Dictation") {
        const userAns = (textAnswers[i] || "").trim().toLowerCase();
        const correctAns = (q.answer as string).trim().toLowerCase();
        if (userAns === correctAns) correctCount++;
      } else if (q.type === "Matching") {
        const userPairs = matchingAnswers[i] || {};
        const qPairs = q.pairs || [];
        let matches = 0;
        qPairs.forEach((p) => {
          if (userPairs[p.left] === p.right) matches++;
        });
        if (matches === qPairs.length) correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setCurrentScore(finalScore);
  }, [answers, textAnswers, matchingAnswers, questions]);

  const handleBackToHome = () => {
    if (!hasReportedCompletion && currentScore !== null) {
      onComplete(currentScore);
      setHasReportedCompletion(true);
    }
    onBack();
  };

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleFinish]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isQuestionAnswered = (q: Question, idx: number) => {
    if (q.type === "MCQ") return answers[idx] !== undefined;
    if (q.type === "Dictation")
      return (textAnswers[idx] || "").trim().length > 0;
    if (q.type === "Matching") {
      const pairCount = q.pairs?.length || 0;
      if (pairCount === 0) return false;
      return Object.keys(matchingAnswers[idx] || {}).length === pairCount;
    }
    return false;
  };

  const answeredCount = questions.filter((q, idx) =>
    isQuestionAnswered(q, idx),
  ).length;
  const allQuestionsAnswered = answeredCount === questions.length;
  const progressPercent = (answeredCount / questions.length) * 100;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl mx-auto px-4 pb-20">
      {/* Sticky Quiz Sidebar */}
      <aside className="w-full lg:w-72 lg:sticky lg:top-24 space-y-6 shrink-0 order-2 lg:order-1">
        <Card className="police-shadow border-none overflow-hidden">
          <div className="primary-gradient p-5">
            <h4 className="font-heading font-bold flex items-center gap-2 text-white text-sm">
              {showResults ? (
                <CheckCircle2 className="h-4 w-4 text-secondary" />
              ) : (
                <Timer className="h-4 w-4 text-secondary" />
              )}
              {showResults ? "KẾT QUẢ BÀI LÀM" : "THỜI GIAN CÒN LẠI"}
            </h4>
            <div className="text-3xl font-black text-white mt-1 tabular-nums">
              {showResults ? `${currentScore}%` : formatTime(timeLeft)}
            </div>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>TIẾN ĐỘ LÀM BÀI</span>
                <span>
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    isQuestionAnswered(questions[i], i)
                      ? "bg-primary text-white border-primary"
                      : "bg-muted text-muted-foreground border-transparent"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3">
              {showResults ? (
                <Button
                  className="w-full h-11 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 police-shadow group"
                  onClick={handleBackToHome}
                >
                  <Home className="mr-2 h-4 w-4" />
                  QUAY LẠI TRANG CHỦ
                </Button>
              ) : (
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
                    disabled={isFinished || !allQuestionsAnswered}
                    onClick={handleFinish}
                  >
                    {isFinished ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ĐANG NỘP...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        NỘP BÀI
                      </div>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-xl p-4 border border-dashed text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center">
          Chú ý: Bài thi sẽ tự động nộp khi hết thời gian.
        </div>
      </aside>

      {/* Questions Area */}
      <div className="flex-1 space-y-8 order-1 lg:order-2">
        <header className="mb-10">
          <Badge variant="outline" className="mb-2 border-primary text-primary">
            UNIT {unit.id}
          </Badge>
          <h2 className="text-3xl font-heading font-black text-primary tracking-tight uppercase">
            KIỂM TRA NĂNG LỰC
          </h2>
          <p className="text-muted-foreground mt-1">
            Hoàn thành các câu hỏi trắc nghiệm, viết câu và ghép đôi.
          </p>
        </header>

        <div className="space-y-6">
          {questions.map((q, i) => (
            <Card
              key={i}
              className={`police-shadow transition-all border-l-4 ${
                showResults
                  ? "border-l-transparent"
                  : isQuestionAnswered(q, i)
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
                {/* 1. MCQ UI */}
                {q.type === "MCQ" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options?.map((opt, optIdx) => {
                        const isSelected = answers[i] === optIdx;
                        const isCorrect = opt === q.answer;
                        let stateClasses = isSelected
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:bg-primary/5";

                        if (showResults) {
                          if (isCorrect)
                            stateClasses =
                              "bg-green-600 text-white ring-green-600";
                          else if (isSelected && !isCorrect)
                            stateClasses = "bg-red-600 text-white ring-red-600";
                        }

                        return (
                          <Button
                            key={optIdx}
                            variant={isSelected ? "default" : "outline"}
                            disabled={showResults}
                            className={`h-auto py-4 px-6 justify-start text-left text-sm font-medium whitespace-normal transition-all ${stateClasses}`}
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [i]: optIdx }))
                            }
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                    {showResults && (
                      <div className="p-4 rounded-xl bg-green-100 border border-green-200">
                        <p className="text-xs font-bold text-green-700 uppercase mb-1">
                          Đáp án đúng:
                        </p>
                        <p className="text-sm font-bold text-green-800">
                          {q.answer as string}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Dictation UI */}
                {q.type === "Dictation" && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nhập câu trả lời của bạn..."
                      disabled={showResults}
                      value={textAnswers[i] || ""}
                      onChange={(e) =>
                        setTextAnswers((prev) => ({
                          ...prev,
                          [i]: e.target.value,
                        }))
                      }
                      className={`w-full h-14 px-4 rounded-xl border-2 transition-all outline-none text-lg font-medium ${
                        showResults
                          ? (textAnswers[i] || "").trim().toLowerCase() ===
                            (q.answer as string).trim().toLowerCase()
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-muted focus:border-primary"
                      }`}
                    />
                    {showResults && (
                      <div className="p-4 rounded-xl bg-green-100 border border-green-200">
                        <p className="text-xs font-bold text-green-700 uppercase mb-1">
                          Đáp án đúng:
                        </p>
                        <p className="text-sm font-bold text-green-800">
                          {q.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Matching UI */}
                {q.type === "Matching" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-2">
                        {(q.pairs || []).map((p: MatchingPair) => {
                          const isMatched = !!matchingAnswers[i]?.[p.left];
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
                              disabled={showResults || isMatched}
                              onClick={() => setSelectedLeft(p.left)}
                              className="w-full justify-start text-sm h-12 relative overflow-hidden"
                            >
                              {p.left}
                              {isMatched && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </div>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                      {/* Right Column */}
                      <div className="space-y-2">
                        {(matchingRightOptionsByQuestionIndex[i] || []).map(
                          (p: MatchingPair) => {
                            const isMatched = Object.values(
                              matchingAnswers[i] || {},
                            ).includes(p.right);
                            return (
                              <Button
                                key={p.right}
                                variant={isMatched ? "secondary" : "outline"}
                                disabled={
                                  showResults || isMatched || !selectedLeft
                                }
                                onClick={() => {
                                  if (selectedLeft) {
                                    setMatchingAnswers((prev) => ({
                                      ...prev,
                                      [i]: {
                                        ...(prev[i] || {}),
                                        [selectedLeft]: p.right,
                                      },
                                    }));
                                    setSelectedLeft(null);
                                  }
                                }}
                                className="w-full justify-start text-sm h-12"
                              >
                                {p.right}
                              </Button>
                            );
                          },
                        )}
                      </div>
                    </div>
                    {showResults && (
                      <div className="mt-4 p-4 rounded-xl bg-muted/50 space-y-2">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">
                          Kết quả ghép đôi:
                        </p>
                        {(q.pairs || []).map((p: MatchingPair) => {
                          const userRight = matchingAnswers[i]?.[p.left];
                          const isCorrect = userRight === p.right;
                          return (
                            <div
                              key={p.left}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="font-bold">{p.left}</span>
                              <span className="text-muted-foreground">→</span>
                              <span
                                className={
                                  isCorrect
                                    ? "text-green-600 font-bold"
                                    : "text-red-600 line-through"
                                }
                              >
                                {userRight || "Chưa ghép"}
                              </span>
                              {!isCorrect && (
                                <span className="text-green-600 font-bold ml-2">
                                  ({p.right})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-card p-10 rounded-2xl border-2 border-dashed flex flex-col items-center text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-primary opacity-20" />
          <div className="space-y-1">
            <h4 className="font-bold text-lg">Bạn đã đến cuối bài kiểm tra</h4>
            <p className="text-sm text-muted-foreground max-w-xs">
              Hãy kiểm tra lại kỹ các câu trả lời trước khi nhấn nộp bài.
            </p>
          </div>
          <Button
            size="lg"
            className="mt-4 px-10 primary-gradient font-bold h-14 rounded-xl"
            onClick={handleFinish}
            disabled={isFinished || !allQuestionsAnswered}
          >
            NỘP BÀI NGAY
          </Button>
        </div>
      </div>
    </div>
  );
};
