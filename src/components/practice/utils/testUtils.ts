import type { Unit, Question } from "@/types";

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
      });
    });

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

    const matchingChunkSize = 4;
    for (let i = 0; i < unit.vocabulary.length; i += matchingChunkSize) {
      const matchingItems = unit.vocabulary.slice(i, i + matchingChunkSize);
      if (matchingItems.length >= 3) {
        pool.push({
          id: `gk-match-${unit.id}-${i}`,
          type: "Matching",
          prompt: `Ghép từ và nghĩa tương ứng`,
          pairs: matchingItems.map((item) => ({
            left: item.word,
            right: item.meaning,
          })),
          answer: matchingItems.map((item) => `${item.word}:${item.meaning}`),
        });
      }
    }
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

  const sections: Section[] = [];

  const vocabIds = questions
    .filter((q) => q.sourceCategory === "vocab")
    .map((q) => q.id);
  if (vocabIds.length > 0) {
    sections.push({
      title: "Trắc nghiệm từ vựng",
      description:
        "Kiểm tra khả năng nhận diện và ghi nhớ từ vựng cảnh sát chuyên ngành.",
      questionIds: shuffleArray([...vocabIds]),
    });
  }

  const patternIds = questions
    .filter(
      (q) =>
        q.sourceCategory === "phrase" ||
        q.type === "Scenario" ||
        (q.sourceCategory === "practice" &&
          !["Matching", "Dictation", "Arrangement", "Scenario"].includes(
            q.type,
          )),
    )
    .map((q) => q.id);
  if (patternIds.length > 0) {
    sections.push({
      title: "Mẫu câu & tình huống",
      description:
        "Ứng dụng các mẫu câu vào các tình huống thực tế của chiến sĩ cảnh sát.",
      questionIds: shuffleArray([...patternIds]),
    });
  }

  const matchingIds = questions
    .filter((q) => q.type === "Matching")
    .map((q) => q.id);
  if (matchingIds.length > 0) {
    sections.push({
      title: "Ghép từ - nghĩa",
      description:
        "Kết nối chính xác giữa thuật ngữ và ý nghĩa tiếng Việt tương ứng.",
      questionIds: shuffleArray([...matchingIds]),
    });
  }

  const writingIds = questions
    .filter((q) => q.type === "Dictation" || q.type === "Arrangement")
    .map((q) => q.id);
  if (writingIds.length > 0) {
    sections.push({
      title: "Điền từ & sắp xếp câu",
      description:
        "Thực hành viết lại và sắp xếp các câu tiếng Anh hoàn chỉnh.",
      questionIds: shuffleArray([...writingIds]),
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
