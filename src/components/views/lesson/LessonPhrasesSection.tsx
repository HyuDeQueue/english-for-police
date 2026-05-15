import React, { useMemo, useEffect, useState } from "react";
import type { Unit, FlaggedItem } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  PlayCircle,
  ArrowRight,
  Sparkles,
  Volume2,
  Star,
  ListTree,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioRecorderButton } from "@/components/common/AudioRecorderButton";
import {
  collectSubLessonIdsFromUnit,
  phraseSubLessonLabel,
} from "@/components/practice/utils/testUtils";

interface LessonPhrasesSectionProps {
  unit: Unit;
  flaggedItems: FlaggedItem[];
  onToggleFlag: (item: FlaggedItem) => void;
  onPlayAudio: (
    text: string,
    element?: HTMLButtonElement,
    isPhrase?: boolean,
  ) => void;
  onStartPractice: (mode?: string, group?: string) => void;
}

const PHRASE_GROUPS_UNIT2 = [
  {
    id: "2.1",
    title: "Tiếp cận & Chào hỏi",
    contexts: [
      "Initial contact and introduction",
      "Approaching and greeting civilians",
      "Initial contact",
    ],
  },
  {
    id: "2.2",
    title: "Xác minh & Yêu cầu",
    contexts: [
      "Requesting identification documents",
      "Verifying personal information",
      "Checking documents",
      "Explaining purpose and authority",
    ],
  },
  {
    id: "2.3",
    title: "Hướng dẫn & Giải thích",
    contexts: [
      "Giving instructions",
      "Explaining procedures",
      "Providing general assistance",
    ],
  },
  {
    id: "2.4",
    title: "Bàn giao & Kết thúc",
    contexts: [
      "Concluding the interview",
      "Ending interaction",
      "Calming and guiding civilians",
    ],
  },
];

const PHRASE_GROUPS_UNIT1 = [
  {
    id: "1.1",
    title: "Tiếp xúc ban đầu",
    contexts: ["Initial contact and introduction"],
  },
  {
    id: "1.2",
    title: "Giấy tờ & xác minh",
    contexts: ["Requesting identification documents"],
  },
  {
    id: "1.3",
    title: "Thông tin cá nhân",
    contexts: ["Verifying personal information"],
  },
];

function legacyGroups(
  unitId: number,
): { id: string; title: string; contexts: string[] }[] | null {
  if (unitId === 2) return PHRASE_GROUPS_UNIT2;
  if (unitId === 1) return PHRASE_GROUPS_UNIT1;
  return null;
}

