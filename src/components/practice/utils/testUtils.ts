import type { LessonTestLane, Unit, Question } from "@/types";

/** Sidebar / route labels → API lane (must match SECTION_META titles). */
export const PRACTICE_MENU_LABEL_TO_LANE: Record<string, LessonTestLane> = {
  "Trắc nghiệm từ vựng": "VOCAB_MCQ",
  "Ghép từ - nghĩa": "MATCHING",
  "Mẫu câu & tình huống": "PHRASE_SCENARIO",
  "Điền từ & sắp xếp câu": "FILL_ARRANGE",
};

export function isLessonTestLane(
  value: string | null,
): value is LessonTestLane {
  return (
    value === "VOCAB_MCQ" ||
    value === "MATCHING" ||
    value === "PHRASE_SCENARIO" ||
    value === "FILL_ARRANGE"
  );
}

const LANE_ORDER: LessonTestLane[] = [
  "VOCAB_MCQ",
  "PHRASE_SCENARIO",
  "MATCHING",
  "FILL_ARRANGE",
];

export const SECTION_META: Record<
  LessonTestLane,
  { title: string; description: string }
> = {
  VOCAB_MCQ: {
    title: "Trắc nghiệm từ vựng",
    description:
      "Kiểm tra khả năng nhận diện và ghi nhớ từ vựng cảnh sát chuyên ngành.",
  },
  PHRASE_SCENARIO: {
    title: "Mẫu câu & tình huống",
    description:
      "Ứng dụng các mẫu câu vào các tình huống thực tế của chiến sĩ cảnh sát.",
  },
  MATCHING: {
    title: "Ghép từ - nghĩa",
    description:
      "Kết nối chính xác giữa thuật ngữ và ý nghĩa tiếng Việt tương ứng.",
  },
  FILL_ARRANGE: {
    title: "Điền từ & sắp xếp câu",
    description: "Thực hành viết lại và sắp xếp các câu tiếng Anh hoàn chỉnh.",
  },
};

function isKnownLane(lane: Question["testLane"]): lane is LessonTestLane {
  return (
    lane === "VOCAB_MCQ" ||
    lane === "MATCHING" ||
    lane === "PHRASE_SCENARIO" ||
    lane === "FILL_ARRANGE"
  );
}

function legacyLane(q: Question): LessonTestLane {
  if (q.sourceCategory === "vocab") return "VOCAB_MCQ";
  if (q.type === "Matching") return "MATCHING";
  if (q.type === "Dictation" || q.type === "Arrangement") return "FILL_ARRANGE";
  if (
    q.sourceCategory === "phrase" ||
    q.type === "Scenario" ||
    (q.sourceCategory === "practice" &&
      !["Matching", "Dictation", "Arrangement", "Scenario"].includes(q.type))
  ) {
    return "PHRASE_SCENARIO";
  }
  return "PHRASE_SCENARIO";
}

export function resolvedLane(q: Question): LessonTestLane {
  if (isKnownLane(q.testLane)) {
    return q.testLane;
  }
  return legacyLane(q);
}

/** When a single practice mode is open (?lane=), only keep questions for that lane. */
export function filterQuestionsByLane(
  questions: Question[],
  lane: LessonTestLane | null,
): Question[] {
  if (!lane) return questions;
  return questions.filter((q) => resolvedLane(q) === lane);
}

/**
 * TrainingGround: round-robin pick across lanes so Dictation/Arrangement are not
 * crowded out by random MCQ when the API returns a mixed bank.
 */
export function pickBalancedPracticeSet(
  questions: Question[],
  limit: number,
): Question[] {
  if (questions.length === 0 || limit <= 0) return [];
  if (questions.length <= limit) return shuffleArray(questions);

  const buckets: Record<LessonTestLane, Question[]> = {
    VOCAB_MCQ: [],
    PHRASE_SCENARIO: [],
    MATCHING: [],
    FILL_ARRANGE: [],
  };
  for (const q of questions) {
    buckets[resolvedLane(q)].push(q);
  }
  for (const lane of LANE_ORDER) {
    buckets[lane] = shuffleArray(buckets[lane]);
  }

  const out: Question[] = [];
  let round = 0;
  while (out.length < limit) {
    let anyAdded = false;
    for (const lane of LANE_ORDER) {
      if (out.length >= limit) break;
      const q = buckets[lane][round];
      if (q) {
        out.push(q);
        anyAdded = true;
      }
    }
    if (!anyAdded) break;
    round += 1;
  }

  if (out.length < limit) {
    const taken = new Set(out.map((q) => q.id));
    const rest = shuffleArray(questions.filter((q) => !taken.has(q.id)));
    for (const q of rest) {
      if (out.length >= limit) break;
      out.push(q);
    }
  }

  return out.slice(0, limit);
}

