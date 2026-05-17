import React, { useMemo, useEffect, useRef, useState } from "react";
import type { Unit, FlaggedItem, Question } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  ChevronRight,
  Sparkles,
  Volume2,
  Star,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AudioRecorderButton } from "@/components/common/AudioRecorderButton";
import { requestOpenLoginDialog } from "@/lib/auth-ui-events";
import {
  collectSubLessonIdsFromUnit,
  phraseSubLessonLabel,
  practiceTypesForSubLesson,
} from "@/components/practice/utils/testUtils";
import { PracticeGroupedTypeMenu } from "@/components/views/lesson/PracticeGroupedTypeMenu";

interface LessonPhrasesSectionProps {
  unit: Unit;
  flaggedItems: FlaggedItem[];
  onToggleFlag: (item: FlaggedItem) => void;
  onPlayAudio: (
    text: string,
    element?: HTMLButtonElement,
    isPhrase?: boolean,
  ) => void;
  practiceQuestions: Question[];
  testsLocked?: boolean;
  onStartPracticeByType: (sectionTitle: string, subLessonId: string) => void;
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
  practiceQuestions,
  testsLocked = false,
  onStartPracticeByType,
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
  const [practiceDialogGroup, setPracticeDialogGroup] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const skipSubScrollRef = useRef(true);

  const dialogPracticeTypes = useMemo(() => {
    if (!practiceDialogGroup) return [];
    return practiceTypesForSubLesson(practiceQuestions, practiceDialogGroup.id);
  }, [practiceDialogGroup, practiceQuestions]);

  const openPracticeDialog = (
    group: { id: string; title: string },
    e: React.MouseEvent | React.PointerEvent,
  ) => {
    e.stopPropagation();
    if (testsLocked) {
      requestOpenLoginDialog();
      return;
    }
    setPracticeDialogGroup(group);
  };

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
    <div className="max-w-full min-w-0 overflow-x-hidden">
      <div className="flex items-center gap-3 px-4 pb-4 pt-6 sm:gap-4 sm:px-6">
        <Badge
          variant="outline"
          className="border-primary bg-primary/5 px-3 py-1 text-lg font-bold text-primary"
        >
          02
        </Badge>
        <h2 className="font-heading text-xl font-extrabold tracking-tight sm:text-2xl">
          CẤU TRÚC
        </h2>
      </div>
      <Card
        id="phrases"
        className="w-full max-w-full min-w-0 scroll-mt-24 overflow-hidden rounded-lg border-none police-shadow"
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
                <AccordionTrigger className="group flex-wrap items-center gap-2 px-4 py-3 transition-all hover:bg-muted/30 hover:no-underline sm:gap-3 sm:px-6 sm:py-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary transition-colors group-data-[state=open]:bg-primary group-data-[state=open]:text-white sm:h-10 sm:w-10 sm:text-sm">
                      {group.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-base font-bold uppercase tracking-tight wrap-break-word text-primary sm:text-lg">
                        {group.title}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground">
                        {group.phrases.length} mẫu câu ứng dụng
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 max-w-full shrink-0 rounded-lg px-3 text-[10px] font-bold sm:px-4 sm:text-xs"
                    disabled={group.phrases.length === 0}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) =>
                      openPracticeDialog(
                        { id: group.id, title: group.title },
                        e,
                      )
                    }
                  >
                    <span className="truncate">Luyện tập</span>
                    <ChevronRight className="ml-1.5 h-3.5 w-3.5 shrink-0" />
                  </Button>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-6 sm:px-6">
                  <div className="space-y-4">
                    {group.phrases.length > 0 ? (
                      group.phrases.map((phrase, idx) => {
                        const flagged = isFlagged(phrase.text);
                        return (
                          <div
                            key={`${group.id}-${idx}`}
                            className="group/item min-w-0 overflow-hidden rounded-xl border border-muted bg-card p-3 transition-all animate-in fade-in slide-in-from-left-2 hover:border-primary/30 hover:bg-primary/5 sm:p-4"
                          >
                            <div className="flex min-w-0 flex-col gap-3">
                              <div className="min-w-0 space-y-1">
                                <h4 className="wrap-break-word text-base font-bold leading-tight text-primary sm:text-lg">
                                  {phrase.text}
                                </h4>
                                <p className="wrap-break-word border-l-2 border-primary/20 pl-3 text-sm font-medium italic text-muted-foreground">
                                  {phrase.translation}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 shrink-0 rounded-full text-[10px] font-black transition-all hover:bg-primary hover:text-white"
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
                                <AudioRecorderButton className="h-8 shrink-0 text-[10px] font-black" />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 shrink-0 rounded-full ${flagged ? "text-secondary" : "text-muted-foreground"}`}
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
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="ml-auto h-9 w-9 shrink-0 rounded-full police-shadow transition-all hover:scale-105 active:scale-95 sm:h-10 sm:w-10"
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
      <Dialog
        open={practiceDialogGroup !== null}
        onOpenChange={(open) => {
          if (!open) setPracticeDialogGroup(null);
        }}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-xl border-none p-0 police-shadow sm:max-w-md">
          <DialogHeader className="primary-gradient gap-2 rounded-none border-0 px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1 text-left">
                <DialogTitle className="text-xl font-heading font-black text-white">
                  Luyện tập
                </DialogTitle>
                <DialogDescription className="text-sm text-white/85">
                  {practiceDialogGroup ? (
                    <>
                      Phần{" "}
                      <span className="font-bold text-white">
                        {practiceDialogGroup.id}
                      </span>
                      {" — "}
                      {practiceDialogGroup.title}
                    </>
                  ) : null}
                </DialogDescription>
              </div>
              <Sparkles
                className="h-10 w-10 shrink-0 text-white/25"
                aria-hidden
              />
            </div>
          </DialogHeader>

          <div className="p-4">
            <PracticeGroupedTypeMenu
              variant="dialog"
              availableLabels={
                new Set(dialogPracticeTypes.map((t) => t.label))
              }
              emptyMessage={`Chưa có bài tập cho phần ${practiceDialogGroup?.id ?? "này"}.`}
              onSelectType={(typeLabel) => {
                if (!practiceDialogGroup) return;
                onStartPracticeByType(typeLabel, practiceDialogGroup.id);
                setPracticeDialogGroup(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonPhrasesSection;
