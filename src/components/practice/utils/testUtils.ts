import type { Unit, Question } from "@/types";

export type MatchingPair = NonNullable<Question["pairs"]>[number];

export interface Section {
  title: string;
  description: string;
  questionIds: string[];
}

export type TestMode = "type" | "chapter" | "bank";

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
): Section[] {
  if (mode === "chapter") {
    const grouped = new Map<number, Question[]>();

    questions.forEach((question) => {
      const unitId = extractUnitId(question.id);
      if (!unitId) return;
      const existing = grouped.get(unitId) || [];
      existing.push(question);
      grouped.set(unitId, existing);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([unitId, items]) => ({
        title: `Luyện tập chương ${unitId}`,
        description:
          "Làm toàn bộ câu hỏi của một chương theo nhiều dạng đã tổng hợp.",
        questionIds: items.map((item) => item.id),
      }));
  }

  if (mode === "bank") {
    const shuffled = shuffleArray(questions);
    const chunkSize = 10;
    const sections: Section[] = [];

    for (let index = 0; index < shuffled.length; index += chunkSize) {
      const batch = shuffled.slice(index, index + chunkSize);
      sections.push({
        title: `Ngân hàng câu hỏi ${sections.length + 1}`,
        description:
          "Trộn câu hỏi ngẫu nhiên từ nhiều chương và nhiều dạng khác nhau.",
        questionIds: batch.map((item) => item.id),
      });
    }

    return sections;
  }

  const sections: Section[] = [];

  const vocabIds = questions
    .filter((q) => q.id.includes("vocab"))
    .map((q) => q.id);
  if (vocabIds.length > 0) {
    sections.push({
      title: "Trắc nghiệm từ vựng",
      description:
        "Kiểm tra khả năng nhận diện và ghi nhớ từ vựng cảnh sát chuyên ngành.",
      questionIds: vocabIds,
    });
  }

  const patternIds = questions
    .filter(
      (q) =>
        q.id.includes("phrase-mcq") ||
        q.type === "Scenario" ||
        (q.id.includes("practice") &&
          !["Matching", "Dictation", "Arrangement"].includes(q.type)),
    )
    .map((q) => q.id);
  if (patternIds.length > 0) {
    sections.push({
      title: "Mẫu câu & tình huống",
      description:
        "Ứng dụng các mẫu câu vào các tình huống thực tế của chiến sĩ cảnh sát.",
      questionIds: patternIds,
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
      questionIds: matchingIds,
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
      questionIds: writingIds,
    });
  }

  return sections;
}