export type MatchingPair = NonNullable<Question["pairs"]>[number];

export interface Section {
  title: string;
  description: string;
  questionIds: string[];
}

export type TestMode = "type" | "bank";

export type SectionResult = {
  score: number;
  correctCount: number;
  total: number;
  submitted: boolean;
};

export const QUESTIONS_PER_PAGE = 20;

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function isMcqOrScenario(q: Question): boolean {
  return (
    (q.type === "MCQ" || q.type === "Scenario") &&
    Array.isArray(q.options) &&
    q.options.length > 0
  );
}

function diversifiedShuffleMcqOptions(
  q: Question,
  avoidCorrectIndex: number | null,
): Question {
  if (!isMcqOrScenario(q)) return q;
  const correct = q.answer;
  if (typeof correct !== "string") return q;
  const opts = q.options!;
  if (!opts.includes(correct)) return q;

  for (let attempt = 0; attempt < 48; attempt++) {
    const shuffled = shuffleArray([...opts]);
    const idx = shuffled.indexOf(correct);
    if (
      avoidCorrectIndex === null ||
      idx !== avoidCorrectIndex ||
      opts.length <= 1
    ) {
      return { ...q, options: shuffled };
    }
  }
  return { ...q, options: shuffleArray([...opts]) };
}

export function preparePracticeQuestions(questions: Question[]): Question[] {
  let prevCorrectIndex: number | null = null;
  return questions.map((q) => {
    if (
      isMcqOrScenario(q) &&
      typeof q.answer === "string" &&
      q.options!.includes(q.answer)
    ) {
      const next = diversifiedShuffleMcqOptions(q, prevCorrectIndex);
      prevCorrectIndex = next.options!.indexOf(next.answer as string);
      return next;
    }
    prevCorrectIndex = null;
    return q;
  });
}

export function preparePracticeQuestionsForSections(
  questions: Question[],
  sections: Section[],
): Question[] {
  const byId = new Map(questions.map((q) => [q.id, q]));
  let prevCorrectIndex: number | null = null;

  for (const section of sections) {
    for (const id of section.questionIds) {
      const q = byId.get(id);
      if (!q) continue;
      if (
        isMcqOrScenario(q) &&
        typeof q.answer === "string" &&
        q.options!.includes(q.answer)
      ) {
        const next = diversifiedShuffleMcqOptions(q, prevCorrectIndex);
        byId.set(id, next);
        prevCorrectIndex = next.options!.indexOf(next.answer as string);
      } else {
        prevCorrectIndex = null;
      }
    }
  }

  return questions.map((q) => byId.get(q.id) ?? q);
}

export function extractUnitId(questionId: string): number | null {
  const match = questionId.match(/-(\d+)-/);
  return match ? Number(match[1]) : null;
}

export function generateGeneralQuestions(lessons: Unit[]): Question[] {
  const pool: Question[] = [];

  lessons.forEach((unit) => {
    unit.vocabulary.forEach((vocab, idx) => {
      const wrongOptions = shuffleArray(
        unit.vocabulary
          .filter((v) => v.word !== vocab.word)
          .slice(0, 3)
          .map((v) => v.meaning),
      );

      pool.push({
        id: `gk-vocab-${unit.id}-${idx}`,
        type: "MCQ",
        prompt: `"${vocab.word}" nghĩa là gì?`,
        options: shuffleArray([vocab.meaning, ...wrongOptions]),
        answer: vocab.meaning,
        sourceCategory: "vocab",
        testLane: "VOCAB_MCQ",
      });

      const wrongOptionsEn = shuffleArray(
        unit.vocabulary
          .filter((v) => v.word !== vocab.word)
          .slice(0, 3)
          .map((v) => v.word),
      );

      pool.push({
        id: `gk-vocab-vi-en-${unit.id}-${idx}`,
        type: "MCQ",
        prompt: `Từ nào có nghĩa là "${vocab.meaning}"?`,
        options: shuffleArray([vocab.word, ...wrongOptionsEn]),
        answer: vocab.word,
        sourceCategory: "practice",
        testLane: "VOCAB_MCQ",
      });
    });

    // Add Matching questions for vocabulary in groups of 4
    for (let i = 0; i < unit.vocabulary.length; i += 4) {
      const group = unit.vocabulary.slice(i, i + 4);
      if (group.length < 2) continue;

      const pairs = group.map((v) => ({
        left: v.word,
        right: v.meaning,
      }));

      pool.push({
        id: `gk-vocab-match-${unit.id}-${i}`,
        type: "Matching",
        prompt: "Ghép từ vựng với nghĩa tương ứng",
        pairs,
        answer: pairs.map((p) => `${p.left}:${p.right}`),
        testLane: "MATCHING",
        sourceCategory: "practice",
      });
    }

    unit.phrases.forEach((phrase, idx) => {
      const wrongOptions = shuffleArray(
        unit.phrases
          .filter((p) => p.text !== phrase.text)
          .slice(0, 3)
          .map((p) => p.translation),
      );

      pool.push({
        id: `gk-phrase-mcq-${unit.id}-${idx}`,
        type: "MCQ",
        prompt: `Chọn nghĩa đúng cho câu: "${phrase.text}"`,
        options: shuffleArray([phrase.translation, ...wrongOptions]),
        answer: phrase.translation,
      });
    });

    unit.phrases.forEach((phrase, idx) => {
      pool.push({
        id: `gk-phrase-dictation-${unit.id}-${idx}`,
        type: "Dictation",
        prompt: `Dịch sang tiếng Anh: "${phrase.translation}"`,
        vnPrompt: phrase.translation,
        answer: phrase.text,
      });
    });

    unit.practice.forEach((question, idx) => {
      pool.push({
        ...question,
        id: `gk-practice-${unit.id}-${idx}-${question.id}`,
        backendQuestionId: question.id,
        backendUnitNumber: unit.id,
      });
    });
  });

  return shuffleArray(pool);
}

