import React from "react";
import { Input } from "@/components/ui/input";
import type { Question } from "@/types";

interface InputQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  showResults?: boolean;
  disabled?: boolean;
}

export const InputQuestion: React.FC<InputQuestionProps> = ({
  question,
  value,
  onChange,
  showResults = false,
  disabled = false,
}) => {
  const normalizedUser = value.trim().toLowerCase();
  const normalizedCorrect = String(question.answer || "")
    .trim()
    .toLowerCase();
  const acceptable = (question.acceptableAnswers || []).map((a) =>
    a.trim().toLowerCase(),
  );
  const isCorrect =
    normalizedUser === normalizedCorrect || acceptable.includes(normalizedUser);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Nhập bản dịch tiếng Anh:
        </label>
        <Input
          type="text"
          value={value}
          disabled={disabled || showResults}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập câu trả lời của bạn..."
          className={`h-12 text-base font-bold border-2 focus-visible:ring-primary police-shadow rounded-xl px-4 transition-all ${
            showResults
              ? isCorrect
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
              : "border-muted"
          }`}
        />
      </div>

      {showResults && (
        <div className="p-4 rounded-xl bg-green-100 border border-green-200">
          <p className="text-xs font-bold text-green-700 uppercase mb-1">
            Đáp án đúng:
          </p>
          <p className="text-sm font-bold text-green-800">{question.answer}</p>
          {question.acceptableAnswers &&
            question.acceptableAnswers.length > 0 && (
              <p className="text-xs text-green-700 mt-1">
                Chấp nhận thêm: {question.acceptableAnswers.join(", ")}
              </p>
            )}
        </div>
      )}
    </div>
  );
};
