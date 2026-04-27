import React from "react";

interface FlashcardStatsProps {
  learningCount: number;
  knownCount: number;
}

export const FlashcardStats: React.FC<FlashcardStatsProps> = ({
  learningCount,
  knownCount,
}) => {
  return (
    <div className="w-full max-w-3xl flex justify-between mb-4 px-2">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 font-bold text-xs">
          {learningCount}
        </div>
        <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">
          Đang học
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">
          Đã thuộc
        </span>
        <div className="h-7 w-7 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-600 font-bold text-xs">
          {knownCount}
        </div>
      </div>
    </div>
  );
};
