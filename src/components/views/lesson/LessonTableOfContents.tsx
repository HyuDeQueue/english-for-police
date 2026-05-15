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

interface LessonTableOfContentsProps {
  readonly unitId: number;
  readonly activeSection: string;
  readonly onBack: () => void;
  readonly onScrollToSection: (id: string) => void;
  /** Tiểu mục mẫu câu (1.1, 2.1, …) — từ seed / API. */
  readonly phraseSubNavItems?: { id: string; label: string }[];
}

export const LessonTableOfContents: React.FC<LessonTableOfContentsProps> = ({
  unitId,
  activeSection,
  onBack,
  onScrollToSection,
  phraseSubNavItems = [],
}) => {
  const sections = [
    { id: "vocabulary", label: "01 Từ vựng", icon: Zap },
    { id: "phrases", label: "02 Cấu trúc", icon: List },
  ];

  // Map active section to accordion value
  const accordionValue = useMemo(() => {
    if (activeSection.startsWith("phrases")) return "phrases";
    return activeSection;
  }, [activeSection]);

  return (
    <div className="bg-card rounded-md border police-shadow overflow-hidden">
      <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
        <h4 className="font-heading font-bold flex items-center gap-2 text-sm">
          <List className="h-4 w-4 text-primary" />
          MỤC LỤC
        </h4>
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold py-0 h-5"
        >
          BÀI-{unitId.toString().padStart(2, "0")}
        </Badge>
      </div>
      <div className="p-2 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary mb-2"
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          QUAY LẠI
        </Button>

        <Accordion
          type="single"
          collapsible
          value={accordionValue}
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
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 hover:no-underline ${
                    isActive
                      ? "bg-primary text-white font-bold police-shadow"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={() => onScrollToSection(item.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <item.icon
                      className={`h-4 w-4 ${isActive ? "text-secondary" : ""}`}
                    />
                    <span>{item.label}</span>
                  </div>
                </AccordionTrigger>

                {isPhrases && phraseSubNavItems.length > 0 && (
                  <AccordionContent className="pl-9 pr-2 pt-2 pb-2 space-y-1">
                    {phraseSubNavItems.map((sub) => {
                      const isSubActive = activeSection === `phrases-${sub.id}`;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onScrollToSection(`phrases-${sub.id}`)}
                          className={`w-full text-left py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all block ${
                            isSubActive
                              ? "text-primary"
                              : "text-muted-foreground/60 hover:text-primary"
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default LessonTableOfContents;
