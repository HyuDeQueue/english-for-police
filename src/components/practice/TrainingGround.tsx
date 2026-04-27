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
import { Badge } from "@/components/ui/badge";
import { Timer, ChevronLeft, CheckCircle2 } from "lucide-react";

import { MultipleChoiceQuestion } from "./questions/MultipleChoiceQuestion";
import { MatchingQuestion } from "./questions/MatchingQuestion";
import { ArrangementQuestion } from "./questions/ArrangementQuestion";
import { InputQuestion } from "./questions/InputQuestion";
import { PracticeSidebar } from "./layout/PracticeSidebar";
import { PracticeResults } from "./results/PracticeResults";

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

  unit.phrases.slice(0, 3).forEach((p, i) => {
    const isTrue = Math.random() > 0.5;
    let promptText = p.text;

    if (!isTrue) {
      const words = p.text.split(" ");
      if (words.length > 3) {
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

  unit.phrases.slice(0, 3).forEach((p, i) => {
    pool.push({
      id: `phrase-write-${i}`,
      type: "Dictation",
      prompt: `Viết lại câu sau bằng tiếng Anh: "${p.translation}"`,
      vnPrompt: p.translation,
      answer: p.text,
    });
  });

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

  const extraPracticeQuestions = unit.practice
    .filter((q) => ["Scenario", "FillInBlank", "Arrangement"].includes(q.type))
    .slice(0, 5)
    .map((q, idx) => ({ ...q, id: `tg-extra-${unit.id}-${idx}-${q.id}` }));
  pool.push(...extraPracticeQuestions);

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matchingAnswers, setMatchingAnswers] = useState<
    Record<string, Record<string, string>>
  >({});
  const [arrangementAnswers, setArrangementAnswers] = useState<
    Record<string, string[]>
  >({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [hasReportedCompletion, setHasReportedCompletion] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const matchingRightOptionsByQuestionId = useMemo(() => {
    const stableOrders: Record<string, { left: string; right: string }[]> = {};
    questions.forEach((q) => {
      if (q.type === "Matching") {
        stableOrders[q.id] = shuffleArray([...(q.pairs || [])]);
      }
    });
    return stableOrders;
  }, [questions]);

  const handleFinish = useCallback(() => {
    setIsFinished(true);
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    questions.forEach((q) => {
      if (q.type === "MCQ" || q.type === "Scenario") {
        if (answers[q.id] === q.answer) correctCount++;
      } else if (
        q.type === "Dictation" ||
        q.type === "FillInBlank" ||
        q.type === "Speaking"
      ) {
        const userAns = String(answers[q.id] || "")
          .trim()
          .toLowerCase();
        const correctAns = String(q.answer || "")
          .trim()
          .toLowerCase();
        const acceptable = (q.acceptableAnswers || []).map((a) =>
          a.trim().toLowerCase(),
        );
        if (userAns === correctAns || acceptable.includes(userAns))
          correctCount++;
      } else if (q.type === "Matching") {
        const userPairs = matchingAnswers[q.id] || {};
        if ((q.pairs || []).every((p) => userPairs[p.left] === p.right))
          correctCount++;
      } else if (q.type === "Arrangement") {
        const userArranged = (arrangementAnswers[q.id] || []).join(" ").trim();
        const correctAns = String(q.answer || "").trim();
        if (userArranged.toLowerCase() === correctAns.toLowerCase())
          correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setCurrentScore(finalScore);
  }, [answers, matchingAnswers, arrangementAnswers, questions]);

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

  const isQuestionAnswered = (q: Question) => {
    if (q.type === "Matching") {
      const pairCount = q.pairs?.length || 0;
      return (
        pairCount > 0 &&
        Object.keys(matchingAnswers[q.id] || {}).length === pairCount
      );
    }
    if (q.type === "Arrangement") {
      return (arrangementAnswers[q.id] || []).length > 0;
    }
    return (
      typeof answers[q.id] === "string" &&
      (answers[q.id] as string).trim().length > 0
    );
  };

  const answeredCount = questions.filter((q) => isQuestionAnswered(q)).length;
  const allQuestionsAnswered = answeredCount === questions.length;

  if (showResults) {
    const combinedAnswers: Record<
      string,
      string | Record<string, string> | string[]
    > = {
      ...answers,
      ...matchingAnswers,
      ...arrangementAnswers,
    };

    return (
      <PracticeResults
        score={currentScore || 0}
        totalQuestions={questions.length}
        questions={questions}
        userAnswers={combinedAnswers}
        onBack={handleBackToHome}
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
              disabled={isFinished || !allQuestionsAnswered}
              onClick={handleFinish}
            >
              {isFinished ? "ĐANG NỘP..." : "NỘP BÀI"}
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
                  {q.type === "MCQ" || q.type === "Scenario" ? (
                    <MultipleChoiceQuestion
                      question={q}
                      selectedAnswer={answers[q.id]}
                      onSelect={(ans) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: ans }))
                      }
                    />
                  ) : q.type === "Matching" ? (
                    <MatchingQuestion
                      question={q}
                      matchingAnswers={matchingAnswers[q.id] || {}}
                      selectedLeft={selectedLeft}
                      onSelectLeft={setSelectedLeft}
                      onMatch={(left, right) => {
                        const current = matchingAnswers[q.id] || {};
                        setMatchingAnswers((prev) => ({
                          ...prev,
                          [q.id]: { ...current, [left]: right },
                        }));
                        setSelectedLeft(null);
                      }}
                      shuffledRightOptions={
                        matchingRightOptionsByQuestionId[q.id] || []
                      }
                    />
                  ) : q.type === "Arrangement" ? (
                    <ArrangementQuestion
                      question={q}
                      selectedWords={arrangementAnswers[q.id] || []}
                      onAddWord={(word) => {
                        const current = arrangementAnswers[q.id] || [];
                        setArrangementAnswers((prev) => ({
                          ...prev,
                          [q.id]: [...current, word],
                        }));
                      }}
                      onRemoveWord={(idx) => {
                        const current = [...(arrangementAnswers[q.id] || [])];
                        current.splice(idx, 1);
                        setArrangementAnswers((prev) => ({
                          ...prev,
                          [q.id]: current,
                        }));
                      }}
                      onReset={() =>
                        setArrangementAnswers((prev) => ({
                          ...prev,
                          [q.id]: [],
                        }))
                      }
                    />
                  ) : (
                    <InputQuestion
                      question={q}
                      value={answers[q.id] || ""}
                      onChange={(val) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: val }))
                      }
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
