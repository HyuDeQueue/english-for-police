import { lazy } from "react";
import { useParams } from "react-router-dom";
import type { Unit } from "@/types";
import type { FlashcardSessionSummary } from "@/components/practice/FlashcardReview";

const FlashcardSessionResults = lazy(() =>
  import("@/components/practice/FlashcardSessionResults").then((m) => ({
    default: m.FlashcardSessionResults,
  })),
);

interface Props {
  lessons: Unit[];
  flashcardSummary: FlashcardSessionSummary | null;
  onBack: (u: Unit) => void;
  onRetry: (u: Unit) => void;
  onContinue: (u: Unit) => void;
}

export function FlashcardResultsPage({
  lessons,
  flashcardSummary,
  onBack,
  onRetry,
  onContinue,
}: Props) {
  const { unitId } = useParams();
  const unit = lessons.find((l) => l.id === Number(unitId));
  if (!unit || !flashcardSummary) return null;

  return (
    <FlashcardSessionResults
      summary={flashcardSummary}
      onBackToLesson={() => onBack(unit)}
      onRetry={() => onRetry(unit)}
      onContinue={() => onContinue(unit)}
    />
  );
}
