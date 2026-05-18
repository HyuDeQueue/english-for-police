import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "@/models/auth.model";
import type {
  EvaluationFetchMeta,
  EvaluationResponse,
  ImprovementDetailResponse,
} from "@/models/evaluation.model";
import { evaluationFacade } from "@/lib/evaluation/evaluation-facade";
import {
  defaultEvaluationPeriod,
  periodPresetDays,
} from "@/utils/evaluation-period";
import { useSonner } from "@/hooks/use-sonner";

export function useStudentEvaluation(userId: number | undefined) {
  const { notifyError } = useSonner();
  const [period, setPeriod] = useState(defaultEvaluationPeriod);
  const [summary, setSummary] = useState<EvaluationResponse | null>(null);
  const [meta, setMeta] = useState<EvaluationFetchMeta | null>(null);
  const [improvementDetail, setImprovementDetail] =
    useState<ImprovementDetailResponse | null>(null);
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number | null>(
    null,
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = useCallback((days: number) => {
    setPeriod(periodPresetDays(days));
  }, []);

  const loadSummary = useCallback(async () => {
    if (!userId) return;
    setIsLoadingSummary(true);
    setError(null);
    try {
      const result = await evaluationFacade.getSummary(userId, period);
      setSummary(result.data);
      setMeta(result.meta);
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError.message || "Không thể tải dữ liệu đánh giá học viên.";
      setError(message);
      setSummary(null);
      notifyError("Tải đánh giá thất bại", message);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [notifyError, period, userId]);

  const loadImprovementDetail = useCallback(
    async (unitNumber: number) => {
      if (!userId) return;
      setIsLoadingDetail(true);
      setSelectedUnitNumber(unitNumber);
      try {
        const result = await evaluationFacade.getImprovement(userId, {
          ...period,
          unitNumber,
        });
        setImprovementDetail(result.data);
      } catch (err) {
        const apiError = err as ApiError;
        notifyError(
          "Tải chi tiết cải thiện thất bại",
          apiError.message || "Không thể tải biểu đồ điểm theo lần nộp.",
        );
        setImprovementDetail(null);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [notifyError, period, userId],
  );

  const clearImprovementDetail = useCallback(() => {
    setSelectedUnitNumber(null);
    setImprovementDetail(null);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSummary();
    });
  }, [loadSummary]);

  return {
    period,
    setPeriod,
    applyPreset,
    summary,
    meta,
    improvementDetail,
    selectedUnitNumber,
    isLoadingSummary,
    isLoadingDetail,
    error,
    loadSummary,
    loadImprovementDetail,
    clearImprovementDetail,
  };
}
