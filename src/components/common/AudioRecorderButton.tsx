import React, { useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { cn } from "@/lib/utils";

interface AudioRecorderButtonProps {
  onTranscription?: (text: string) => void;
  className?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const AudioRecorderButton: React.FC<AudioRecorderButtonProps> = ({
  onTranscription,
  className,
  variant = "outline",
  size = "sm",
}) => {
  const { status, transcription, error, startRecording, stopRecording, reset } =
    useAudioRecorder();

  const [showTranscription, setShowTranscription] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === "recording") {
      stopRecording();
      setShowTranscription(true);
    } else {
      reset();
      setShowTranscription(false);
      await startRecording();
    }
  };

  const isVisible = showTranscription || status === "transcribing" || status === "error";

  React.useEffect(() => {
    if (status === "success" && onTranscription) {
      onTranscription(transcription);
      const timer = setTimeout(() => setShowTranscription(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [status, transcription, onTranscription]);

  return (
    <div className="relative inline-flex flex-col items-center">
      <Button
        variant={variant}
        size={size}
        className={cn(
          "rounded-full transition-all",
          status === "recording" &&
            "bg-red-500 text-white hover:bg-red-600 animate-pulse border-red-500",
          className,
        )}
        onClick={handleToggle}
        disabled={status === "transcribing"}
      >
        {status === "transcribing" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : status === "recording" ? (
          <>
            <MicOff className="h-3 w-3 mr-1.5" />
            DỪNG
          </>
        ) : (
          <>
            <Mic className="h-3 w-3 mr-1.5" />
            LUYỆN NÓI
          </>
        )}
      </Button>

      {isVisible && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-48 p-2 bg-white border rounded-lg shadow-xl text-[10px] italic pointer-events-none animate-in fade-in slide-in-from-top-1">
            {status === "transcribing" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-2 w-2 animate-spin" />
                Đang nhận diện...
              </div>
            ) : status === "error" ? (
              <div className="text-red-500 font-medium">Lỗi: {error}</div>
            ) : (
              <div className="text-primary font-medium">
                Bạn nói: "{transcription}"
              </div>
            )}
          </div>
        )}
    </div>
  );
};
