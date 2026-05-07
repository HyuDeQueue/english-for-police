import { lazy, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { FlaggedItem, Unit } from "@/types";
import { fetchLessonById } from "@/lib/lessonApi";

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
  const unitNumber = Number(unitId);
  const cachedUnit = useMemo(
    () => lessons.find((l) => l.id === unitNumber),
    [lessons, unitNumber],
  );
  const [remoteUnit, setRemoteUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(unitNumber)) return;

    let isMounted = true;
    const loadLesson = async () => {
      setIsLoading(true);
      try {
        const unit = await fetchLessonById(unitNumber);
        if (isMounted) {
          setRemoteUnit(unit);
        }
      } catch (error) {
        console.error(`Failed to fetch lesson ${unitNumber}`, error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadLesson();
    return () => {
      isMounted = false;
    };
  }, [unitNumber]);

  const unit = remoteUnit || cachedUnit;

  if (isLoading && !unit) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Đang tải bài học...
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Không tìm thấy bài học.
      </div>
    );
  }

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
