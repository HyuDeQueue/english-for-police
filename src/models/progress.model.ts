export interface QuizAnswer {
  questionId: string;
  answer: string;
}

export interface QuizAttemptRequest {
  unitNumber: number;
  answers: QuizAnswer[];
}

export interface TypeScore {
  questionType: string;
  totalQuestions: number;
  autoScoredQuestions: number;
  correctCount: number;
  rawScore: number;
  normalizedScore: number;
  reviewStatus: string;
  pendingReview: boolean;
}

export interface UnitProgress {
  unitNumber: number;
  unitTitle?: string;
  status: string;
  attemptCount: number;
  bestScore: number;
  latestScore: number;
  accuracy: number;
  startedAt: string;
  completedAt: string;
  lastAttemptAt: string;
}

export interface QuizAttemptResponse {
  score: number;
  provisionalScore: number;
  finalScore: number;
  hasPendingReview: boolean;
  correctCount: number;
  totalQuestions: number;
  typeScores: TypeScore[];
  unitProgress: UnitProgress;
}

export interface ScoreHistory {
  attemptId: number;
  unitNumber: number;
  score: number;
  finalScore: number;
  hasPendingReview: boolean;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
}

export interface TypeScoreSummary {
  questionType: string;
  attemptCount: number;
  bestProvisionalScore: number;
  latestProvisionalScore: number;
  bestFinalScore: number;
  latestFinalScore: number;
  pendingReviewCount: number;
  lastAttemptAt: string;
}

export interface TypeHistoryItem {
  attemptTypeScoreId: number;
  attemptId: number;
  unitNumber: number;
  questionType: string;
  provisionalScore: number;
  finalNormalizedScore: number;
  reviewStatus: string;
  submittedAt: string;
}

export interface ProgressOverview {
  totalUnits: number;
  completedUnits: number;
  completionPercent: number;
  averageBestScore: number;
  lastActivityAt: string;
}

export interface ProgressData {
  overview: ProgressOverview;
  units: UnitProgress[];
  scores: ScoreHistory[];
  typeScores: TypeScoreSummary[];
  typeHistory: TypeHistoryItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export type DashboardSummary = ProgressOverview;

export interface ProgressResponse<T> {
  code: string;
  data: T;
  message: string;
}
