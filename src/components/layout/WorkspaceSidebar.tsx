import React, { useMemo, useState } from "react";
import type {
  Collocation,
  FlaggedItem,
  Phrase,
  Unit,
  Vocabulary,
} from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookMarked,
  ChevronDown,
  ExternalLink,
  Folder,
  FolderOpen,
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

type SearchTreeCategory = {
  key: SearchResult["category"];
  label: string;
  items: SearchResult[];
};

type SearchTreeNode = {
  unit: Unit;
  matchesChapter: boolean;
  categories: SearchTreeCategory[];
};

type GroupedItem = {
  unit: Unit;
  vocabulary: (Vocabulary & { rawItem: FlaggedItem })[];
  phrases: (Phrase & { rawItem: FlaggedItem })[];
  collocations: (Collocation & { rawItem: FlaggedItem })[];
};

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  lessons,
  flaggedItems,
  isOpen,
  onClose,
  onNavigateToUnit,
  onRemoveItem,
}) => {
  const [query, setQuery] = useState("");
  const [expandedChapterIds, setExpandedChapterIds] = useState<number[]>(() =>
    lessons.map((lesson) => lesson.id),
  );

  const searchTree = useMemo<SearchTreeNode[]>(() => {
    const trimmed = query.trim().toLowerCase();

    return lessons
      .map((unit) => {
        const matchesChapter =
          trimmed.length === 0 ||
          unit.title.toLowerCase().includes(trimmed) ||
          unit.description.toLowerCase().includes(trimmed);

        const categories: SearchTreeCategory[] = [
          {
            key: "vocabulary",
            label: "Từ vựng",
            items: unit.vocabulary
              .filter((vocab) => {
                const matches = [
                  vocab.word,
                  vocab.meaning,
                  vocab.example,
                  vocab.phonetic,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(trimmed);
                return matchesChapter || trimmed.length === 0 || matches;
              })
              .map((vocab) => ({
                unit,
                unitId: unit.id,
                category: "vocabulary",
                title: vocab.word,
                subtitle: `${vocab.meaning} · ${vocab.example}`,
              })),
          },
          {
            key: "phrase",
            label: "Cấu trúc / Mẫu câu",
            items: unit.phrases
              .filter((phrase) => {
                const matches = [
                  phrase.text,
                  phrase.translation,
                  phrase.context,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(trimmed);
                return matchesChapter || trimmed.length === 0 || matches;
              })
              .map((phrase) => ({
                unit,
                unitId: unit.id,
                category: "phrase",
                title: phrase.text,
                subtitle: phrase.translation,
              })),
          },
          {
            key: "collocation",
            label: "Công thức ghi nhớ",
            items: unit.memoryBoost.collocations
              .filter((collocation) => {
                const combined =
                  `${collocation.verb} ${collocation.noun}`.toLowerCase();
                return (
                  matchesChapter ||
                  trimmed.length === 0 ||
                  combined.includes(trimmed)
                );
              })
              .map((collocation) => ({
                unit,
                unitId: unit.id,
                category: "collocation",
                title: `${collocation.verb} ${collocation.noun}`,
                subtitle: "Công thức ghi nhớ",
              })),
          },
        ];

        const hasCategoryItems = categories.some(
          (category) => category.items.length > 0,
        );
        if (!matchesChapter && !hasCategoryItems) {
          return null;
        }

        return {
          unit,
          matchesChapter,
          categories,
        };
      })
      .filter((node): node is SearchTreeNode => node !== null);
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

  const toggleChapter = (chapterId: number) => {
    setExpandedChapterIds((current) =>
      current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId],
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-450px sm:w-580px p-0 flex flex-col bg-background shadow-2xl border-l"
      >
        <SheetHeader className="p-6 border-b bg-primary/5">
          <SheetTitle className="flex items-center gap-2 font-heading text-primary">
            <BookMarked className="h-6 w-6" />
            Bảng công cụ
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-6">
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
              {query.trim().length > 0 && searchTree.length === 0 && (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  Không tìm thấy kết quả phù hợp.
                </p>
              )}

              {searchTree.map((node) => {
                const isExpanded =
                  query.trim().length > 0 ||
                  expandedChapterIds.includes(node.unit.id);

                return (
                  <div
                    key={node.unit.id}
                    className="rounded-2xl border bg-card overflow-hidden"
                  >
                    <div className="flex items-stretch gap-0 border-b bg-muted/30">
                      <button
                        className="group flex flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/5"
                        onClick={() => {
                          onNavigateToUnit(node.unit);
                          onClose();
                        }}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {isExpanded ? (
                            <FolderOpen className="h-5 w-5" />
                          ) : (
                            <Folder className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase tracking-wider"
                            >
                              CHƯƠNG {node.unit.id}
                            </Badge>
                            {node.matchesChapter && query.trim().length > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] uppercase tracking-wider"
                              >
                                Khớp chương
                              </Badge>
                            )}
                          </div>
                          <div className="font-bold text-primary text-sm transition-colors group-hover:text-primary/90 line-clamp-2">
                            {node.unit.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {node.unit.description}
                          </div>
                        </div>
                      </button>

                      <button
                        className="flex shrink-0 items-center justify-center px-3 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                        onClick={() => toggleChapter(node.unit.id)}
                        disabled={query.trim().length > 0}
                        aria-label={
                          isExpanded
                            ? `Thu gọn chương ${node.unit.id}`
                            : `Mở rộng chương ${node.unit.id}`
                        }
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 p-3">
                        {node.categories
                          .filter((category) => category.items.length > 0)
                          .map((category) => (
                            <div
                              key={category.key}
                              className="rounded-xl border border-dashed bg-background/70 p-3"
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  {category.label}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase tracking-wider"
                                >
                                  {category.items.length}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                {category.items.map((item) => (
                                  <button
                                    key={`${item.category}-${item.unitId}-${item.title}`}
                                    className="group flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/30 hover:police-shadow"
                                    onClick={() => {
                                      onNavigateToUnit(item.unit);
                                      onClose();
                                    }}
                                  >
                                    <span
                                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                        item.category === "vocabulary"
                                          ? "bg-blue-500"
                                          : item.category === "phrase"
                                            ? "bg-secondary"
                                            : item.category === "collocation"
                                              ? "bg-primary"
                                              : "bg-amber-500"
                                      }`}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold text-sm text-primary transition-colors group-hover:text-primary/90 line-clamp-2">
                                        {item.title}
                                      </div>
                                      <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                        {item.subtitle}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
