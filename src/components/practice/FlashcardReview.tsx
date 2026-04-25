import React, { useEffect, useMemo, useState } from "react";
import type { Unit } from "../../types";
import {
  type FlashcardDeckMode,
  getFlashcardHistoryStorageKey,
  getFlashcardStatusStorageKey,
} from "./flashcardStorage";

interface FlashcardReviewProps {
  unit: Unit;
  onBack: () => void;
  onComplete: (summary: FlashcardSessionSummary) => void;
}

type ReviewStatus = "unseen" | "known" | "review";

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
  category: "Vocabulary" | "Phrase";
}

interface FlashcardAttemptRecord {
  timestamp: string;
  knownCount: number;
  reviewCount: number;
  reviewedCount: number;
  totalCards: number;
}

export interface FlashcardSessionSummary {
  unitId: number;
  unitTitle: string;
  deckMode: FlashcardDeckMode;
  deckTitle: string;
  totalCards: number;
  reviewedCount: number;
  knownCount: number;
  reviewCount: number;
  completionPercent: number;
  weakCards: FlashcardItem[];
  currentKnownRate: number;
  previousKnownRate: number | null;
}

const loadStatusByCard = (unitId: number, deckMode: FlashcardDeckMode) => {
  try {
    const saved = localStorage.getItem(
      getFlashcardStatusStorageKey(unitId, deckMode),
    );
    return saved ? (JSON.parse(saved) as Record<string, ReviewStatus>) : {};
  } catch {
    return {};
  }
};

