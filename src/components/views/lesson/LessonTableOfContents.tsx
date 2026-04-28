import React from "react";
import { ChevronLeft, List, Zap, BookMarked } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LessonTableOfContentsProps {
  readonly unitId: number;
  readonly activeSection: string;
  readonly onBack: () => void;
  readonly onScrollToSection: (id: string) => void;
}

export const LessonTableOfContents: React.FC<LessonTableOfContentsProps> = ({
  unitId,
  activeSection,
  onBack,
  onScrollToSection,
}) => {
  const sections = [
    { id: "vocabulary", label: "01 Từ vựng", icon: Zap },
    { id: "phrases", label: "02 Cấu trúc", icon: List },
    { id: "memory", label: "03 Ghi nhớ", icon: BookMarked },
  ];

  return (
    <div className="bg-card rounded-xl border police-shadow overflow-hidden">
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
          className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary"
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          QUAY LẠI
        </Button>

        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => onScrollToSection(item.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${
              activeSection === item.id
                ? "bg-primary text-white font-bold police-shadow"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            }`}
          >
            <item.icon
              className={`h-4 w-4 ${activeSection === item.id ? "text-secondary" : ""}`}
            />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LessonTableOfContents;
