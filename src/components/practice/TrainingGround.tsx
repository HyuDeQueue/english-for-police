import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Question, Unit } from "../../types";
import { SpeakingPractice } from "./SpeakingPractice";

interface TrainingGroundProps {
  unit: Unit;
  onComplete: () => void;
  onBack: () => void;
}

type PracticeMode =
  | "sentencePatterns"
  | "vocabulary"
  | "mixed"
  | "fullTopicTest";

const SECONDS_PER_QUESTION = 60;

export const TrainingGround: React.FC<TrainingGroundProps> = ({
  unit,
  onComplete,
  onBack,
}) => {
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(
    unit.id === 1 ? null : "fullTopicTest",
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeRecords, setTimeRecords] = useState<Record<string, number>>({});
  const questionStartRef = useRef<number>(0);

  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs for smooth scrolling to questions
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const buildTopicOneVocabularyQuestions = (): Question[] =>
    unit.vocabulary.slice(0, 10).map((vocab, index) => ({
      id: `u1_vocab_${index + 1}`,
      type: "FillInBlank",
      prompt: `Fill in the term: ${vocab.meaning} (${vocab.phonetic})`,
      circumstance: `Vocabulary Drill ${index + 1}/10`,
      answer: vocab.word,
    }));

  const buildTopicOneSentencePatternQuestions = (): Question[] =>
    unit.phrases.slice(0, 10).map((phrase, index) => ({
      id: `u1_pattern_${index + 1}`,
      type: "Dictation",
      prompt: phrase.translation,
      circumstance: `Sentence Pattern Drill ${index + 1}/10`,
      vnPrompt: phrase.translation,
      answer: phrase.text,
    }));

  const vocabularyQuestions =
    unit.id === 1 ? buildTopicOneVocabularyQuestions() : unit.practice;
  const sentencePatternQuestions =
    unit.id === 1 ? buildTopicOneSentencePatternQuestions() : unit.practice;
  const mixedQuestions =
    unit.id === 1
      ? [
          ...sentencePatternQuestions.slice(0, 5),
          ...vocabularyQuestions.slice(0, 5),
        ]
      : unit.practice;
  const fullTopicQuestions =
    unit.id === 1
      ? [...sentencePatternQuestions, ...vocabularyQuestions]
      : unit.practice;

  const reorderByDifficulty = useCallback(
    (questions: Question[]) => {
      const diffKey = `police_english_difficult_${unit.id}`;
      try {
        const saved = localStorage.getItem(diffKey);
        if (!saved) return questions;
        const difficultIds: string[] = JSON.parse(saved);
        const difficult = questions.filter((q) => difficultIds.includes(q.id));
        const rest = questions.filter((q) => !difficultIds.includes(q.id));
        return [...difficult, ...rest];
      } catch {
        return questions;
      }
    },
    [unit.id],
  );

  const activeQuestions =
    selectedMode === "sentencePatterns"
      ? reorderByDifficulty(sentencePatternQuestions)
      : selectedMode === "vocabulary"
        ? reorderByDifficulty(vocabularyQuestions)
        : selectedMode === "mixed"
          ? reorderByDifficulty(mixedQuestions)
          : reorderByDifficulty(fullTopicQuestions);

  const currentQuestion = activeQuestions[currentQuestionIndex];

  // Start timer when mode is selected
  useEffect(() => {
    if (selectedMode && !submitted) {
      const total = activeQuestions.length * SECONDS_PER_QUESTION;
      const id = setInterval(() => {
        setTotalTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      timerRef.current = id;
      setTimeout(() => setTotalTimeLeft(total), 0);
      return () => clearInterval(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode, submitted]);

  useEffect(() => {
    questionStartRef.current = performance.now();
  }, [currentQuestionIndex]);

  const recordTimeForQuestion = useCallback((qId: string) => {
    const now = performance.now();
    const elapsed = Math.round((now - questionStartRef.current) / 1000);
    setTimeRecords((prev) => ({
      ...prev,
      [qId]: (prev[qId] || 0) + elapsed,
    }));
  }, []);

  const setAnswer = (questionId: string, answer: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const goToQuestion = (index: number) => {
    if (currentQuestion) recordTimeForQuestion(currentQuestion.id);
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    if (currentQuestion) recordTimeForQuestion(currentQuestion.id);
    clearInterval(timerRef.current);
    setSubmitted(true);

    const times = Object.values(timeRecords);
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const difficultIds = Object.entries(timeRecords)
        .filter(([, t]) => t > avg * 2)
        .map(([id]) => id);
      if (difficultIds.length > 0) {
        localStorage.setItem(
          `police_english_difficult_${unit.id}`,
          JSON.stringify(difficultIds),
        );
      }
    }
  };

  const getScore = () => {
    let correct = 0;
    for (const q of activeQuestions) {
      const userAns = answers[q.id]?.trim().toLowerCase() || "";
      const correctAns =
        q.type === "Scenario"
          ? (q.bestAnswer || (q.answer as string)).toLowerCase()
          : (q.answer as string).toLowerCase();
      if (userAns === correctAns) correct++;
    }
    return correct;
  };

  const answeredCount = activeQuestions.filter((q) => answers[q.id]).length;
  const allAnswered = answeredCount === activeQuestions.length;
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const startMode = (mode: PracticeMode) => {
    setSelectedMode(mode);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setTimeRecords({});
  };

  // Mode selection
  if (unit.id === 1 && selectedMode === null) {
    return (
      <div className="practice-container animate-fade-in">
        <button className="back-btn" onClick={onBack}>
          ← QUAY LẠI PHẦN HỌC
        </button>
        <div className="card">
          <h2>TOPIC 1 - CHỌN NHÓM LUYỆN TẬP</h2>
          <p>Chọn nhóm bài tập phù hợp:</p>
          <div className="practice-mode-grid">
            <button
              className="primary-gradient"
              onClick={() => startMode("sentencePatterns")}
            >
              MẪU CÂU (10)
            </button>
            <button
              className="secondary"
              onClick={() => startMode("vocabulary")}
            >
              TỪ VỰNG (10)
            </button>
            <button className="secondary" onClick={() => startMode("mixed")}>
              HỖN HỢP (10)
            </button>
            <button
              className="secondary"
              onClick={() => startMode("fullTopicTest")}
            >
              TOÀN BỘ (20)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results after submit
  if (submitted) {
    const score = getScore();
    const total = activeQuestions.length;
    const percent = Math.round((score / total) * 100);

    // Find difficult ones
    const times = Object.values(timeRecords);
    const avg =
      times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;

    return (
      <div className="practice-container animate-fade-in">
        <div className="card result-card text-center">
          <div className="asymmetry-label">KẾT QUẢ</div>
          <h2>HOÀN THÀNH KIỂM TRA</h2>
          <div className="result-score">
            <span className="score-val">{percent}%</span>
            <label>
              ĐỘ CHÍNH XÁC ({score}/{total})
            </label>
          </div>
        </div>

        <div className="results-review">
          <h3>📋 Chi tiết kết quả</h3>
          {activeQuestions.map((q, i) => {
            const userAns = answers[q.id] || "(Chưa trả lời)";
            const correctAns =
              q.type === "Scenario"
                ? q.bestAnswer || (q.answer as string)
                : (q.answer as string);
            const isCorrect =
              userAns.trim().toLowerCase() === correctAns.toLowerCase();
            const timeTaken = timeRecords[q.id] || 0;
            const isDifficult = timeTaken > avg * 2;

            return (
              <div
                key={q.id}
                className={`card result-item ${isCorrect ? "correct" : "wrong"}`}
              >
                <div className="result-item-header">
                  <span className="result-q-num">Câu {i + 1}</span>
                  <span
                    className={`result-badge ${isCorrect ? "success" : "fail"}`}
                  >
                    {isCorrect ? "✓ Đúng" : "✗ Sai"}
                  </span>
                  {isDifficult && (
                    <span className="result-badge difficult">⏱ Câu khó</span>
                  )}
                </div>
                <p className="result-prompt">{q.prompt}</p>
                {!isCorrect && (
                  <div className="result-answers">
                    <div className="your-answer">Bạn: {userAns}</div>
                    <div className="correct-answer">Đáp án: {correctAns}</div>
                  </div>
                )}
                {q.explanation && (
                  <p className="result-explanation">💡 {q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="action-row">
          {unit.id === 1 && (
            <button
              className="secondary"
              style={{ marginRight: "0.75rem" }}
              onClick={() => {
                setSelectedMode(null);
                setSubmitted(false);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setTimeRecords({});
              }}
            >
              CHỌN NHÓM KHÁC
            </button>
          )}
          <button className="primary-gradient" onClick={onComplete}>
            QUAY LẠI LỘ TRÌNH
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="practice-container animate-fade-in">
        <button className="back-btn" onClick={onBack}>
          ← QUAY LẠI PHẦN HỌC
        </button>
        <div className="card">
          <h2>KHÔNG CÓ DỮ LIỆU LUYỆN TẬP</h2>
          <p>Bài học hiện chưa có đủ câu hỏi cho chế độ này.</p>
        </div>
      </div>
    );
  }

  // Main test UI
  return (
    <div className="practice-container animate-fade-in">
      <div className="test-layout">
        {/* Left: Sidebar (Timer + Question Grid) */}
        <div className="test-sidebar">
          <button
            className="back-btn"
            onClick={onBack}
            style={{ marginBottom: "1rem", alignSelf: "flex-start" }}
          >
            ← QUAY LẠI PHẦN HỌC
          </button>
          <div className="card timer-card">
            <div className="timer-display">
              <span className="timer-icon">⏱</span>
              <span
                className={`timer-value ${totalTimeLeft < 60 ? "warning" : ""}`}
              >
                {formatTime(totalTimeLeft)}
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${(answeredCount / activeQuestions.length) * 100}%`,
                }}
              />
            </div>
            <small>
              {answeredCount}/{activeQuestions.length} đã trả lời
            </small>
          </div>

          <div className="card question-grid-card">
            <h4>Danh sách câu hỏi</h4>
            <div className="question-grid">
              {activeQuestions.map((q, i) => {
                const status = answers[q.id]
                  ? "answered"
                  : i === currentQuestionIndex
                    ? "current"
                    : "unanswered";
                return (
                  <button
                    key={q.id}
                    className={`q-grid-btn ${status}`}
                    onClick={() => {
                      goToQuestion(i);
                      questionRefs.current[i]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            className={`submit-test-btn primary-gradient ${allAnswered ? "ready" : ""}`}
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            {allAnswered
              ? "NỘP BÀI"
              : `Còn ${activeQuestions.length - answeredCount} câu`}
          </button>
        </div>

        {/* Right: Question Area (Scrolling List) */}
        <div className="test-main">
          {activeQuestions.map((q, i) => (
            <div
              key={q.id}
              className="card test-question-card"
              style={{ marginBottom: "1.5rem" }}
              ref={(el) => {
                questionRefs.current[i] = el;
              }}
              onClick={() => setCurrentQuestionIndex(i)}
            >
              <div className="test-question-header">
                <span className="type-tag">
                  {q.type === "MCQ"
                    ? "Trắc nghiệm"
                    : q.type === "FillInBlank"
                      ? "Điền khuyết"
                      : q.type === "Dictation"
                        ? "Chép chính tả"
                        : q.type === "Scenario"
                          ? "Tình huống"
                          : "Luyện nói"}
                </span>
                <span className="question-counter">
                  Câu {i + 1}/{activeQuestions.length}
                </span>
              </div>

              {q.scenarioDescription && (
                <div className="scenario-box">
                  <strong>Tình huống:</strong> {q.scenarioDescription}
                </div>
              )}

              <h3 className="test-prompt">{q.prompt}</h3>

              {q.circumstance && (
                <p className="question-circumstance">
                  Bối cảnh: {q.circumstance}
                </p>
              )}
              {q.vnPrompt && <div className="vn-prompt-text">{q.vnPrompt}</div>}

              {/* MCQ / Scenario */}
              {(q.type === "MCQ" || q.type === "Scenario") && (
                <div className="options-grid">
                  {q.options?.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      className={`option-btn ${answers[q.id] === opt ? "selected" : ""}`}
                      onClick={() => setAnswer(q.id, opt)}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Fill / Dictation */}
              {(q.type === "FillInBlank" || q.type === "Dictation") && (
                <div className="input-group">
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    onFocus={() => setCurrentQuestionIndex(i)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="practice-input"
                  />
                </div>
              )}

              {/* Speaking */}
              {q.type === "Speaking" && (
                <SpeakingPractice
                  prompt={q.prompt}
                  answer={q.answer as string}
                  onCorrect={() => setAnswer(q.id, q.answer as string)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
