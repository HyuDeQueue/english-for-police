import React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonShortcutButtonsProps {
  readonly onStartPractice: () => void;
  readonly onStartFlashcards: () => void;
  readonly onStartGeneralTest: () => void;
  readonly onStartQuickTest: () => void;
}

export const LessonShortcutButtons: React.FC<LessonShortcutButtonsProps> = ({
  onStartPractice,
  onStartFlashcards,
  onStartGeneralTest,
  onStartQuickTest,
}) => {
  return (
    <div className="mt-4 space-y-2">
      <Button
        variant="default"
        className="w-full h-10 justify-between font-bold"
        onClick={onStartPractice}
      >
        Kiểm tra
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="w-full h-10 justify-between font-bold"
        onClick={onStartFlashcards}
      >
        Ôn tập
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="w-full h-10 justify-between font-bold"
        onClick={onStartGeneralTest}
      >
        Luyện tập
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="w-full h-10 justify-between font-bold"
        onClick={onStartQuickTest}
      >
        Test nhanh
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LessonShortcutButtons;
