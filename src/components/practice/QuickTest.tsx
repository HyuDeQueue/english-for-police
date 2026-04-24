import React, { useState, useMemo } from "react";
import type { Unit, Question } from "../../types";

interface QuickTestProps {
  lessons: Unit[];
  completedUnitIds: number[];
  onBack: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const QuickTest: React.FC<QuickTestProps> = ({
  lessons,
  completedUnitIds,
  onBack,
}) => {
  const questions = useMemo<Question[]>(() => {
    const pool: Question[] = [];
    for (const unit of lessons) {
      if (!completedUnitIds.includes(unit.id)) continue;

      // Generate MCQ from vocabulary
      for (const vocab of unit.vocabulary.slice(0, 5)) {
        const wrongOptions = unit.vocabulary
          .filter((v) => v.word !== vocab.word)
          .slice(0, 3)
          .map((v) => v.meaning);

        pool.push({
          id: `qt_vocab_${unit.id}_${vocab.word}`,
          type: "MCQ",
          prompt: `"${vocab.word}" nghĩa là gì?`,
          options: shuffleArray([vocab.meaning, ...wrongOptions]),
          answer: vocab.meaning,
        });
      }

      // Generate fill-in from phrases
      for (const phrase of unit.phrases.slice(0, 3)) {
        pool.push({
          id: `qt_phrase_${unit.id}_${phrase.text.slice(0, 20)}`,
          type: "Dictation",
          prompt: phrase.translation,
          vnPrompt: phrase.translation,
          answer: phrase.text,
        });
      }
    }
    return shuffleArray(pool).slice(0, 10);
  }, [lessons, completedUnitIds]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentQ = questions[currentIndex];

  const setAnswer = (qId: string, ans: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  const score = questions.filter(
    (q) =>
      (answers[q.id] || "").trim().toLowerCase() ===
      (q.answer as string).toLowerCase()
  ).length;

  if (questions.length === 0) {
    return (
      <div className="practice-container animate-fade-in">
        <button className="back-btn" onClick={onBack}>← QUAY LẠI</button>
        <div className="card">
          <h2>Chưa có dữ liệu</h2>
          <p>Hãy hoàn thành ít nhất 1 bài học để mở bài test nhanh.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="practice-container animate-fade-in">
        <div className="card result-card text-center">
          <h2>⚡ BÀI TEST NHANH</h2>
          <div className="result-score">
            <span className="score-val">
              {Math.round((score / questions.length) * 100)}%
            </span>
            <label>
              {score}/{questions.length} câu đúng
            </label>
          </div>
        </div>

        <div className="results-review">
          {questions.map((q, i) => {
            const userAns = answers[q.id] || "(Chưa trả lời)";
            const isCorrect =
              userAns.trim().toLowerCase() === (q.answer as string).toLowerCase();
            return (
              <div key={q.id} className={`card result-item ${isCorrect ? "correct" : "wrong"}`}>
                <div className="result-item-header">
                  <span className="result-q-num">Câu {i + 1}</span>
                  <span className={`result-badge ${isCorrect ? "success" : "fail"}`}>
                    {isCorrect ? "✓" : "✗"}
                  </span>
                </div>
                <p className="result-prompt">{q.prompt}</p>
                {!isCorrect && (
                  <div className="result-answers">
                    <div className="your-answer">Bạn: {userAns}</div>
                    <div className="correct-answer">Đáp án: {q.answer as string}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="action-row">
          <button className="primary-gradient" onClick={onBack}>
            QUAY LẠI TRANG CHỦ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-container animate-fade-in">
      <button className="back-btn" onClick={onBack}>← QUAY LẠI</button>

      <div className="test-layout">
        <div className="test-main">
          <div className="card test-question-card">
            <div className="test-question-header">
              <span className="type-tag">⚡ Test nhanh</span>
              <span className="question-counter">
                Câu {currentIndex + 1}/{questions.length}
              </span>
            </div>

            <h3 className="test-prompt">{currentQ.prompt}</h3>
            {currentQ.vnPrompt && (
              <div className="vn-prompt-text">{currentQ.vnPrompt}</div>
            )}

            {currentQ.type === "MCQ" && (
              <div className="options-grid">
                {currentQ.options?.map((opt, i) => (
                  <button
                    key={i}
                    className={`option-btn ${answers[currentQ.id] === opt ? "selected" : ""}`}
                    onClick={() => setAnswer(currentQ.id, opt)}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {(currentQ.type === "FillInBlank" || currentQ.type === "Dictation") && (
              <div className="input-group">
                <input
                  type="text"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                  placeholder="Nhập câu trả lời..."
                  className="practice-input"
                />
              </div>
            )}

            <div className="test-nav-row">
              <button
                className="secondary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((p) => p - 1)}
              >
                ← Câu trước
              </button>
              <button
                className="secondary"
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((p) => p + 1)}
              >
                Câu sau →
              </button>
            </div>
          </div>
        </div>

        <div className="test-sidebar">
          <div className="card question-grid-card">
            <h4>Danh sách câu hỏi</h4>
            <div className="question-grid">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  className={`q-grid-btn ${answers[q.id] ? "answered" : i === currentIndex ? "current" : "unanswered"}`}
                  onClick={() => setCurrentIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <button
            className={`submit-test-btn primary-gradient ${Object.keys(answers).length === questions.length ? "ready" : ""}`}
            disabled={Object.keys(answers).length < questions.length}
            onClick={() => setSubmitted(true)}
          >
            NỘP BÀI
          </button>
        </div>
      </div>
    </div>
  );
};
