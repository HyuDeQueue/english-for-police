import React, { useMemo, useState } from "react";
import type {
  Collocation,
  FlaggedItem,
  Phrase,
  Question,
  Unit,
  Vocabulary,
} from "@/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookMarked,
  ChevronRight,
  ExternalLink,
  Search,
  Trash2,
  Volume2,
  Zap,
} from "lucide-react";

interface WorkspaceSidebarProps {
  lessons: Unit[];
  flaggedItems: FlaggedItem[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUnit: (unit: Unit) => void;
  onRemoveItem: (item: FlaggedItem) => void;
  activeUnit?: Unit | null;
  onStartPractice?: () => void;
  onStartFlashcards?: () => void;
  onStartGeneralKnowledgeTest?: () => void;
  onStartQuickTest?: () => void;
}

type SearchResult = {
  unit: Unit;
  unitId: number;
  category: "unit" | "vocabulary" | "phrase" | "collocation" | "practice";
  title: string;
  subtitle: string;
};

type GroupedItem = {
  unit: Unit;
  vocabulary: (Vocabulary & { rawItem: FlaggedItem })[];
  phrases: (Phrase & { rawItem: FlaggedItem })[];
  collocations: (Collocation & { rawItem: FlaggedItem })[];
};

function normalizeAnswer(answer: Question["answer"]): string {
  return Array.isArray(answer) ? answer.join(" ") : String(answer || "");
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  lessons,
  flaggedItems,
  isOpen,
  onClose,
  onNavigateToUnit,
  onRemoveItem,
  activeUnit,
  onStartPractice,
  onStartFlashcards,
  onStartGeneralKnowledgeTest,
  onStartQuickTest,
}) => {
  const [query, setQuery] = useState("");

  const searchResults = useMemo<SearchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    const results: SearchResult[] = [];

    for (const unit of lessons) {
      if (
        unit.title.toLowerCase().includes(trimmed) ||
        unit.description.toLowerCase().includes(trimmed)
      ) {
        results.push({
          unit,
          unitId: unit.id,
          category: "unit",
          title: unit.title,
          subtitle: unit.description,
        });
      }

      for (const vocab of unit.vocabulary) {
        if (
          [vocab.word, vocab.meaning, vocab.example, vocab.phonetic]
            .join(" ")
            .toLowerCase()
            .includes(trimmed)
        ) {
          results.push({
            unit,
            unitId: unit.id,
            category: "vocabulary",
            title: vocab.word,
            subtitle: `${vocab.meaning} · ${vocab.example}`,
          });
        }
      }

      for (const phrase of unit.phrases) {
        if (
          [phrase.text, phrase.translation, phrase.context]
            .join(" ")
            .toLowerCase()
            .includes(trimmed)
        ) {
          results.push({
            unit,
            unitId: unit.id,
            category: "phrase",
            title: phrase.text,
            subtitle: phrase.translation,
          });
        }
      }

      for (const collocation of unit.memoryBoost.collocations) {
        const combined =
          `${collocation.verb} ${collocation.noun}`.toLowerCase();
        if (combined.includes(trimmed)) {
          results.push({
            unit,
            unitId: unit.id,
            category: "collocation",
            title: `${collocation.verb} ${collocation.noun}`,
            subtitle: "Công thức ghi nhớ",
          });
        }
      }

      for (const practice of unit.practice) {
        const joined = [
          practice.prompt,
          practice.vnPrompt,
          normalizeAnswer(practice.answer),
          ...(practice.acceptableAnswers || []),
          practice.explanation || "",
        ]
          .join(" ")
          .toLowerCase();
        if (joined.includes(trimmed)) {
          results.push({
            unit,
            unitId: unit.id,
            category: "practice",
            title: practice.prompt,
            subtitle: `Bài tập · ${practice.type}`,
          });
        }
      }
    }

    return results.slice(0, 30);
  }, [lessons, query]);

  const groupedItems = flaggedItems.reduce(
    (acc, item) => {
      const unit = lessons.find((lesson) => lesson.id === item.unitId);
      if (!unit) return acc;

      if (!acc[item.unitId]) {
        acc[item.unitId] = {
          unit,
          vocabulary: [],
          phrases: [],
          collocations: [],
        };
      }

      if (item.type === "vocabulary") {
        const vocab = unit.vocabulary.find((v) => v.word === item.key);
        if (vocab)
          acc[item.unitId].vocabulary.push({ ...vocab, rawItem: item });
      } else if (item.type === "phrase") {
        const phrase = unit.phrases.find((p) => p.text === item.key);
        if (phrase) acc[item.unitId].phrases.push({ ...phrase, rawItem: item });
      } else if (item.type === "collocation") {
        const collocation = unit.memoryBoost.collocations.find(
          (c) => `${c.verb} ${c.noun}` === item.key,
        );
        if (collocation) {
          acc[item.unitId].collocations.push({ ...collocation, rawItem: item });
        }
      }

      return acc;
    },
    {} as Record<number, GroupedItem>,
  );

  const unitIds = Object.keys(groupedItems)
    .map(Number)
    .sort((a, b) => a - b);

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-420px sm:w-560px p-0 flex flex-col bg-background shadow-2xl border-l"
      >
        <SheetHeader className="p-6 border-b bg-primary/5">
          <SheetTitle className="flex items-center gap-2 font-heading text-primary">
            <BookMarked className="h-6 w-6" />
            Bảng công cụ
          </SheetTitle>
          <SheetDescription>
            Chứa lối tắt luyện tập, tìm kiếm toàn bộ dữ liệu và sổ tay đã đánh
            dấu.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
              <Zap className="h-4 w-4 text-secondary" />
              Lối tắt
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="default"
                className="h-12 justify-between font-bold"
                onClick={() => {
                  onStartPractice?.();
                  onClose();
                }}
                disabled={!onStartPractice || !activeUnit}
              >
                Kiểm tra
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 justify-between font-bold"
                onClick={() => {
                  onStartFlashcards?.();
                  onClose();
                }}
                disabled={!onStartFlashcards || !activeUnit}
              >
                Ôn tập
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 justify-between font-bold"
                onClick={() => {
                  onStartGeneralKnowledgeTest?.();
                  onClose();
                }}
                disabled={!onStartGeneralKnowledgeTest || !activeUnit}
              >
                Tổng hợp
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 justify-between font-bold"
                onClick={() => {
                  onStartQuickTest?.();
                  onClose();
                }}
                disabled={!onStartQuickTest}
              >
                Test nhanh
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {!activeUnit && (
              <p className="text-xs text-muted-foreground">
                Mở một chương để dùng các nút luyện tập theo bài.
              </p>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
              <Search className="h-4 w-4 text-primary" />
              Tìm kiếm toàn bộ dữ liệu
            </div>
            <Input
              placeholder="Nhập từ, mẫu câu, công thức, câu hỏi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 text-base focus-visible:ring-primary police-shadow"
              autoFocus
            />

            <div className="space-y-3">
              {query.trim().length >= 2 && searchResults.length === 0 && (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  Không tìm thấy kết quả phù hợp.
                </p>
              )}

              {searchResults.map((result, index) => (
                <button
                  key={`${result.category}-${result.unitId}-${index}`}
                  className="group w-full text-left p-4 rounded-xl border bg-card hover:bg-primary hover:border-primary hover:police-shadow cursor-pointer transition-all active:scale-[0.98]"
                  onClick={() => {
                    onNavigateToUnit(result.unit);
                    onClose();
                  }}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <Badge
                      variant={
                        result.category === "unit" ? "default" : "secondary"
                      }
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {result.category === "unit"
                        ? "Chương"
                        : result.category === "vocabulary"
                          ? "Từ vựng"
                          : result.category === "phrase"
                            ? "Mẫu câu"
                            : result.category === "collocation"
                              ? "Công thức"
                              : "Bài tập"}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase group-hover:text-white/60">
                      Chương {result.unitId}
                    </span>
                  </div>
                  <div className="font-bold text-primary text-sm group-hover:text-white transition-colors line-clamp-2">
                    {result.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 group-hover:text-white/80 transition-colors line-clamp-2">
                    {result.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
              <BookMarked className="h-4 w-4 text-secondary" />
              Sổ tay cá nhân
            </div>

            {flaggedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 rounded-2xl border bg-muted/20">
                <BookMarked className="h-10 w-10 text-muted-foreground opacity-30" />
                <div className="space-y-1">
                  <p className="font-bold text-base">Chưa có dữ liệu lưu lại</p>
                  <p className="text-sm text-muted-foreground max-w-260px mx-auto">
                    Bấm ngôi sao trong bài học để lưu từ vựng, mẫu câu hoặc công
                    thức.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {unitIds.map((unitId) => {
                  const group = groupedItems[unitId];
                  return (
                    <div key={unitId} className="space-y-3">
                      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 border-b border-dashed">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20 shrink-0"
                          >
                            CHƯƠNG {unitId}
                          </Badge>
                          <h3 className="font-bold text-sm truncate max-w-220px">
                            {group.unit.title}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] font-bold text-primary hover:bg-primary/5 px-2"
                          onClick={() => {
                            onNavigateToUnit(group.unit);
                            onClose();
                          }}
                        >
                          ĐẾN BÀI <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-3 pl-2">
                        {group.vocabulary.map((v, i) => (
                          <div
                            key={`v-${i}`}
                            className="group p-4 rounded-xl border bg-card hover:border-primary/30 hover:police-shadow transition-all relative"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] h-4 uppercase">
                                Từ vựng
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onRemoveItem(v.rawItem)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="font-bold text-primary truncate">
                                  {v.word}
                                </h4>
                                <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                                  {v.meaning}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full shrink-0"
                                onClick={() => playAudio(v.word)}
                              >
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {group.phrases.map((p, i) => (
                          <div
                            key={`p-${i}`}
                            className="group p-4 rounded-xl border bg-card hover:border-primary/30 hover:police-shadow transition-all relative border-l-4 border-l-secondary/30"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <Badge className="bg-secondary/10 text-secondary border-none text-[9px] h-4 uppercase">
                                Mẫu câu
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onRemoveItem(p.rawItem)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <h4 className="font-bold text-primary leading-tight mb-1">
                              {p.text}
                            </h4>
                            <p className="text-sm font-medium text-muted-foreground">
                              {p.translation}
                            </p>
                            <div className="mt-2 flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => playAudio(p.text)}
                              >
                                <Volume2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {group.collocations.map((c, i) => (
                          <div
                            key={`c-${i}`}
                            className="group p-4 rounded-xl border bg-card hover:border-primary/30 hover:police-shadow transition-all relative border-l-4 border-l-primary/30"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <Badge className="bg-primary/10 text-primary border-none text-[9px] h-4 uppercase">
                                Công thức
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onRemoveItem(c.rawItem)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-secondary fill-current" />
                              <div className="flex items-center gap-1.5 font-black text-primary uppercase text-sm">
                                <span>{c.verb}</span>
                                <span className="text-muted-foreground">+</span>
                                <span>{c.noun}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};
