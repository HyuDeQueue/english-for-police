export interface Vocabulary {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  type: "Noun" | "Verb" | "Expression" | "Adjective" | "Adverb";
  audioUrl?: string;
  /** Tiểu mục (vd. 1.1, 1.2) — đồng bộ seed / API lesson. */
  subLessonId?: string | null;
}

export interface Phrase {
  text: string;
  translation: string;
  context: string;
  audioUrl?: string;
  realWorldExamples?: string[];
  /** Tiểu mục mẫu câu (vd. 2.1, 2.2) — dùng cho menu & lọc luyện tập. */
  subLessonId?: string | null;
}


export type LessonTestLane =
  | "VOCAB_MCQ"
  | "MATCHING"
  | "PHRASE_SCENARIO"
  | "FILL_ARRANGE";

export interface GrammarStructure {
  id: number;
  unitNumber: number;
  title: string;
  summary: string;
  exampleEn?: string | null;
  exampleVi?: string | null;
  sortOrder: number;
}

export interface Question {
  id: string;
  backendQuestionId?: string;
  backendUnitNumber?: number;
  sourceCategory?: "vocab" | "phrase" | "practice";
  /** When set, drives "Luyện tập" section grouping on the client. */
  testLane?: LessonTestLane | null;
  type:
    | "MCQ"
    | "Matching"
    | "FillInBlank"
    | "Dictation"
    | "Arrangement"
    | "Speaking"
    | "Scenario";
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
  /** Gắn câu luyện tập persisted với tiểu mục (vd. 2.1). */
  subLessonId?: string | null;
}

export interface MemoryBoost {
  summary: string;
  /** Trường OpenAPI; FE có thể bỏ qua nếu không dùng UI collocation. */
  collocations?: { verb: string; noun: string }[];
}

export interface PhraseTemplate {
  id: number;
  unitNumber: number;
  patternEn: string;
  patternVi: string;
  contextNote?: string | null;
  audioUrl?: string | null;
  sortOrder: number;
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  vocabulary: Vocabulary[];
  phrases: Phrase[];
  memoryBoost: MemoryBoost;
  practice: Question[];
  videoUrl?: string;
}

export interface UserProgress {
  completedUnits: number[];
  scores: Record<number, number>;
}

export interface FlaggedItem {
  unitId: number;
  type: "vocabulary" | "phrase";
  key: string;
  data?: unknown;
}

export interface DailyTask {
  date: string;
  tasks: {
    id: string;
    label: string;
    description?: string;
    navigatePath?: string;
    completed: boolean;
    current: number;
    target: number;
  }[];
}

export type FlashcardStatus = "unseen" | "known" | "review";
