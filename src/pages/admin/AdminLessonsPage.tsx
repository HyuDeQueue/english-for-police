import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  Collocation,
  GrammarStructure,
  LessonTestLane,
  Phrase,
  PhraseTemplate,
  Question,
  Unit,
  Vocabulary,
} from "@/types";
import { lessonService } from "@/services/lesson.service";
import { useSonner } from "@/hooks/use-sonner";
import { cn } from "@/lib/utils";
import {
  SECTION_META,
  resolvedLane,
} from "@/components/practice/utils/testUtils";

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

export function emptyUnit(suggestedId: number): Unit {
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
    circumstance: "",
    scenarioDescription: "",
    vnPrompt: "",
    bestAnswer: "",
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

const selectClass =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const TEST_LANE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Chưa phân loại (tự suy)" },
  { value: "VOCAB_MCQ", label: "Trắc nghiệm từ vựng" },
  { value: "MATCHING", label: "Ghép từ – nghĩa" },
  { value: "PHRASE_SCENARIO", label: "Mẫu câu & tình huống" },
  { value: "FILL_ARRANGE", label: "Điền từ & sắp xếp câu" },
];

const LANES_ORDER: LessonTestLane[] = [
  "VOCAB_MCQ",
  "MATCHING",
  "PHRASE_SCENARIO",
  "FILL_ARRANGE",
];

export type LessonEditorScope =
  | "full"
  | "meta"
  | "vocabulary"
  | "phrases"
  | "practice";

function defaultQuestionForLane(unitId: number, lane: LessonTestLane): Question {
  const q = defaultQuestion(unitId);
  q.testLane = lane;
  switch (lane) {
    case "VOCAB_MCQ":
      q.type = "MCQ";
      break;
    case "MATCHING":
      q.type = "Matching";
      break;
    case "PHRASE_SCENARIO":
      q.type = "Scenario";
      break;
    case "FILL_ARRANGE":
      q.type = "Dictation";
      break;
    default:
      break;
  }
  return q;
}

type EditorMode = "create" | "edit";

