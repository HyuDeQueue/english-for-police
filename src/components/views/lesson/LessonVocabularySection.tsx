import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Volume2,
  Star,
  ChevronLeft,
  ChevronRight,
  Languages,
  Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioRecorderButton } from "@/components/common/AudioRecorderButton";
import type { Unit, FlaggedItem } from "@/types";
import {
  sortSubLessonIds,
} from "@/components/practice/utils/testUtils";

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
  const navigate = useNavigate();

  const vocabSubIds = useMemo(() => {
    const fromVocab = unit.vocabulary
      .map((v) => v.subLessonId?.trim())
      .filter((x): x is string => !!x);
    const fromPhrases = unit.phrases
      .map((p) => p.subLessonId?.trim())
      .filter((x): x is string => !!x);
    const merged = new Set([...fromVocab, ...fromPhrases]);
    return sortSubLessonIds([...merged]).filter((id) => id.startsWith(`${unit.id}.`));
  }, [unit]);

  const [vocabSubFilter, setVocabSubFilter] = useState<string>("all");

  const filteredVocabulary = useMemo(() => {
    if (vocabSubFilter === "all" || vocabSubIds.length === 0) {
      return unit.vocabulary;
    }
    return unit.vocabulary.filter(
      (v) => (v.subLessonId ?? "").trim() === vocabSubFilter,
    );
  }, [unit.vocabulary, vocabSubFilter, vocabSubIds.length]);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredVocabulary.length / itemsPerPage),
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [vocabSubFilter, unit.id]);

  const isFlagged = (word: string) =>
    flaggedItems.some(
      (f) => f.unitId === unit.id && f.type === "vocabulary" && f.key === word,
    );

  const startIndex = currentPage * itemsPerPage;
  const visibleItems = filteredVocabulary.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goVocabDrill = (drill: "en-vi" | "vi-en" | "matching") => {
    const lane = drill === "matching" ? "MATCHING" : "VOCAB_MCQ";
    navigate(
      `/generaltest/${unit.id}?lane=${encodeURIComponent(lane)}&vocabDrill=${drill}`,
    );
  };

  return (
    <section
      data-section="vocabulary"
      ref={sectionRef}
      className="scroll-mt-24"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
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

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:max-w-xl">
          {vocabSubIds.length > 0 ? (
            <div className="flex-1 min-w-[180px] space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Lọc theo tiểu mục
              </p>
              <Select value={vocabSubFilter} onValueChange={setVocabSubFilter}>
                <SelectTrigger className="h-9 font-bold text-xs">
                  <SelectValue placeholder="Tất cả từ vựng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tiểu mục</SelectItem>
                  {vocabSubIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      Phần {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 border-primary text-primary font-black text-[10px] shrink-0"
              onClick={() => goVocabDrill("en-vi")}
            >
              <Languages className="mr-1.5 h-3.5 w-3.5" />
              Anh → Việt
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 border-primary text-primary font-black text-[10px] shrink-0"
              onClick={() => goVocabDrill("vi-en")}
            >
              <Languages className="mr-1.5 h-3.5 w-3.5" />
              Việt → Anh
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 border-primary text-primary font-black text-[10px] shrink-0"
              onClick={() => goVocabDrill("matching")}
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Ghép cặp
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        {totalPages > 1 && (
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-primary/10 transition-all duration-200"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft
                className={`h-4 w-4 transition-colors ${
                  currentPage === 0 ? "text-slate-300" : "text-primary"
                }`}
              />
            </Button>

            <div className="flex flex-col items-center gap-1 px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 min-w-8 text-center">
                {currentPage + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentPage
                        ? "h-2.5 w-5 bg-primary shadow-[0_0_0_3px_rgba(31,58,110,0.08)]"
                        : "h-2 w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                    aria-current={i === currentPage ? "page" : undefined}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-primary/10 transition-all duration-200"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage === totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight
                className={`h-4 w-4 transition-colors ${
                  currentPage === totalPages - 1
                    ? "text-slate-300"
                    : "text-primary"
                }`}
              />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-400px">
        {visibleItems.map((v, i) => {
          const flagged = isFlagged(v.word);
          return (
            <Card
              key={`${v.word}-${startIndex + i}`}
              className={`group relative hover:police-shadow transition-all border-l-4 ${flagged ? "border-l-secondary" : "border-l-primary/20 hover:border-l-primary"}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-primary">{v.word}</h3>
                      <Badge variant="outline" className="text-[10px] py-0">
                        {v.type}
                      </Badge>
                      {v.subLessonId ? (
                        <Badge
                          variant="secondary"
                          className="text-[9px] py-0 font-black"
                        >
                          {v.subLessonId}
                        </Badge>
                      ) : null}
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
                  <AudioRecorderButton className="h-8 text-xs font-bold" />
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
