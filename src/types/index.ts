export interface Vocabulary {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  type: "Noun" | "Verb" | "Expression" | "Adjective" | "Adverb";
  audioUrl?: string;
}

export interface Phrase {
  text: string;
  translation: string;
  context: string;
  audioUrl?: string;
  realWorldExamples?: string[];
}

export interface Collocation {
  verb: string;
  noun: string;
}

export interface Question {
  id: string;
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
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  vocabulary: Vocabulary[];
  phrases: Phrase[];
  memoryBoost: {
    collocations: Collocation[];
    summary: string;
  };
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
  key: string; // word or phrase text
}

export interface DailyTask {
  date: string; // YYYY-MM-DD
  tasks: {
    id: string;
    label: string;
    completed: boolean;
  }[];
}
