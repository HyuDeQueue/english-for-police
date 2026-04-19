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
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

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
      alert("Trình duyệt này không hỗ trợ nhận diện giọng nói.");
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

      const cleanText = text
        .toLowerCase()
        .replace(/[.,!?;]/g, "")
        .trim();
      const cleanAnswer = answer
        .toLowerCase()
        .replace(/[.,!?;]/g, "")
        .trim();

      if (
        cleanText.includes(cleanAnswer.split(" ")[0]) ||
        cleanText === cleanAnswer
      ) {
        setFeedbackStatus("success");
        onCorrect();
      } else {
        setFeedbackStatus("error");
        setTimeout(() => setFeedbackStatus("idle"), 2500);
      }
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
            : "Nhấn Micro để bắt đầu trả lời bằng giọng nói"}
        </p>

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
