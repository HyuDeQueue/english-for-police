import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Unit } from "@/types";
import { defaultPhrase } from "@/pages/admin/LessonEditorUtils";

import { Trash2, Plus } from "lucide-react";

export function PhrasesSection({
  draft,
  setDraft,
}: {
  draft: Unit;
  setDraft: React.Dispatch<React.SetStateAction<Unit>>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="h-2 w-2 rounded-full bg-primary" />
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/70">
          Danh sách mẫu câu ({draft.phrases.length})
        </h4>
      </div>

      <Card className="border border-border/60 bg-card/30 shadow-none overflow-hidden">
        <CardContent className="space-y-6 p-4 max-h-[700px] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {draft.phrases.map((row, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col gap-4 p-5 rounded-xl border border-border/40 bg-background/60 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                {/* Item Number Badge */}
                <div className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                  {idx + 1}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                      Mẫu câu tiếng Anh
                    </Label>
                    <Input
                      placeholder="VD: How can I help you?"
                      value={row.text}
                      onChange={(e) => {
                        const p = [...draft.phrases];
                        p[idx] = { ...p[idx], text: e.target.value };
                        setDraft((d) => ({ ...d, phrases: p }));
                      }}
                      className="h-9 text-sm font-bold border-border/40 focus:border-primary/40 focus:ring-primary/10"
                    />
                  </div>
                  <div className="md:col-span-6 space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                      Bản dịch tiếng Việt
                    </Label>
                    <Input
                      placeholder="VD: Tôi có thể giúp gì cho bạn?"
                      value={row.translation}
                      onChange={(e) => {
                        const p = [...draft.phrases];
                        p[idx] = { ...p[idx], translation: e.target.value };
                        setDraft((d) => ({ ...d, phrases: p }));
                      }}
                      className="h-9 text-sm font-medium border-border/40"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end items-end pb-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => {
                        const p = draft.phrases.filter((_, i) => i !== idx);
                        setDraft((d) => ({ ...d, phrases: p }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    Ngữ cảnh sử dụng
                  </Label>
                  <Input
                    placeholder="VD: Dùng khi tiếp đón công dân tại trụ sở..."
                    value={row.context}
                    onChange={(e) => {
                      const p = [...draft.phrases];
                      p[idx] = { ...p[idx], context: e.target.value };
                      setDraft((d) => ({ ...d, phrases: p }));
                    }}
                    className="h-9 text-xs italic bg-muted/10 border-dashed border-border/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    Tiểu mục (subLessonId)
                  </Label>
                  <Input
                    placeholder="VD: 2.1 hoặc 1.2"
                    value={row.subLessonId ?? ""}
                    onChange={(e) => {
                      const p = [...draft.phrases];
                      p[idx] = { ...p[idx], subLessonId: e.target.value };
                      setDraft((d) => ({ ...d, phrases: p }));
                    }}
                    className="h-9 text-xs font-mono border-border/60"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-10 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mt-2"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                phrases: [...d.phrases, defaultPhrase()],
              }))
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm mẫu câu mới
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
