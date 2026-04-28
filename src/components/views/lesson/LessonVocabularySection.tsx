import React, { useState } from "react";
import { Volume2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Unit, FlaggedItem } from "@/types";

interface LessonVocabularySectionProps {
  readonly unit: Unit;
  readonly flaggedItems: FlaggedItem[];
  readonly onToggleFlag: (item: FlaggedItem) => void;
  readonly onPlayAudio: (text: string, element?: HTMLButtonElement) => void;
  readonly sectionRef?: (el: HTMLElement | null) => void;
}

export const LessonVocabularySection: React.FC<
  LessonVocabularySectionProps
> = ({ unit, flaggedItems, onToggleFlag, onPlayAudio, sectionRef }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(unit.vocabulary.length / itemsPerPage);

  const isFlagged = (word: string) =>
    flaggedItems.some(
      (f) => f.unitId === unit.id && f.type === "vocabulary" && f.key === word,
    );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const startIndex = currentPage * itemsPerPage;
  const visibleItems = unit.vocabulary.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <section
      data-section="vocabulary"
      ref={sectionRef}
      className="scroll-mt-24"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="text-lg px-3 py-1 font-bold border-primary text-primary bg-primary/5"
          >
            01
          </Badge>
          <h2 className="text-2xl font-heading font-extrabold tracking-tight">
            TỪ VỰNG
          </h2>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-3 bg-muted/30 px-3 py-2 rounded-full border border-slate-100 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm transition-all"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft
                className={`h-5 w-5 ${currentPage === 0 ? "text-slate-300" : "text-primary font-bold"}`}
              />
            </Button>

            <div className="flex flex-col items-center px-2 min-w-60px">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1.5">
                {currentPage + 1} / {totalPages}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      i === currentPage
                        ? "w-5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                        : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm transition-all"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight
                className={`h-5 w-5 ${currentPage === totalPages - 1 ? "text-slate-300" : "text-primary font-bold"}`}
              />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-400px">
        {visibleItems.map((v, i) => {
          const flagged = isFlagged(v.word);
          return (
            <Card
              key={startIndex + i}
              className={`group relative hover:police-shadow transition-all border-l-4 ${flagged ? "border-l-secondary" : "border-l-primary/20 hover:border-l-primary"}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-primary">
                        {v.word}
                      </h3>
                      <Badge variant="outline" className="text-[10px] py-0">
                        {v.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {v.phonetic}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full ${flagged ? "text-secondary" : "text-muted-foreground"}`}
                    onClick={() =>
                      onToggleFlag({
                        unitId: unit.id,
                        type: "vocabulary",
                        key: v.word,
                      })
                    }
                  >
                    <Star
                      className={`h-4 w-4 ${flagged ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-bold text-base leading-tight">{v.meaning}</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs font-bold transition-all group-hover:bg-primary group-hover:text-white hover:bg-primary hover:text-white"
                    onClick={(e) => onPlayAudio(v.word, e.currentTarget)}
                  >
                    <Volume2 className="h-3 w-3 mr-1.5" />
                    PHÁT ÂM
                  </Button>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg border italic text-xs leading-relaxed">
                  "Ex: {v.example}"
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default LessonVocabularySection;
