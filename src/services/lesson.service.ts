import { API_ROUTES } from "@/api/routes";
import type {
  GrammarStructure,
  LessonTestLane,
  PhraseTemplate,
  Question,
  Unit,
} from "@/types";
import { api } from "@/utils/api-client";
import {
  normalizeLessonFromApi,
  unitToLessonApiBody,
} from "@/services/lesson-payload";
import { practiceQuestionService } from "@/services/practice-question.service";
import {
  filterQuestionsByLane,
  isLessonTestLane,
} from "@/components/practice/utils/testUtils";

interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

export const lessonService = {
  getLessons: async (): Promise<Unit[]> => {
    const response = await api.get<ApiResponse<Unit[]>>(
      API_ROUTES.LESSONS.LIST,
    );
    return response.data.map(normalizeLessonFromApi);
  },

  getLessonByUnitNumber: async (unitNumber: number): Promise<Unit> => {
    const response = await api.get<ApiResponse<Unit>>(
      API_ROUTES.LESSONS.DETAIL(unitNumber),
    );
    return normalizeLessonFromApi(response.data);
  },

  /** ADMIN + JWT: practice answers included for edit forms. */
  getLessonForAdmin: async (unitNumber: number): Promise<Unit> => {
    const response = await api.get<ApiResponse<Unit>>(
      API_ROUTES.LESSONS.DETAIL_INCLUDE_ANSWERS(unitNumber),
    );
    return normalizeLessonFromApi(response.data);
  },

  createLesson: async (unit: Unit): Promise<Unit> => {
    const response = await api.post<ApiResponse<Unit>>(
      API_ROUTES.LESSONS.LIST,
      unitToLessonApiBody(unit),
    );
    return normalizeLessonFromApi(response.data);
  },

  updateLesson: async (unitNumber: number, unit: Unit): Promise<Unit> => {
    const response = await api.put<ApiResponse<Unit>>(
      API_ROUTES.LESSONS.DETAIL(unitNumber),
      unitToLessonApiBody({ ...unit, id: unitNumber }),
    );
    return normalizeLessonFromApi(response.data);
  },

  deleteLesson: async (unitNumber: number): Promise<void> => {
    await api.delete(API_ROUTES.LESSONS.DETAIL(unitNumber));
  },

  importLessons: async (lessons: Unit[]): Promise<string> => {
    const response = await api.post<ApiResponse<string>>(
      API_ROUTES.LESSONS.IMPORT,
      lessons,
    );
    return response.data;
  },

  listGrammarStructures: async (
    unitNumber: number,
  ): Promise<GrammarStructure[]> => {
    const response = await api.get<ApiResponse<GrammarStructure[]>>(
      API_ROUTES.LESSONS.GRAMMAR_STRUCTURES(unitNumber),
    );
    return response.data;
  },

  createGrammarStructure: async (
    unitNumber: number,
    body: {
      title: string;
      summary: string;
      exampleEn?: string | null;
      exampleVi?: string | null;
      sortOrder?: number;
    },
  ): Promise<GrammarStructure> => {
    const response = await api.post<ApiResponse<GrammarStructure>>(
      API_ROUTES.LESSONS.GRAMMAR_STRUCTURES(unitNumber),
      body,
    );
    return response.data;
  },

  updateGrammarStructure: async (
    unitNumber: number,
    id: number,
    body: {
      title: string;
      summary: string;
      exampleEn?: string | null;
      exampleVi?: string | null;
      sortOrder?: number;
    },
  ): Promise<GrammarStructure> => {
    const response = await api.put<ApiResponse<GrammarStructure>>(
      API_ROUTES.LESSONS.GRAMMAR_STRUCTURE(unitNumber, id),
      body,
    );
    return response.data;
  },

  deleteGrammarStructure: async (
    unitNumber: number,
    id: number,
  ): Promise<void> => {
    await api.delete(API_ROUTES.LESSONS.GRAMMAR_STRUCTURE(unitNumber, id));
  },

  getLessonTests: async (
    unitNumber: number,
    lane?: LessonTestLane | string,
  ): Promise<Question[]> => {
    const questions = await practiceQuestionService.getQuestions({
      unitNumbers: [unitNumber],
      sources: ["practice", "vocab", "phrase"],
    });
    if (lane && isLessonTestLane(lane)) {
      return filterQuestionsByLane(questions, lane);
    }
    return questions;
  },

  listPhraseTemplates: async (
    unitNumber: number,
  ): Promise<PhraseTemplate[]> => {
    const response = await api.get<ApiResponse<PhraseTemplate[]>>(
      API_ROUTES.LESSONS.PHRASE_TEMPLATES(unitNumber),
    );
    return response.data;
  },

  createPhraseTemplate: async (
    unitNumber: number,
    body: {
      patternEn: string;
      patternVi: string;
      contextNote?: string | null;
      audioUrl?: string | null;
      sortOrder?: number;
    },
  ): Promise<PhraseTemplate> => {
    const response = await api.post<ApiResponse<PhraseTemplate>>(
      API_ROUTES.LESSONS.PHRASE_TEMPLATES(unitNumber),
      body,
    );
    return response.data;
  },

  updatePhraseTemplate: async (
    unitNumber: number,
    id: number,
    body: {
      patternEn: string;
      patternVi: string;
      contextNote?: string | null;
      audioUrl?: string | null;
      sortOrder?: number;
    },
  ): Promise<PhraseTemplate> => {
    const response = await api.put<ApiResponse<PhraseTemplate>>(
      API_ROUTES.LESSONS.PHRASE_TEMPLATE(unitNumber, id),
      body,
    );
    return response.data;
  },

  deletePhraseTemplate: async (
    unitNumber: number,
    id: number,
  ): Promise<void> => {
    await api.delete(API_ROUTES.LESSONS.PHRASE_TEMPLATE(unitNumber, id));
  },
};