export function buildSections(
  questions: Question[],
  mode: TestMode,
  bankLimit: number = 40,
): Section[] {
  if (mode === "bank") {
    const shuffled = shuffleArray(questions);
    const batch = shuffled.slice(0, Math.min(bankLimit, shuffled.length));

    return [
      {
        title: "Bài test tổng hợp",
        description:
          "Trộn câu hỏi ngẫu nhiên từ nhiều chương và nhiều dạng khác nhau.",
        questionIds: batch.map((item) => item.id),
      },
    ];
  }

  const buckets: Record<LessonTestLane, string[]> = {
    VOCAB_MCQ: [],
    PHRASE_SCENARIO: [],
    MATCHING: [],
    FILL_ARRANGE: [],
  };

  for (const q of questions) {
    buckets[resolvedLane(q)].push(q.id);
  }

  const sections: Section[] = [];
  for (const lane of LANE_ORDER) {
    const ids = buckets[lane];
    if (ids.length === 0) continue;
    const meta = SECTION_META[lane];
    sections.push({
      title: meta.title,
      description: meta.description,
      questionIds: shuffleArray([...ids]),
    });
  }

  return sections;
}

export function extractQuestion(
  questionId: string,
  fallbackUnitNumber?: number,
) {
  const mappedPatterns: Array<{
    regex: RegExp;
    toQuestionId: (match: RegExpMatchArray) => string;
  }> = [
    {
      regex: /^gk-practice-(\d+)-\d+-(.+)$/,
      toQuestionId: (m) => m[2],
    },
    {
      regex: /^qt_extra_(\d+)_\d+_(.+)$/,
      toQuestionId: (m) => m[2],
    },
    {
      regex: /^tg-extra-(\d+)-\d+-(.+)$/,
      toQuestionId: (m) => m[2],
    },
    {
      regex: /^qt_(vocab|phrase_recog|phrase_write)_(\d+)_(.+)$/,
      toQuestionId: () => questionId,
    },
    {
      regex: /^qt_match_(\d+)$/,
      toQuestionId: () => questionId,
    },
    {
      regex: /^gk-(vocab|phrase-mcq|phrase-dictation|match)-(\d+)-\d+$/,
      toQuestionId: () => questionId,
    },
  ];

  for (const { regex, toQuestionId } of mappedPatterns) {
    const match = questionId.match(regex);
    if (!match) continue;

    const unitCandidate =
      match[1] && /^\d+$/.test(match[1])
        ? Number(match[1])
        : match[2] && /^\d+$/.test(match[2])
          ? Number(match[2])
          : fallbackUnitNumber;

    if (unitCandidate === undefined || Number.isNaN(unitCandidate)) {
      return null;
    }

    return {
      unitNumber: unitCandidate,
      questionId: toQuestionId(match),
    };
  }

  // Training-ground generated IDs (e.g. vocab-0, phrase-recog-0) don't include unit.
  if (fallbackUnitNumber !== undefined) {
    return {
      unitNumber: fallbackUnitNumber,
      questionId,
    };
  }

  return null;
}

export function serializeAnswerForApi(answer: unknown): string {
  // Keep legacy transport format for backend compatibility.
  // This preserves previous behavior used before refactor:
  // - arrays => comma-joined by JS String()
  // - objects => "[object Object]"
  return String(answer ?? "");
}

