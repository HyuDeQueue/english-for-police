import { API_ROUTES } from "@/api/routes";
import type { Unit } from "@/types";
import { api } from "@/utils/api-client";
import { normalizeLessonFromApi, unitToLessonApiBody } from "@/services/lesson-payload";

interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

export const lessonService = {
  getLessons: async (): Promise<Unit[]> => {
    const response = await api.get<ApiResponse<Unit[]>>(API_ROUTES.LESSONS.LIST);
    return response.data;
  },

  getLessonByUnitNumber: async (unitNumber: number): Promise<Unit> => {
    const response = await api.get<ApiResponse<Unit>>(
      API_ROUTES.LESSONS.DETAIL(unitNumber),
    );
    return response.data;
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
};
