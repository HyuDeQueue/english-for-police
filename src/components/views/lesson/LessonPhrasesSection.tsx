import React from "react";
import { Volume2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Unit, FlaggedItem } from "@/types";

interface LessonPhrasesSectionProps {
  readonly unit: Unit;
  readonly flaggedItems: FlaggedItem[];
  readonly onToggleFlag: (item: FlaggedItem) => void;
  readonly onPlayAudio: (
    text: string,
    element?: HTMLButtonElement,
    isPhrase?: boolean,
  ) => void;
  readonly sectionRef?: (el: HTMLElement | null) => void;
}

export const LessonPhrasesSection: React.FC<LessonPhrasesSectionProps> = ({
  unit,
  flaggedItems,
  onToggleFlag,
  onPlayAudio,
  sectionRef,
}) => {
  const isFlagged = (text: string) =>
    flaggedItems.some(
      (f) => f.unitId === unit.id && f.type === "phrase" && f.key === text,
    );

  return (
    <section
      data-section="phrases"
      ref={sectionRef}
      className="scroll-mt-100px"
    >
      <div className="flex items-center gap-4 mb-6">
        <Badge
          variant="outline"
          className="text-lg px-3 py-1 font-bold border-primary text-primary bg-primary/5"
        >
          02
        </Badge>
        <h2 className="text-2xl font-heading font-extrabold tracking-tight">
          CẤU TRÚC CHUYÊN NGHIỆP
        </h2>
      </div>

      <div className="space-y-4">
        {unit.phrases.map((p, i) => {
          const flagged = isFlagged(p.text);
          return (
            <Card
              key={i}
              className={`overflow-hidden border-l-4 ${flagged ? "border-l-secondary" : "border-l-primary/20"}`}
            >
              <Accordion type="single" collapsible>
                <AccordionItem value={`item-${i}`} className="border-none">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-primary text-lg mb-1">
                        {p.text}
                      </h4>
                      <p className="text-muted-foreground font-medium">
                        {p.translation}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 rounded-full ${flagged ? "text-secondary" : "text-muted-foreground"}`}
                        onClick={() =>
                          onToggleFlag({
                            unitId: unit.id,
                            type: "phrase",
                            key: p.text,
                          })
                        }
                      >
                        <Star
                          className={`h-5 w-5 ${flagged ? "fill-current" : ""}`}
                        />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full transition-all group-hover:bg-primary group-hover:text-white hover:bg-primary hover:text-white"
                        onClick={(e) =>
                          onPlayAudio(p.text, e.currentTarget, true)
                        }
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                      <AccordionTrigger className="hover:no-underline p-0 ml-2" />
                    </div>
                  </div>
                  <AccordionContent className="px-6 pb-6 pt-2 bg-muted/30">
                    <div className="space-y-4 text-sm">
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className="h-fit shrink-0 bg-white"
                        >
                          NGỮ CẢNH
                        </Badge>
                        <p className="leading-relaxed">{p.context}</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-white">
                          VÍ DỤ THỰC TẾ
                        </Badge>
                        <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
                          {p.realWorldExamples &&
                          p.realWorldExamples.length > 0 ? (
                            p.realWorldExamples.map((ex, j) => (
                              <li
                                key={j}
                                className="italic text-muted-foreground"
                              >
                                {ex}
                              </li>
                            ))
                          ) : (
                            <li className="italic text-muted-foreground opacity-60">
                              Sử dụng trong các tình huống giao tiếp tuần tra
                              thực tế.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default LessonPhrasesSection;
