import { lazy } from "react";
import { useParams, useLocation } from "react-router-dom";
import type { Unit } from "@/types";
import type { FlashcardSessionSummary } from "@/components/practice/FlashcardReview";

const FlashcardReview = lazy(() =>
  import("@/components/practice/FlashcardReview").then((m) => ({
    default: m.FlashcardReview,
  })),
);

interface Props {
  lessons: Unit[];
  flashcardRound: number;
  onBack: (u: Unit) => void;
  onComplete: (s: FlashcardSessionSummary) => void;
}

export function FlashcardReviewPage({
  lessons,
  flashcardRound,
  onBack,
  onComplete,
}: Props) {
  const { unitId } = useParams();
  const location = useLocation();
  const initialMode = location.state?.initialMode;
  const unit = lessons.find((l) => l.id === Number(unitId));
  if (!unit) return null;

  return (
    <FlashcardReview
      key={`${unit.id}-${flashcardRound}-${initialMode}`}
      unit={unit}
      onBack={() => onBack(unit)}
      onComplete={onComplete}
      initialMode={initialMode}
    />
  );
}
