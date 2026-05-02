import { lazy } from "react";
import { useParams } from "react-router-dom";
import type { FlaggedItem, Unit } from "@/types";

const LessonView = lazy(() =>
  import("@/components/views/LessonView").then((m) => ({
    default: m.LessonView,
  })),
);

interface Props {
  lessons: Unit[];
  flaggedItems: FlaggedItem[];
  toggleFlag: (item: FlaggedItem) => void;
  updateDailyTask: (id: string, inc: number) => void;
  onBack: () => void;
}

export function LessonViewPage({
  lessons,
  flaggedItems,
  toggleFlag,
  updateDailyTask,
  onBack,
}: Props) {
  const { unitId } = useParams();
  const unit = lessons.find((l) => l.id === Number(unitId));
  if (!unit) return null;

  return (
    <LessonView
      unit={unit}
      onBack={onBack}
      flaggedItems={flaggedItems}
      onPhraseAction={() => updateDailyTask("speak", 1)}
      toggleFlag={toggleFlag}
    />
  );
}
