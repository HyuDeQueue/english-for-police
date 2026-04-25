import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import type { Unit, Question } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, ChevronLeft, Send, CheckCircle2, Home } from "lucide-react";

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
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const questions = useMemo(() => {
    const all: Question[] = unit.vocabulary.map((v, i) => {
      const options = [
        v.meaning,
        ...unit.vocabulary
          .filter((_, idx) => idx !== i)
          .slice(0, 3)
          .map((item) => item.meaning),
      ].sort();

      return {
        id: `vocab-${i}`,
        type: "MCQ",
        prompt: `Nghĩa của từ "${v.word}" là gì?`,
        options,
        answer: v.meaning,
      };
    });

    return all.slice(0, 10);
  }, [unit]);

  const handleFinish = useCallback(() => {
    setIsFinished(true);
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const correctCount = Object.entries(answers).reduce((acc, [qIdx, aIdx]) => {
      const q = questions[Number(qIdx)];
      const correctIdx = q.options?.indexOf(q.answer as string) ?? -1;
      return acc + (correctIdx === aIdx ? 1 : 0);
    }, 0);

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setCurrentScore(finalScore);
  }, [answers, questions]);

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

  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl mx-auto">
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
                    answers[i] !== undefined
                      ? "bg-primary text-white border-primary"
                      : "bg-muted text-muted-foreground border-transparent"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 font-bold group"
                onClick={onBack}
              >
                <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                HỦY BỎ
              </Button>
              {showResults ? (
                <Button
                  className="w-full h-11 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 police-shadow group"
                  onClick={() => onComplete(currentScore || 0)}
                >
                  <Home className="mr-2 h-4 w-4" />
                  XÁC NHẬN KẾT QUẢ
                </Button>
              ) : (
                <Button
                  className="w-full h-11 font-bold primary-gradient police-shadow group"
                  disabled={isFinished || answeredCount === 0}
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
            Hoàn thành các câu hỏi trắc nghiệm dựa trên nội dung bài học.
          </p>
        </header>

        <div className="space-y-6">
          {questions.map((q, i) => (
            <Card
              key={i}
              className={`police-shadow transition-all border-l-4 ${
                showResults
                  ? answers[i] === q.options?.indexOf(q.answer as string)
                    ? "border-l-green-500"
                    : "border-l-red-500"
                  : answers[i] !== undefined
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = answers[i] === optIdx;
                    const isCorrect = opt === q.answer;

                    let variant: "default" | "outline" | "destructive" =
                      isSelected ? "default" : "outline";
                    let stateClasses = "";

                    if (showResults) {
                      if (isCorrect) {
                        variant = "default";
                        stateClasses =
                          "bg-green-600 border-green-600 text-white ring-green-600";
                      } else if (isSelected && !isCorrect) {
                        variant = "destructive";
                        stateClasses =
                          "bg-red-600 border-red-600 text-white ring-red-600";
                      }
                    } else {
                      stateClasses = isSelected
                        ? "ring-2 ring-primary ring-offset-2 police-shadow"
                        : "hover:bg-primary/5 hover:border-primary/30";
                    }

                    return (
                      <Button
                        key={optIdx}
                        variant={variant}
                        disabled={showResults}
                        className={`h-auto py-4 px-6 justify-start text-left text-sm font-medium whitespace-normal transition-all ${stateClasses}`}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [i]: optIdx }))
                        }
                      >
                        <span
                          className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 shrink-0 text-[10px] ${
                            isSelected
                              ? "bg-white text-primary border-white"
                              : "text-muted-foreground border-muted-foreground/30"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                      </Button>
                    );
                  })}
                </div>
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
            disabled={isFinished}
          >
            NỘP BÀI NGAY
          </Button>
        </div>
      </div>
    </div>
  );
};
