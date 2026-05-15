import type { Question, Unit } from "@/types";

function stripQuestionForApi(
  q: Question,
): Omit<
  Question,
  "id" | "backendQuestionId" | "backendUnitNumber" | "sourceCategory"
> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, backendQuestionId, backendUnitNumber, sourceCategory, ...rest } =
    q;
  const pairs =
    rest.pairs?.map((p) =>
      "left" in p && "right" in p
        ? { left: p.left, right: p.right }
        : (p as { left: string; right: string }),
    ) ?? [];
  return { ...rest, pairs };
}

export function unitToLessonApiBody(unit: Unit) {
  return {
    id: unit.id,
    title: unit.title,
    description: unit.description,
    videoUrl: unit.videoUrl ?? null,
    vocabulary: unit.vocabulary,
    phrases: unit.phrases,
    memoryBoost: { summary: unit.memoryBoost.summary },
    practice: unit.practice.map(stripQuestionForApi),
  };
}

function normalizePair(
  p: { left?: string; right?: string } | Record<string, string>,
): { left: string; right: string } {
  const left =
    "left" in p && typeof p.left === "string"
      ? p.left
      : (Object.values(p)[0] ?? "");
  const right =
    "right" in p && typeof p.right === "string"
      ? p.right
      : (Object.values(p)[1] ?? "");
  return { left, right };
}

export function normalizeLessonFromApi(unit: Unit): Unit {
  return {
    ...unit,
    practice: unit.practice.map((q, index) => ({
      ...q,
      id: q.id || `pq-${unit.id}-${index}`,
      pairs: q.pairs?.map((p) =>
        "left" in p && "right" in p
          ? p
          : normalizePair(p as Record<string, string>),
      ),
    })),
  };
}
