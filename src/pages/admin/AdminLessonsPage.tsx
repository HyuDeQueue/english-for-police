import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Collocation, Phrase, Question, Unit, Vocabulary } from "@/types";
import { lessonService } from "@/services/lesson.service";
import { useSonner } from "@/hooks/use-sonner";

const QUESTION_TYPES: Question["type"][] = [
  "MCQ",
  "Matching",
  "FillInBlank",
  "Dictation",
  "Arrangement",
  "Speaking",
  "Scenario",
];

const VOCAB_TYPES: Vocabulary["type"][] = [
  "Noun",
  "Verb",
  "Expression",
  "Adjective",
  "Adverb",
];

function newQuestionId(unitId: number): string {
  return `pq-${unitId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyUnit(suggestedId: number): Unit {
  return {
    id: suggestedId,
    title: "",
    description: "",
    vocabulary: [],
    phrases: [],
    memoryBoost: { collocations: [], summary: "" },
    practice: [],
    videoUrl: "",
  };
}

function defaultQuestion(unitId: number): Question {
  return {
    id: newQuestionId(unitId),
    type: "MCQ",
    prompt: "",
    answer: "",
    options: ["", ""],
    acceptableAnswers: [],
    pairs: [],
  };
}

function defaultVocabulary(): Vocabulary {
  return {
    word: "",
    phonetic: "",
    meaning: "",
    example: "",
    type: "Noun",
  };
}

function defaultPhrase(): Phrase {
  return {
    text: "",
    translation: "",
    context: "",
  };
}

function defaultCollocation(): Collocation {
  return { verb: "", noun: "" };
}

interface AdminLessonsPageProps {
  onLessonsUpdated: () => Promise<void>;
}

export default function AdminLessonsPage({
  onLessonsUpdated,
}: AdminLessonsPageProps) {
  const { notifyError, notifySuccess } = useSonner();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<Unit>(emptyUnit(1));

  const suggestedNextId = useMemo(() => {
    if (!units.length) return 1;
    return Math.max(...units.map((u) => u.id)) + 1;
  }, [units]);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const list = await lessonService.getLessons();
      setUnits(list);
    } catch (e) {
      console.error(e);
      notifyError("Không tải được danh sách chương", String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits]);

  const openCreate = () => {
    setMode("create");
    setDraft(emptyUnit(suggestedNextId));
    setDialogOpen(true);
  };

  const openEdit = async (unitNumber: number) => {
    setMode("edit");
    setDialogOpen(true);
    setSaving(true);
    try {
      const full = await lessonService.getLessonForAdmin(unitNumber);
      setDraft(full);
    } catch (e) {
      console.error(e);
      notifyError("Không tải được chương", String((e as Error).message ?? e));
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const persist = async () => {
    setSaving(true);
    try {
      if (mode === "create") {
        await lessonService.createLesson(draft);
        notifySuccess("Đã tạo chương", `Chương ${draft.id}`);
      } else {
        await lessonService.updateLesson(draft.id, draft);
        notifySuccess("Đã cập nhật chương", `Chương ${draft.id}`);
      }
      setDialogOpen(false);
      await loadUnits();
      await onLessonsUpdated();
    } catch (e) {
      console.error(e);
      notifyError("Lưu thất bại", String((e as Error).message ?? e));
    } finally {
      setSaving(false);
    }
  };

  const removeUnit = async (unitNumber: number) => {
    if (!window.confirm(`Xóa chương ${unitNumber}? Thao tác không hoàn tác.`)) {
      return;
    }
    try {
      await lessonService.deleteLesson(unitNumber);
      notifySuccess("Đã xóa chương", String(unitNumber));
      await loadUnits();
      await onLessonsUpdated();
    } catch (e) {
      console.error(e);
      notifyError("Xóa thất bại", String((e as Error).message ?? e));
    }
  };

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <AdminPageLayout
      title="Quản lý bài học"
      description="Tạo, sửa và xóa chương (đơn vị bài học), gồm từ vựng, mẫu câu, cố định và câu hỏi luyện tập. Chỉnh sửa đáp án cần đăng nhập quản trị."
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm chương
        </Button>
      }
    >
      <Card className="border-border police-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Danh sách chương
          </CardTitle>
          <CardDescription>
            {loading ? "Đang tải…" : `${units.length} chương`}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Mã</th>
                <th className="py-2 pr-4 font-semibold">Tiêu đề</th>
                <th className="py-2 pr-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-mono font-medium">{u.id}</td>
                  <td className="py-3 pr-4">{u.title}</td>
                  <td className="py-3 pr-0 text-right space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => void openEdit(u.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => void removeUnit(u.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Thêm chương mới" : `Sửa chương ${draft.id}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit-id">Mã chương (số)</Label>
                <Input
                  id="unit-id"
                  type="number"
                  disabled={mode === "edit"}
                  value={draft.id}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      id: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video">Video URL</Label>
                <Input
                  id="video"
                  value={draft.videoUrl ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, videoUrl: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Textarea
                id="desc"
                rows={3}
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
              />
            </div>

            <Accordion type="multiple" className="w-full border rounded-md">
              <AccordionItem value="vocab">
                <AccordionTrigger>Từ vựng ({draft.vocabulary.length})</AccordionTrigger>
                <AccordionContent className="space-y-3 px-1">
                  {draft.vocabulary.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-6 gap-2 border-b pb-3"
                    >
                      <Input
                        placeholder="Từ"
                        value={row.word}
                        onChange={(e) => {
                          const v = [...draft.vocabulary];
                          v[idx] = { ...v[idx], word: e.target.value };
                          setDraft((d) => ({ ...d, vocabulary: v }));
                        }}
                      />
                      <Input
                        placeholder="Phiên âm"
                        value={row.phonetic}
                        onChange={(e) => {
                          const v = [...draft.vocabulary];
                          v[idx] = { ...v[idx], phonetic: e.target.value };
                          setDraft((d) => ({ ...d, vocabulary: v }));
                        }}
                      />
                      <Input
                        placeholder="Nghĩa"
                        className="md:col-span-2"
                        value={row.meaning}
                        onChange={(e) => {
                          const v = [...draft.vocabulary];
                          v[idx] = { ...v[idx], meaning: e.target.value };
                          setDraft((d) => ({ ...d, vocabulary: v }));
                        }}
                      />
                      <select
                        className={selectClass}
                        value={row.type}
                        onChange={(e) => {
                          const v = [...draft.vocabulary];
                          v[idx] = {
                            ...v[idx],
                            type: e.target.value as Vocabulary["type"],
                          };
                          setDraft((d) => ({ ...d, vocabulary: v }));
                        }}
                      >
                        {VOCAB_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 md:col-span-6">
                        <Input
                          placeholder="Ví dụ"
                          className="flex-1"
                          value={row.example}
                          onChange={(e) => {
                            const v = [...draft.vocabulary];
                            v[idx] = { ...v[idx], example: e.target.value };
                            setDraft((d) => ({ ...d, vocabulary: v }));
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const v = draft.vocabulary.filter((_, i) => i !== idx);
                            setDraft((d) => ({ ...d, vocabulary: v }));
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        vocabulary: [...d.vocabulary, defaultVocabulary()],
                      }))
                    }
                  >
                    + Thêm từ
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="phrases">
                <AccordionTrigger>Mẫu câu ({draft.phrases.length})</AccordionTrigger>
                <AccordionContent className="space-y-3 px-1">
                  {draft.phrases.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3"
                    >
                      <Input
                        placeholder="Câu"
                        value={row.text}
                        onChange={(e) => {
                          const p = [...draft.phrases];
                          p[idx] = { ...p[idx], text: e.target.value };
                          setDraft((d) => ({ ...d, phrases: p }));
                        }}
                      />
                      <Input
                        placeholder="Dịch"
                        value={row.translation}
                        onChange={(e) => {
                          const p = [...draft.phrases];
                          p[idx] = { ...p[idx], translation: e.target.value };
                          setDraft((d) => ({ ...d, phrases: p }));
                        }}
                      />
                      <div className="flex gap-2 md:col-span-3">
                        <Input
                          placeholder="Ngữ cảnh"
                          className="flex-1"
                          value={row.context}
                          onChange={(e) => {
                            const p = [...draft.phrases];
                            p[idx] = { ...p[idx], context: e.target.value };
                            setDraft((d) => ({ ...d, phrases: p }));
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const p = draft.phrases.filter((_, i) => i !== idx);
                            setDraft((d) => ({ ...d, phrases: p }));
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        phrases: [...d.phrases, defaultPhrase()],
                      }))
                    }
                  >
                    + Thêm mẫu câu
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="memory">
                <AccordionTrigger>Cố định (memory boost)</AccordionTrigger>
                <AccordionContent className="space-y-3 px-1">
                  <div className="space-y-2">
                    <Label>Tóm tắt</Label>
                    <Textarea
                      rows={2}
                      value={draft.memoryBoost.summary}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          memoryBoost: {
                            ...d.memoryBoost,
                            summary: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  {draft.memoryBoost.collocations.map((row, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Động từ"
                        value={row.verb}
                        onChange={(e) => {
                          const c = [...draft.memoryBoost.collocations];
                          c[idx] = { ...c[idx], verb: e.target.value };
                          setDraft((d) => ({
                            ...d,
                            memoryBoost: { ...d.memoryBoost, collocations: c },
                          }));
                        }}
                      />
                      <Input
                        placeholder="Danh từ"
                        value={row.noun}
                        onChange={(e) => {
                          const c = [...draft.memoryBoost.collocations];
                          c[idx] = { ...c[idx], noun: e.target.value };
                          setDraft((d) => ({
                            ...d,
                            memoryBoost: { ...d.memoryBoost, collocations: c },
                          }));
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const c = draft.memoryBoost.collocations.filter(
                            (_, i) => i !== idx,
                          );
                          setDraft((d) => ({
                            ...d,
                            memoryBoost: { ...d.memoryBoost, collocations: c },
                          }));
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        memoryBoost: {
                          ...d.memoryBoost,
                          collocations: [
                            ...d.memoryBoost.collocations,
                            defaultCollocation(),
                          ],
                        },
                      }))
                    }
                  >
                    + Thêm cố định
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="practice">
                <AccordionTrigger>Câu hỏi ({draft.practice.length})</AccordionTrigger>
                <AccordionContent className="space-y-4 px-1">
                  {draft.practice.map((q, idx) => (
                    <div
                      key={q.id}
                      className="border rounded-md p-3 space-y-2 bg-muted/20"
                    >
                      <div className="flex flex-wrap gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Loại</Label>
                          <select
                            className={selectClass + " min-w-[140px]"}
                            value={q.type}
                            onChange={(e) => {
                              const p = [...draft.practice];
                              p[idx] = {
                                ...p[idx],
                                type: e.target.value as Question["type"],
                              };
                              setDraft((d) => ({ ...d, practice: p }));
                            }}
                          >
                            {QUESTION_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => {
                            const p = draft.practice.filter((_, i) => i !== idx);
                            setDraft((d) => ({ ...d, practice: p }));
                          }}
                        >
                          Xóa câu
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Đề bài</Label>
                        <Textarea
                          rows={2}
                          value={q.prompt}
                          onChange={(e) => {
                            const p = [...draft.practice];
                            p[idx] = { ...p[idx], prompt: e.target.value };
                            setDraft((d) => ({ ...d, practice: p }));
                          }}
                        />
                      </div>
                      {(q.type === "MCQ" || q.type === "Scenario") && (
                        <div className="space-y-1">
                          <Label className="text-xs">Lựa chọn (mỗi dòng một)</Label>
                          <Textarea
                            rows={3}
                            value={(q.options ?? []).join("\n")}
                            onChange={(e) => {
                              const opts = e.target.value
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              const p = [...draft.practice];
                              p[idx] = { ...p[idx], options: opts };
                              setDraft((d) => ({ ...d, practice: p }));
                            }}
                          />
                        </div>
                      )}
                      {q.type === "Matching" && (
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Cặp (mỗi dòng: trái | phải)
                          </Label>
                          <Textarea
                            rows={3}
                            value={(q.pairs ?? [])
                              .map((pair) => `${pair.left} | ${pair.right}`)
                              .join("\n")}
                            onChange={(e) => {
                              const lines = e.target.value.split("\n");
                              const pairs = lines
                                .map((line) => {
                                  const [l, r] = line.split("|").map((s) => s.trim());
                                  if (!l || !r) return null;
                                  return { left: l, right: r };
                                })
                                .filter(Boolean) as { left: string; right: string }[];
                              const p = [...draft.practice];
                              p[idx] = { ...p[idx], pairs };
                              setDraft((d) => ({ ...d, practice: p }));
                            }}
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Đáp án (chuỗi hoặc JSON)</Label>
                          <Input
                            value={
                              typeof q.answer === "string"
                                ? q.answer
                                : JSON.stringify(q.answer ?? "")
                            }
                            onChange={(e) => {
                              const raw = e.target.value;
                              let answer: string | string[] = raw;
                              if (raw.trim().startsWith("[")) {
                                try {
                                  answer = JSON.parse(raw) as string[];
                                } catch {
                                  answer = raw;
                                }
                              }
                              const p = [...draft.practice];
                              p[idx] = { ...p[idx], answer };
                              setDraft((d) => ({ ...d, practice: p }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Giải thích</Label>
                          <Input
                            value={q.explanation ?? ""}
                            onChange={(e) => {
                              const p = [...draft.practice];
                              p[idx] = { ...p[idx], explanation: e.target.value };
                              setDraft((d) => ({ ...d, practice: p }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        practice: [
                          ...d.practice,
                          defaultQuestion(d.id || 1),
                        ],
                      }))
                    }
                  >
                    + Thêm câu hỏi
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="button" onClick={() => void persist()} disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
