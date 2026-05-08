import type { User } from "./user.model";

export interface StudentProgressSummary {
  userId: number;
  fullName: string;
  rank: string;
  email: string;
  completionPercentage: number;
  lastActive: string;
  role: string;
}

export interface UnitProgress {
  unitId: number;
  title: string;
  progress: number; // 0-100
  status: "locked" | "in-progress" | "completed";
  hasBadge: boolean;
}

export interface TestScore {
  testId: string;
  title: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
}

export interface StudentDossier extends User {
  rank: string;
  proficiencyScore: number;
  totalStudyTime: number;
  accuracyRate: number;
  unitProgress: UnitProgress[];
  testHistory: TestScore[];
}

export interface AdminApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

export interface AdminReportStudentSummary {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  overallProgressPercent: number;
  overallScorePercent: number;
  lastActivityAt: string;
  lastActiveLabel: string;
}

export interface AdminReportChapter {
  unitNumber: number;
  title: string;
  status: string;
  attemptCount: number;
  progressPercent: number;
  scorePercent: number;
  lastAttemptAt: string;
}

export interface AdminReportTrendWindow {
  progressDeltaPercent: number;
  scoreDeltaPercent: number;
}

export interface AdminReportStudentDashboard {
  userId: number;
  fullName: string;
  email: string;
  overallProgressPercent: number;
  overallScorePercent: number;
  lastActivityAt: string;
  chapters: AdminReportChapter[];
  trend: {
    last7Days: AdminReportTrendWindow;
    last30Days: AdminReportTrendWindow;
  };
  rank: {
    rankInCohort: number;
    percentileInCohort: number;
  };
  activity: {
    lastSeenAt: string;
    totalAttempts: number;
    attemptsLast7Days: number;
  };
  explain: string[];
}

export interface AdminReportDistributionBucket {
  label: string;
  fromPercentInclusive: number;
  toPercentExclusive: number;
  count: number;
}

export interface AdminReportDailyActiveUser {
  date: string;
  activeStudents: number;
}

export interface AdminReportOverview {
  totalStudents: number;
  activeStudents7d: number;
  avgOverallProgressPercent: number;
  avgOverallScorePercent: number;
  studentsAtRiskCount: number;
  progressDistributionBuckets: AdminReportDistributionBucket[];
  scoreDistributionBuckets: AdminReportDistributionBucket[];
  dailyActiveUsers: AdminReportDailyActiveUser[];
  topStudents: AdminReportStudentSummary[];
  atRiskStudents: AdminReportStudentSummary[];
  explain: string[];
}

export type CompareMetric = "progress" | "score";

export interface AdminReportComparePoint {
  date: string;
  value: number;
}

export interface AdminReportCompareSeries {
  userId: number;
  fullName: string;
  points: AdminReportComparePoint[];
}

export interface AdminReportChapterComparison {
  unitNumber: number;
  title: string;
  valuesByUserId: Record<string, number>;
}

export interface AdminReportCompare {
  metric: string;
  days: number;
  series: AdminReportCompareSeries[];
  chaptersComparison: AdminReportChapterComparison[];
  explain: string[];
}
