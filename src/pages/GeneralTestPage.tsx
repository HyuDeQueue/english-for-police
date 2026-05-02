import { lazy } from "react";
import { useParams } from "react-router-dom";
import type { Unit } from "@/types";

const GeneralKnowledgeTest = lazy(() =>
  import("@/components/practice/GeneralKnowledgeTest").then((m) => ({
    default: m.GeneralKnowledgeTest,
  })),
);

interface Props {
  lessons: Unit[];
  onBack: (u?: Unit) => void;
  onComplete: () => void;
}

export function GeneralTestPage({ lessons, onBack, onComplete }: Props) {
  const { unitId } = useParams();
  const unit = lessons.find((l) => l.id === Number(unitId));

  return (
    <GeneralKnowledgeTest
      lessons={unit ? [unit] : lessons}
      mode={unit ? "unit" : "all"}
      onBack={() => onBack(unit)}
      onComplete={onComplete}
    />
  );
}
