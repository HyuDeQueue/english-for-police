import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Keyboard } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
  phonetic?: string;
  example?: string;
  context?: string;
  isFlipped: boolean;
  onFlip: () => void;
  onPlayAudio: (text: string) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  front,
  back,
  phonetic,
  example,
  context,
  isFlipped,
  onFlip,
  onPlayAudio,
}) => {
  return (
    <div
      className="w-full max-w-3xl aspect-16/10 relative group cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden bg-[#2e3856] rounded-2xl police-shadow flex flex-col p-6 overflow-hidden border border-white/5">
          <div className="flex justify-between items-start">
            <div className="h-8 w-8 invisible" />
            <Button
              variant="ghost"
              size="icon"
              className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio(front);
              }}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
              {front}
            </h2>
            {phonetic && (
              <p className="text-white/40 text-lg font-mono">{phonetic}</p>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/5 border-t border-white/5 flex items-center justify-center gap-3 text-xs font-medium">
            <Keyboard className="h-4 w-4 text-white/40" />
            <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">
              Phím tắt
            </span>
            <span className="text-white/60">Bấm</span>
            <span className="px-2 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-mono text-white">
              Space
            </span>
            <span className="text-white/60">hoặc chạm vào thẻ để lật</span>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#2e3856] rounded-2xl police-shadow flex flex-col p-6 overflow-hidden border border-white/5">
          <div className="h-8" />
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl md:text-4xl font-bold text-emerald-400 mb-4">
              {back}
            </h3>
            {example && (
              <p className="text-white/60 text-base italic max-w-xl">
                "{example}"
              </p>
            )}
            {context && (
              <p className="text-white/60 text-base italic max-w-xl">
                "{context}"
              </p>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/5 border-t border-white/5 flex items-center justify-center gap-3 text-xs font-medium">
            <Keyboard className="h-4 w-4 text-white/40" />
            <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">
              Phím tắt
            </span>
            <span className="text-white/60">Bấm</span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-mono text-white">
                ←
              </span>
              <span className="text-white/40 italic">để học lại hoặc</span>
              <span className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-mono text-white">
                →
              </span>
              <span className="text-white/40 italic">nếu đã thuộc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
