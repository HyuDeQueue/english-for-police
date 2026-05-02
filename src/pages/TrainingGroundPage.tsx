import { lazy } from "react";
import { useParams } from "react-router-dom";
import type { Unit, UserProgress } from "@/types";

const TrainingGround = lazy(() =>
  import("@/components/practice/TrainingGround").then((m) => ({
    default: m.TrainingGround,
  })),
);

interface Props {
  lessons: Unit[];
  progress: UserProgress;
  setProgress: (p: UserProgress) => void;
  onBack: (u: Unit) => void;
  onComplete: () => void;
}

export function TrainingGroundPage({
  lessons,
  progress,
  setProgress,
  onBack,
  onComplete,
}: Props) {
  const { unitId } = useParams();
  const unit = lessons.find((l) => l.id === Number(unitId));
  if (!unit) return null;

  return (
    <TrainingGround
      unit={unit}
      onBack={() => onBack(unit)}
      onComplete={() => {
        setProgress({
          ...progress,
          completedUnits: Array.from(
            new Set([...progress.completedUnits, unit.id]),
          ),
        });
        onComplete();
      }}
    />
  );
}
