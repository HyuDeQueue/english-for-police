import { API_ROUTES } from "@/api/routes";
import { api } from "@/utils/api-client";
import type { Question } from "@/types";

interface PracticeQuestionApiDto {
  unitNumber: number;
  id: string;
  sourceCategory: "vocab" | "phrase" | "practice";
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
  pairs?: { left: string; right: string }[];
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

    const endpoint = `${API_ROUTES.PRACTICE.QUESTIONS}?${params.toString()}`;
    const response = await api.get<ApiResponse<PracticeQuestionApiDto[]>>(endpoint);
    return response.data.map((item) => ({
      id: item.id,
      backendQuestionId: item.id,
      backendUnitNumber: item.unitNumber,
      sourceCategory: item.sourceCategory,
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
      pairs: item.pairs,
    }));
  },
};
