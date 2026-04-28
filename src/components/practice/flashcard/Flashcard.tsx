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
        <div className="absolute inset-0 backface-hidden bg-linear-to-br from-[#2e3856] to-[#1a1f35] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col p-8 overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              POLICE ENGLISH
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/40 hover:text-white hover:bg-white/10 h-10 w-10 transition-all rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio(front);
              }}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 drop-shadow-2xl">
              {front}
            </h2>
            {phonetic && (
              <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                <p className="text-emerald-400 text-xl font-mono tracking-wider">
                  {phonetic}
                </p>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/5 border-t border-white/5 flex items-center justify-center gap-4 text-xs font-medium backdrop-blur-sm">
            <Keyboard className="h-4 w-4 text-white/40" />
            <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">
              TRẢI NGHIỆM
            </span>
            <span className="text-white/60">Bấm</span>
            <span className="px-2.5 py-1 bg-white/10 rounded-md border border-white/20 text-[10px] font-mono text-white shadow-inner">
              Space
            </span>
            <span className="text-white/60 font-medium">
              để lật xem kết quả
            </span>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-linear-to-br from-[#1a1f35] to-[#0f1225] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col p-8 overflow-hidden border border-white/10">
          <div className="flex justify-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/40 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
              KẾT QUẢ
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-300 mb-6 py-2">
              {back}
            </h3>

            {(example || context) && (
              <div className="space-y-4 max-w-xl">
                <div className="h-px w-12 bg-white/10 mx-auto" />
                {example && (
                  <p className="text-white/80 text-lg md:text-xl italic font-medium leading-relaxed">
                    "{example}"
                  </p>
                )}
                {context && (
                  <p className="text-white/50 text-base italic leading-relaxed">
                    Context: {context}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/5 border-t border-white/5 flex items-center justify-center gap-4 text-xs font-medium backdrop-blur-sm">
            <Keyboard className="h-4 w-4 text-white/40" />
            <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">
              ĐÁNH GIÁ
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                <span className="text-orange-400 font-mono">←</span>
                <span className="text-orange-400/80 text-[9px] font-bold">
                  CẦN ÔN TẬP
                </span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <span className="text-emerald-400 font-mono">→</span>
                <span className="text-emerald-400/80 text-[9px] font-bold">
                  ĐÃ THUỘC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
