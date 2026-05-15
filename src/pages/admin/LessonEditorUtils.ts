import type {
  LessonTestLane,
  Phrase,
  Question,
  Unit,
  Vocabulary,
} from "@/types";

export const QUESTION_TYPES: Question["type"][] = [
  "MCQ",
  "Matching",
  "FillInBlank",
  "Dictation",
  "Arrangement",
  "Speaking",
  "Scenario",
];

export const VOCAB_TYPES: Vocabulary["type"][] = [
  "Noun",
  "Verb",
  "Expression",
  "Adjective",
  "Adverb",
];

export function newQuestionId(unitId: number): string {
  return `pq-${unitId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyUnit(suggestedId: number): Unit {
  return {
    id: suggestedId,
    title: "",
    description: "",
    vocabulary: [],
    phrases: [],
    memoryBoost: { summary: "" },
    practice: [],
    videoUrl: "",
  };
}

export function defaultQuestion(unitId: number): Question {
  return {
    id: newQuestionId(unitId),
    type: "MCQ",
    prompt: "",
    answer: "",
    options: ["", ""],
    acceptableAnswers: [],
    pairs: [],
    circumstance: "",
    scenarioDescription: "",
    vnPrompt: "",
    bestAnswer: "",
  };
}

export function defaultVocabulary(): Vocabulary {
  return {
    word: "",
    phonetic: "",
    meaning: "",
    example: "",
    type: "Noun",
  };
}

export function defaultPhrase(): Phrase {
  return {
    text: "",
    translation: "",
    context: "",
    subLessonId: "",
  };
}

export function defaultQuestionForLane(
  unitId: number,
  lane: LessonTestLane,
): Question {
  const q = defaultQuestion(unitId);
  q.testLane = lane;
  switch (lane) {
    case "VOCAB_MCQ":
      q.type = "MCQ";
      break;
    case "MATCHING":
      q.type = "Matching";
      break;
    case "PHRASE_SCENARIO":
      q.type = "Scenario";
      break;
    case "FILL_ARRANGE":
      q.type = "Dictation";
      break;
    default:
      break;
  }
  return q;
}

export const LANES_ORDER: LessonTestLane[] = [
  "VOCAB_MCQ",
  "MATCHING",
  "PHRASE_SCENARIO",
  "FILL_ARRANGE",
];

export type LessonEditorScope =
  | "full"
  | "meta"
  | "vocabulary"
  | "phrases"
  | "practice";
