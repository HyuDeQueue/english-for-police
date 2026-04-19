import React, { useState } from 'react';
import type { Unit } from '../../types';
import { ReflexWheel } from './ReflexWheel';

interface TrainingGroundProps {
  unit: Unit;
  onComplete: () => void;
  onBack: () => void;
}

export const TrainingGround: React.FC<TrainingGroundProps> = ({ unit, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean, msg: string } | null>(null);

  const currentQuestion = unit.practice[currentQuestionIndex];

  const handleMCQ = (option: string) => {
    const isCorrect = option === currentQuestion.answer;
    setFeedback({ 
      correct: isCorrect, 
      msg: isCorrect ? 'Mission objective achieved. Proceeding to next objective.' : `Target missed. Correct response was: ${currentQuestion.answer}` 
    });
    if (isCorrect) setScore(s => s + 1);
  };

  const handleInputSubmit = () => {
    const isCorrect = userAnswer.trim().toLowerCase() === (currentQuestion.answer as string).toLowerCase();
    setFeedback({ 
      correct: isCorrect, 
      msg: isCorrect ? 'Input verified. Target summarized correctly.' : `Data mismatch. Expected: ${currentQuestion.answer}` 
    });
    if (isCorrect) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    setFeedback(null);
    setUserAnswer('');
    if (currentQuestionIndex < unit.practice.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="card animate-fade-in text-center result-card">
        <div className="asymmetry-label">END</div>
        <h2>TRAINING COMPLETE</h2>
        <div className="result-score">
          <span className="score-val">{Math.round((score / unit.practice.length) * 100)}%</span>
          <label>ACCURACY RATING</label>
        </div>
        <p>The mission has been concluded. Your performance has been logged.</p>
        <button className="primary-gradient" onClick={onComplete}>RETURN TO OPS</button>
      </div>
    );
  }

  return (
    <div className="practice-container animate-fade-in">
      <button className="back-btn" onClick={onBack}>← BACK TO BRIEFING</button>
      <div className="card">
        <div className="progress-bar-container" style={{marginBottom: '2rem'}}>
          <div 
            className="progress-bar-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / unit.practice.length) * 100}%` }}
          ></div>
        </div>

        <div className="training-layout">
          {/* Left Column: Mission Details */}
          <div className="mission-sidebar">
            <div className="question-header">
              <span className="type-tag">{currentQuestion.type}</span>
              <h3>{currentQuestion.prompt}</h3>
              {currentQuestion.vnPrompt && <div className="vn-prompt-text">{currentQuestion.vnPrompt}</div>}
            </div>
          </div>

          {/* Right Column: Interaction & Feedback */}
          <div className="action-center">
            <div className="question-body">
              {currentQuestion.type === 'MCQ' && (
                <div className="grid cols-1 options-grid">
                  {currentQuestion.options?.map((opt, i) => (
                    <button 
                      key={i} 
                      className={`option-btn ${feedback ? (opt === currentQuestion.answer ? 'correct' : (opt === userAnswer ? 'wrong' : '')) : ''}`}
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

              {(currentQuestion.type === 'FillInBlank' || currentQuestion.type === 'Dictation') && (
                <div className="input-group">
                  <input 
                    type="text" 
                    value={userAnswer} 
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your response..."
                    disabled={!!feedback}
                    onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                    className="practice-input"
                  />
                  {!feedback && <button onClick={handleInputSubmit} className="submit-btn primary-gradient">SUBMIT</button>}
                </div>
              )}

              {currentQuestion.type === 'Speaking' && (
                <ReflexWheel 
                  prompt={currentQuestion.prompt} 
                  answer={currentQuestion.answer as string}
                  onCorrect={() => {
                    setScore(s => s + 1);
                    setFeedback({ correct: true, msg: 'Speech verified. Authentication granted.' });
                  }}
                />
              )}
            </div>

            <div className="feedback-container">
              {feedback && (
                <div className={`feedback-alert animate-fade-in ${feedback.correct ? 'success' : 'fail'}`}>
                  <div className="feedback-status">
                    <span className="status-icon">{feedback.correct ? '✓' : '⚠'}</span>
                    <p>{feedback.msg}</p>
                  </div>
                  <button className="next-btn" onClick={nextQuestion}>NEXT TASK →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
