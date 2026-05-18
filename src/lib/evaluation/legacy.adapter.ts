import { reportsService } from "@/services/reports.service";
import { progressService } from "@/services/progress.service";
import type {
  EvaluationResponse,
  ImprovementDetailResponse,
  EvaluationQueryParams,
  ImprovementQueryParams,
} from "@/models/evaluation.model";
import type { ScoreHistory } from "@/models/progress.model";
import {
  defaultEvaluationPeriod,
  isDateInInclusiveRange,
} from "@/utils/evaluation-period";
import {
  buildImprovementUnits,
  computeOverallDeltaPercent,
  toAttemptScorePoints,
  type ScoreAttemptInput,
} from "@/utils/evaluation-calculations";

const LEGACY_EXPLAIN_PREFIX =
  "[Dữ liệu ước lượng từ API cũ] Một số chỉ số Tham gia có thể khác so với API đánh giá chính thức.";

function mapScoresToAttempts(
  scores: ScoreHistory[],
  from: string,
  to: string,
): ScoreAttemptInput[] {
  return scores
    .filter((s) => isDateInInclusiveRange(s.submittedAt, from, to))
    .map((s) => ({
      unitNumber: s.unitNumber,
      unitTitle: null,
      attemptId: s.attemptId,
      score: s.score,
      finalScore: s.hasPendingReview ? null : s.finalScore,
      submittedAt: s.submittedAt,
    }));
}

function buildParticipationFromDashboard(
  dashboard: Awaited<ReturnType<typeof reportsService.getStudentDashboard>>,
  period: { from: string; to: string },
  totalAttemptsInPeriod: number,
  distinctUnitsWithAttempts: number,
) {
  const chapters = dashboard.chapters ?? [];
  const unitsCompleted = chapters.filter(
    (c) => c.status?.toLowerCase() === "completed",
  ).length;
  const unitsInProgress = chapters.filter((c) => {
    const status = c.status?.toLowerCase() ?? "";
    return status === "in_progress" || status === "in-progress";
  }).length;

  const retryCount = Math.max(
    0,
    totalAttemptsInPeriod - distinctUnitsWithAttempts,
  );

  return {
    activeDays: dashboard.activity.attemptsLast7Days > 0 ? 1 : 0,
    activityEventSum: dashboard.activity.totalAttempts,
    unitsCompleted,
    unitsInProgress,
    totalAttempts: totalAttemptsInPeriod || dashboard.activity.totalAttempts,
    retryCount,
    period,
  };
}

export async function fetchLegacyEvaluationSummary(
  userId: number,
  params: EvaluationQueryParams,
): Promise<EvaluationResponse> {
  const defaults = defaultEvaluationPeriod();
  const from = params.from ?? defaults.from;
  const to = params.to ?? defaults.to;
  const period = { from, to };

  const dashboard = await reportsService.getStudentDashboard(userId);

  let scoreAttempts: ScoreAttemptInput[] = [];
  try {
    const progress = await progressService.getProgress({
      userId,
      view: "scores",
      page: 0,
      size: 500,
    });
    scoreAttempts = mapScoresToAttempts(progress.scores ?? [], from, to);
    for (const chapter of dashboard.chapters) {
      for (const attempt of scoreAttempts) {
        if (attempt.unitNumber === chapter.unitNumber && !attempt.unitTitle) {
          attempt.unitTitle = chapter.title;
        }
      }
    }
  } catch {
    scoreAttempts = [];
  }

  const unitTitles = new Map<number, string | null>();
  for (const chapter of dashboard.chapters) {
    unitTitles.set(chapter.unitNumber, chapter.title);
  }
  for (const attempt of scoreAttempts) {
    if (attempt.unitTitle) unitTitles.set(attempt.unitNumber, attempt.unitTitle);
  }

  const units = buildImprovementUnits(scoreAttempts, unitTitles);
  const distinctUnits = new Set(scoreAttempts.map((a) => a.unitNumber)).size;

  return {
    userId: dashboard.userId,
    fullName: dashboard.fullName,
    period,
    participation: buildParticipationFromDashboard(
      dashboard,
      period,
      scoreAttempts.length,
      distinctUnits,
    ),
    improvement: {
      overallDeltaPercent: computeOverallDeltaPercent(units),
      units,
    },
    explain: [
      LEGACY_EXPLAIN_PREFIX,
      "Tham gia: activeDays/activityEventSum được ước lượng từ dashboard reports + progress.",
      "Cải thiện: tính từ progress?view=scores trong kỳ from/to.",
      ...(dashboard.explain ?? []),
    ],
  };
}

export async function fetchLegacyImprovementDetail(
  userId: number,
  params: ImprovementQueryParams,
): Promise<ImprovementDetailResponse> {
  const summary = await fetchLegacyEvaluationSummary(userId, params);
  const from = params.from ?? summary.period.from;
  const to = params.to ?? summary.period.to;

  let scoreAttempts: ScoreAttemptInput[] = [];
  try {
    const progress = await progressService.getProgress({
      userId,
      view: "scores",
      page: 0,
      size: 500,
    });
    scoreAttempts = mapScoresToAttempts(progress.scores ?? [], from, to);
  } catch {
    scoreAttempts = [];
  }

  const unitTitles = new Map<number, string | null>();
  for (const unit of summary.improvement.units) {
    unitTitles.set(unit.unitNumber, unit.unitTitle);
  }

  const filteredUnits = params.unitNumber
    ? summary.improvement.units.filter(
        (u) => u.unitNumber === params.unitNumber,
      )
    : summary.improvement.units;

  const units = filteredUnits.map((unitSummary) => {
    const attempts = scoreAttempts.filter(
      (a) => a.unitNumber === unitSummary.unitNumber,
    );
    return {
      summary: unitSummary,
      attemptScores: toAttemptScorePoints(attempts),
    };
  });

  if (params.unitNumber && units.length === 0) {
    const empty = buildImprovementUnits([], unitTitles).find(
      (u) => u.unitNumber === params.unitNumber,
    );
    units.push({
      summary: empty ?? {
        unitNumber: params.unitNumber,
        unitTitle: unitTitles.get(params.unitNumber) ?? null,
        attemptCount: 0,
        firstScore: null,
        lastScore: null,
        bestScore: null,
        deltaScore: null,
        trendDirection: "INSUFFICIENT_DATA",
      },
      attemptScores: [],
    });
  }

  return {
    userId: summary.userId,
    fullName: summary.fullName,
    period: summary.period,
    units,
    explain: summary.explain,
  };
}
