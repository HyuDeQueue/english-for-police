import React, { useMemo, useEffect, useRef, useState } from "react";
import type { Unit, FlaggedItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, ArrowRight, Sparkles, Volume2, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  /** Đồng bộ với dropdown tiểu mục ở mục lục. */
  selectedSubId?: string;
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
  selectedSubId,
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
  }, [unit]);

  const [accordionOpen, setAccordionOpen] = useState<string[]>(() =>
    groupedPhrases[0]?.id ? [groupedPhrases[0].id] : [],
  );
  const skipSubScrollRef = useRef(true);

  useEffect(() => {
    skipSubScrollRef.current = true;
  }, [unit.id]);
  useEffect(() => {
    const first = groupedPhrases[0]?.id;
    if (!first) return;
    queueMicrotask(() => {
      setAccordionOpen((prev) => {
        const valid = prev.filter((id) =>
          groupedPhrases.some((g) => g.id === id),
        );
        return valid.length > 0 ? valid : [first];
      });
    });
  }, [groupedPhrases]);

  useEffect(() => {
    if (!selectedSubId) return;

    queueMicrotask(() => {
      setAccordionOpen((prev) =>
        prev.includes(selectedSubId) ? prev : [...prev, selectedSubId],
      );
    });

    if (skipSubScrollRef.current) {
      skipSubScrollRef.current = false;
      return;
    }

    const HEADER_OFFSET = 96;

    const scrollToAnchor = () => {
      const el = document.getElementById(`phrases-${selectedSubId}`);
      if (!el) return;
      const top =
        el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    const t1 = window.setTimeout(scrollToAnchor, 50);
    const t2 = window.setTimeout(scrollToAnchor, 320);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [selectedSubId]);

  const isFlagged = (text: string) =>
    flaggedItems.some(
      (f) => f.unitId === unit.id && f.type === "phrase" && f.key === text,
    );

  return (
    <>
      <div className="flex items-center gap-4 px-6 pt-6 pb-4">
        <Badge
          variant="outline"
          className="border-primary bg-primary/5 px-3 py-1 text-lg font-bold text-primary"
        >
          02
        </Badge>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">
          CẤU TRÚC
        </h2>
      </div>
      <Card
        id="phrases"
        className="scroll-mt-24 overflow-hidden rounded-lg border-none police-shadow"
      >
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
                className="border-b last:border-0"
              >
                <div
                  id={`phrases-${group.id}`}
                  data-phrase-anchor={group.id}
                  className="phrase-section-anchor scroll-mt-28 h-0 w-full"
                  aria-hidden
                />
                <AccordionTrigger className="group items-center gap-3 px-6 py-4 transition-all hover:bg-muted/30 hover:no-underline">
                  <div className="flex min-w-0 flex-1 items-center gap-4 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary transition-colors group-data-[state=open]:bg-primary group-data-[state=open]:text-white">
                      {group.id}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-primary">
                        {group.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {group.phrases.length} mẫu câu ứng dụng
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="primary-gradient police-shadow group/practice h-9 shrink-0 rounded-lg px-3 text-[10px] font-black transition-all hover:scale-105 active:scale-95 sm:px-4 sm:text-xs"
                    disabled={group.phrases.length === 0}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartPractice("PHRASE_SCENARIO", group.id);
                    }}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 shrink-0 animate-pulse text-secondary" />
                    LUYỆN TẬP PHẦN {group.id}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 shrink-0 transition-transform group-hover/practice:translate-x-0.5" />
                  </Button>
                </AccordionTrigger>
                <AccordionContent className="px-6 pt-2 pb-6">
                  <div className="space-y-4">
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
                                  onPlayAudio(
                                    phrase.text,
                                    e.currentTarget,
                                    true,
                                  )
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
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
};

export default LessonPhrasesSection;