export const LessonPhrasesSection: React.FC<LessonPhrasesSectionProps> = ({
  unit,
  flaggedItems,
  onToggleFlag,
  onPlayAudio,
  onStartPractice,
}) => {
  const groupedPhrases = useMemo(() => {
    const subIds = collectSubLessonIdsFromUnit(unit);
    if (subIds.length > 0) {
      return subIds.map((id) => ({
        id,
        title: phraseSubLessonLabel(
          id,
          unit.phrases.find((p) => (p.subLessonId ?? "").trim() === id),
        ),
        phrases: unit.phrases.filter(
          (p) => (p.subLessonId ?? "").trim() === id,
        ),
      }));
    }
    const legacy = legacyGroups(unit.id);
    if (legacy) {
      return legacy.map((group) => {
        const phrases = unit.phrases.filter((p) =>
          group.contexts.some(
            (c) => p.context.toLowerCase() === c.toLowerCase(),
          ),
        );
        return { id: group.id, title: group.title, phrases };
      });
    }
    return [{ id: "all", title: "Mẫu câu", phrases: unit.phrases }];
  }, [unit.phrases, unit.id]);

  const [accordionOpen, setAccordionOpen] = useState<string[]>(() =>
    groupedPhrases[0]?.id ? [groupedPhrases[0].id] : [],
  );
  const [subSelect, setSubSelect] = useState<string>(
    () => groupedPhrases[0]?.id ?? "",
  );

  useEffect(() => {
    const first = groupedPhrases[0]?.id;
    if (!first) return;
    setSubSelect((prev) =>
      groupedPhrases.some((g) => g.id === prev) ? prev : first,
    );
    setAccordionOpen((prev) => {
      const valid = prev.filter((id) => groupedPhrases.some((g) => g.id === id));
      return valid.length > 0 ? valid : [first];
    });
  }, [groupedPhrases]);

  useEffect(() => {
    if (!subSelect) return;
    setAccordionOpen([subSelect]);
    const el = document.getElementById(`phrases-${subSelect}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [subSelect]);

  const isFlagged = (text: string) =>
    flaggedItems.some(
      (f) => f.unitId === unit.id && f.type === "phrase" && f.key === text,
    );

  return (
    <Card
      id="phrases"
      className="border-none police-shadow overflow-hidden scroll-mt-24"
    >
      <CardHeader className="primary-gradient text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <Badge className="bg-white/20 text-white border-none mb-2">
              PHẦN 02
            </Badge>
            <CardTitle className="text-2xl sm:text-3xl font-heading font-black flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-secondary" />
              MẪU CÂU GIAO TIẾP
            </CardTitle>
            <p className="text-white/80 font-medium max-w-xl">
              Chọn tiểu mục để xem mẫu câu và mở luyện tập đúng bộ câu hỏi đã
              gắn theo ID (ví dụ 2.1, 2.2...).
            </p>
          </div>
          {groupedPhrases.length > 1 ? (
            <div className="w-full sm:w-64 space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                <ListTree className="h-3.5 w-3.5" />
                Tiểu mục
              </p>
              <Select value={subSelect} onValueChange={setSubSelect}>
                <SelectTrigger className="h-11 bg-white/95 text-foreground font-bold border-0 shadow-md">
                  <SelectValue placeholder="Chọn phần" />
                </SelectTrigger>
                <SelectContent>
                  {groupedPhrases.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.id} — {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Accordion
          type="multiple"
          value={accordionOpen}
          onValueChange={setAccordionOpen}
          className="w-full"
        >
          {groupedPhrases.map((group) => (
            <AccordionItem
              key={group.id}
              value={group.id}
              id={`phrases-${group.id}`}
              className="border-b last:border-0"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/30 transition-all hover:no-underline group">
                <div className="flex items-center gap-4 text-left">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-colors">
                    {group.id}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-primary uppercase tracking-tight">
                      {group.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {group.phrases.length} mẫu câu ứng dụng
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6">
                <div className="space-y-4 mb-6">
                  {group.phrases.length > 0 ? (
                    group.phrases.map((phrase, idx) => {
                      const flagged = isFlagged(phrase.text);
                      return (
                        <div
                          key={`${group.id}-${idx}`}
                          className="group/item p-4 rounded-xl border border-muted bg-card hover:border-primary/30 hover:bg-primary/5 transition-all animate-in fade-in slide-in-from-left-2"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="space-y-1">
                                <h4 className="text-lg font-bold text-primary leading-tight">
                                  {phrase.text}
                                </h4>
                                <p className="text-muted-foreground font-medium italic border-l-2 border-primary/20 pl-3">
                                  {phrase.translation}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-full text-[10px] font-black transition-all hover:bg-primary hover:text-white"
                                  onClick={(e) =>
                                    onPlayAudio(
                                      phrase.text,
                                      e.currentTarget,
                                      true,
                                    )
                                  }
                                >
                                  <Volume2 className="h-3 w-3 mr-1.5" />
                                  NGHE MẪU
                                </Button>
                                <AudioRecorderButton className="h-8 text-[10px] font-black" />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full ${flagged ? "text-secondary" : "text-muted-foreground"}`}
                                  onClick={() =>
                                    onToggleFlag({
                                      unitId: unit.id,
                                      type: "phrase",
                                      key: phrase.text,
                                    })
                                  }
                                >
                                  <Star
                                    className={`h-4 w-4 ${flagged ? "fill-current" : ""}`}
                                  />
                                </Button>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full h-10 w-10 shrink-0 police-shadow hover:scale-110 active:scale-95 transition-all"
                              onClick={(e) =>
                                onPlayAudio(phrase.text, e.currentTarget, true)
                              }
                            >
                              <PlayCircle className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed">
                      Đang cập nhật nội dung cho phần này...
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <Button
                    size="lg"
                    className="rounded-xl font-black px-8 h-14 primary-gradient police-shadow transition-all hover:scale-105 active:scale-95 group"
                    onClick={() => onStartPractice("PHRASE_SCENARIO", group.id)}
                    disabled={group.phrases.length === 0}
                  >
                    <Sparkles className="mr-3 h-6 w-6 text-secondary animate-pulse" />
                    LUYỆN TẬP PHẦN {group.id}
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default LessonPhrasesSection;
