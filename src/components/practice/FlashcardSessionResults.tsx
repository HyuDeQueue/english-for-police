import React from "react";
import type { FlashcardSessionSummary } from "./FlashcardReview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, BookOpen } from "lucide-react";

interface FlashcardSessionResultsProps {
  summary: FlashcardSessionSummary;
  onRetry: () => void;
  onContinue: () => void;
  onBackToLesson: () => void;
}

export const FlashcardSessionResults: React.FC<
  FlashcardSessionResultsProps
> = ({ summary, onRetry, onContinue, onBackToLesson }) => {
  const knownDelta =
    summary.previousKnownRate === 0
      ? null
      : summary.currentKnownRate - summary.previousKnownRate;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Hero Section */}
      <Card className="police-shadow border-none overflow-hidden text-center">
        <div className="primary-gradient p-4 text-white">
          <Badge className="bg-white/20 text-white border-none mb-4 px-3 py-1 font-bold">
            HOÀN THÀNH NHIỆM VỤ
          </Badge>
          <h2 className="text-3xl font-heading font-black uppercase tracking-widest mb-2">
            Kết quả ôn tập Flashcard
          </h2>
          <p className="text-white/80 font-medium">
            Bài {summary.unitId}: {summary.unitTitle}
          </p>
          <div className="mt-8 inline-flex flex-col items-center justify-center h-40 w-40 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/20">
            <span className="text-5xl font-black">
              {summary.currentKnownRate}%
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                Tỷ lệ thuộc bài
              </span>
              {knownDelta !== null && knownDelta !== 0 && (
                <Badge
                  className={`border-none px-1 py-0 h-4 text-[9px] ${knownDelta > 0 ? "bg-green-400 text-green-950" : "bg-red-400 text-red-950"}`}
                >
                  {knownDelta > 0 ? "+" : ""}
                  {knownDelta}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="police-shadow border-none">
          <CardContent className="pt-6 text-center">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Đã review
            </div>
            <div className="text-3xl font-black text-primary">
              {summary.reviewedCount}/{summary.totalCards}
            </div>
            <Progress
              value={(summary.reviewedCount / summary.totalCards) * 100}
              className="h-1.5 mt-3"
            />
          </CardContent>
        </Card>
        <Card className="police-shadow border-none border-b-4 border-b-green-500">
          <CardContent className="pt-6 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-green-600">
              Đã thuộc
            </div>
            <div className="text-3xl font-black text-green-600">
              {summary.knownCount}
            </div>
            <p className="text-[10px] font-medium text-muted-foreground mt-2 italic">
              Làm tốt lắm!
            </p>
          </CardContent>
        </Card>
        <Card className="police-shadow border-none border-b-4 border-b-secondary">
          <CardContent className="pt-6 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-secondary">
              Cần ôn lại
            </div>
            <div className="text-3xl font-black text-secondary">
              {summary.reviewCount}
            </div>
            <p className="text-[10px] font-medium text-muted-foreground mt-2 italic">
              Cần cố gắng thêm
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Button
          variant="outline"
          className="h-16 text-base font-bold border-2 border-orange-500 text-orange-500 hover:bg-orange-500/5 rounded-xl transition-all"
          onClick={onRetry}
        >
          <RotateCcw className="mr-2 h-5 w-5" /> ÔN LẠI TỪ ĐẦU
        </Button>

        <Button
          className="h-16 text-lg font-black primary-gradient police-shadow rounded-xl transition-all hover:scale-[1.02] uppercase tracking-wider"
          onClick={onContinue}
        >
          {summary.deckMode === "vocabulary" ? "Học mẫu câu" : "Học từ vựng"}
          <span className="ml-2 text-xs opacity-80">(TIẾP TỤC)</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 text-base font-bold border-2 border-primary text-primary hover:bg-primary/5 rounded-xl transition-all"
          onClick={onBackToLesson}
        >
          <BookOpen className="mr-2 h-5 w-5" /> QUAY LẠI BÀI HỌC
        </Button>
      </div>
    </div>
  );
};
