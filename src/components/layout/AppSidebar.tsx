import { useMemo, useState } from "react";
import { speak } from "@/lib/speech";
import { AudioRecorderButton } from "@/components/common/AudioRecorderButton";
import type {
  Collocation,
  FlaggedItem,
  Phrase,
  Unit,
  Vocabulary,
} from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-context";
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
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  lessons: Unit[];
  flaggedItems: FlaggedItem[];
  onNavigateToUnit: (unit: Unit) => void;
  onRemoveItem: (item: FlaggedItem) => void;
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

export function AppSidebar({
  lessons,
  flaggedItems,
  onNavigateToUnit,
  onRemoveItem,
}: AppSidebarProps) {
  const [query, setQuery] = useState("");
  const [expandedChapterIds, setExpandedChapterIds] = useState<number[]>([]);
  const { setOpenMobile } = useSidebar();

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
    speak(text);
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapterIds((current) =>
      current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId],
    );
  };

  const handleNavigate = (unit: Unit) => {
    onNavigateToUnit(unit);
    setOpenMobile(false);
  };

  return (
    <Sidebar
      side="left"
      collapsible="offcanvas"
      className="border-r border-border/50 shadow-2xl"
    >
      <SidebarHeader className="h-16 border-b border-primary/20 primary-gradient flex items-center px-4">
        <div className="flex items-center gap-3 font-heading text-white flex-1">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <BookMarked className="h-5 w-5 text-secondary fill-secondary" />
          </div>
          <span className="font-bold text-lg tracking-tight">Bảng công cụ</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0 bg-sidebar custom-scrollbar">
        {/* Search Section */}
        <SidebarGroup className="px-6 py-8">
          <SidebarGroupLabel className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
            <Search className="h-3 w-3 text-primary" />
            TÌM KIẾM DỮ LIỆU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="relative group">
              <SidebarInput
                placeholder="Nhập từ, mẫu câu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-4 bg-background border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary police-shadow transition-all rounded-xl text-sm"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-6 space-y-4">
          {query.trim().length > 0 && searchTree.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl bg-muted/30 border border-dashed border-border/50">
              <p className="text-muted-foreground text-sm font-medium">
                Không tìm thấy kết quả.
              </p>
            </div>
          )}

          {searchTree.map((node) => {
            const isExpanded =
              query.trim().length > 0 ||
              expandedChapterIds.includes(node.unit.id);

            return (
              <div
                key={node.unit.id}
                className={cn(
                  "rounded-2xl border transition-all duration-300",
                  isExpanded
                    ? "bg-white shadow-xl border-primary/10"
                    : "bg-card hover:bg-white hover:shadow-md border-border/50",
                )}
              >
                <div
                  className={cn(
                    "flex items-stretch gap-0 rounded-t-2xl overflow-hidden",
                    isExpanded && "bg-primary/5",
                  )}
                >
                  <button
                    className="group flex flex-1 items-center gap-4 px-4 py-3.5 text-left transition-all active:scale-[0.98]"
                    onClick={() => handleNavigate(node.unit)}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                        isExpanded
                          ? "bg-primary text-white"
                          : "bg-primary/5 text-primary group-hover:bg-primary/10",
                      )}
                    >
                      {isExpanded ? (
                        <FolderOpen className="h-5 w-5" />
                      ) : (
                        <Folder className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                          Chương {node.unit.id}
                        </span>
                      </div>
                      <div className="font-bold text-primary text-sm line-clamp-2 leading-snug">
                        {node.unit.title}
                      </div>
                    </div>
                  </button>

                  <button
                    className="flex shrink-0 items-center justify-center px-3 text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary border-l border-border/30"
                    onClick={() => toggleChapter(node.unit.id)}
                    disabled={query.trim().length > 0}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-3 space-y-3 bg-linear-to-b from-primary/5 to-transparent rounded-b-2xl">
                    {node.categories
                      .filter((category) => category.items.length > 0)
                      .map((category) => (
                        <div key={category.key} className="space-y-2">
                          <div className="px-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/70">
                              {category.label}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {category.items.map((item) => (
                              <button
                                key={`${item.category}-${item.unitId}-${item.title}`}
                                className="group flex w-full items-start gap-3 rounded-xl border border-border/40 bg-white p-2.5 text-left transition-all hover:border-primary/30 hover:shadow-sm active:scale-[0.98]"
                                onClick={() => handleNavigate(item.unit)}
                              >
                                <div
                                  className={cn(
                                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ring-4 ring-opacity-10",
                                    item.category === "vocabulary"
                                      ? "bg-blue-500 ring-blue-500"
                                      : item.category === "phrase"
                                        ? "bg-secondary ring-secondary"
                                        : "bg-primary ring-primary",
                                  )}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-[11px] text-primary line-clamp-1">
                                    {item.title}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground/80 line-clamp-1 font-medium mt-0.5">
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

        {/* Notebook Section */}
        <SidebarGroup className="px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <SidebarGroupLabel className="p-0 h-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
              <BookMarked className="h-3 w-3 text-secondary" />
              SỔ TAY BÀI HỌC
            </SidebarGroupLabel>
            {flaggedItems.length > 0 && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 h-4 bg-secondary/10 border-secondary/20 text-secondary-foreground font-bold"
              >
                {flaggedItems.length} MỤC
              </Badge>
            )}
          </div>

          <div className="space-y-6">
            {flaggedItems.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-muted/20 border border-dashed border-border/50">
                <p className="italic text-muted-foreground/60 text-[11px] font-medium">
                  Chưa có mục nào được lưu vào sổ tay.
                </p>
              </div>
            ) : (
              unitIds.map((unitId) => {
                const group = groupedItems[unitId];
                return (
                  <div key={unitId} className="space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-5 w-1 bg-primary rounded-full" />
                        <span className="font-black text-[10px] uppercase tracking-wider text-primary line-clamp-1">
                          {group.unit.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[9px] font-black text-primary hover:bg-primary/5 px-2 rounded-lg transition-all"
                        onClick={() => handleNavigate(group.unit)}
                      >
                        CHI TIẾT <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {group.phrases.map((p, i) => (
                        <div
                          key={`p-${i}`}
                          className="group p-3 rounded-xl border border-border/40 bg-white hover:border-secondary/20 hover:shadow-sm transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-secondary/20" />
                          <div className="flex justify-between items-start mb-2">
                            <Badge className="bg-secondary/10 text-secondary-foreground border-none text-[8px] font-black h-4 px-1.5 rounded-md">
                              MẪU CÂU
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                              onClick={() => onRemoveItem(p.rawItem)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-primary leading-snug tracking-tight">
                                {p.text}
                              </h4>
                              <p className="text-[10px] text-muted-foreground/80 font-medium line-clamp-2 mt-1.5">
                                {p.translation}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-xl border-border/50 hover:bg-secondary hover:text-white transition-all shadow-sm"
                                onClick={() => playAudio(p.text)}
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                              </Button>
                              <AudioRecorderButton
                                size="icon"
                                className="h-8 w-8 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {group.collocations.map((c, i) => (
                        <div
                          key={`c-${i}`}
                          className="group p-3 rounded-xl border border-border/40 bg-white hover:border-primary/20 hover:shadow-sm transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                          <div className="flex justify-between items-start mb-2">
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black h-4 px-1.5 rounded-md">
                              CÔNG THỨC
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                              onClick={() => onRemoveItem(c.rawItem)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="bg-secondary/10 p-1 rounded-md shrink-0">
                                <Zap className="h-3 w-3 text-secondary fill-secondary" />
                              </div>
                              <div className="font-black text-primary uppercase text-[10px] tracking-wider truncate">
                                {c.verb} + {c.noun}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-xl shrink-0 border-border/50 hover:bg-primary hover:text-white transition-all shadow-sm"
                              onClick={() => playAudio(`${c.verb} ${c.noun}`)}
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {group.vocabulary.map((v, i) => (
                        <div
                          key={`v-${i}`}
                          className="group p-3 rounded-xl border border-border/40 bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
                          <div className="flex justify-between items-start mb-2">
                            <Badge className="bg-blue-50 text-blue-700 border-none text-[8px] font-black h-4 px-1.5 rounded-md">
                              TỪ VỰNG
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                              onClick={() => onRemoveItem(v.rawItem)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-primary truncate tracking-tight">
                                {v.word}
                              </h4>
                              <p className="text-[10px] text-muted-foreground/80 font-medium line-clamp-1 mt-0.5">
                                {v.meaning}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-xl border-border/50 hover:bg-primary hover:text-white transition-all shadow-sm"
                                onClick={() => playAudio(v.word)}
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                              </Button>
                              <AudioRecorderButton
                                size="icon"
                                className="h-8 w-8 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
