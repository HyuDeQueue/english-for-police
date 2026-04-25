import React, { useState, useRef } from "react";
import type { Unit, FlaggedItem } from "../../types";

interface LessonViewProps {
  unit: Unit;
  onBack: () => void;
  onStartPractice: (unit: Unit) => void;
  onStartFlashcards: (unit: Unit) => void;
  isFlagged: (
    unitId: number,
    type: "vocabulary" | "phrase",
    key: string,
  ) => boolean;
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
  const playAudio = (text: string, buttonEl?: HTMLButtonElement) => {
    if (buttonEl) {
      buttonEl.classList.add("playing");
      buttonEl.disabled = true;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onend = () => {
      if (buttonEl) {
        buttonEl.classList.remove("playing");
        buttonEl.disabled = false;
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const [expandedPhrases, setExpandedPhrases] = useState<Set<number>>(
    new Set(),
  );
  const [activeSection, setActiveSection] = useState<string>("summary");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

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
      <aside className="lesson-sidebar">
        <div className="lesson-toc-sidebar">
          <h4>Mục lục</h4>
          <button
            className="back-btn"
            onClick={onBack}
            style={{
              width: "100%",
              textAlign: "left",
              marginBottom: "1rem",
              padding: "0.5rem",
            }}
          >
            ← Quay lại
          </button>
          <ul className="toc-list">
            <li className="toc-item">
              <button
                className={`toc-link ${activeSection === "summary" ? "active" : ""}`}
                onClick={() => {
                  setActiveSection("summary");
                  sectionRefs.current["summary"]?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Tóm tắt
              </button>
            </li>
            {unit.videoUrl && (
              <li className="toc-item">
                <button
                  className={`toc-link ${activeSection === "video" ? "active" : ""}`}
                  onClick={() => {
                    setActiveSection("video");
                    sectionRefs.current["video"]?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  🎬 Video
                </button>
              </li>
            )}
            <li className="toc-item">
              <button
                className={`toc-link ${activeSection === "vocabulary" ? "active" : ""}`}
                onClick={() => {
                  setActiveSection("vocabulary");
                  sectionRefs.current["vocabulary"]?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                01 Từ vựng
              </button>
            </li>
            <li className="toc-item">
              <button
                className={`toc-link ${activeSection === "phrases" ? "active" : ""}`}
                onClick={() => {
                  setActiveSection("phrases");
                  sectionRefs.current["phrases"]?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                02 Cấu trúc
              </button>
            </li>
            <li className="toc-item">
              <button
                className={`toc-link ${activeSection === "memory" ? "active" : ""}`}
                onClick={() => {
                  setActiveSection("memory");
                  sectionRefs.current["memory"]?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                03 Ghi nhớ
              </button>
            </li>
          </ul>
        </div>

        <div className="lesson-progress-sidebar">
          <h4>Đánh dấu</h4>
          <div>
            {unit.vocabulary.some((v) =>
              isFlagged(unit.id, "vocabulary", v.word),
            ) ? (
              unit.vocabulary.map((v, i) =>
                isFlagged(unit.id, "vocabulary", v.word) ? (
                  <div key={i} className="progress-item flagged" title={v.word}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {v.word}
                    </span>
                  </div>
                ) : null,
              )
            ) : (
              <p style={{ fontSize: "0.8rem", opacity: "0.6", margin: "0" }}>
                Không có từ nào được đánh dấu
              </p>
            )}
          </div>
        </div>
      </aside>

      <div className="lesson-main-content">
        <div className="summary-video-grid">
          <section
            className="lesson-part summary-section"
            ref={(el) => {
              if (el) sectionRefs.current["summary"] = el;
            }}
          >
            <div className="card boost-card summary-hero">
              <h3>Tóm tắt bài học</h3>
              <p>{unit.memoryBoost.summary}</p>
            </div>
          </section>

          {unit.videoUrl ? (
            <section
              className="lesson-part"
              ref={(el) => {
                if (el) sectionRefs.current["video"] = el;
              }}
            >
              <div className="part-header">
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
          ) : (
            <section className="lesson-part">
              <div className="card video-placeholder">
                <span>🎬</span>
                <p>Video thực tế sẽ được cập nhật sớm</p>
              </div>
            </section>
          )}
        </div>

        <section
          className="lesson-part"
          ref={(el) => {
            if (el) sectionRefs.current["vocabulary"] = el;
          }}
        >
          <div className="part-header">
            <span className="part-num">01</span>
            <h2>TỪ VỰNG CHUYÊN NGÀNH</h2>
          </div>
          <div className="grid cols-3">
            {unit.vocabulary.map((v, i) => {
              const flagged = isFlagged(unit.id, "vocabulary", v.word);
              return (
                <div
                  key={i}
                  className={`card vocab-card ${flagged ? "flagged" : ""}`}
                >
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
                        {flagged ? "⭐" : "☆"}
                      </button>
                    </div>
                  </div>
                  <div className="phonetic">{v.phonetic}</div>
                  <div className="meaning">{v.meaning}</div>
                  <button
                    className="audio-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(v.word, e.currentTarget);
                    }}
                  >
                    🔊 Nghe
                  </button>
                  <div className="example">
                    <em>Ex: {v.example}</em>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          className="lesson-part"
          ref={(el) => {
            if (el) sectionRefs.current["phrases"] = el;
          }}
        >
          <div className="part-header">
            <span className="part-num">02</span>
            <h2>CẤU TRÚC CHUYÊN NGHIỆP</h2>
          </div>
          <div className="grid cols-1">
            {unit.phrases.map((p, i) => {
              const expanded = expandedPhrases.has(i);
              const flagged = isFlagged(unit.id, "phrase", p.text);
              return (
                <div
                  key={i}
                  className={`card phrase-card ${flagged ? "flagged" : ""}`}
                >
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
                        title={flagged ? "Bỏ đánh dấu" : "Đánh dấu ôn lại"}
                      >
                        {flagged ? "⭐" : "☆"}
                      </button>
                      <button
                        className="audio-btn"
                        onClick={(e) => {
                          playAudio(p.text, e.currentTarget);
                        }}
                      >
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
                            Tình huống: Khi tiếp xúc với người nước ngoài trong
                            khu vực tuần tra, sử dụng câu này để{" "}
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

        <section
          className="lesson-part"
          ref={(el) => {
            if (el) sectionRefs.current["memory"] = el;
          }}
        >
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

        <div className="action-row">
          <button
            className="secondary large-btn"
            onClick={() => onStartFlashcards(unit)}
            style={{ marginRight: "1rem" }}
          >
            ÔN TẬP FLASHCARDS
          </button>
          <button
            className="primary-gradient large-btn"
            onClick={() => onStartPractice(unit)}
          >
            BẮT ĐẦU KIỂM TRA
          </button>
        </div>
      </div>
    </div>
  );
};