const loadAttemptHistory = (unitId: number, deckMode: FlashcardDeckMode) => {
  try {
    const saved = localStorage.getItem(
      getFlashcardHistoryStorageKey(unitId, deckMode),
    );
    return saved ? (JSON.parse(saved) as FlashcardAttemptRecord[]) : [];
  } catch {
    return [];
  }
};

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  unit,
  onBack,
  onComplete,
}) => {
  const initialDeckMode: FlashcardDeckMode =
    unit.id === 1 ? "sentencePatterns" : "vocabulary";
  const [deckMode, setDeckMode] = useState<FlashcardDeckMode>(initialDeckMode);

  const cards = useMemo<FlashcardItem[]>(() => {
    const vocabularyCards = unit.vocabulary.slice(0, 10).map((word, index) => ({
      id: `vocab-${index}`,
      front: word.word,
      back: `${word.meaning}\n\nVí dụ: ${word.example}`,
      hint: `${word.phonetic} • ${word.type}`,
      category: "Vocabulary" as const,
    }));

    const phraseCards = unit.phrases.slice(0, 10).map((phrase, index) => ({
      id: `phrase-${index}`,
      front: phrase.text,
      back: `${phrase.translation}\n\nNgữ cảnh: ${phrase.context}`,
      category: "Phrase" as const,
    }));

    return deckMode === "vocabulary" ? vocabularyCards : phraseCards;
  }, [unit, deckMode]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "next" | "prev"
  >("next");
  const [statusByCard, setStatusByCard] = useState<
    Record<string, ReviewStatus>
  >(() => loadStatusByCard(unit.id, initialDeckMode));

  const currentCard = cards[currentIndex];

  const reviewedCount = useMemo(
    () => Object.values(statusByCard).filter((s) => s !== "unseen").length,
    [statusByCard],
  );
  const knownCount = useMemo(
    () => Object.values(statusByCard).filter((s) => s === "known").length,
    [statusByCard],
  );
  const reviewCount = useMemo(
    () => Object.values(statusByCard).filter((s) => s === "review").length,
    [statusByCard],
  );

  useEffect(() => {
    localStorage.setItem(
      getFlashcardStatusStorageKey(unit.id, deckMode),
      JSON.stringify(statusByCard),
    );
  }, [statusByCard, unit.id, deckMode]);

  useEffect(() => {
    if (!currentCard) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
      }

      if (event.key === "ArrowRight") {
        setTransitionDirection("next");
        setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
        setIsFlipped(false);
      }

      if (event.key === "ArrowLeft") {
        setTransitionDirection("prev");
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
        setIsFlipped(false);
      }

      if (event.key.toLowerCase() === "k") {
        setStatusByCard((prev) => ({ ...prev, [currentCard.id]: "known" }));
      }

      if (event.key.toLowerCase() === "r") {
        setStatusByCard((prev) => ({ ...prev, [currentCard.id]: "review" }));
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [cards.length, currentCard]);

  const markCard = (status: Exclude<ReviewStatus, "unseen">) => {
    if (!currentCard) {
      return;
    }
    setStatusByCard((prev) => ({ ...prev, [currentCard.id]: status }));
  };

  const changeDeckMode = (nextMode: FlashcardDeckMode) => {
    if (nextMode === deckMode) {
      return;
    }
    setDeckMode(nextMode);
    setCurrentIndex(0);
    setIsFlipped(false);
    setTransitionDirection("next");
    setStatusByCard(loadStatusByCard(unit.id, nextMode));
  };

  const nextCard = () => {
    setTransitionDirection("next");
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
    setIsFlipped(false);
  };

  const previousCard = () => {
    setTransitionDirection("prev");
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setIsFlipped(false);
  };

  const completionPercent =
    cards.length > 0 ? Math.round((reviewedCount / cards.length) * 100) : 0;
  const currentStatus = currentCard
    ? (statusByCard[currentCard.id] ?? "unseen")
    : "unseen";

  const finishSession = () => {
    const totalCards = cards.length;
    const currentKnownRate =
      totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;
    const weakCards = cards.filter(
      (card) => statusByCard[card.id] === "review",
    );

    const history = loadAttemptHistory(unit.id, deckMode);
    const previous = history.length > 0 ? history[history.length - 1] : null;
    const previousKnownRate =
      previous && previous.totalCards > 0
        ? Math.round((previous.knownCount / previous.totalCards) * 100)
        : null;

    const currentAttempt: FlashcardAttemptRecord = {
      timestamp: new Date().toISOString(),
      knownCount,
      reviewCount,
      reviewedCount,
      totalCards,
    };

    localStorage.setItem(
      getFlashcardHistoryStorageKey(unit.id, deckMode),
      JSON.stringify([...history, currentAttempt].slice(-15)),
    );

    onComplete({
      unitId: unit.id,
      unitTitle: unit.title,
      deckMode,
      deckTitle:
        deckMode === "vocabulary"
          ? "PHẦN 1 - TỪ VỰNG"
          : "PHẦN 2 - MẪU CÂU (2.1)",
      totalCards,
      reviewedCount,
      knownCount,
      reviewCount,
      completionPercent,
      weakCards,
      currentKnownRate,
      previousKnownRate,
    });
  };

  if (!currentCard) {
    return (
      <div className="flashcards-view animate-fade-in">
        <button className="back-btn" onClick={onBack}>
          ← QUAY LẠI PHẦN HỌC
        </button>
        <section className="card flashcards-footer">
          <h3>Không có flashcard cho bài này</h3>
          <p>Hãy thêm từ vựng hoặc mẫu câu để bắt đầu phiên ôn tập.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="flashcards-view animate-fade-in">
      <button className="back-btn" onClick={onBack}>
        ← QUAY LẠI PHẦN HỌC
      </button>

      <section className="card flashcards-header">
        <div>
          <span className="type-tag">CHỦ ĐỀ {unit.id}</span>
          <h2>ÔN TẬP NHANH KIỂU QUIZLET</h2>
          <p>{unit.title}</p>
          <div className="flashcard-deck-tabs">
            <button
              className={`deck-tab ${deckMode === "vocabulary" ? "active" : ""}`}
              onClick={() => changeDeckMode("vocabulary")}
            >
              PHẦN 1 - TỪ VỰNG
            </button>
            <button
              className={`deck-tab ${deckMode === "sentencePatterns" ? "active" : ""}`}
              onClick={() => changeDeckMode("sentencePatterns")}
            >
              PHẦN 2 - MẪU CÂU
            </button>
          </div>
        </div>
        <div className="flashcards-stats">
          <div>
            <label>ĐÃ XEM</label>
            <strong>
              {reviewedCount}/{cards.length}
            </strong>
          </div>
          <div>
            <label>THUỘC BÀI</label>
            <strong>{knownCount}</strong>
          </div>
          <div>
            <label>CẦN ÔN LẠI</label>
            <strong>{reviewCount}</strong>
          </div>
        </div>
      </section>

      <div className="progress-bar-container flashcards-progress">
        <div
          className="progress-bar-fill"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <section className="flashcard-stage">
        {/* Left Arrow */}
        <button
          className="flashcard-nav"
          onClick={previousCard}
          disabled={currentIndex === 0}
          title="Thẻ trước (←)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          key={currentCard.id}
          className={`flashcard-shell ${isFlipped ? "flipped" : ""}`}
          data-direction={transitionDirection}
          onClick={() => setIsFlipped((prev) => !prev)}
        >
          {/* Card index indicator */}
          <div className="flashcard-index">
            {currentIndex + 1} / {cards.length}
          </div>

          <div className="flashcard-face flashcard-front">
            <span
              className={`flashcard-badge ${currentCard.category === "Vocabulary" ? "badge-vocab" : "badge-phrase"}`}
            >
              {currentCard.category === "Vocabulary" ? "TỪ VỰNG" : "MẪU CÂU"}
            </span>
            <h3>{currentCard.front}</h3>
            {currentCard.hint && (
              <p className="flashcard-hint">{currentCard.hint}</p>
            )}
          </div>

          <div className="flashcard-face flashcard-back">
            <span className="flashcard-badge badge-back">MẶT SAU</span>
            <h3>Nghĩa &amp; ngữ cảnh</h3>
            {currentCard.back
              .split("\n")
              .filter(Boolean)
              .map((line, index) => (
                <p key={index}>{line}</p>
              ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          className="flashcard-nav"
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
          title="Thẻ tiếp theo (→)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </section>

      <section className="flashcards-actions">
        {/* Flip button */}
        <button
          className="fc-action-btn fc-flip"
          onClick={() => setIsFlipped((prev) => !prev)}
          title="Lật thẻ (Space)"
        >
          {isFlipped ? "Ẩn đáp án" : "Lật thẻ"}
        </button>

        {/* Mark Known */}
        <button
          className={`fc-action-btn fc-known ${currentStatus === "known" ? "active" : ""}`}
          onClick={() => markCard("known")}
          title="Đánh dấu đã thuộc (K)"
        >
          Thuộc bài (K)
        </button>

        {/* Mark Review */}
        <button
          className={`fc-action-btn fc-review ${currentStatus === "review" ? "active" : ""}`}
          onClick={() => markCard("review")}
          title="Đánh dấu cần ôn lại (R)"
        >
          Cần ôn lại (R)
        </button>

        {/* Finish */}
        <button
          className="fc-action-btn fc-finish"
          disabled={reviewedCount < cards.length}
          onClick={finishSession}
          title={
            reviewedCount < cards.length
              ? `Còn ${cards.length - reviewedCount} thẻ chưa xem`
              : "Hoàn tất phiên ôn"
          }
        >
          Hoàn tất phiên ôn
        </button>
      </section>

      <section className="card flashcards-footer">
        <p>
          Phím tắt: <kbd>Space</kbd> lật thẻ &nbsp;·&nbsp;
          <kbd>←</kbd>
          <kbd>→</kbd> chuyển thẻ &nbsp;·&nbsp;
          <kbd>K</kbd> đánh dấu thuộc &nbsp;·&nbsp;
          <kbd>R</kbd> đánh dấu cần ôn
        </p>
      </section>
    </div>
  );
};
