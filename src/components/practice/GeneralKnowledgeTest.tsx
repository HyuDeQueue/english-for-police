import React, { useMemo, useState } from "react";
import type { Unit, Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Send,
  Home,
  Brain,
} from "lucide-react";

type MatchingAnswer = Record<string, string>;
type MatchingPair = NonNullable<Question["pairs"]>[number];
type ArrangementAnswer = string[];

interface GeneralKnowledgeTestProps {
  lessons: Unit[];
  mode?: "unit" | "all";
  onBack: () => void;
  onComplete?: (score: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateGeneralQuestions(lessons: Unit[]): Question[] {
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

    // Keep all curated lesson practice questions too.
    unit.practice.forEach((question, idx) => {
      pool.push({
        ...question,
        id: `gk-practice-${unit.id}-${idx}-${question.id}`,
      });
    });

    // Build multiple matching sets so more vocabulary is covered.
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

interface Section {
  title: string;
  description: string;
  questionIds: string[];
}

type TestMode = "type" | "chapter" | "bank";
const QUESTIONS_PER_PAGE = 20;

function extractUnitId(questionId: string): number | null {
  const match = questionId.match(/-(\d+)-/);
  return match ? Number(match[1]) : null;
}

function buildSections(questions: Question[], mode: TestMode): Section[] {
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
    .filter((q) => q.id.includes("phrase-mcq") || q.type === "Scenario")
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

type SectionResult = {
  score: number;
  correctCount: number;
  total: number;
  submitted: boolean;
};

export const GeneralKnowledgeTest: React.FC<GeneralKnowledgeTestProps> = ({
  lessons,
  mode = "all",
  onBack,
  onComplete,
}) => {
  const [questions] = useState<Question[]>(() =>
    generateGeneralQuestions(lessons),
  );
  const initialMode: TestMode = mode === "unit" ? "chapter" : "type";
  const [testMode, setTestMode] = useState<TestMode>(initialMode);

  const sections = useMemo<Section[]>(() => {
    return buildSections(questions, testMode);
  }, [questions, testMode]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const currentSection = sections[currentSectionIndex];

  const sectionQuestions = useMemo(() => {
    if (!currentSection) return [];
    return questions.filter((q) => currentSection.questionIds.includes(q.id));
  }, [currentSection, questions]);

  const pagedSectionQuestions = useMemo(() => {
    if (testMode !== "chapter") return sectionQuestions;
    const start = currentPageIndex * QUESTIONS_PER_PAGE;
    return sectionQuestions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [currentPageIndex, sectionQuestions, testMode]);

  const [currentIndexInSection, setCurrentIndexInSection] = useState(0);

  const matchingRightOptionsByQuestionId = useMemo(() => {
    const stableOrders: Record<string, MatchingPair[]> = {};
    questions.forEach((q) => {
      if (q.type === "Matching") {
        stableOrders[q.id] = shuffleArray([...(q.pairs || [])]);
      }
    });
    return stableOrders;
  }, [questions]);

  const [answers, setAnswers] = useState<
    Record<string, string | MatchingAnswer>
  >({});
  const [matchingAnswers, setMatchingAnswers] = useState<
    Record<string, MatchingAnswer>
  >({});
  const [arrangementAnswers, setArrangementAnswers] = useState<
    Record<string, ArrangementAnswer>
  >({});
  const [selectedLeft, setSelectedLeft] = useState<
    Record<string, string | null>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [sectionResults, setSectionResults] = useState<
    Record<number, SectionResult>
  >({});

  const currentQuestion = pagedSectionQuestions[currentIndexInSection];

  const isQuestionAnswered = (q: Question): boolean => {
    if (!q) return false;
    if (q.type === "MCQ" || q.type === "Scenario") {
      return (
        typeof answers[q.id] === "string" &&
        (answers[q.id] as string).trim().length > 0
      );
    }
    if (
      q.type === "Dictation" ||
      q.type === "FillInBlank" ||
      q.type === "Speaking"
    ) {
      return (
        typeof answers[q.id] === "string" &&
        (answers[q.id] as string).trim().length > 0
      );
    }
    if (q.type === "Matching") {
      const pairCount = q.pairs?.length || 0;
      if (pairCount === 0) return false;
      return Object.keys(matchingAnswers[q.id] || {}).length === pairCount;
    }
    if (q.type === "Arrangement") {
      return (arrangementAnswers[q.id] || []).length > 0;
    }
    return false;
  };

  const sectionProgress = sections.map((section) => {
    const sectionQs = questions.filter((q) =>
      section.questionIds.includes(q.id),
    );
    const answered = sectionQs.filter((q) => isQuestionAnswered(q)).length;
    const result =
      sectionResults[
        sections.findIndex((item) => item.title === section.title)
      ];
    return {
      answered,
      total: sectionQs.length,
      isComplete: sectionQs.length > 0 && answered === sectionQs.length,
      result,
    };
  });

  const allSectionsSubmitted =
    sections.length > 0 &&
    sections.every((_, idx) => sectionResults[idx]?.submitted);

  const resetTestState = () => {
    setCurrentSectionIndex(0);
    setCurrentPageIndex(0);
    setCurrentIndexInSection(0);
    setAnswers({});
    setMatchingAnswers({});
    setArrangementAnswers({});
    setSelectedLeft({});
    setSectionResults({});
    setShowResults(false);
    setScore(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeTestMode = (nextMode: TestMode) => {
    if (nextMode === testMode) return;
    setTestMode(nextMode);
    resetTestState();
  };

  const calculateScore = (questionList: Question[]) => {
    let correctCount = 0;

    questionList.forEach((q) => {
      if (q.type === "Matching") {
        const userPairs = matchingAnswers[q.id] || {};
        const allCorrect = (q.pairs || []).every(
          (pair) => userPairs[pair.left] === pair.right,
        );
        if (allCorrect) correctCount++;
        return;
      }

      if (q.type === "Arrangement") {
        const userArranged = (arrangementAnswers[q.id] || []).join(" ").trim();
        const correctAnswer = String(q.answer || "").trim();
        if (userArranged.toLowerCase() === correctAnswer.toLowerCase()) {
          correctCount++;
        }
        return;
      }

      const userAnswer =
        typeof answers[q.id] === "string"
          ? (answers[q.id] as string).trim().toLowerCase()
          : "";
      const correctAnswer = String(q.answer || "")
        .trim()
        .toLowerCase();
      const acceptable = (q.acceptableAnswers || []).map((a) =>
        a.trim().toLowerCase(),
      );
      if (userAnswer === correctAnswer || acceptable.includes(userAnswer)) {
        correctCount++;
      }
    });

    return {
      correctCount,
      total: questionList.length,
      score:
        questionList.length > 0
          ? Math.round((correctCount / questionList.length) * 100)
          : 0,
    };
  };

  const handleSubmitSection = () => {
    const currentSectionScore = calculateScore(sectionQuestions);
    const nextResults = {
      ...sectionResults,
      [currentSectionIndex]: {
        ...currentSectionScore,
        submitted: true,
      },
    };

    setSectionResults(nextResults);

    const overallCorrect = Object.values(nextResults).reduce(
      (sum, result) => sum + result.correctCount,
      0,
    );
    const overallScore =
      questions.length > 0
        ? Math.round((overallCorrect / questions.length) * 100)
        : 0;

    if (
      sections.length > 0 &&
      sections.every((_, idx) => nextResults[idx]?.submitted)
    ) {
      setScore(overallScore);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults && onComplete) onComplete(score);
    onBack();
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center px-4">
        <Card className="police-shadow border-none p-10">
          <CardTitle className="text-xl mb-3">
            Chưa có dữ liệu cho bài kiểm tra tổng hợp
          </CardTitle>
          <p className="text-muted-foreground mb-6">
            Vui lòng quay lại và kiểm tra dữ liệu bài học.
          </p>
          <Button onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            QUAY LẠI
          </Button>
        </Card>
      </div>
    );
  }

  if (showResults && allSectionsSubmitted) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-8 animate-fade-in">
        <Card className="police-shadow border-none overflow-hidden text-center">
          <div className="primary-gradient p-8">
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-widest">
              KẾT QUẢ TEST TỔNG HỢP
            </h2>
            <div className="mt-5 inline-flex flex-col items-center justify-center h-28 w-28 rounded-full bg-white/10 border-4 border-white/20">
              <span className="text-4xl font-black text-white">{score}%</span>
              <span className="text-[10px] font-bold text-white/70">
                {Math.round((score / 100) * questions.length)}/
                {questions.length} CÂU
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, i) => {
            let isCorrect = false;
            let userDisplay = "";
            let answerDisplay = "";

            if (q.type === "Matching") {
              const userPairs = matchingAnswers[q.id] || {};
              isCorrect = (q.pairs || []).every(
                (pair) => userPairs[pair.left] === pair.right,
              );
              userDisplay = "Bài ghép đôi";
              answerDisplay = (q.pairs || [])
                .map((pair) => `${pair.left} - ${pair.right}`)
                .join(", ");
            } else if (q.type === "Arrangement") {
              const userArranged = (arrangementAnswers[q.id] || [])
                .join(" ")
                .trim();
              const correctAnswer = String(q.answer || "").trim();
              isCorrect =
                userArranged.toLowerCase() === correctAnswer.toLowerCase();
              userDisplay = `Bạn: ${userArranged || "(Chưa trả lời)"}`;
              answerDisplay = `Đáp án: ${correctAnswer}`;
            } else {
              const userAnswer =
                typeof answers[q.id] === "string"
                  ? (answers[q.id] as string)
                  : "(Chưa trả lời)";
              const correctAnswer = String(q.answer || "");
              const normalizedUser = userAnswer.trim().toLowerCase();
              const normalizedCorrect = correctAnswer.trim().toLowerCase();
              const acceptable = (q.acceptableAnswers || []).map((a) =>
                a.trim().toLowerCase(),
              );
              isCorrect =
                normalizedUser === normalizedCorrect ||
                acceptable.includes(normalizedUser);
              userDisplay = `Bạn: ${userAnswer || "(Chưa trả lời)"}`;
              answerDisplay = `Đáp án: ${correctAnswer}`;
            }

            return (
              <Card
                key={q.id}
                className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"} police-shadow`}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      CÂU {i + 1} ({q.type})
                    </p>
                    <p className="text-sm font-bold leading-snug">{q.prompt}</p>
                    <p
                      className={
                        isCorrect
                          ? "text-green-600 text-xs"
                          : "text-red-600 text-xs"
                      }
                    >
                      {userDisplay}
                    </p>
                    {!isCorrect && (
                      <p className="text-green-600 text-xs font-medium">
                        {answerDisplay}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          size="lg"
          className="w-full h-12 font-bold"
          onClick={handleBack}
        >
          <Home className="mr-2 h-4 w-4" />
          QUAY LẠI ({score}%)
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center px-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="group text-primary font-bold"
        >
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          QUAY LẠI
        </Button>

        <div className="flex gap-2">
          {sections.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-12 rounded-full transition-all ${
                idx === currentSectionIndex
                  ? "bg-primary w-20"
                  : idx < currentSectionIndex
                    ? "bg-green-500"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4">
        <Button
          type="button"
          variant={testMode === "type" ? "default" : "outline"}
          size="sm"
          className="font-bold"
          onClick={() => changeTestMode("type")}
        >
          Theo dạng
        </Button>
        <Button
          type="button"
          variant={testMode === "chapter" ? "default" : "outline"}
          size="sm"
          className="font-bold"
          onClick={() => changeTestMode("chapter")}
        >
          Theo chương
        </Button>
        <Button
          type="button"
          variant={testMode === "bank" ? "default" : "outline"}
          size="sm"
          className="font-bold"
          onClick={() => changeTestMode("bank")}
        >
          Trộn ngân hàng
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start px-4">
        <aside className="w-full lg:w-80 space-y-6 shrink-0 lg:sticky lg:top-24">
          <Card className="police-shadow border-none overflow-hidden">
            <CardHeader className="bg-muted/50 border-b p-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                PHẦN {currentSectionIndex + 1}: {currentSection?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-xs text-muted-foreground font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3">
                "{currentSection?.description}"
              </p>

              <div className="grid grid-cols-4 gap-3">
                {pagedSectionQuestions.map((q, idx) => (
                  <button
                    key={q.id}
                    className={`h-11 w-11 rounded-lg font-bold text-xs border-2 transition-all ${
                      isQuestionAnswered(q)
                        ? "bg-primary text-white border-primary"
                        : idx === currentIndexInSection
                          ? "border-secondary bg-secondary/10 text-primary scale-110 shadow-sm"
                          : "border-muted text-muted-foreground hover:border-primary/30"
                    }`}
                    onClick={() => setCurrentIndexInSection(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {testMode === "chapter" &&
                sectionQuestions.length > QUESTIONS_PER_PAGE && (
                  <div className="flex items-center justify-between gap-2 rounded-xl border bg-muted/20 px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs font-bold"
                      disabled={currentPageIndex === 0}
                      onClick={() => {
                        setCurrentPageIndex((prev) => Math.max(0, prev - 1));
                        setCurrentIndexInSection(0);
                      }}
                    >
                      <ChevronLeft className="mr-1 h-3 w-3" />
                      Trang trước
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs font-bold"
                      disabled={
                        (currentPageIndex + 1) * QUESTIONS_PER_PAGE >=
                        sectionQuestions.length
                      }
                      onClick={() => {
                        setCurrentPageIndex((prev) => prev + 1);
                        setCurrentIndexInSection(0);
                      }}
                    >
                      Trang sau
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )}

              <div className="pt-4 border-t space-y-3">
                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase">
                  Chọn bài luyện tập để làm từng test nhỏ
                </p>

                <div className="space-y-2">
                  {sections.map((section, idx) => {
                    const progress = sectionProgress[idx];
                    const result = sectionResults[idx];
                    return (
                      <Button
                        key={section.title}
                        type="button"
                        variant={
                          idx === currentSectionIndex ? "default" : "outline"
                        }
                        className={`w-full h-11 justify-between text-xs font-bold transition-all ${
                          idx === currentSectionIndex
                            ? "text-white shadow-md"
                            : "text-slate-800"
                        }`}
                        onClick={() => {
                          setCurrentSectionIndex(idx);
                          setCurrentPageIndex(0);
                          setCurrentIndexInSection(0);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <span className="truncate">
                          {idx + 1}. {section.title}
                        </span>
                        <Badge
                          variant={
                            result?.submitted
                              ? "secondary"
                              : progress?.isComplete
                                ? "outline"
                                : "outline"
                          }
                          className={`ml-2 shrink-0 border ${
                            idx === currentSectionIndex
                              ? "border-white/30 bg-white/15 text-white"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {result?.submitted
                            ? `${result.score}%`
                            : `${progress?.answered ?? 0}/${progress?.total ?? 0}`}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  className={`w-full h-14 text-base font-black rounded-xl transition-all ${
                    sectionQuestions.length > 0
                      ? "primary-gradient police-shadow scale-100"
                      : "bg-muted text-muted-foreground opacity-60"
                  }`}
                  disabled={sectionQuestions.length === 0}
                  onClick={handleSubmitSection}
                >
                  <Send className="mr-2 h-5 w-5" />
                  {sectionResults[currentSectionIndex]?.submitted
                    ? "NỘP LẠI BÀI NÀY"
                    : "NỘP BÀI NÀY"}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase">
                  Mỗi bài luyện tập có nút nộp riêng
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 w-full space-y-6">
          <Card className="police-shadow border-none min-h-360px flex flex-col">
            <CardHeader className="border-b bg-muted/20 py-2.5 px-4 sm:px-5">
              <div className="flex justify-between items-center">
                <Badge className="bg-primary/10 text-primary border-none px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider">
                  {currentSection?.title}
                </Badge>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Câu{" "}
                  {currentPageIndex * QUESTIONS_PER_PAGE +
                    currentIndexInSection +
                    1}{" "}
                  / {sectionQuestions.length}
                </span>
              </div>
              {sectionResults[currentSectionIndex]?.submitted && (
                <div className="mt-2 rounded-xl border bg-secondary/5 px-3 py-2 text-xs font-bold text-secondary">
                  Đã nộp bài này: {sectionResults[currentSectionIndex].score}%
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
              <div className="space-y-6 max-w-xl mx-auto w-full">
                {currentQuestion && (
                  <>
                    <h3 className="text-xl sm:text-2xl font-heading font-black text-primary leading-tight">
                      {currentQuestion.prompt}
                    </h3>
                    {currentQuestion.vnPrompt && (
                      <div className="p-3 bg-secondary/5 border-l-4 border-secondary rounded-r-xl italic text-secondary text-sm font-medium">
                        {currentQuestion.vnPrompt}
                      </div>
                    )}

                    <div className="space-y-3 py-1">
                      {currentQuestion.type === "MCQ" ||
                      currentQuestion.type === "Scenario" ? (
                        <div className="grid grid-cols-1 gap-3">
                          {currentQuestion.options?.map((opt, i) => (
                            <Button
                              key={i}
                              variant={
                                answers[currentQuestion.id] === opt
                                  ? "default"
                                  : "outline"
                              }
                              className={`h-auto py-3 px-4 justify-start text-left text-sm font-bold transition-all border-2 ${
                                answers[currentQuestion.id] === opt
                                  ? "ring-2 ring-primary ring-offset-2 police-shadow bg-primary text-white"
                                  : "hover:bg-primary/5 hover:border-primary/20"
                              }`}
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [currentQuestion.id]: opt,
                                }))
                              }
                            >
                              <span
                                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 text-[11px] ${
                                  answers[currentQuestion.id] === opt
                                    ? "bg-white text-primary border-white"
                                    : "text-muted-foreground border-muted"
                                }`}
                              >
                                {String.fromCharCode(65 + i)}
                              </span>
                              {opt}
                            </Button>
                          ))}
                        </div>
                      ) : currentQuestion.type === "Matching" ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">
                                Tiếng Anh
                              </p>
                              {currentQuestion.pairs?.map((pair) => {
                                const current =
                                  matchingAnswers[currentQuestion.id] || {};
                                const isMatched = !!current[pair.left];
                                const isSelected =
                                  selectedLeft[currentQuestion.id] ===
                                  pair.left;
                                return (
                                  <Button
                                    key={pair.left}
                                    variant={
                                      isSelected
                                        ? "default"
                                        : isMatched
                                          ? "secondary"
                                          : "outline"
                                    }
                                    disabled={isMatched}
                                    onClick={() =>
                                      setSelectedLeft((prev) => ({
                                        ...prev,
                                        [currentQuestion.id]: pair.left,
                                      }))
                                    }
                                    className="w-full justify-start text-xs h-10 relative overflow-hidden font-bold"
                                  >
                                    {pair.left}
                                    {isMatched && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
                                    )}
                                  </Button>
                                );
                              })}
                            </div>
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">
                                Nghĩa Tiếng Việt
                              </p>
                              {(
                                matchingRightOptionsByQuestionId[
                                  currentQuestion.id
                                ] || []
                              ).map((pair) => {
                                const current =
                                  matchingAnswers[currentQuestion.id] || {};
                                const isMatched = Object.values(
                                  current,
                                ).includes(pair.right);
                                return (
                                  <Button
                                    key={pair.right}
                                    variant={
                                      isMatched ? "secondary" : "outline"
                                    }
                                    disabled={
                                      isMatched ||
                                      !selectedLeft[currentQuestion.id]
                                    }
                                    onClick={() => {
                                      const left =
                                        selectedLeft[currentQuestion.id];
                                      if (!left) return;
                                      const newMatches: MatchingAnswer = {
                                        ...current,
                                        [left]: pair.right,
                                      };
                                      setMatchingAnswers((prev) => ({
                                        ...prev,
                                        [currentQuestion.id]: newMatches,
                                      }));
                                      setAnswers((prev) => ({
                                        ...prev,
                                        [currentQuestion.id]: newMatches,
                                      }));
                                      setSelectedLeft((prev) => ({
                                        ...prev,
                                        [currentQuestion.id]: null,
                                      }));
                                    }}
                                    className="w-full justify-start text-xs h-10 font-medium"
                                  >
                                    {pair.right}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground italic text-center bg-muted/30 py-1.5 rounded-lg">
                            * Chọn một từ bên trái sau đó chọn nghĩa phù hợp bên
                            phải
                          </p>
                        </div>
                      ) : currentQuestion.type === "Arrangement" ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border-2 border-dashed bg-muted/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                              Khu vực sắp xếp
                            </p>
                            <div className="min-h-14 p-2.5 rounded-xl bg-white border flex flex-wrap gap-2">
                              {(arrangementAnswers[currentQuestion.id] || [])
                                .length > 0 ? (
                                (
                                  arrangementAnswers[currentQuestion.id] || []
                                ).map((word, idx) => (
                                  <Button
                                    key={`${word}-${idx}`}
                                    type="button"
                                    variant="secondary"
                                    className="h-9 px-3 text-xs font-bold animate-in zoom-in-50 duration-200"
                                    onClick={() => {
                                      setArrangementAnswers((prev) => {
                                        const next = [
                                          ...(prev[currentQuestion.id] || []),
                                        ];
                                        next.splice(idx, 1);
                                        setAnswers((old) => ({
                                          ...old,
                                          [currentQuestion.id]: next.join(" "),
                                        }));
                                        return {
                                          ...prev,
                                          [currentQuestion.id]: next,
                                        };
                                      });
                                    }}
                                  >
                                    {word}
                                  </Button>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground italic self-center mx-auto">
                                  Chạm vào các từ bên dưới để xây dựng câu hoàn
                                  chỉnh
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-secondary/5 border-2 border-secondary/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">
                              Các từ cho sẵn
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(currentQuestion.options || []).map(
                                (word, idx) => {
                                  const selected =
                                    arrangementAnswers[currentQuestion.id] ||
                                    [];
                                  const usedCount = selected.filter(
                                    (w) => w === word,
                                  ).length;
                                  const availableCount = (
                                    currentQuestion.options || []
                                  )
                                    .slice(0, idx + 1)
                                    .filter((w) => w === word).length;
                                  const disabled = usedCount >= availableCount;
                                  return (
                                    <Button
                                      key={`${word}-${idx}`}
                                      type="button"
                                      variant="outline"
                                      disabled={disabled}
                                      className={`h-9 px-3 text-xs font-bold border-2 transition-all ${disabled ? "opacity-30 scale-90" : "hover:border-primary hover:text-primary"}`}
                                      onClick={() => {
                                        setArrangementAnswers((prev) => {
                                          const next = [
                                            ...(prev[currentQuestion.id] || []),
                                            word,
                                          ];
                                          setAnswers((old) => ({
                                            ...old,
                                            [currentQuestion.id]:
                                              next.join(" "),
                                          }));
                                          return {
                                            ...prev,
                                            [currentQuestion.id]: next,
                                          };
                                        });
                                      }}
                                    >
                                      {word}
                                    </Button>
                                  );
                                },
                              )}
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-red-500 font-bold"
                              onClick={() => {
                                setArrangementAnswers((prev) => ({
                                  ...prev,
                                  [currentQuestion.id]: [],
                                }));
                                setAnswers((prev) => ({
                                  ...prev,
                                  [currentQuestion.id]: "",
                                }));
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Xóa toàn bộ
                              sắp xếp
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Nhập bản dịch tiếng Anh:
                          </label>
                          <Input
                            type="text"
                            value={
                              typeof answers[currentQuestion.id] === "string"
                                ? (answers[currentQuestion.id] as string)
                                : ""
                            }
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [currentQuestion.id]: e.target.value,
                              }))
                            }
                            placeholder="Nhập câu trả lời của bạn..."
                            className="h-12 text-base font-bold border-2 focus-visible:ring-primary police-shadow rounded-xl px-4"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>

            <div className="p-3 bg-muted/10 border-t flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs font-bold rounded-lg"
                disabled={currentIndexInSection === 0}
                onClick={() => setCurrentIndexInSection((p) => p - 1)}
              >
                <ChevronLeft className="mr-1.5 h-4 w-4" /> Câu trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs font-bold rounded-lg"
                disabled={
                  currentIndexInSection === pagedSectionQuestions.length - 1
                }
                onClick={() => setCurrentIndexInSection((p) => p + 1)}
              >
                Câu sau <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
