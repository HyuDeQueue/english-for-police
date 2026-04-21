import React, { useState } from "react";
import type { Question, Unit } from "../../types";
import { SpeakingPractice } from "./SpeakingPractice";

interface TrainingGroundProps {
  unit: Unit;
  onComplete: () => void;
  onBack: () => void;
}

export const TrainingGround: React.FC<TrainingGroundProps> = ({
  unit,
  onComplete,
  onBack,
}) => {
  type PracticeMode =
    | "sentencePatterns"
    | "vocabulary"
    | "mixed"
    | "fullTopicTest";

  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(
    unit.id === 1 ? null : "fullTopicTest",
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    msg: string;
  } | null>(null);

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

  const activeQuestions =
    selectedMode === "sentencePatterns"
      ? sentencePatternQuestions
      : selectedMode === "vocabulary"
        ? vocabularyQuestions
        : selectedMode === "mixed"
          ? mixedQuestions
          : fullTopicQuestions;

  const currentQuestion = activeQuestions[currentQuestionIndex];

  const modeLabel =
    selectedMode === "sentencePatterns"
      ? "Part 2 - Sentence Patterns"
      : selectedMode === "vocabulary"
        ? "Part 1 - Vocabulary"
        : selectedMode === "mixed"
          ? "Mixed Review"
          : "Full Topic Test";

  const startMode = (mode: PracticeMode) => {
    setSelectedMode(mode);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setUserAnswer("");
    setFeedback(null);
  };

  const handleMCQ = (option: string) => {
    const isCorrect = option === currentQuestion.answer;
    setFeedback({
      correct: isCorrect,
      msg: isCorrect
        ? "Đã hoàn thành mục tiêu. Đang chuyển sang nội dung tiếp theo."
        : `Không chính xác. Đáp án đúng là: ${currentQuestion.answer}`,
    });
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleInputSubmit = () => {
    const isCorrect =
      userAnswer.trim().toLowerCase() ===
      (currentQuestion.answer as string).toLowerCase();
    setFeedback({
      correct: isCorrect,
      msg: isCorrect
        ? "Dữ liệu đã được xác nhận chính xác."
        : `Dữ liệu không khớp. Yêu cầu: ${currentQuestion.answer}`,
    });
    if (isCorrect) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    setFeedback(null);
    setUserAnswer("");
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  if (unit.id === 1 && selectedMode === null) {
    return (
      <div className="practice-container animate-fade-in">
        <button className="back-btn" onClick={onBack}>
          ← QUAY LẠI PHẦN HỌC
        </button>
        <div className="card">
          <h2>TOPIC 1 - PRACTICE GROUPS</h2>
          <p>
            Học theo nhóm tuần tự: Sentence Patterns trước, sau đó Vocabulary,
            rồi Mixed và Full Topic Test.
          </p>
          <div className="practice-mode-grid">
            <button
              className="primary-gradient"
              onClick={() => startMode("sentencePatterns")}
            >
              PART 2 - SENTENCE PATTERNS (10)
            </button>
            <button
              className="secondary"
              onClick={() => startMode("vocabulary")}
            >
              PART 1 - VOCABULARY (10)
            </button>
            <button className="secondary" onClick={() => startMode("mixed")}>
              MIXED REVIEW (10)
            </button>
            <button
              className="secondary"
              onClick={() => startMode("fullTopicTest")}
            >
              FULL TOPIC TEST (20)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="card animate-fade-in text-center result-card">
        <div className="asymmetry-label">END</div>
        <h2>HOÀN THÀNH HUẤN LUYỆN</h2>
        <p className="type-tag">{modeLabel}</p>
        <div className="result-score">
          <span className="score-val">
            {Math.round((score / activeQuestions.length) * 100)}%
          </span>
          <label>ĐỘ CHÍNH XÁC</label>
        </div>
        <p>Nhiệm vụ đã kết thúc. Kết quả của bạn đã được ghi lại hệ thống.</p>
        {unit.id === 1 && (
          <button
            className="secondary"
            style={{ marginRight: "0.75rem" }}
            onClick={() => {
              setSelectedMode(null);
              setShowResult(false);
              setCurrentQuestionIndex(0);
              setScore(0);
              setUserAnswer("");
              setFeedback(null);
            }}
          >
            CHỌN NHÓM KHÁC
          </button>
        )}
        <button className="primary-gradient" onClick={onComplete}>
          QUAY LẠI LỘ TRÌNH
        </button>
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
          <p>
            Bài học hiện chưa có đủ câu hỏi cho chế độ này. Hãy chọn nhóm khác
            hoặc bổ sung dữ liệu trong phần quản trị.
          </p>
          {unit.id === 1 && (
            <button className="secondary" onClick={() => setSelectedMode(null)}>
              CHỌN NHÓM KHÁC
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="practice-container animate-fade-in">
      <button className="back-btn" onClick={onBack}>
        ← QUAY LẠI PHẦN HỌC
      </button>
      <div className="card">
        <div
          className="progress-bar-container"
          style={{ marginBottom: "2rem" }}
        >
          <div
            className="progress-bar-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`,
            }}
          ></div>
        </div>

        <div className="mode-chip-row">
          <span className="type-tag">{modeLabel}</span>
          {unit.id === 1 && (
            <button className="secondary" onClick={() => setSelectedMode(null)}>
              ĐỔI NHÓM
            </button>
          )}
        </div>

        <div className="training-layout">
          {/* Left Column: Mission Details */}
          <div className="mission-sidebar">
            <div className="question-header">
              <span className="type-tag">
                {currentQuestion.type === "MCQ"
                  ? "Trắc nghiệm"
                  : currentQuestion.type === "FillInBlank"
                    ? "Điền khuyết"
                    : currentQuestion.type === "Dictation"
                      ? "Chép chính tả"
                      : "Luyện nói"}
              </span>
              <h3>{currentQuestion.prompt}</h3>
              {currentQuestion.circumstance && (
                <p className="question-circumstance">
                  Bối cảnh: {currentQuestion.circumstance}
                </p>
              )}
              {currentQuestion.vnPrompt && (
                <div className="vn-prompt-text">{currentQuestion.vnPrompt}</div>
              )}
            </div>
          </div>

          {/* Right Column: Interaction & Feedback */}
          <div className="action-center">
            <div className="question-body">
              {currentQuestion.type === "MCQ" && (
                <div className="options-grid">
                  {currentQuestion.options?.map((opt, i) => (
                    <button
                      key={i}
                      className={`option-btn ${feedback ? (opt === currentQuestion.answer ? "correct" : opt === userAnswer ? "wrong" : "") : ""}`}
                      onClick={() => {
                        if (feedback) return;
                        setUserAnswer(opt);
                        handleMCQ(opt);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {(currentQuestion.type === "FillInBlank" ||
                currentQuestion.type === "Dictation") && (
                <div className="input-group">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    disabled={!!feedback}
                    onKeyPress={(e) => e.key === "Enter" && handleInputSubmit()}
                    className="practice-input"
                  />
                  {!feedback && (
                    <button
                      onClick={handleInputSubmit}
                      className="submit-btn primary-gradient"
                    >
                      XÁC NHẬN
                    </button>
                  )}
                </div>
              )}

              {currentQuestion.type === "Speaking" && (
                <SpeakingPractice
                  prompt={currentQuestion.prompt}
                  answer={currentQuestion.answer as string}
                  onCorrect={() => {
                    setScore((s) => s + 1);
                    setFeedback({
                      correct: true,
                      msg: "Giọng nói đã được xác minh. Chấp nhận kết quả.",
                    });
                  }}
                />
              )}
            </div>

            <div className="feedback-container">
              {feedback && (
                <div
                  className={`feedback-alert animate-fade-in ${feedback.correct ? "success" : "fail"}`}
                >
                  <div className="feedback-status">
                    <span className="status-icon">
                      {feedback.correct ? "✓" : "⚠"}
                    </span>
                    <p>{feedback.msg}</p>
                  </div>
                  <button className="next-btn" onClick={nextQuestion}>
                    NHIỆM VỤ TIẾP THEO →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
