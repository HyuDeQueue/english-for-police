import React, { useMemo } from "react";
import { ChevronLeft, List, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PhraseSubNavItem } from "@/components/practice/utils/testUtils";

interface LessonTableOfContentsProps {
  readonly unitId: number;
  readonly activeSection: string;
  readonly onBack: () => void;
  readonly onScrollToSection: (id: string) => void;
  readonly phraseSubNavItems?: PhraseSubNavItem[];
  readonly selectedPhraseSubId?: string;
  readonly onPhraseSubSelect?: (id: string) => void;
}

export const LessonTableOfContents: React.FC<LessonTableOfContentsProps> = ({
  unitId,
  activeSection,
  onBack,
  onScrollToSection,
  phraseSubNavItems = [],
  selectedPhraseSubId = "",
  onPhraseSubSelect,
}) => {
  const sections = [
    { id: "vocabulary", label: "01 Từ vựng", icon: Zap },
    { id: "phrases", label: "02 Cấu trúc", icon: List },
  ];

  const showPhraseSubNav = phraseSubNavItems.length > 0;

  const goToPhraseSub = (subId: string) => {
    if (onPhraseSubSelect) {
      onPhraseSubSelect(subId);
    } else {
      onScrollToSection(`phrases-${subId}`);
    }
  };

  const accordionValue = useMemo(() => {
    if (activeSection.startsWith("phrases")) return "phrases";
    return activeSection;
  }, [activeSection]);

  return (
    <div className="overflow-hidden rounded-md border bg-card police-shadow">
      <div className="flex items-center justify-between border-b bg-muted/50 p-4">
        <h4 className="flex items-center gap-2 font-heading text-sm font-bold">
          <List className="h-4 w-4 text-primary" />
          MỤC LỤC
        </h4>
        <Badge
          variant="outline"
          className="h-5 border-primary/20 bg-primary/10 py-0 text-[10px] font-bold text-primary"
        >
          BÀI-{unitId.toString().padStart(2, "0")}
        </Badge>
      </div>
      <div className="space-y-1 p-2">
        <Button
          variant="ghost"
          className="mb-2 h-auto w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary"
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          QUAY LẠI
        </Button>

        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={(value) => {
            if (value) onScrollToSection(value);
          }}
          className="w-full"
        >
          {sections.map((item) => {
            const isPhrases = item.id === "phrases";
            const isActive = accordionValue === item.id;

            return (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-none"
              >
                <AccordionTrigger
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:no-underline ${
                    isActive
                      ? "primary-gradient police-shadow font-bold text-white"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${isActive ? "text-secondary" : ""}`}
                  />
                  <span className="flex-1">{item.label}</span>
                </AccordionTrigger>

                {isPhrases && showPhraseSubNav ? (
                  <AccordionContent className="space-y-0.5 px-2 pb-3 pt-1 pl-4">
                    {phraseSubNavItems.map((sub) => {
                      const isSubActive =
                        activeSection === `phrases-${sub.id}` ||
                        selectedPhraseSubId === sub.id;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => goToPhraseSub(sub.id)}
                          className={`w-full rounded-md px-2 py-2 text-left text-[11px] leading-snug transition-colors ${
                            isSubActive
                              ? "bg-primary/10 font-bold text-primary"
                              : "font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          }`}
                        >
                          <span className="font-black">{sub.id}</span>
                          <span className="mx-1 text-muted-foreground/80">
                            —
                          </span>
                          <span>{sub.title}</span>
                        </button>
                      );
                    })}
                  </AccordionContent>
                ) : null}
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default LessonTableOfContents;
