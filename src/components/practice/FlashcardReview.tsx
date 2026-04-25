import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Unit, FlashcardStatus } from "../../types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

export interface FlashcardSessionSummary {
  unitId: number;
  unitTitle: string;
  totalCards: number;
  reviewedCount: number;
  knownCount: number;
  reviewCount: number;
  completionPercent: number;
  weakCards: { id: string; front: string; back: string }[];
  currentKnownRate: number;
  previousKnownRate: number;
  deckMode: "vocabulary" | "sentencePatterns";
}

export interface FlashcardReviewProps {
  unit: Unit;
  onBack: () => void;
  onComplete: (summary: FlashcardSessionSummary) => void;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  unit,
  onBack,
  onComplete,
}) => {
  const [deckMode, setDeckMode] = useState<"vocabulary" | "sentencePatterns">(
    "vocabulary",
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = useMemo(
    () =>
      deckMode === "vocabulary"
        ? unit.vocabulary.map((v) => ({
            id: `v-${v.word}`,
            front: v.word,
            back: `${v.meaning}\n\n[${v.phonetic}]\n${v.example}`,
            category: "Vocabulary",
            hint: v.type,
          }))
        : unit.phrases.map((p) => ({
            id: `p-${p.text}`,
            front: p.text,
            back: `${p.translation}\n\n${p.context}`,
            category: "Phrase",
            hint: "", // Ensure hint exists
          })),
    [deckMode, unit.vocabulary, unit.phrases],
  );

  const [cardStatuses, setCardStatuses] = useState<{
    [key: string]: FlashcardStatus;
  }>(() => {
    const key = `police_fc_status_${unit.id}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const key = `police_fc_status_${unit.id}`;
    localStorage.setItem(key, JSON.stringify(cardStatuses));
  }, [cardStatuses, unit.id]);

  const currentCard = cards[currentIndex];
  const currentStatus = cardStatuses[currentCard?.id] || "unseen";

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 50);
    }
  }, [currentIndex, cards.length]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
      }, 50);
    }
  }, [currentIndex]);

  const markCard = useCallback(
    (status: FlashcardStatus) => {
      const cardId = cards[currentIndex]?.id;
      if (!cardId) return;
      setCardStatuses((prev) => ({ ...prev, [cardId]: status }));
      if (currentIndex < cards.length - 1) {
        setTimeout(nextCard, 200);
      }
    },
    [currentIndex, cards, nextCard],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        nextCard();
      } else if (e.code === "ArrowLeft") {
        previousCard();
      } else if (e.code === "KeyK") {
        markCard("known");
      } else if (e.code === "KeyR") {
        markCard("review");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextCard, previousCard, markCard]);

  const changeDeckMode = (mode: "vocabulary" | "sentencePatterns") => {
    setDeckMode(mode);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const reviewedCount = Object.keys(cardStatuses).filter((id) =>
    cards.some((c) => c.id === id),
  ).length;
  const knownCount = Object.values(cardStatuses).filter(
    (s) => s === "known",
  ).length;
  const reviewCount = Object.values(cardStatuses).filter(
    (s) => s === "review",
  ).length;
  const completionPercent = (reviewedCount / cards.length) * 100;

  const finishSession = () => {
    const weakCards = cards
      .filter((c) => cardStatuses[c.id] === "review")
      .map((c) => ({ id: c.id, front: c.front, back: c.back }));

    const totalCards = cards.length;
    const currentKnownRate = (knownCount / totalCards) * 100;

    const sessionKey = `police_fc_history_${unit.id}`;
    const previousHistory = localStorage.getItem(sessionKey);
    const previousKnownRate = previousHistory
      ? JSON.parse(previousHistory).knownRate
      : 0;

    localStorage.setItem(
      sessionKey,
      JSON.stringify({
        date: new Date().toISOString(),
        knownRate: currentKnownRate,
      }),
    );

    onComplete({
      unitId: unit.id,
      unitTitle: unit.title,
      totalCards,
      reviewedCount,
      knownCount,
      reviewCount,
      completionPercent,
      weakCards,
      currentKnownRate,
      previousKnownRate,
      deckMode,
    });
  };

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <HelpCircle className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-xl font-bold">Không có flashcard cho bài này</h3>
        <p className="text-muted-foreground mt-2">
          Hãy thêm dữ liệu để bắt đầu ôn tập.
        </p>
        <Button variant="outline" onClick={onBack} className="mt-6">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        QUAY LẠI PHẦN HỌC
      </Button>

      {/* Header & Stats */}
      <Card className="police-shadow border-none overflow-hidden">
        <div className="primary-gradient p-6">
          <Badge variant="outline" className="text-white border-white/20 mb-2">
            CHỦ ĐỀ {unit.id}
          </Badge>
          <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-tight">
            ÔN TẬP NHANH QUIZLET
          </h2>
          <p className="text-white/70 text-sm mt-1">{unit.title}</p>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
            <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto">
              <Button
                variant={deckMode === "vocabulary" ? "default" : "ghost"}
                size="sm"
                className="flex-1 sm:flex-none rounded-lg text-xs font-bold"
                onClick={() => changeDeckMode("vocabulary")}
              >
                PHẦN 1 - TỪ VỰNG
              </Button>
              <Button
                variant={deckMode === "sentencePatterns" ? "default" : "ghost"}
                size="sm"
                className="flex-1 sm:flex-none rounded-lg text-xs font-bold"
                onClick={() => changeDeckMode("sentencePatterns")}
              >
                PHẦN 2 - MẪU CÂU
              </Button>
            </div>

            <div className="flex gap-8 text-center shrink-0">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  ĐÃ XEM
                </p>
                <p className="text-lg font-black text-primary">
                  {reviewedCount}/{cards.length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">
                  THUỘC BÀI
                </p>
                <p className="text-lg font-black text-green-600">
                  {knownCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  CẦN ÔN
                </p>
                <p className="text-lg font-black text-secondary">
                  {reviewCount}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Tiến độ phiên học</span>
              <span>{Math.round(completionPercent)}%</span>
            </div>
            <Progress
              value={completionPercent}
              className="h-1.5 bg-muted [&>div]:primary-gradient"
            />
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Stage */}
      <div className="relative flex items-center justify-center gap-4 py-10 min-h-[400px]">
        {/* Left Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="hidden sm:flex h-12 w-12 rounded-full police-shadow shrink-0 hover:bg-primary hover:text-white disabled:opacity-30"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Card Shell */}
        <div className="flex-1 max-w-[640px] perspective-[1400px]">
          <div
            key={currentCard?.id}
            className="relative w-full aspect-16/10 cursor-pointer transition-transform duration-700 transform-3d"
            style={{
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
            onClick={() => setIsFlipped((prev) => !prev)}
          >
            {/* Front Face */}
            <Card className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 backface-hidden police-shadow border-2 border-primary/10 group-hover:border-primary/20 transition-colors bg-card">
              <div className="absolute top-4 right-4 text-xs font-bold text-muted-foreground opacity-30">
                {currentIndex + 1} / {cards.length}
              </div>
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-none"
              >
                {currentCard?.category === "Vocabulary" ? "TỪ VỰNG" : "MẪU CÂU"}
              </Badge>
              <h3 className="text-3xl sm:text-4xl font-heading font-black text-center text-primary leading-tight">
                {currentCard?.front}
              </h3>
              {currentCard?.hint && (
                <p className="mt-4 text-muted-foreground font-medium italic">
                  ({currentCard.hint})
                </p>
              )}
              <div className="mt-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                Chạm để xem đáp án
              </div>
            </Card>

            {/* Back Face */}
            <Card
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 backface-hidden police-shadow border-2 border-secondary/20 bg-secondary/5"
              style={{
                transform: "rotateY(180deg)",
              }}
            >
              <Badge
                variant="outline"
                className="mb-4 border-secondary text-secondary font-bold"
              >
                MẶT SAU
              </Badge>
              <div className="space-y-4 text-center overflow-y-auto max-h-full scrollbar-none">
                {currentCard?.back
                  .split("\n")
                  .filter(Boolean)
                  .map((line, idx) => (
                    <p
                      key={idx}
                      className={`${idx === 0 ? "text-xl sm:text-2xl font-bold text-primary" : "text-sm sm:text-base text-muted-foreground leading-relaxed"}`}
                    >
                      {line}
                    </p>
                  ))}
              </div>
              <div className="mt-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                Chạm để quay lại mặt trước
              </div>
            </Card>
          </div>
        </div>

        {/* Right Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="hidden sm:flex h-12 w-12 rounded-full police-shadow shrink-0 hover:bg-primary hover:text-white disabled:opacity-30"
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          variant="outline"
          className="h-12 w-40 font-bold border-2"
          onClick={() => setIsFlipped((prev) => !prev)}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {isFlipped ? "Ẩn đáp án" : "Lật thẻ"}
        </Button>

        <Button
          variant="secondary"
          className={`h-12 px-8 font-bold text-green-700 bg-green-50 hover:bg-green-100 border-2 border-green-200 transition-all ${currentStatus === "known" ? "ring-2 ring-green-500 bg-green-100" : ""}`}
          onClick={() => markCard("known")}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Đã thuộc (K)
        </Button>

        <Button
          variant="secondary"
          className={`h-12 px-8 font-bold text-secondary-foreground bg-secondary/10 hover:bg-secondary/20 border-2 border-secondary/20 transition-all ${currentStatus === "review" ? "ring-2 ring-secondary bg-secondary/20" : ""}`}
          onClick={() => markCard("review")}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Cần ôn (R)
        </Button>

        <Button
          variant="default"
          className="h-12 px-8 font-bold primary-gradient border-none disabled:opacity-50"
          disabled={reviewedCount < cards.length}
          onClick={finishSession}
        >
          Hoàn tất
        </Button>
      </div>

      {/* Key Hints */}
      <div className="text-center">
        <div className="inline-flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span>
            <kbd className="bg-white px-1.5 py-0.5 rounded border shadow-sm mr-1">
              Space
            </kbd>{" "}
            Lật
          </span>
          <span>
            <kbd className="bg-white px-1.5 py-0.5 rounded border shadow-sm mr-1">
              ←
            </kbd>
            <kbd className="bg-white px-1.5 py-0.5 rounded border shadow-sm mr-1">
              →
            </kbd>{" "}
            Chuyển
          </span>
          <span>
            <kbd className="bg-white px-1.5 py-0.5 rounded border shadow-sm mr-1">
              K
            </kbd>{" "}
            Thuộc
          </span>
          <span>
            <kbd className="bg-white px-1.5 py-0.5 rounded border shadow-sm mr-1">
              R
            </kbd>{" "}
            Ôn
          </span>
        </div>
      </div>
    </div>
  );
};
