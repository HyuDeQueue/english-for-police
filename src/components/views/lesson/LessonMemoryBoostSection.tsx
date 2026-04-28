import React from "react";
import { Zap, BookMarked } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Unit, FlaggedItem } from "@/types";

interface LessonMemoryBoostSectionProps {
  readonly unit: Unit;
  readonly flaggedItems: FlaggedItem[];
  readonly onToggleFlag: (item: FlaggedItem) => void;
  readonly sectionRef?: (el: HTMLElement | null) => void;
}

export const LessonMemoryBoostSection: React.FC<
  LessonMemoryBoostSectionProps
> = ({ unit, flaggedItems, onToggleFlag, sectionRef }) => {
  const isFlagged = (key: string) =>
    flaggedItems.some(
      (f) => f.unitId === unit.id && f.type === "collocation" && f.key === key,
    );

  return (
    <section data-section="memory" ref={sectionRef} className="scroll-mt-100px">
      <div className="flex items-center gap-4 mb-6">
        <Badge
          variant="outline"
          className="text-lg px-3 py-1 font-bold border-primary text-primary bg-primary/5"
        >
          03
        </Badge>
        <h2 className="text-2xl font-heading font-extrabold tracking-tight">
          GHI NHỚ NHANH
        </h2>
      </div>
      <Card className="police-shadow border-none bg-secondary/5 overflow-hidden">
        <CardHeader className="bg-secondary/10 border-b border-secondary/20">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5 fill-current text-secondary" />
            Cụm từ đi kèm (Collocations)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {unit.memoryBoost.collocations.map((c, i) => {
              const key = `${c.verb} ${c.noun}`;
              const flagged = isFlagged(key);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 bg-white rounded-lg border transition-all ${flagged ? "border-secondary bg-secondary/5" : "border-secondary/10 hover:border-secondary"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{c.verb}</span>
                    <span className="text-muted-foreground">+</span>
                    <span className="font-medium">{c.noun}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full ${flagged ? "text-secondary" : "text-muted-foreground hover:text-secondary"}`}
                    onClick={() =>
                      onToggleFlag({
                        unitId: unit.id,
                        type: "collocation",
                        key: key,
                      })
                    }
                  >
                    <BookMarked
                      className={`h-4 w-4 ${flagged ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default LessonMemoryBoostSection;
