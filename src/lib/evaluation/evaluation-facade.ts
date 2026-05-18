import type { ApiError } from "@/models/auth.model";
import type {
  EvaluationFetchMeta,
  EvaluationQueryParams,
  EvaluationResponse,
  ImprovementDetailResponse,
  ImprovementQueryParams,
} from "@/models/evaluation.model";
import { evaluationService } from "@/services/evaluation.service";
import {
  fetchLegacyEvaluationSummary,
  fetchLegacyImprovementDetail,
} from "@/lib/evaluation/legacy.adapter";

const FORCE_LEGACY =
  import.meta.env.VITE_EVALUATION_API_FALLBACK === "true";

function shouldFallbackToLegacy(error: unknown): boolean {
  if (FORCE_LEGACY) return true;
  const apiError = error as ApiError;
  const status = apiError?.status;
  if (status === 404 || status === 501 || status === 502 || status === 503) {
    return true;
  }
  const message = (apiError?.message ?? "").toLowerCase();
  return (
    message.includes("not found") ||
    message.includes("no static resource") ||
    message.includes("evaluation")
  );
}

export const evaluationFacade = {
  async getSummary(
    userId: number,
    params: EvaluationQueryParams,
  ): Promise<{ data: EvaluationResponse; meta: EvaluationFetchMeta }> {
    if (FORCE_LEGACY) {
      return {
        data: await fetchLegacyEvaluationSummary(userId, params),
        meta: { source: "legacy-adapter" },
      };
    }

    try {
      const data = await evaluationService.getStudentEvaluation(userId, params);
      return { data, meta: { source: "evaluation-api" } };
    } catch (error) {
      if (!shouldFallbackToLegacy(error)) throw error;
      return {
        data: await fetchLegacyEvaluationSummary(userId, params),
        meta: { source: "legacy-adapter" },
      };
    }
  },

  async getImprovement(
    userId: number,
    params: ImprovementQueryParams,
  ): Promise<{ data: ImprovementDetailResponse; meta: EvaluationFetchMeta }> {
    if (FORCE_LEGACY) {
      return {
        data: await fetchLegacyImprovementDetail(userId, params),
        meta: { source: "legacy-adapter" },
      };
    }

    try {
      const data = await evaluationService.getStudentImprovement(userId, params);
      return { data, meta: { source: "evaluation-api" } };
    } catch (error) {
      if (!shouldFallbackToLegacy(error)) throw error;
      return {
        data: await fetchLegacyImprovementDetail(userId, params),
        meta: { source: "legacy-adapter" },
      };
    }
  },
};
