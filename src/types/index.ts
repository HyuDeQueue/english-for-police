export interface Vocabulary {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  type: "Noun" | "Verb" | "Expression" | "Adjective" | "Adverb";
  audioUrl?: string; // Optional if we use TTS
}

export interface Phrase {
  text: string;
  translation: string;
  context: string;
  audioUrl?: string;
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
    | "Speaking";
  prompt: string;
  circumstance?: string; // Scenario context shown before answering
  options?: string[]; // For MCQ
  answer: string | string[]; // Single string or array for matching/arrangement
  vnPrompt?: string; // For translation/speaking
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
}

export interface UserProgress {
  completedUnits: number[];
  scores: Record<number, number>;
}
