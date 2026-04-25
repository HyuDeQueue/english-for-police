import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Unit, FlashcardStatus } from "../../types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, X, Check, Undo2, Keyboard } from "lucide-react";

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
        // Complete session
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
          previousKnownRate: 0, // Would need more tracking
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

  // Keyboard shortcuts
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
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-primary"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại bài học
        </Button>
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={deckMode === "vocabulary" ? "secondary" : "ghost"}
            size="sm"
            className={`text-xs font-bold ${deckMode === "vocabulary" ? "bg-white shadow-sm" : ""}`}
            onClick={() => {
              setDeckMode("vocabulary");
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            Từ vựng
          </Button>
          <Button
            variant={deckMode === "sentencePatterns" ? "secondary" : "ghost"}
            size="sm"
            className={`text-xs font-bold ${deckMode === "sentencePatterns" ? "bg-white shadow-sm" : ""}`}
            onClick={() => {
              setDeckMode("sentencePatterns");
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            Mẫu câu
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="w-full max-w-3xl flex justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 font-bold text-xs">
            {stats.learning}
          </div>
          <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">
            Đang học
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">
            Đã thuộc
          </span>
          <div className="h-7 w-7 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-600 font-bold text-xs">
            {stats.known}
          </div>
        </div>
      </div>

      {/* Flashcard Container */}
      <div
        className="w-full max-w-3xl aspect-16/10 relative group cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden bg-[#2e3856] rounded-2xl police-shadow flex flex-col p-6 overflow-hidden border border-white/5">
            <div className="flex justify-between items-start">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8 invisible"
              >
                <div className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(currentCard.front);
                }}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
                {currentCard.front}
              </h2>
              {"phonetic" in currentCard && currentCard.phonetic && (
                <p className="text-white/40 text-lg font-mono">
                  {currentCard.phonetic}
                </p>
              )}
            </div>

            {/* Shortcut Banner */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/5 border-t border-white/5 flex items-center justify-center gap-3 text-xs font-medium">
              <Keyboard className="h-4 w-4 text-white/40" />
              <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">
                Phím tắt
              </span>
              <span className="text-white/60">Bấm</span>
              <span className="px-2 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-mono text-white">
                Space
              </span>
              <span className="text-white/60">hoặc chạm vào thẻ để lật</span>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#2e3856] rounded-2xl police-shadow flex flex-col p-6 overflow-hidden border border-white/5">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(currentCard.back);
                }}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 overflow-y-auto custom-scrollbar">
              <h3 className="text-2xl md:text-4xl font-bold text-emerald-400 mb-4">
                {currentCard.back}
              </h3>
              {"example" in currentCard && currentCard.example && (
                <p className="text-white/60 text-base italic max-w-xl">
                  "{currentCard.example}"
                </p>
              )}
              {"context" in currentCard && currentCard.context && (
                <p className="text-white/60 text-base italic max-w-xl">
                  "{currentCard.context}"
                </p>
              )}
            </div>

            {/* Shortcut Banner Back */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/5 border-t border-white/5 flex items-center justify-center gap-3 text-xs font-medium">
              <Keyboard className="h-4 w-4 text-white/40" />
              <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">
                Phím tắt
              </span>
              <span className="text-white/60">Bấm</span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-mono text-white">
                  ←
                </span>
                <span className="text-white/40 italic">để học lại hoặc</span>
                <span className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-mono text-white">
                  →
                </span>
                <span className="text-white/40 italic">nếu đã thuộc</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-3xl mt-6 flex items-center justify-center gap-12 relative">
        <div className="flex items-center gap-6">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border-2 border-orange-500/20 text-orange-500 hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              markCard("review");
            }}
          >
            <X className="h-7 w-7" />
          </Button>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/20 text-emerald-500 hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              markCard("known");
            }}
          >
            <Check className="h-7 w-7" />
          </Button>
        </div>

        <div className="absolute right-2 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary h-9 w-9"
            onClick={(e) => {
              e.stopPropagation();
              undoLast();
            }}
            disabled={sessionHistory.length === 0}
          >
            <Undo2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar (Subtle) */}
      <div className="w-full max-w-3xl mt-8 px-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">
          <span>Tiến độ</span>
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

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
