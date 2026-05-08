export interface DistributionBucket {
  label: string;
  fromPercentInclusive: number;
  toPercentExclusive: number;
  count: number;
}

export interface DailyActiveUsersPoint {
  date: string; // ISO date
  activeStudents: number;
}

export interface StudentProgressSummaryApi {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  overallProgressPercent: number;
  overallScorePercent: number;
  lastActivityAt: string | null;
  lastActiveLabel: string;
}

export interface DashboardOverviewApi {
  totalStudents: number;
  activeStudents7d: number;
  avgOverallProgressPercent: number;
  avgOverallScorePercent: number;
  studentsAtRiskCount: number;
  progressDistributionBuckets: DistributionBucket[];
  scoreDistributionBuckets: DistributionBucket[];
  dailyActiveUsers: DailyActiveUsersPoint[];
  topStudents: StudentProgressSummaryApi[];
  atRiskStudents: StudentProgressSummaryApi[];
  explain: string[];
}

export interface ChapterKpi {
  unitNumber: number;
  title: string;
  status: string;
  attemptCount: number;
  progressPercent: number;
  scorePercent: number;
  lastAttemptAt: string | null;
}

export interface TrendDelta {
  progressDeltaPercent: number;
  scoreDeltaPercent: number;
}

export interface StudentTrendSummary {
  last7Days: TrendDelta;
  last30Days: TrendDelta;
}

export interface StudentRank {
  rankInCohort: number;
  percentileInCohort: number;
}

export interface StudentActivity {
  lastSeenAt: string | null;
  totalAttempts: number;
  attemptsLast7Days: number;
}

export interface StudentDashboardApi {
  userId: number;
  fullName: string;
  email: string;
  overallProgressPercent: number;
  overallScorePercent: number;
  lastActivityAt: string | null;
  chapters: ChapterKpi[];
  trend: StudentTrendSummary;
  rank: StudentRank;
  activity: StudentActivity;
  explain: string[];
}

export interface TrendPoint {
  date: string; // ISO date
  value: number | null;
}

export interface StudentTrendSeries {
  userId: number;
  fullName: string;
  points: TrendPoint[];
}

export interface ChapterComparison {
  unitNumber: number;
  title: string;
  valuesByUserId: Record<string, number>;
}

export interface CompareDashboardApi {
  metric: "progress" | "score" | string;
  days: number;
  series: StudentTrendSeries[];
  chaptersComparison: ChapterComparison[];
  explain: string[];
}

