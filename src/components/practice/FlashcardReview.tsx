import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Unit, FlashcardStatus } from "../../types";
import { FlashcardHeader } from "./flashcard/FlashcardHeader";
import { FlashcardStats } from "./flashcard/FlashcardStats";
import { Flashcard } from "./flashcard/Flashcard";
import { FlashcardControls } from "./flashcard/FlashcardControls";
import { FlashcardProgress } from "./flashcard/FlashcardProgress";

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
            back: v.meaning,
            phonetic: v.phonetic,
            example: v.example,
            category: "Vocabulary",
            hint: v.type,
            type: "vocabulary" as const,
          }))
        : unit.phrases.map((p) => ({
            id: `p-${p.text}`,
            front: p.text,
            back: p.translation,
            context: p.context,
            category: "Phrase",
            hint: "Phrase",
            type: "phrase" as const,
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

  const [sessionHistory, setSessionHistory] = useState<number[]>([]);

  useEffect(() => {
    const key = `police_fc_status_${unit.id}`;
    localStorage.setItem(key, JSON.stringify(cardStatuses));
  }, [cardStatuses, unit.id]);

  const currentCard = cards[currentIndex];

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setSessionHistory((prev) => [...prev, currentIndex]);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 50);
    }
  }, [currentIndex, cards.length]);

  const undoLast = () => {
    if (sessionHistory.length > 0) {
      const lastIndex = sessionHistory[sessionHistory.length - 1];
      setSessionHistory((prev) => prev.slice(0, -1));
      setIsFlipped(false);
      setCurrentIndex(lastIndex);
    }
  };

  const markCard = useCallback(
    (status: FlashcardStatus) => {
      setCardStatuses((prev) => ({
        ...prev,
        [currentCard.id]: status,
      }));
      if (currentIndex === cards.length - 1) {
        const knownCount =
          Object.values(cardStatuses).filter((s) => s === "known").length +
          (status === "known" ? 1 : 0);
        const reviewCount =
          Object.values(cardStatuses).filter((s) => s === "review").length +
          (status === "review" ? 1 : 0);

        const summary: FlashcardSessionSummary = {
          unitId: unit.id,
          unitTitle: unit.title,
          totalCards: cards.length,
          reviewedCount: cards.length,
          knownCount,
          reviewCount,
          completionPercent: Math.round((knownCount / cards.length) * 100),
          weakCards: cards
            .filter(
              (c) =>
                cardStatuses[c.id] === "review" ||
                (c.id === currentCard.id && status === "review"),
            )
            .map((c) => ({ id: c.id, front: c.front, back: c.back })),
          currentKnownRate: Math.round((knownCount / cards.length) * 100),
          previousKnownRate: 0,
          deckMode,
        };
        onComplete(summary);
      } else {
        nextCard();
      }
    },
    [
      currentCard,
      currentIndex,
      cards,
      cardStatuses,
      unit,
      onComplete,
      nextCard,
      deckMode,
    ],
  );

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        markCard("known");
      } else if (e.code === "ArrowLeft") {
        markCard("review");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [markCard]);

  const stats = useMemo(() => {
    const currentCardIds = new Set(cards.map((c) => c.id));
    const relevantStatuses = Object.entries(cardStatuses).filter(([id]) =>
      currentCardIds.has(id),
    );

    return {
      learning:
        cards.length -
        relevantStatuses.filter((item) => item[1] === "known").length,
      known: relevantStatuses.filter((item) => item[1] === "known").length,
    };
  }, [cards, cardStatuses]);

  if (!currentCard) return null;

  return (
    <div className="flex flex-col items-center overflow-x-hidden py-3">
      <FlashcardHeader
        onBack={onBack}
        deckMode={deckMode}
        onModeChange={(mode) => {
          setDeckMode(mode);
          setCurrentIndex(0);
          setIsFlipped(false);
        }}
      />

      <FlashcardStats learningCount={stats.learning} knownCount={stats.known} />

      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        phonetic={"phonetic" in currentCard ? currentCard.phonetic : undefined}
        example={"example" in currentCard ? currentCard.example : undefined}
        context={"context" in currentCard ? currentCard.context : undefined}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
        onPlayAudio={playAudio}
      />

      <FlashcardControls
        onMark={markCard}
        onUndo={undoLast}
        canUndo={sessionHistory.length > 0}
      />

      <FlashcardProgress current={currentIndex + 1} total={cards.length} />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `,
        }}
      />
    </div>
  );
};
