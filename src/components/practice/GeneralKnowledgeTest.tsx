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
        prompt: `[UNIT ${unit.id}] "${vocab.word}" nghĩa là gì?`,
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
        prompt: `[UNIT ${unit.id}] Chọn nghĩa đúng cho câu: "${phrase.text}"`,
        options: shuffleArray([phrase.translation, ...wrongOptions]),
        answer: phrase.translation,
      });
    });

    unit.phrases.forEach((phrase, idx) => {
      pool.push({
        id: `gk-phrase-dictation-${unit.id}-${idx}`,
        type: "Dictation",
        prompt: `[UNIT ${unit.id}] Dịch sang tiếng Anh: "${phrase.translation}"`,
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
          prompt: `[UNIT ${unit.id}] Ghép từ và nghĩa tương ứng`,
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

export const GeneralKnowledgeTest: React.FC<GeneralKnowledgeTestProps> = ({
  lessons,
  onBack,
  onComplete,
}) => {
  const [questions] = useState<Question[]>(() =>
    generateGeneralQuestions(lessons),
  );

  const sections = useMemo<Section[]>(() => {
    const s: Section[] = [];

    const vocabIds = questions
      .filter((q) => q.id.includes("vocab"))
      .map((q) => q.id);
    if (vocabIds.length > 0) {
      s.push({
        title: "KHO TỪ VỰNG",
        description:
          "Kiểm tra khả năng nhận diện và ghi nhớ từ vựng cảnh sát chuyên ngành.",
        questionIds: vocabIds,
      });
    }

    const patternIds = questions
      .filter((q) => q.id.includes("phrase-mcq") || q.type === "Scenario")
      .map((q) => q.id);
    if (patternIds.length > 0) {
      s.push({
        title: "MẪU CÂU TÌNH HUỐNG",
        description:
          "Ứng dụng các mẫu câu vào các tình huống thực tế của chiến sĩ cảnh sát.",
        questionIds: patternIds,
      });
    }

    const matchingIds = questions
      .filter((q) => q.type === "Matching")
      .map((q) => q.id);
    if (matchingIds.length > 0) {
      s.push({
        title: "GHÉP ĐÔI TƯƠNG TÁC",
        description:
          "Kết nối chính xác giữa thuật ngữ và ý nghĩa tiếng Việt tương ứng.",
        questionIds: matchingIds,
      });
    }

    const writingIds = questions
      .filter((q) => q.type === "Dictation" || q.type === "Arrangement")
      .map((q) => q.id);
    if (writingIds.length > 0) {
      s.push({
        title: "KỸ NĂNG VIẾT",
        description:
          "Thực hành viết lại và sắp xếp các câu tiếng Anh hoàn chỉnh.",
        questionIds: writingIds,
      });
    }

    return s;
  }, [questions]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = sections[currentSectionIndex];

  const sectionQuestions = useMemo(() => {
    if (!currentSection) return [];
    return questions.filter((q) => currentSection.questionIds.includes(q.id));
  }, [currentSection, questions]);

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

  const currentQuestion = sectionQuestions[currentIndexInSection];

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
    return {
      answered,
      total: sectionQs.length,
      isComplete: sectionQs.length > 0 && answered === sectionQs.length,
    };
  });

  const canSubmitAll =
    sectionProgress.length > 0 && sectionProgress.every((s) => s.isComplete);

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
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

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
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

  if (showResults) {
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
                {sectionQuestions.map((q, idx) => (
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

              <div className="pt-4 border-t space-y-3">
                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase">
                  Chọn section để làm theo thứ tự bạn muốn
                </p>

                <div className="space-y-2">
                  {sections.map((section, idx) => {
                    const progress = sectionProgress[idx];
                    return (
                      <Button
                        key={section.title}
                        type="button"
                        variant={
                          idx === currentSectionIndex ? "default" : "outline"
                        }
                        className="w-full h-11 justify-between text-xs font-bold"
                        onClick={() => {
                          setCurrentSectionIndex(idx);
                          setCurrentIndexInSection(0);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <span className="truncate">
                          {idx + 1}. {section.title}
                        </span>
                        <Badge
                          variant={
                            progress?.isComplete ? "secondary" : "outline"
                          }
                          className="ml-2 shrink-0"
                        >
                          {progress?.answered ?? 0}/{progress?.total ?? 0}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  className={`w-full h-14 text-base font-black rounded-xl transition-all ${
                    canSubmitAll
                      ? "primary-gradient police-shadow scale-100"
                      : "bg-muted text-muted-foreground opacity-60"
                  }`}
                  disabled={!canSubmitAll}
                  onClick={handleSubmit}
                >
                  <Send className="mr-2 h-5 w-5" />
                  NỘP BÀI
                </Button>
                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase">
                  Hoàn thành tất cả section để nộp bài
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 w-full space-y-6">
          <Card className="police-shadow border-none min-h-420px flex flex-col">
            <CardHeader className="border-b bg-muted/20 py-3. px-6">
              <div className="flex justify-between items-center">
                <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                  {currentSection?.title}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Câu {currentIndexInSection + 1} / {sectionQuestions.length}
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
              <div className="space-y-8 max-w-2xl mx-auto w-full">
                {currentQuestion && (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-heading font-black text-primary leading-tight">
                      {currentQuestion.prompt}
                    </h3>
                    {currentQuestion.vnPrompt && (
                      <div className="p-4 bg-secondary/5 border-l-4 border-secondary rounded-r-xl italic text-secondary text-base font-medium">
                        {currentQuestion.vnPrompt}
                      </div>
                    )}

                    <div className="space-y-4 py-2">
                      {currentQuestion.type === "MCQ" ||
                      currentQuestion.type === "Scenario" ? (
                        <div className="grid grid-cols-1 gap-4">
                          {currentQuestion.options?.map((opt, i) => (
                            <Button
                              key={i}
                              variant={
                                answers[currentQuestion.id] === opt
                                  ? "default"
                                  : "outline"
                              }
                              className={`h-auto py-4 px-6 justify-start text-left text-base font-bold transition-all border-2 ${
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
                                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 text-xs ${
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
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                                    className="w-full justify-start text-sm h-12 relative overflow-hidden font-bold"
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
                                    className="w-full justify-start text-sm h-12 font-medium"
                                  >
                                    {pair.right}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground italic text-center bg-muted/30 py-2 rounded-lg">
                            * Chọn một từ bên trái sau đó chọn nghĩa phù hợp bên
                            phải
                          </p>
                        </div>
                      ) : currentQuestion.type === "Arrangement" ? (
                        <div className="space-y-6">
                          <div className="p-5 rounded-2xl border-2 border-dashed bg-muted/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                              Khu vực sắp xếp
                            </p>
                            <div className="min-h-16 p-3 rounded-xl bg-white border flex flex-wrap gap-3">
                              {(arrangementAnswers[currentQuestion.id] || [])
                                .length > 0 ? (
                                (
                                  arrangementAnswers[currentQuestion.id] || []
                                ).map((word, idx) => (
                                  <Button
                                    key={`${word}-${idx}`}
                                    type="button"
                                    variant="secondary"
                                    className="h-10 px-4 font-bold animate-in zoom-in-50 duration-200"
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
                                <span className="text-sm text-muted-foreground italic self-center mx-auto">
                                  Chạm vào các từ bên dưới để xây dựng câu hoàn
                                  chỉnh
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl bg-secondary/5 border-2 border-secondary/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">
                              Các từ cho sẵn
                            </p>
                            <div className="flex flex-wrap gap-3">
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
                                      className={`h-10 px-4 font-bold border-2 transition-all ${disabled ? "opacity-30 scale-90" : "hover:border-primary hover:text-primary"}`}
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
                        <div className="space-y-4">
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
                            className="h-16 text-lg font-bold border-2 focus-visible:ring-primary police-shadow rounded-xl px-6"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>

            <div className="p-4 bg-muted/10 border-t flex justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 font-bold rounded-lg"
                disabled={currentIndexInSection === 0}
                onClick={() => setCurrentIndexInSection((p) => p - 1)}
              >
                <ChevronLeft className="mr-1.5 h-4 w-4" /> Câu trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 font-bold rounded-lg"
                disabled={currentIndexInSection === sectionQuestions.length - 1}
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
