import React from "react";
import type { FlashcardSessionSummary } from "./FlashcardReview";

interface FlashcardSessionResultsProps {
  summary: FlashcardSessionSummary;
  onRetry: () => void;
  onBackToLesson: () => void;
}

export const FlashcardSessionResults: React.FC<
  FlashcardSessionResultsProps
> = ({ summary, onRetry, onBackToLesson }) => {
  const knownDelta =
    summary.previousKnownRate === null
      ? null
      : summary.currentKnownRate - summary.previousKnownRate;

  return (
    <div className="flashcard-results-view animate-fade-in">
      <section className="card flashcard-results-hero">
        <div>
          <span className="type-tag">MISSION COMPLETE</span>
          <h2>KẾT QUẢ PHIÊN ÔN FLASHCARD</h2>
          <p>
            Bài {summary.unitId}: {summary.unitTitle}
          </p>
        </div>
        <div className="result-score">
          <span className="score-val">{summary.currentKnownRate}%</span>
          <label>TỈ LỆ THUỘC BÀI</label>
        </div>
      </section>

      <section className="flashcard-results-kpis">
        <div className="card">
          <label>ĐÃ REVIEW</label>
          <strong>
            {summary.reviewedCount}/{summary.totalCards}
          </strong>
        </div>
        <div className="card">
          <label>KNOWN</label>
          <strong>{summary.knownCount}</strong>
        </div>
        <div className="card">
          <label>NEEDS REVIEW</label>
          <strong>{summary.reviewCount}</strong>
        </div>
      </section>

      <section className="card flashcard-results-trend">
        <h3>Xu hướng hôm nay</h3>
        <p>
          Hiện tại: <strong>{summary.currentKnownRate}%</strong>
          {summary.previousKnownRate !== null && (
            <>
              {" "}
              | Lần trước: <strong>{summary.previousKnownRate}%</strong> | Chênh
              lệch:{" "}
              <strong>
                {knownDelta && knownDelta > 0 ? `+${knownDelta}` : knownDelta}%
              </strong>
            </>
          )}
        </p>
      </section>

      <section className="card flashcard-results-weak-list">
        <h3>Thẻ cần ôn lại</h3>
        {summary.weakCards.length === 0 && (
          <p className="weak-empty">Không có thẻ yếu. Bạn đã xử lý rất tốt.</p>
        )}

        {summary.weakCards.length > 0 && (
          <ul>
            {summary.weakCards.map((card) => {
              const shortBack = card.back.split("\n")[0];
              return (
                <li key={card.id}>
                  <span>{card.front}</span>
                  <small>{shortBack}</small>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flashcard-results-actions">
        <button className="primary-gradient" onClick={onRetry}>
          ÔN LẠI TỪ ĐẦU
        </button>
        <button className="secondary" onClick={onBackToLesson}>
          QUAY LẠI BÀI HỌC
        </button>
      </section>
    </div>
  );
};