export function LessonEditorForm({
  mode,
  draft,
  setDraft,
  idPrefix,
  saving,
  onCancel,
  onSave,
  phraseTemplates,
  setPhraseTemplates,
  grammarStructures,
  setGrammarStructures,
  scope = "full",
}: {
  mode: EditorMode;
  draft: Unit;
  setDraft: React.Dispatch<React.SetStateAction<Unit>>;
  idPrefix: string;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  phraseTemplates: PhraseTemplate[];
  setPhraseTemplates: React.Dispatch<React.SetStateAction<PhraseTemplate[]>>;
  grammarStructures: GrammarStructure[];
  setGrammarStructures: React.Dispatch<React.SetStateAction<GrammarStructure[]>>;
  /** Không gian soạn chương: tách trang; `full` = form đầy đủ (thêm chương). */
  scope?: LessonEditorScope;
}) {
  const { notifyError, notifySuccess } = useSonner();
  const [newPhrase, setNewPhrase] = useState({
    patternEn: "",
    patternVi: "",
    contextNote: "",
    audioUrl: "",
  });
  const [newStructure, setNewStructure] = useState({
    title: "",
    summary: "",
    exampleEn: "",
    exampleVi: "",
  });

  useEffect(() => {
    setNewPhrase({ patternEn: "", patternVi: "", contextNote: "", audioUrl: "" });
    setNewStructure({ title: "", summary: "", exampleEn: "", exampleVi: "" });
  }, [draft.id]);

  const eff = scope;
  const showMeta = eff === "full" || eff === "meta";
  const showVocab = eff === "full" || eff === "vocabulary";
  const showPhrases = eff === "full" || eff === "phrases";
  const showPractice = eff === "full" || eff === "practice";
  const showMemoryTemplatesGrammar = eff === "full";
  const isScopedEditor = eff !== "full";
  const lockedOpenSections = useMemo(() => {
    if (!isScopedEditor) return undefined;
    const sections: string[] = [];
    if (showVocab) sections.push("vocab");
    if (showPhrases) sections.push("phrases");
    if (showPractice) sections.push("practice");
    return sections;
  }, [isScopedEditor, showPhrases, showPractice, showVocab]);

  const scopedTitle =
    eff === "meta"
      ? "Thông tin chương"
      : eff === "vocabulary"
        ? "Từ vựng"
        : eff === "phrases"
          ? "Mẫu câu"
          : eff === "practice"
            ? "Bài kiểm tra & câu hỏi luyện tập"
            : null;

  const practiceIndicesByLane = useMemo(() => {
    const m: Record<LessonTestLane, number[]> = {
      VOCAB_MCQ: [],
      MATCHING: [],
      PHRASE_SCENARIO: [],
      FILL_ARRANGE: [],
    };
    draft.practice.forEach((q, i) => {
      m[resolvedLane(q)].push(i);
    });
    return m;
  }, [draft.practice]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h3 className="text-lg font-bold text-primary tracking-tight">
          {scopedTitle ??
            (mode === "create" ? "Thêm chương mới" : `Sửa chương ${draft.id}`)}
        </h3>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
            Hủy
          </Button>
          <Button type="button" size="sm" onClick={() => void onSave()} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang lưu…
              </>
            ) : (
              "Lưu"
            )}
          </Button>
        </div>
      </div>

      {showMeta ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-unit-id`}>Mã chương (số)</Label>
              <Input
                id={`${idPrefix}-unit-id`}
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
              <Label htmlFor={`${idPrefix}-video`}>Video URL</Label>
              <Input
                id={`${idPrefix}-video`}
                value={draft.videoUrl ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, videoUrl: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-title`}>Tiêu đề</Label>
            <Input
              id={`${idPrefix}-title`}
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-desc`}>Mô tả</Label>
            <Textarea
              id={`${idPrefix}-desc`}
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>
        </div>
      ) : null}

      {(showVocab ||
        showPhrases ||
        showMemoryTemplatesGrammar ||
        showPractice) ? (
      <Accordion
        type="multiple"
        value={lockedOpenSections}
        className="w-full rounded-xl border border-border/80 bg-background px-2 md:px-3"
      >
        {showVocab ? (
        <AccordionItem value="vocab" className="border-b border-border/80 px-1">
          <AccordionTrigger
            className={cn(
              "py-4 text-base font-semibold hover:no-underline",
              isScopedEditor && "pointer-events-none cursor-default [&>svg]:hidden",
            )}
          >
            Từ vựng ({draft.vocabulary.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1 pb-5 pt-1">
            {draft.vocabulary.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 border-b border-border/50 pb-3 last:border-0"
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
        ) : null}

        {showPhrases ? (
        <AccordionItem value="phrases" className="border-b border-border/80 px-1">
          <AccordionTrigger
            className={cn(
              "py-4 text-base font-semibold hover:no-underline",
              isScopedEditor && "pointer-events-none cursor-default [&>svg]:hidden",
            )}
          >
            Mẫu câu ({draft.phrases.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1 pb-5 pt-1">
            {draft.phrases.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-border/50 pb-3 last:border-0"
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
        ) : null}

        {showMemoryTemplatesGrammar ? (
        <>
        <AccordionItem value="memory" className="border-b border-border/80 px-1">
          <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
            Cố định (memory boost)
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1 pb-5 pt-1">
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
              <div key={idx} className="flex gap-2 flex-wrap">
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

        <AccordionItem value="phrase-templates" className="px-1">
          <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
            Mẫu câu (template) ({phraseTemplates.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1 pb-5 pt-1 text-sm">
            <p className="text-muted-foreground text-xs">
              Lớp soạn riêng với mục &quot;Mẫu câu&quot; trong bài học; dùng cho tài liệu / ngân hàng mở rộng sau này.
            </p>
            {mode === "create" ? (
              <p className="text-muted-foreground">
                Lưu chương mới trước, rồi mở &quot;Sửa&quot; để thêm mẫu câu qua API.
              </p>
            ) : (
              <>
                {phraseTemplates.map((row) => (
                  <div
                    key={row.id}
                    className="border border-border rounded-lg p-3 space-y-2 bg-muted/20"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">patternEn</Label>
                        <Textarea
                          rows={2}
                          value={row.patternEn}
                          onChange={(e) => {
                            const v = e.target.value;
                            setPhraseTemplates((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, patternEn: v } : r,
                              ),
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">patternVi</Label>
                        <Textarea
                          rows={2}
                          value={row.patternVi}
                          onChange={(e) => {
                            const v = e.target.value;
                            setPhraseTemplates((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, patternVi: v } : r,
                              ),
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder="contextNote"
                        value={row.contextNote ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPhraseTemplates((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, contextNote: v } : r,
                            ),
                          );
                        }}
                      />
                      <Input
                        placeholder="audioUrl"
                        value={row.audioUrl ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPhraseTemplates((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, audioUrl: v } : r,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          void (async () => {
                            try {
                              await lessonService.updatePhraseTemplate(
                                draft.id,
                                row.id,
                                {
                                  patternEn: row.patternEn.trim(),
                                  patternVi: row.patternVi.trim(),
                                  contextNote: row.contextNote?.trim() || null,
                                  audioUrl: row.audioUrl?.trim() || null,
                                  sortOrder: row.sortOrder,
                                },
                              );
                              notifySuccess("Đã lưu mẫu câu", `#${row.id}`);
                            } catch (e) {
                              notifyError(
                                "Không lưu được mẫu câu",
                                String((e as Error).message ?? e),
                              );
                            }
                          })();
                        }}
                      >
                        Lưu dòng
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          void (async () => {
                            try {
                              await lessonService.deletePhraseTemplate(
                                draft.id,
                                row.id,
                              );
                              setPhraseTemplates((prev) =>
                                prev.filter((r) => r.id !== row.id),
                              );
                              notifySuccess("Đã xóa mẫu câu", `#${row.id}`);
                            } catch (e) {
                              notifyError(
                                "Không xóa được",
                                String((e as Error).message ?? e),
                              );
                            }
                          })();
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border border-dashed rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Thêm mẫu câu mới
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Textarea
                      rows={2}
                      placeholder="patternEn"
                      value={newPhrase.patternEn}
                      onChange={(e) =>
                        setNewPhrase((n) => ({ ...n, patternEn: e.target.value }))
                      }
                    />
                    <Textarea
                      rows={2}
                      placeholder="patternVi"
                      value={newPhrase.patternVi}
                      onChange={(e) =>
                        setNewPhrase((n) => ({ ...n, patternVi: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      placeholder="contextNote"
                      value={newPhrase.contextNote}
                      onChange={(e) =>
                        setNewPhrase((n) => ({ ...n, contextNote: e.target.value }))
                      }
                    />
                    <Input
                      placeholder="audioUrl"
                      value={newPhrase.audioUrl}
                      onChange={(e) =>
                        setNewPhrase((n) => ({ ...n, audioUrl: e.target.value }))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => {
                      void (async () => {
                        if (
                          !newPhrase.patternEn.trim() ||
                          !newPhrase.patternVi.trim()
                        ) {
                          notifyError("Thiếu nội dung", "Nhập patternEn và patternVi.");
                          return;
                        }
                        try {
                          const created = await lessonService.createPhraseTemplate(
                            draft.id,
                            {
                              patternEn: newPhrase.patternEn.trim(),
                              patternVi: newPhrase.patternVi.trim(),
                              contextNote: newPhrase.contextNote.trim() || null,
                              audioUrl: newPhrase.audioUrl.trim() || null,
                              sortOrder: phraseTemplates.length + 1,
                            },
                          );
                          setPhraseTemplates((prev) => [...prev, created]);
                          setNewPhrase({
                            patternEn: "",
                            patternVi: "",
                            contextNote: "",
                            audioUrl: "",
                          });
                          notifySuccess("Đã thêm mẫu câu", "");
                        } catch (e) {
                          notifyError(
                            "Không tạo được",
                            String((e as Error).message ?? e),
                          );
                        }
                      })();
                    }}
                  >
                    + Thêm mẫu câu
                  </Button>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="grammar-structures" className="px-1">
          <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
            Cấu trúc ngữ pháp ({grammarStructures.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1 pb-5 pt-1 text-sm">
            {mode === "create" ? (
              <p className="text-muted-foreground">
                Lưu chương mới trước, rồi mở &quot;Sửa&quot; để thêm cấu trúc qua API.
              </p>
            ) : (
              <>
                {grammarStructures.map((row) => (
                  <div
                    key={row.id}
                    className="border border-border rounded-lg p-3 space-y-2 bg-muted/20"
                  >
                    <Input
                      placeholder="title"
                      value={row.title}
                      onChange={(e) => {
                        const v = e.target.value;
                        setGrammarStructures((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? { ...r, title: v } : r,
                          ),
                        );
                      }}
                    />
                    <Textarea
                      rows={2}
                      placeholder="summary"
                      value={row.summary}
                      onChange={(e) => {
                        const v = e.target.value;
                        setGrammarStructures((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? { ...r, summary: v } : r,
                          ),
                        );
                      }}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Textarea
                        rows={2}
                        placeholder="exampleEn"
                        value={row.exampleEn ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setGrammarStructures((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, exampleEn: v } : r,
                            ),
                          );
                        }}
                      />
                      <Textarea
                        rows={2}
                        placeholder="exampleVi"
                        value={row.exampleVi ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setGrammarStructures((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, exampleVi: v } : r,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          void (async () => {
                            try {
                              await lessonService.updateGrammarStructure(
                                draft.id,
                                row.id,
                                {
                                  title: row.title.trim(),
                                  summary: row.summary.trim(),
                                  exampleEn: row.exampleEn?.trim() || null,
                                  exampleVi: row.exampleVi?.trim() || null,
                                  sortOrder: row.sortOrder,
                                },
                              );
                              notifySuccess("Đã lưu cấu trúc", `#${row.id}`);
                            } catch (e) {
                              notifyError(
                                "Không lưu được",
                                String((e as Error).message ?? e),
                              );
                            }
                          })();
                        }}
                      >
                        Lưu dòng
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          void (async () => {
                            try {
                              await lessonService.deleteGrammarStructure(
                                draft.id,
                                row.id,
                              );
                              setGrammarStructures((prev) =>
                                prev.filter((r) => r.id !== row.id),
                              );
                              notifySuccess("Đã xóa cấu trúc", `#${row.id}`);
                            } catch (e) {
                              notifyError(
                                "Không xóa được",
                                String((e as Error).message ?? e),
                              );
                            }
                          })();
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border border-dashed rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Thêm cấu trúc mới
                  </p>
                  <Input
                    placeholder="title"
                    value={newStructure.title}
                    onChange={(e) =>
                      setNewStructure((n) => ({ ...n, title: e.target.value }))
                    }
                  />
                  <Textarea
                    rows={2}
                    placeholder="summary"
                    value={newStructure.summary}
                    onChange={(e) =>
                      setNewStructure((n) => ({ ...n, summary: e.target.value }))
                    }
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Textarea
                      rows={2}
                      placeholder="exampleEn"
                      value={newStructure.exampleEn}
                      onChange={(e) =>
                        setNewStructure((n) => ({
                          ...n,
                          exampleEn: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      rows={2}
                      placeholder="exampleVi"
                      value={newStructure.exampleVi}
                      onChange={(e) =>
                        setNewStructure((n) => ({
                          ...n,
                          exampleVi: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      void (async () => {
                        if (
                          !newStructure.title.trim() ||
                          !newStructure.summary.trim()
                        ) {
                          notifyError("Thiếu nội dung", "Nhập title và summary.");
                          return;
                        }
                        try {
                          const created =
                            await lessonService.createGrammarStructure(draft.id, {
                              title: newStructure.title.trim(),
                              summary: newStructure.summary.trim(),
                              exampleEn: newStructure.exampleEn.trim() || null,
                              exampleVi: newStructure.exampleVi.trim() || null,
                              sortOrder: grammarStructures.length + 1,
                            });
                          setGrammarStructures((prev) => [...prev, created]);
                          setNewStructure({
                            title: "",
                            summary: "",
                            exampleEn: "",
                            exampleVi: "",
                          });
                          notifySuccess("Đã thêm cấu trúc", "");
                        } catch (e) {
                          notifyError(
                            "Không tạo được",
                            String((e as Error).message ?? e),
                          );
                        }
                      })();
                    }}
                  >
                    + Thêm cấu trúc
                  </Button>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
        </>
        ) : null}

        {showPractice ? (
        <AccordionItem value="practice" className="px-1">
          <AccordionTrigger
            className={cn(
              "py-4 text-base font-semibold hover:no-underline",
              isScopedEditor && "pointer-events-none cursor-default [&>svg]:hidden",
            )}
          >
            Bài kiểm tra & câu hỏi luyện tập ({draft.practice.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-6 px-1 pb-5 pt-1">
            {LANES_ORDER.map((lane) => {
              const laneIndices = practiceIndicesByLane[lane];
              const meta = SECTION_META[lane];
              return (
                <div
                  key={lane}
                  className="rounded-xl border border-border bg-muted/20 p-4 space-y-4"
                >
                  <div className="space-y-1 border-b border-border/60 pb-3">
                    <p className="text-sm font-bold text-primary">{meta.title}</p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {meta.description}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {laneIndices.length} câu · lane{" "}
                      <span className="text-foreground">{lane}</span>
                    </p>
                  </div>
                  <div className="space-y-4">
                    {laneIndices.map((idx) => {
                      const q = draft.practice[idx];
                      return (
              <div
                key={q.id}
                className="border border-border rounded-lg p-3 space-y-2 bg-muted/30"
              >
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Loại</Label>
                    <select
                      className={cn(selectClass, "min-w-[140px]")}
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
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Làn kiểm tra (UI luyện tập)
                    </Label>
                    <select
                      className={cn(selectClass, "min-w-[220px]")}
                      value={q.testLane ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        const p = [...draft.practice];
                        p[idx] = {
                          ...p[idx],
                          testLane:
                            v === ""
                              ? undefined
                              : (v as LessonTestLane),
                        };
                        setDraft((d) => ({ ...d, practice: p }));
                      }}
                    >
                      {TEST_LANE_OPTIONS.map((opt) => (
                        <option key={opt.value || "unset"} value={opt.value}>
                          {opt.label}
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
                  <Label className="text-xs text-muted-foreground">Đề bài</Label>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Ngữ cảnh (circumstance)
                    </Label>
                    <Textarea
                      rows={2}
                      value={q.circumstance ?? ""}
                      onChange={(e) => {
                        const p = [...draft.practice];
                        p[idx] = { ...p[idx], circumstance: e.target.value };
                        setDraft((d) => ({ ...d, practice: p }));
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Gợi ý tiếng Việt (vnPrompt)
                    </Label>
                    <Textarea
                      rows={2}
                      value={q.vnPrompt ?? ""}
                      onChange={(e) => {
                        const p = [...draft.practice];
                        p[idx] = { ...p[idx], vnPrompt: e.target.value };
                        setDraft((d) => ({ ...d, practice: p }));
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Mô tả tình huống (Scenario / Speaking)
                  </Label>
                  <Textarea
                    rows={2}
                    value={q.scenarioDescription ?? ""}
                    onChange={(e) => {
                      const p = [...draft.practice];
                      p[idx] = { ...p[idx], scenarioDescription: e.target.value };
                      setDraft((d) => ({ ...d, practice: p }));
                    }}
                  />
                </div>
                {(q.type === "MCQ" || q.type === "Scenario") && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Lựa chọn (mỗi dòng một)
                    </Label>
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
                    <Label className="text-xs text-muted-foreground">
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
                    <Label className="text-xs text-muted-foreground">
                      Đáp án (chuỗi hoặc JSON)
                    </Label>
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
                    <Label className="text-xs text-muted-foreground">
                      Đáp án mẫu (bestAnswer)
                    </Label>
                    <Input
                      value={q.bestAnswer ?? ""}
                      onChange={(e) => {
                        const p = [...draft.practice];
                        p[idx] = { ...p[idx], bestAnswer: e.target.value };
                        setDraft((d) => ({ ...d, practice: p }));
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Đáp án chấp nhận được (mỗi dòng một, FillInBlank / Dictation)
                  </Label>
                  <Textarea
                    rows={3}
                    value={(q.acceptableAnswers ?? []).join("\n")}
                    onChange={(e) => {
                      const list = e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const p = [...draft.practice];
                      p[idx] = { ...p[idx], acceptableAnswers: list };
                      setDraft((d) => ({ ...d, practice: p }));
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Giải thích</Label>
                  <Textarea
                    rows={2}
                    value={q.explanation ?? ""}
                    onChange={(e) => {
                      const p = [...draft.practice];
                      p[idx] = { ...p[idx], explanation: e.target.value };
                      setDraft((d) => ({ ...d, practice: p }));
                    }}
                  />
                </div>
              </div>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        practice: [
                          ...d.practice,
                          defaultQuestionForLane(d.id || 1, lane),
                        ],
                      }))
                    }
                  >
                    + Thêm câu — {meta.title}
                  </Button>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
        ) : null}
      </Accordion>
      ) : null}
    </div>
  );
}

interface AdminLessonsPageProps {
  onLessonsUpdated: () => Promise<void>;
}

export default function AdminLessonsPage({
  onLessonsUpdated,
}: AdminLessonsPageProps) {
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useSonner();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  /** null = closed; "create" = add panel above rows */
  const [expanded, setExpanded] = useState<null | "create">(null);
  const [draft, setDraft] = useState<Unit>(emptyUnit(1));
  const [phraseTemplates, setPhraseTemplates] = useState<PhraseTemplate[]>([]);
  const [grammarStructures, setGrammarStructures] = useState<GrammarStructure[]>(
    [],
  );

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

  const closePanel = () => {
    setExpanded(null);
    setPhraseTemplates([]);
    setGrammarStructures([]);
  };

  const toggleCreatePanel = () => {
    if (expanded === "create") {
      closePanel();
      return;
    }
    setExpanded("create");
    setPhraseTemplates([]);
    setGrammarStructures([]);
    setDraft(emptyUnit(suggestedNextId));
  };

  const persist = async () => {
    setSaving(true);
    try {
      if (expanded === "create") {
        await lessonService.createLesson(draft);
        notifySuccess("Đã tạo chương", `Chương ${draft.id}`);
        const newId = draft.id;
        closePanel();
        await loadUnits();
        await onLessonsUpdated();
        navigate(`/admin/lessons/${newId}/workspace`);
        return;
      }
      closePanel();
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

  return (
    <AdminPageLayout
      title="Quản lý bài học"
      description="Thêm chương mới tại đây; soạn thảo chi tiết (từ vựng, mẫu câu, bài kiểm tra) mở trang không gian riêng cho từng chương."
      actions={
        <Button
          onClick={toggleCreatePanel}
          variant={expanded === "create" ? "secondary" : "default"}
          className="gap-2"
        >
          {expanded === "create" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {expanded === "create" ? "Đóng form thêm" : "Thêm chương"}
        </Button>
      }
    >
      <Card className="border-border police-shadow overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Danh sách chương
          </CardTitle>
          <CardDescription>
            {loading ? "Đang tải…" : `${units.length} chương`}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto px-0 sm:px-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                <th className="py-3 pl-4 sm:pl-6 pr-4 font-semibold w-[72px]">Mã</th>
                <th className="py-3 pr-4 font-semibold">Tiêu đề</th>
                <th className="py-3 pr-4 sm:pr-6 font-semibold text-right min-w-[240px]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {expanded === "create" && (
                <tr className="bg-primary/5">
                  <td colSpan={3} className="p-0 align-top">
                    <div className="border-b border-primary/30 bg-gradient-to-b from-primary/10 to-muted/20">
                      <div className="max-h-[min(75vh,900px)] overflow-y-auto overscroll-contain p-4 md:p-6">
                        <LessonEditorForm
                          mode="create"
                          draft={draft}
                          setDraft={setDraft}
                          phraseTemplates={phraseTemplates}
                          setPhraseTemplates={setPhraseTemplates}
                          grammarStructures={grammarStructures}
                          setGrammarStructures={setGrammarStructures}
                          idPrefix="create"
                          saving={saving}
                          onCancel={closePanel}
                          onSave={persist}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {units.map((u) => (
                <Fragment key={u.id}>
                  <tr className="border-b border-border/60 transition-colors">
                    <td className="py-3 pl-4 sm:pl-6 pr-4 font-mono font-semibold text-primary">
                      {u.id}
                    </td>
                    <td className="py-3 pr-4 font-medium">{u.title}</td>
                    <td className="py-3 pr-4 sm:pr-6 text-right whitespace-nowrap space-x-2">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="gap-1"
                        onClick={() =>
                          navigate(`/admin/lessons/${u.id}/workspace`)
                        }
                      >
                        Soạn chương
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
                </Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
