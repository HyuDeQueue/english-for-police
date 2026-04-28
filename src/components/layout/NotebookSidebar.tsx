import React from "react";
import type {
  Unit,
  FlaggedItem,
  Vocabulary,
  Phrase,
  Collocation,
} from "../../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Trash2, Volume2, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotebookSidebarProps {
  lessons: Unit[];
  flaggedItems: FlaggedItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (item: FlaggedItem) => void;
  onNavigateToUnit: (unit: Unit) => void;
}

interface GroupedItem {
  unit: Unit;
  vocabulary: (Vocabulary & { rawItem: FlaggedItem })[];
  phrases: (Phrase & { rawItem: FlaggedItem })[];
  collocations: (Collocation & { rawItem: FlaggedItem })[];
}

export const NotebookSidebar: React.FC<NotebookSidebarProps> = ({
  lessons,
  flaggedItems,
  isOpen,
  onClose,
  onRemoveItem,
  onNavigateToUnit,
}) => {
  const groupedItems = flaggedItems.reduce(
    (acc, item) => {
      const unit = lessons.find((l) => l.id === item.unitId);
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
        if (collocation)
          acc[item.unitId].collocations.push({ ...collocation, rawItem: item });
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
        className="w-400px sm:w-540px p-0 flex flex-col bg-background shadow-2xl border-l"
      >
        <SheetHeader className="p-6 border-b bg-primary/5">
          <SheetTitle className="flex items-center gap-2 font-heading text-primary">
            <BookMarked className="h-6 w-6" />
            Sổ tay cá nhân
          </SheetTitle>
          <SheetDescription>
            Lưu trữ các từ vựng, mẫu câu và công thức quan trọng của bạn.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {flaggedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <BookMarked className="h-10 w-10 text-muted-foreground opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg">Sổ tay trống</p>
                <p className="text-sm text-muted-foreground max-w-240px">
                  Bấm vào biểu tượng ngôi sao hoặc bookmark trong các bài học để
                  lưu nội dung.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-10">
              {unitIds.map((unitId) => {
                const group = groupedItems[unitId];
                return (
                  <div key={unitId} className="space-y-4">
                    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 border-b border-dashed">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          CHƯƠNG {unitId}
                        </Badge>
                        <h3 className="font-bold text-sm truncate max-w-180px">
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
                        ĐẾN BÀI HỌC <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-3 pl-2">
                      {/* Vocabulary */}
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
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-primary">
                                {v.word}
                              </h4>
                              <p className="text-sm font-medium text-muted-foreground">
                                {v.meaning}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => playAudio(v.word)}
                            >
                              <Volume2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Phrases */}
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

                      {/* Collocations */}
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
