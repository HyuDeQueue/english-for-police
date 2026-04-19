import React from 'react';
import type { Unit } from '../../types';

interface LessonViewProps {
  unit: Unit;
  onBack: () => void;
  onStartPractice: (unit: Unit) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ unit, onBack, onStartPractice }) => {
  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="view-lesson animate-fade-in">
      <button className="back-btn" onClick={onBack}>← BACK TO OPS</button>
      
      <section className="lesson-part">
        <div className="part-header">
          <span className="part-num">01</span>
          <h2>SPECIALIZED VOCABULARY</h2>
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
              <button className="audio-btn" onClick={(e) => { e.stopPropagation(); playAudio(v.word); }}>
                🔊 Listen
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
          <h2>PROFESSIONAL PHRASES</h2>
        </div>
        <div className="grid cols-2">
          {unit.phrases.map((p, i) => (
            <div key={i} className="card phrase-card">
              <div className="phrase-text">{p.text}</div>
              <div className="phrase-translation">{p.translation}</div>
              <div className="phrase-context">{p.context}</div>
              <button className="audio-btn" onClick={() => playAudio(p.text)}>
                🔊 Play Audio
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-part">
        <div className="part-header">
          <span className="part-num">03</span>
          <h2>MEMORY BOOST</h2>
        </div>
        <div className="grid cols-2">
          <div className="card boost-card">
            <h3>Collocations</h3>
            <ul className="collocation-list">
              {unit.memoryBoost.collocations.map((c, i) => (
                <li key={i}><strong>{c.verb}</strong> + {c.noun}</li>
              ))}
            </ul>
          </div>
          <div className="card boost-card">
            <h3>Mission Summary</h3>
            <p>{unit.memoryBoost.summary}</p>
          </div>
        </div>
      </section>

      <div className="action-row">
        <button className="primary-gradient large-btn" onClick={() => onStartPractice(unit)}>
          PROCEED TO TRAINING GROUND
        </button>
      </div>
    </div>
  );
};
