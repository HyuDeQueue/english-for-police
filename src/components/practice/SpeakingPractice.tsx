import React, { useState } from "react";

interface SpeakingPracticeProps {
  prompt: string;
  answer: string;
  onCorrect: () => void;
}

export const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({
  answer,
  onCorrect,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,!?;]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const evaluateAnswer = (text: string) => {
    const cleanText = normalizeText(text);
    const cleanAnswer = normalizeText(answer);

    if (!cleanText) {
      setFeedbackStatus("error");
      setTimeout(() => setFeedbackStatus("idle"), 2500);
      return;
    }

    if (
      cleanText === cleanAnswer ||
      cleanText.includes(cleanAnswer) ||
      cleanAnswer.includes(cleanText)
    ) {
      setFeedbackStatus("success");
      onCorrect();
      return;
    }

    setFeedbackStatus("error");
    setTimeout(() => setFeedbackStatus("idle"), 2500);
  };

  const startRecording = () => {
    interface ISpeechRecognitionEvent {
      results: { [key: number]: { [key: number]: { transcript: string } } };
    }
    interface ISpeechRecognition extends EventTarget {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      maxAlternatives: number;
      onstart: () => void;
      onresult: (event: ISpeechRecognitionEvent) => void;
      onerror: (event: { error: string }) => void;
      onend: () => void;
      start: () => void;
    }
    interface ISpeechRecognitionConstructor {
      new (): ISpeechRecognition;
    }

    const SpeechRecognition =
      (
        window as unknown as {
          SpeechRecognition: ISpeechRecognitionConstructor;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition: ISpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setTranscript("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }

    const recognition =
      new (SpeechRecognition as ISpeechRecognitionConstructor)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setFeedbackStatus("idle");
      setTranscript("Đang lắng nghe để xử lý...");
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      evaluateAnswer(text);
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === "aborted") return;
      setFeedbackStatus("error");
      setTimeout(() => setFeedbackStatus("idle"), 2500);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }
  };

  const handleManualSubmit = () => {
    setTranscript(manualInput);
    evaluateAnswer(manualInput);
  };

  return (
    <div className="speaking-practice animate-fade-in">
      {feedbackStatus !== "idle" && (
        <div className={`status-toast ${feedbackStatus} animate-pop`}>
          {feedbackStatus === "success" ? "✓ CHÍNH XÁC" : "✕ THỬ LẠI"}
        </div>
      )}

      <div
        className={`speaking-ui-card ${feedbackStatus === "error" ? "shake" : ""}`}
      >
        <div className="voice-visualizer">
          {isRecording && <div className="pulse-ring"></div>}
          <button
            className={`mic-btn-large ${isRecording ? "active" : ""} ${feedbackStatus}`}
            onClick={startRecording}
          >
            {feedbackStatus === "success"
              ? "✓"
              : feedbackStatus === "error"
                ? "✕"
                : isRecording
                  ? "🛑"
                  : "🎤"}
          </button>
        </div>

        <p className="instruction-text">
          {isRecording
            ? "Hãy nói to câu phản xạ bên trên..."
            : speechSupported
              ? "Nhấn Micro để bắt đầu trả lời bằng giọng nói"
              : "Thiết bị không hỗ trợ mic. Hãy nhập câu trả lời bằng văn bản."}
        </p>

        {!speechSupported && (
          <div className="input-group" style={{ marginTop: "1rem" }}>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Nhập câu nói tiếng Anh của bạn..."
              onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
              className="practice-input"
            />
            <button
              onClick={handleManualSubmit}
              className="submit-btn primary-gradient"
            >
              XAC NHAN
            </button>
          </div>
        )}

        {transcript && (
          <div className={`transcript-box ${feedbackStatus}`}>
            <span className="transcript-label">DỮ LIỆU NHẬN DIỆN:</span>
            <p className="transcript-text">"{transcript}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
