import React from "react";

interface FlashcardProgressProps {
  current: number;
  total: number;
}

export const FlashcardProgress: React.FC<FlashcardProgressProps> = ({
  current,
  total,
}) => {
  return (
    <div className="w-full max-w-3xl mt-8 px-2">
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">
        <span>Tiến độ</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
};