export function mapAnswersToBackendPayload(
  questions: Question[],
  combinedAnswers: Record<string, unknown>,
) {
  const questionById = new Map(questions.map((q) => [q.id, q]));
  return Object.entries(combinedAnswers)
    .map(([clientQuestionId, answer]) => {
      const question = questionById.get(clientQuestionId);
      if (!question?.backendQuestionId || question.backendUnitNumber == null) {
        return null;
      }
      return {
        unitNumber: question.backendUnitNumber,
        questionId: question.backendQuestionId,
        answer: serializeAnswerForApi(answer),
      };
    })
    .filter((item): item is NonNullable<typeof item> => !!item);
}

export type VocabDrillMode = "en-vi" | "vi-en" | "matching";

const VIETNAMESE_REGEX =
  /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;

function isViEnMcq(q: Question): boolean {
  if (q.type !== "MCQ" || q.sourceCategory !== "practice") return false;
  if (!Array.isArray(q.options) || q.options.length === 0) return false;
  const promptHasVi =
    VIETNAMESE_REGEX.test(q.prompt) ||
    (q.vnPrompt != null && String(q.vnPrompt).length > 0);
  const optsLookEnglish = q.options.every(
    (o) => typeof o === "string" && !VIETNAMESE_REGEX.test(o),
  );
  return promptHasVi && optsLookEnglish;
}

/** Lọc 3 dạng luyện từ vựng theo spec API (vocab / practice + FE). */
export function filterVocabDrillQuestions(
  questions: Question[],
  mode: VocabDrillMode,
): Question[] {
  if (mode === "en-vi") {
    return questions.filter((q) => q.sourceCategory === "vocab");
  }
  if (mode === "vi-en") {
    return questions.filter(isViEnMcq);
  }
  return questions.filter(
    (q) =>
      q.type === "Matching" &&
      Array.isArray(q.pairs) &&
      q.pairs.length > 0 &&
      (q.sourceCategory === "practice" || q.sourceCategory === "vocab"),
  );
}

export function sortSubLessonIds(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const [am, as] = a.split(".").map(Number);
    const [bm, bs] = b.split(".").map(Number);
    if (Number.isNaN(am) || Number.isNaN(as)) return a.localeCompare(b);
    if (Number.isNaN(bm) || Number.isNaN(bs)) return a.localeCompare(b);
    if (am !== bm) return am - bm;
    return as - bs;
  });
}

/** Tiểu mục từ phrases[].subLessonId và practice[].subLessonId (đã seed). */
export function collectSubLessonIdsFromUnit(unit: Unit): string[] {
  const set = new Set<string>();
  for (const p of unit.phrases) {
    const id = p.subLessonId?.trim();
    if (id) set.add(id);
  }
  for (const q of unit.practice) {
    const id = q.subLessonId?.trim();
    if (id) set.add(id);
  }
  return sortSubLessonIds([...set]);
}

export function filterQuestionsBySubLesson(
  questions: Question[],
  subLessonId: string | null,
): Question[] {
  if (!subLessonId?.trim()) return questions;
  const want = subLessonId.trim();
  return questions.filter((q) => (q.subLessonId ?? "").trim() === want);
}

export const SUB_LESSON_NAV_LABELS: Record<string, string> = {
  "1.1": "Tiếp xúc ban đầu",
  "1.2": "Giấy tờ & xác minh",
  "1.3": "Thông tin cá nhân",
  "2.1": "Tiếp cận & chào hỏi",
  "2.2": "Thẩm quyền & pháp luật",
  "2.3": "Hỗ trợ chung",
  "2.4": "Trấn an & hướng dẫn",
};

export function phraseSubLessonLabel(
  subId: string,
  sample?: { context?: string },
): string {
  return (
    SUB_LESSON_NAV_LABELS[subId] ??
    (sample?.context ? `${subId} · ${sample.context}` : `Phần ${subId}`)
  );
}

export type PhraseSubNavItem = {
  id: string;
  title: string;
  label: string;
};

/** Tiểu mục mẫu câu cho mục lục / dropdown (từ subLessonId hoặc legacy theo unit). */
export function getPhraseSubNavItems(unit: Unit): PhraseSubNavItem[] {
  const subIds = collectSubLessonIdsFromUnit(unit);
  if (subIds.length > 0) {
    return subIds.map((id) => {
      const title = phraseSubLessonLabel(
        id,
        unit.phrases.find((p) => (p.subLessonId ?? "").trim() === id),
      );
      return { id, title, label: `${id} — ${title}` };
    });
  }

  const legacyIds = sortSubLessonIds(
    Object.keys(SUB_LESSON_NAV_LABELS).filter((k) =>
      k.startsWith(`${unit.id}.`),
    ),
  );
  if (legacyIds.length > 0 && unit.phrases.length > 0) {
    return legacyIds.map((id) => {
      const title = SUB_LESSON_NAV_LABELS[id] ?? id;
      return { id, title, label: `${id} — ${title}` };
    });
  }

  return [];
}
