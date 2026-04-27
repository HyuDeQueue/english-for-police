import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Home } from "lucide-react";
import type { Question } from "@/types";

interface PracticeResultsProps {
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: Record<string, string | Record<string, string> | string[]>;
  onBack: () => void;
  title?: string;
}

export const PracticeResults: React.FC<PracticeResultsProps> = ({
  score,
  totalQuestions,
  questions,
  userAnswers,
  onBack,
  title = "KẾT QUẢ BÀI LÀM",
}) => {
  const isCorrect = (q: Question) => {
    const ans = userAnswers[q.id];
    if (!ans) return false;

    if (q.type === "Matching") {
      const userPairs = ans as Record<string, string>;
      return (q.pairs || []).every((p) => userPairs[p.left] === p.right);
    }
    if (q.type === "Arrangement") {
      const userArranged = ((ans as string[]) || []).join(" ").trim();
      return (
        userArranged.toLowerCase() === (q.answer as string).trim().toLowerCase()
      );
    }

    const normalizedUser = String(ans).trim().toLowerCase();
    const normalizedCorrect = String(q.answer || "")
      .trim()
      .toLowerCase();
    const acceptable = (q.acceptableAnswers || []).map((a) =>
      a.trim().toLowerCase(),
    );
    return (
      normalizedUser === normalizedCorrect ||
      acceptable.includes(normalizedUser)
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-8 animate-fade-in">
      <Card className="police-shadow border-none overflow-hidden text-center">
        <div className="primary-gradient p-8">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-widest">
            {title}
          </h2>
          <div className="mt-5 inline-flex flex-col items-center justify-center h-28 w-28 rounded-full bg-white/10 border-4 border-white/20">
            <span className="text-4xl font-black text-white">{score}%</span>
            <span className="text-[10px] font-bold text-white/70">
              {Math.round((score / 100) * totalQuestions)}/{totalQuestions} CÂU
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.map((q, i) => {
          const correct = isCorrect(q);
          const ans = userAnswers[q.id];

          let userDisplay = "";
          let answerDisplay = "";

          if (q.type === "Matching") {
            userDisplay = "Bài ghép đôi";
            answerDisplay = (q.pairs || [])
              .map((pair) => `${pair.left} - ${pair.right}`)
              .join(", ");
          } else if (q.type === "Arrangement") {
            userDisplay = `Bạn: ${((ans as string[]) || []).join(" ") || "(Chưa trả lời)"}`;
            answerDisplay = `Đáp án: ${q.answer}`;
          } else {
            userDisplay = `Bạn: ${ans || "(Chưa trả lời)"}`;
            answerDisplay = `Đáp án: ${q.answer}`;
          }

          return (
            <Card
              key={q.id}
              className={`border-l-4 ${correct ? "border-l-green-500" : "border-l-red-500"} police-shadow`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                >
                  {correct ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    CÂU {i + 1} ({q.type})
                  </p>
                  <p className="text-sm font-bold leading-snug">{q.prompt}</p>
                  <p
                    className={
                      correct
                        ? "text-green-600 text-xs"
                        : "text-red-600 text-xs"
                    }
                  >
                    {userDisplay}
                  </p>
                  {!correct && (
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

      <Button size="lg" className="w-full h-12 font-bold" onClick={onBack}>
        <Home className="mr-2 h-4 w-4" />
        QUAY LẠI ({score}%)
      </Button>
    </div>
  );
};
