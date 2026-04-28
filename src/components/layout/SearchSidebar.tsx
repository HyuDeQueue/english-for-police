import React, { useState, useMemo } from "react";
import type { Unit } from "../../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface SearchSidebarProps {
  lessons: Unit[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUnit: (unit: Unit) => void;
}

interface SearchResult {
  unitId: number;
  unitTitle: string;
  type: "vocabulary" | "phrase";
  primary: string;
  secondary: string;
  unit: Unit;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  lessons,
  isOpen,
  onClose,
  onNavigateToUnit,
}) => {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    for (const unit of lessons) {
      for (const v of unit.vocabulary) {
        if (
          v.word.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q)
        ) {
          matches.push({
            unitId: unit.id,
            unitTitle: unit.title,
            type: "vocabulary",
            primary: v.word,
            secondary: v.meaning,
            unit,
          });
        }
      }
      for (const p of unit.phrases) {
        if (
          p.text.toLowerCase().includes(q) ||
          p.translation.toLowerCase().includes(q)
        ) {
          matches.push({
            unitId: unit.id,
            unitTitle: unit.title,
            type: "phrase",
            primary: p.text,
            secondary: p.translation,
            unit,
          });
        }
      }
    }
    return matches.slice(0, 20);
  }, [query, lessons]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] p-0 flex flex-col bg-background shadow-2xl border-l"
      >
        <SheetHeader className="p-6 border-b bg-muted/20">
          <SheetTitle className="flex items-center gap-2 font-heading text-primary">
            <Search className="h-5 w-5" />
            Tìm kiếm từ vựng
          </SheetTitle>
        </SheetHeader>

        <div className="p-6">
          <Input
            placeholder="Nhập từ vựng hoặc mẫu câu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 text-base focus-visible:ring-primary police-shadow"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar">
          <div className="space-y-4">
            {query.trim().length >= 2 && results.length === 0 && (
              <p className="text-center py-10 text-muted-foreground text-sm">
                Không tìm thấy kết quả phù hợp.
              </p>
            )}

            {results.map((r, i) => (
              <div
                key={i}
                className="group p-5 rounded-xl border bg-card hover:bg-primary hover:border-primary hover:police-shadow cursor-pointer transition-all active:scale-[0.98]"
                onClick={() => {
                  onNavigateToUnit(r.unit);
                  onClose();
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge
                    variant={r.type === "vocabulary" ? "default" : "secondary"}
                    className={`text-[10px] uppercase tracking-wider ${
                      r.type === "vocabulary"
                        ? "group-hover:bg-white group-hover:text-primary"
                        : "group-hover:bg-white/20 group-hover:text-white border-none"
                    }`}
                  >
                    {r.type === "vocabulary" ? "Từ vựng" : "Mẫu câu"}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase group-hover:text-white/60">
                    Chương {r.unitId}
                  </span>
                </div>
                <div className="font-bold text-primary text-base group-hover:text-white transition-colors">
                  {r.primary}
                </div>
                <div className="text-sm text-muted-foreground mt-1 group-hover:text-white/80 transition-colors">
                  {r.secondary}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
