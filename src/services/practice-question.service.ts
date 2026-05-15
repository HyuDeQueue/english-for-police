import { API_ROUTES } from "@/api/routes";
import { api } from "@/utils/api-client";
import type { LessonTestLane, Question } from "@/types";

export interface PracticeQuestionApiDto {
  unitNumber: number;
  id: string;
  sourceCategory?: "vocab" | "phrase" | "practice" | string;
  type: Question["type"];
  prompt: string;
  circumstance?: string;
  scenarioDescription?: string;
  options?: string[];
  answer: string | string[];
  bestAnswer?: string;
  acceptableAnswers?: string[];
  explanation?: string;
  vnPrompt?: string;
  pairs?: Array<{ left?: string; right?: string } | Record<string, string>>;
  testLane?: LessonTestLane | null | string;
  subLessonId?: string | null;
}

interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

export interface PracticeQuestionFilters {
  unitNumbers: number[];
  sources?: Array<"vocab" | "phrase" | "practice">;
  limitPerUnit?: number;
  /** Query `sub_lesson_id` — chỉ câu practice persisted gắn tiểu mục. */
  subLessonId?: string;
}

function narrowSourceCategory(
  s: string | undefined,
): "vocab" | "phrase" | "practice" | undefined {
  if (s === "vocab" || s === "phrase" || s === "practice") return s;
  return undefined;
}

function narrowTestLane(
  v: string | null | undefined,
): LessonTestLane | undefined {
  if (
    v === "VOCAB_MCQ" ||
    v === "MATCHING" ||
    v === "PHRASE_SCENARIO" ||
    v === "FILL_ARRANGE"
  ) {
    return v;
  }
  return undefined;
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

/** Chuẩn hóa một dòng câu hỏi từ API lesson tests / practice / test bank. */
export function mapPracticeQuestionDto(item: PracticeQuestionApiDto): Question {
  const pairs = item.pairs?.map((p) =>
    "left" in p && "right" in p && p.left != null && p.right != null
      ? { left: String(p.left), right: String(p.right) }
      : normalizePair(p as Record<string, string>),
  );

  return {
    id: item.id,
    backendQuestionId: item.id,
    backendUnitNumber: item.unitNumber,
    sourceCategory: narrowSourceCategory(item.sourceCategory),
    testLane: narrowTestLane(item.testLane as string | undefined),
    type: item.type,
    prompt: item.prompt,
    circumstance: item.circumstance,
    scenarioDescription: item.scenarioDescription,
    options: item.options,
    answer: item.answer,
    bestAnswer: item.bestAnswer,
    acceptableAnswers: item.acceptableAnswers,
    explanation: item.explanation,
    vnPrompt: item.vnPrompt,
    pairs,
    subLessonId: item.subLessonId ?? undefined,
  };
}

export const practiceQuestionService = {
  getQuestions: async (filters: PracticeQuestionFilters): Promise<Question[]> => {
    const params = new URLSearchParams();
    for (const unitNumber of filters.unitNumbers) {
      params.append("unitNumbers", String(unitNumber));
    }
    if (filters.sources?.length) {
      params.append("sources", filters.sources.join(","));
    }
    if (filters.limitPerUnit) {
      params.append("limitPerUnit", String(filters.limitPerUnit));
    }
    if (filters.subLessonId?.trim()) {
      params.append("sub_lesson_id", filters.subLessonId.trim());
    }

    const endpoint = `${API_ROUTES.PRACTICE.QUESTIONS}?${params.toString()}`;
    const response = await api.get<ApiResponse<PracticeQuestionApiDto[]>>(endpoint);
    return response.data.map(mapPracticeQuestionDto);
  },

  getTestBank: async (
    unitNumber: number,
    preset: "general" | "quick",
    limit?: number,
  ): Promise<Question[]> => {
    const params = new URLSearchParams({ preset });
    if (limit != null && limit > 0) {
      params.set("limit", String(limit));
    }
    const endpoint = `${API_ROUTES.LESSONS.TEST_BANK(unitNumber)}?${params.toString()}`;
    const response = await api.get<ApiResponse<PracticeQuestionApiDto[]>>(endpoint);
    return response.data.map(mapPracticeQuestionDto);
  },

  /** Random tối đa 10 câu practice đã persist trong các chương đã chọn. */
  postQuickTest: async (
    chapterIds: Array<number | string>,
  ): Promise<Question[]> => {
    const response = await api.post<ApiResponse<PracticeQuestionApiDto[]>>(
      API_ROUTES.PRACTICE.QUICK_TEST,
      { chapter_ids: chapterIds },
    );
    return response.data.map(mapPracticeQuestionDto);
  },
};
