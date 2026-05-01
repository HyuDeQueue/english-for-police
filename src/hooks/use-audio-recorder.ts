import { useState, useRef, useCallback } from "react";
import { transcribeAudio } from "@/lib/asr";

export type RecorderStatus =
  | "idle"
  | "recording"
  | "transcribing"
  | "success"
  | "error";

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [transcription, setTranscription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      if (!window.isSecureContext) {
        throw new Error(
          "Microphone access requires a secure context (HTTPS or localhost).",
        );
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error("Your browser does not support microphone access.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        setStatus("transcribing");
        try {
          const text = await transcribeAudio(audioBlob);
          setTranscription(text);
          setStatus("success");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to transcribe");
          setStatus("error");
        } finally {
          // Stop all tracks to release the microphone
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setStatus("recording");
      setError(null);
      setTranscription("");
    } catch (err) {
      console.error("Recording error:", err);
      setError(
        err instanceof Error ? err.message : "Could not access microphone",
      );
      setStatus("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setTranscription("");
    setError(null);
  }, []);

  return {
    status,
    transcription,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}
