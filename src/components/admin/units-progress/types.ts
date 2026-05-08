import type {
  ChapterKpi,
  StudentProgressSummaryApi,
} from "@/models/reports.model";

export interface StudentChapterProgress {
  student: StudentProgressSummaryApi;
  chapter: ChapterKpi;
}

export interface UnitGroupedData {
  unitNumber: number;
  title: string;
  students: StudentChapterProgress[];
  avgProgress: number;
  avgScore: number;
  completedCount: number;
}

export interface AggregateStats {
  totalStudents: number;
  totalChapters: number;
  completedChapters: number;
  avgProgress: number;
  avgScore: number;
  inProgressCount: number;
}

export interface UnitAverageProgress {
  unitNumber: number;
  title: string;
  avgProgress: number;
  avgScore: number;
  avgScoreOnTen: number;
}
