import React, { useMemo, useState } from "react";
import type { Unit, Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Send, ChevronDown } from "lucide-react";

import { MultipleChoiceQuestion } from "./questions/MultipleChoiceQuestion";
import { MatchingQuestion } from "./questions/MatchingQuestion";
import { ArrangementQuestion } from "./questions/ArrangementQuestion";
import { InputQuestion } from "./questions/InputQuestion";
import { PracticeSidebar } from "./layout/PracticeSidebar";
import { PracticeHeader } from "./layout/PracticeHeader";
import { PracticeResults } from "./results/PracticeResults";

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
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number | null>(0);
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

  const [answers, setAnswers] = useState<Record<string, string>>({});
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
  const [overallScore, setOverallScore] = useState(0);
  const [sectionResults, setSectionResults] = useState<
    Record<number, SectionResult>
  >({});

  const currentQuestion = pagedSectionQuestions[currentIndexInSection];

  const isQuestionAnswered = (q: Question): boolean => {
    if (!q) return false;
    if (q.type === "Matching") {
      const pairCount = q.pairs?.length || 0;
      return (
        pairCount > 0 &&
        Object.keys(matchingAnswers[q.id] || {}).length === pairCount
      );
    }
    if (q.type === "Arrangement") {
      return (arrangementAnswers[q.id] || []).length > 0;
    }
    return (
      typeof answers[q.id] === "string" &&
      (answers[q.id] as string).trim().length > 0
    );
  };

  const sectionProgress = sections.map((section, idx) => {
    const sectionQs = questions.filter((q) =>
      section.questionIds.includes(q.id),
    );
    const answered = sectionQs.filter((q) => isQuestionAnswered(q)).length;
    const result = sectionResults[idx];
    return {
      answered,
      total: sectionQs.length,
      isComplete: sectionQs.length > 0 && answered === sectionQs.length,
      result,
    };
  });

  const resetTestState = () => {
    setCurrentSectionIndex(0);
    setExpandedSectionIndex(0);
    setCurrentPageIndex(0);
    setCurrentIndexInSection(0);
    setAnswers({});
    setMatchingAnswers({});
    setArrangementAnswers({});
    setSelectedLeft({});
    setSectionResults({});
    setShowResults(false);
    setOverallScore(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      const userAnswer = String(answers[q.id] || "")
        .trim()
        .toLowerCase();
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
    const calculatedOverallScore =
      questions.length > 0
        ? Math.round((overallCorrect / questions.length) * 100)
        : 0;

    if (
      sections.length > 0 &&
      sections.every((_, idx) => nextResults[idx]?.submitted)
    ) {
      setOverallScore(calculatedOverallScore);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults && onComplete) onComplete(overallScore);
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

  if (showResults) {
    const combinedAnswers: Record<
      string,
      string | MatchingAnswer | ArrangementAnswer
    > = {
      ...answers,
      ...matchingAnswers,
      ...arrangementAnswers,
    };

    return (
      <PracticeResults
        score={overallScore}
        totalQuestions={questions.length}
        questions={questions}
        userAnswers={combinedAnswers}
        onBack={handleBack}
        title="KẾT QUẢ TEST TỔNG HỢP"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">
      <PracticeHeader onBack={handleBack}>
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
      </PracticeHeader>

      <div className="flex flex-wrap gap-2 px-4">
        <Button
          type="button"
          variant={testMode === "type" ? "default" : "outline"}
          size="sm"
          className="font-bold"
          onClick={() => {
            if (testMode === "type") return;
            setTestMode("type");
            resetTestState();
          }}
        >
          Theo dạng
        </Button>
        <Button
          type="button"
          variant={testMode === "chapter" ? "default" : "outline"}
          size="sm"
          className="font-bold"
          onClick={() => {
            if (testMode === "chapter") return;
            setTestMode("chapter");
            resetTestState();
          }}
        >
          Theo chương
        </Button>
        <Button
          type="button"
          variant={testMode === "bank" ? "default" : "outline"}
          size="sm"
          className="font-bold"
          onClick={() => {
            if (testMode === "bank") return;
            setTestMode("bank");
            resetTestState();
          }}
        >
          Trộn ngân hàng
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start px-4">
        <PracticeSidebar
          title="DANH SÁCH CÂU HỎI"
          description="Chọn từng phần để bắt đầu làm bài. Bạn có thể nộp bài riêng cho từng phần."
          footer={
            <>
              <Button
                size="lg"
                className={`w-full h-14 text-base font-black rounded-xl transition-all ${
                  sectionQuestions.length > 0
                    ? "primary-gradient police-shadow"
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
            </>
          }
        >
          <div className="space-y-3">
            {sections.map((section, idx) => {
              const isActive = idx === currentSectionIndex;
              const progress = sectionProgress[idx];
              const result = sectionResults[idx];

              return (
                <div key={section.title} className="space-y-3">
                  <Button
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className={`w-full h-12 justify-between text-xs font-bold transition-all rounded-xl ${
                      isActive ? "text-white shadow-md" : "text-slate-800"
                    }`}
                    onClick={() => {
                      if (isActive) {
                        setExpandedSectionIndex(expandedSectionIndex === idx ? null : idx);
                      } else {
                        setCurrentSectionIndex(idx);
                        setExpandedSectionIndex(idx);
                        setCurrentPageIndex(0);
                        setCurrentIndexInSection(0);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="shrink-0">{idx + 1}.</span>
                      <span className="truncate">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={result?.submitted ? "secondary" : "outline"}
                        className={`shrink-0 border text-[10px] ${
                          isActive
                            ? "border-white/30 bg-white/15 text-white"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {result?.submitted
                          ? `${result.score}%`
                          : `${progress?.answered ?? 0}/${progress?.total ?? 0}`}
                      </Badge>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${expandedSectionIndex === idx ? "rotate-180" : ""}`}
                      />
                    </div>
                  </Button>

                  {expandedSectionIndex === idx && (
                    <div className="pl-1 pr-1 py-1 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-muted/30 rounded-xl p-3 border border-muted-foreground/10">
                        <p className="text-[10px] text-muted-foreground italic mb-3 line-clamp-2">
                          {section.description}
                        </p>
                        <div className="grid grid-cols-4 gap-2.5">
                          {pagedSectionQuestions.map((q, qIdx) => {
                            const globalIdx = (currentPageIndex * QUESTIONS_PER_PAGE) + qIdx;
                            return (
                              <button
                                key={q.id}
                                className={`h-10 w-10 rounded-lg font-bold text-[11px] border-2 transition-all ${
                                  isQuestionAnswered(q)
                                    ? "bg-primary text-white border-primary"
                                    : qIdx === currentIndexInSection
                                      ? "border-secondary bg-secondary/10 text-primary scale-110 shadow-sm"
                                      : "border-muted text-muted-foreground hover:border-primary/30"
                                }`}
                                onClick={() => {
                                  if (!isActive) {
                                    setCurrentSectionIndex(idx);
                                    setCurrentPageIndex(currentPageIndex);
                                  }
                                  setCurrentIndexInSection(qIdx);
                                }}
                              >
                                {globalIdx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {sectionQuestions.length > QUESTIONS_PER_PAGE && (
                          <div className="flex items-center justify-between gap-1 rounded-lg border bg-muted/20 px-2 py-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-1.5 text-[10px] font-bold"
                              disabled={currentPageIndex === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPageIndex((prev) =>
                                  Math.max(0, prev - 1),
                                );
                                setCurrentIndexInSection(0);
                              }}
                            >
                              <ChevronLeft className="mr-1 h-3 w-3" />
                              Trước
                            </Button>
                            <span className="text-[9px] font-black text-muted-foreground">
                              {currentPageIndex + 1}/
                              {Math.ceil(
                                sectionQuestions.length / QUESTIONS_PER_PAGE,
                              )}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-1.5 text-[10px] font-bold"
                              disabled={
                                (currentPageIndex + 1) * QUESTIONS_PER_PAGE >=
                                sectionQuestions.length
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPageIndex((prev) => prev + 1);
                                setCurrentIndexInSection(0);
                              }}
                            >
                              Sau
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PracticeSidebar>

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
                        <MultipleChoiceQuestion
                          question={currentQuestion}
                          selectedAnswer={answers[currentQuestion.id]}
                          onSelect={(ans) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: ans,
                            }))
                          }
                        />
                      ) : currentQuestion.type === "Matching" ? (
                        <MatchingQuestion
                          question={currentQuestion}
                          matchingAnswers={
                            matchingAnswers[currentQuestion.id] || {}
                          }
                          selectedLeft={
                            selectedLeft[currentQuestion.id] || null
                          }
                          onSelectLeft={(left) =>
                            setSelectedLeft((prev) => ({
                              ...prev,
                              [currentQuestion.id]: left,
                            }))
                          }
                          onMatch={(left, right) => {
                            const current =
                              matchingAnswers[currentQuestion.id] || {};
                            const newMatches = { ...current, [left]: right };
                            setMatchingAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: newMatches,
                            }));
                            setSelectedLeft((prev) => ({
                              ...prev,
                              [currentQuestion.id]: null,
                            }));
                          }}
                          shuffledRightOptions={
                            matchingRightOptionsByQuestionId[
                              currentQuestion.id
                            ] || []
                          }
                        />
                      ) : currentQuestion.type === "Arrangement" ? (
                        <ArrangementQuestion
                          question={currentQuestion}
                          selectedWords={
                            arrangementAnswers[currentQuestion.id] || []
                          }
                          onAddWord={(word) => {
                            const current =
                              arrangementAnswers[currentQuestion.id] || [];
                            setArrangementAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: [...current, word],
                            }));
                          }}
                          onRemoveWord={(idx) => {
                            const current = [
                              ...(arrangementAnswers[currentQuestion.id] || []),
                            ];
                            current.splice(idx, 1);
                            setArrangementAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: current,
                            }));
                          }}
                          onReset={() =>
                            setArrangementAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: [],
                            }))
                          }
                        />
                      ) : (
                        <InputQuestion
                          question={currentQuestion}
                          value={answers[currentQuestion.id] || ""}
                          onChange={(val) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: val,
                            }))
                          }
                        />
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
