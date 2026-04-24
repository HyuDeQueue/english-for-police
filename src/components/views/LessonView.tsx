import React, { useState } from "react";
import type { Unit, FlaggedItem } from "../../types";

interface LessonViewProps {
  unit: Unit;
  onBack: () => void;
  onStartPractice: (unit: Unit) => void;
  onStartFlashcards: (unit: Unit) => void;
  isFlagged: (unitId: number, type: "vocabulary" | "phrase", key: string) => boolean;
  toggleFlag: (item: FlaggedItem) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  unit,
  onBack,
  onStartPractice,
  onStartFlashcards,
  isFlagged,
  toggleFlag,
}) => {
  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const [expandedPhrases, setExpandedPhrases] = useState<Set<number>>(new Set());

  const togglePhraseExpand = (index: number) => {
    setExpandedPhrases((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="view-lesson animate-fade-in">
      <button className="back-btn" onClick={onBack}>
        ← QUAY LẠI LỘ TRÌNH
      </button>

      {/* Summary FIRST */}
      <section className="lesson-part summary-section">
        <div className="card boost-card summary-hero">
          <h3>📌 Tóm tắt bài học</h3>
          <p>{unit.memoryBoost.summary}</p>
        </div>
      </section>

      {/* Video Section */}
      {unit.videoUrl && (
        <section className="lesson-part">
          <div className="part-header">
            <span className="part-num">🎬</span>
            <h2>VIDEO THỰC TẾ</h2>
          </div>
          <div className="video-container">
            <iframe
              src={unit.videoUrl}
              title="Video thực tế"
              allowFullScreen
              style={{
                width: "100%",
                aspectRatio: "16/9",
                border: "none",
                borderRadius: "0.375rem",
              }}
            />
          </div>
        </section>
      )}

      {!unit.videoUrl && (
        <section className="lesson-part">
          <div className="card video-placeholder">
            <span>🎬</span>
            <p>Video thực tế sẽ được cập nhật sớm</p>
          </div>
        </section>
      )}

      {/* Vocabulary */}
      <section className="lesson-part">
        <div className="part-header">
          <span className="part-num">01</span>
          <h2>TỪ VỰNG CHUYÊN NGÀNH</h2>
        </div>
        <div className="grid cols-3">
          {unit.vocabulary.map((v, i) => {
            const flagged = isFlagged(unit.id, "vocabulary", v.word);
            return (
              <div key={i} className={`card vocab-card ${flagged ? "flagged" : ""}`}>
                <div className="vocab-word">
                  <strong>{v.word}</strong>
                  <div className="vocab-actions">
                    <span className="type-tag">{v.type}</span>
                    <button
                      className={`flag-btn ${flagged ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlag({
                          unitId: unit.id,
                          type: "vocabulary",
                          key: v.word,
                        });
                      }}
                      title={flagged ? "Bỏ đánh dấu" : "Đánh dấu ôn lại"}
                    >
                      {flagged ? "🚩" : "🏳️"}
                    </button>
                  </div>
                </div>
                <div className="phonetic">{v.phonetic}</div>
                <div className="meaning">{v.meaning}</div>
                <button
                  className="audio-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(v.word);
                  }}
                >
                  🔊 Nghe phát âm
                </button>
                <div className="example">
                  <em>Ex: {v.example}</em>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Phrases with Dropdown */}
      <section className="lesson-part">
        <div className="part-header">
          <span className="part-num">02</span>
          <h2>CẤU TRÚC CHUYÊN NGHIỆP</h2>
        </div>
        <div className="grid cols-1">
          {unit.phrases.map((p, i) => {
            const expanded = expandedPhrases.has(i);
            const flagged = isFlagged(unit.id, "phrase", p.text);
            return (
              <div key={i} className={`card phrase-card ${flagged ? "flagged" : ""}`}>
                <div className="phrase-main">
                  <div className="phrase-content">
                    <div className="phrase-text">{p.text}</div>
                    <div className="phrase-translation">{p.translation}</div>
                  </div>
                  <div className="phrase-actions">
                    <button
                      className={`flag-btn ${flagged ? "active" : ""}`}
                      onClick={() =>
                        toggleFlag({
                          unitId: unit.id,
                          type: "phrase",
                          key: p.text,
                        })
                      }
                    >
                      {flagged ? "🚩" : "🏳️"}
                    </button>
                    <button className="audio-btn" onClick={() => playAudio(p.text)}>
                      🔊
                    </button>
                    <button
                      className="expand-btn"
                      onClick={() => togglePhraseExpand(i)}
                    >
                      {expanded ? "▲" : "▼"} Chi tiết
                    </button>
                  </div>
                </div>
                {expanded && (
                  <div className="phrase-details animate-fade-in">
                    <div className="phrase-context-detail">
                      <strong>Ngữ cảnh:</strong> {p.context}
                    </div>
                    {p.realWorldExamples && p.realWorldExamples.length > 0 ? (
                      <div className="real-world-examples">
                        <strong>Ví dụ thực tế:</strong>
                        <ul>
                          {p.realWorldExamples.map((ex, j) => (
                            <li key={j}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="real-world-examples">
                        <em>
                          Tình huống: Khi tiếp xúc với người nước ngoài trong khu
                          vực tuần tra, sử dụng câu này để{" "}
                          {p.context.toLowerCase()}.
                        </em>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Memory Boost - Collocations */}
      <section className="lesson-part">
        <div className="part-header">
          <span className="part-num">03</span>
          <h2>GHI NHỚ NHANH</h2>
        </div>
        <div className="grid cols-2">
          <div className="card boost-card">
            <h3>Cụm từ đi kèm</h3>
            <ul className="collocation-list">
              {unit.memoryBoost.collocations.map((c, i) => (
                <li key={i}>
                  <strong>{c.verb}</strong> + {c.noun}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="action-row">
        <button
          className="secondary large-btn"
          onClick={() => onStartFlashcards(unit)}
          style={{ marginRight: "1rem" }}
        >
          📖 ÔN TẬP FLASHCARDS
        </button>
        <button
          className="primary-gradient large-btn"
          onClick={() => onStartPractice(unit)}
        >
          ✍️ BẮT ĐẦU KIỂM TRA
        </button>
      </div>
    </div>
  );
};
