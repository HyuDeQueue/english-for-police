import React, { useEffect, useMemo, useState } from "react";
import type { Unit } from "../../types";
import {
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
  totalCards: number;
  reviewedCount: number;
  knownCount: number;
  reviewCount: number;
  completionPercent: number;
  weakCards: FlashcardItem[];
  currentKnownRate: number;
  previousKnownRate: number | null;
}

const loadStatusByCard = (unitId: number) => {
  try {
    const saved = localStorage.getItem(getFlashcardStatusStorageKey(unitId));
    return saved ? (JSON.parse(saved) as Record<string, ReviewStatus>) : {};
  } catch {
    return {};
  }
};

const loadAttemptHistory = (unitId: number) => {
  try {
    const saved = localStorage.getItem(getFlashcardHistoryStorageKey(unitId));
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
  const cards = useMemo<FlashcardItem[]>(() => {
    const vocabularyCards = unit.vocabulary.map((word, index) => ({
      id: `vocab-${index}`,
      front: word.word,
      back: `${word.meaning}\n\nEx: ${word.example}`,
      hint: `${word.phonetic} • ${word.type}`,
      category: "Vocabulary" as const,
    }));

    const phraseCards = unit.phrases.map((phrase, index) => ({
      id: `phrase-${index}`,
      front: phrase.text,
      back: `${phrase.translation}\n\nContext: ${phrase.context}`,
      category: "Phrase" as const,
    }));

    return [...vocabularyCards, ...phraseCards];
  }, [unit]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "next" | "prev"
  >("next");
  const [statusByCard, setStatusByCard] = useState<
    Record<string, ReviewStatus>
  >(() => loadStatusByCard(unit.id));

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
      getFlashcardStatusStorageKey(unit.id),
      JSON.stringify(statusByCard),
    );
  }, [statusByCard, unit.id]);

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
        setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
        setIsFlipped(false);
      }

      if (event.key === "ArrowLeft") {
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

    const history = loadAttemptHistory(unit.id);
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
      getFlashcardHistoryStorageKey(unit.id),
      JSON.stringify([...history, currentAttempt].slice(-15)),
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
          <span className="type-tag">DECK BÀI {unit.id}</span>
          <h2>ÔN TẬP NHANH KIỂU QUIZLET</h2>
          <p>{unit.title}</p>
        </div>
        <div className="flashcards-stats">
          <div>
            <label>ĐÃ REVIEW</label>
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
        <button
          className="flashcard-nav"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          ←
        </button>

        <div
          key={currentCard.id}
          className={`flashcard-shell ${isFlipped ? "flipped" : ""}`}
          data-direction={transitionDirection}
          onClick={() => setIsFlipped((prev) => !prev)}
        >
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-badge">{currentCard.category}</span>
            <h3>{currentCard.front}</h3>
            {currentCard.hint && <p>{currentCard.hint}</p>}
            <small>Nhấn vào thẻ hoặc phím Space để lật</small>
          </div>

          <div className="flashcard-face flashcard-back">
            <span className="flashcard-badge">MẶT SAU</span>
            <h3>Nghĩa và ngữ cảnh</h3>
            {currentCard.back.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        <button
          className="flashcard-nav"
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
        >
          →
        </button>
      </section>

      <section className="flashcards-actions">
        <button
          className="secondary"
          onClick={() => setIsFlipped((prev) => !prev)}
        >
          {isFlipped ? "ẨN ĐÁP ÁN" : "REVEAL / LẬT THẺ"}
        </button>
        <button
          className={`mark-btn known ${currentStatus === "known" ? "active" : ""}`}
          onClick={() => markCard("known")}
        >
          MARK KNOWN (K)
        </button>
        <button
          className={`mark-btn review ${currentStatus === "review" ? "active" : ""}`}
          onClick={() => markCard("review")}
        >
          MARK REVIEW (R)
        </button>
        <button
          className="primary-gradient finish-session-btn"
          disabled={reviewedCount < cards.length}
          onClick={finishSession}
        >
          HOÀN TẤT PHIÊN ÔN
        </button>
      </section>

      <section className="card flashcards-footer">
        <p>
          Điều hướng nhanh: <strong>Space</strong> lật thẻ, <strong>←/→</strong>{" "}
          chuyển thẻ, <strong>K</strong> đánh dấu thuộc, <strong>R</strong> đánh
          dấu cần ôn.
        </p>
      </section>
    </div>
  );
};
