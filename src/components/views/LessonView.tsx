import React from "react";
import type { Unit } from "../../types";

interface LessonViewProps {
  unit: Unit;
  onBack: () => void;
  onStartPractice: (unit: Unit) => void;
  onStartFlashcards: (unit: Unit) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  unit,
  onBack,
  onStartPractice,
  onStartFlashcards,
}) => {
  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="view-lesson animate-fade-in">
      <button className="back-btn" onClick={onBack}>
        ← QUAY LẠI LỘ TRÌNH
      </button>

      <section className="lesson-part">
        <div className="part-header">
          <span className="part-num">01</span>
          <h2>TỪ VỰNG CHUYÊN NGÀNH</h2>
        </div>
        <div className="grid cols-3">
          {unit.vocabulary.map((v, i) => (
            <div key={i} className="card vocab-card">
              <div className="vocab-word">
                <strong>{v.word}</strong>
                <span className="type-tag">{v.type}</span>
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
          ))}
        </div>
      </section>

      <section className="lesson-part">
        <div className="part-header">
          <span className="part-num">02</span>
          <h2>CẤU TRÚC CHUYÊN NGHIỆP</h2>
        </div>
        <div className="grid cols-2">
          {unit.phrases.map((p, i) => (
            <div key={i} className="card phrase-card">
              <div className="phrase-text">{p.text}</div>
              <div className="phrase-translation">{p.translation}</div>
              <div className="phrase-context">{p.context}</div>
              <button className="audio-btn" onClick={() => playAudio(p.text)}>
                🔊 Nghe
              </button>
            </div>
          ))}
        </div>
      </section>

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
          <div className="card boost-card">
            <h3>Tóm tắt nhiệm vụ</h3>
            <p>{unit.memoryBoost.summary}</p>
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
          BẮT ĐẦU LUYỆN TẬP
        </button>
      </div>
    </div>
  );
};
