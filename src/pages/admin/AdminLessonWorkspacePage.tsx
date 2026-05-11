import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  BookMarked,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Layers,
  LayoutDashboard,
  Loader2,
  PencilLine,
  Save,
  HelpCircle,
  BookOpenCheck,
} from "lucide-react";
import {
  LessonEditorForm,
  emptyUnit,
  type LessonEditorScope,
} from "@/pages/admin/AdminLessonsPage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  GrammarStructure,
  LessonTestLane,
  PhraseTemplate,
  Question,
  Unit,
} from "@/types";
import { lessonService } from "@/services/lesson.service";
import { useSonner } from "@/hooks/use-sonner";
import { cn } from "@/lib/utils";
import {
  SECTION_META,
  resolvedLane,
} from "@/components/practice/utils/testUtils";

const LANES: LessonTestLane[] = [
  "VOCAB_MCQ",
  "MATCHING",
  "PHRASE_SCENARIO",
  "FILL_ARRANGE",
];

type ViewKey = "overview" | LessonEditorScope;

const VIEW_LIST: {
  key: Exclude<ViewKey, "overview" | "full">;
  label: string;
  Icon: typeof BookMarked;
}[] = [
  { key: "meta", label: "Thông tin chương", Icon: HelpCircle },
  { key: "vocabulary", label: "Từ vựng", Icon: BookMarked },
  { key: "phrases", label: "Mẫu câu", Icon: Layers },
  { key: "practice", label: "Bài kiểm tra", Icon: BookOpenCheck },
];

export default function AdminLessonWorkspacePage({
  onLessonsUpdated,
}: {
  onLessonsUpdated: () => Promise<void>;
}) {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notifyError, notifySuccess } = useSonner();
  const id = Number(unitId);

  const viewParam = searchParams.get("view") ?? "overview";
  const activeView: ViewKey =
    viewParam === "overview" ||
    viewParam === "meta" ||
    viewParam === "vocabulary" ||
    viewParam === "phrases" ||
    viewParam === "practice"
      ? (viewParam as ViewKey)
      : "overview";

  const setView = (v: ViewKey) => {
    if (v === "overview") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ view: v }, { replace: true });
    }
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Unit>(() => emptyUnit(1));
  const [phraseTemplates, setPhraseTemplates] = useState<PhraseTemplate[]>([]);
  const [grammarStructures, setGrammarStructures] = useState<GrammarStructure[]>(
    [],
  );

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id < 1) {
      notifyError("Chương không hợp lệ", "");
      navigate("/admin/lessons", { replace: true });
      return;
    }
    setLoading(true);
    try {
      const [full, templates, structures] = await Promise.all([
        lessonService.getLessonForAdmin(id),
        lessonService.listPhraseTemplates(id),
        lessonService.listGrammarStructures(id),
      ]);
      setDraft(full);
      setPhraseTemplates(templates);
      setGrammarStructures(structures);
    } catch (e) {
      console.error(e);
      notifyError("Không tải được chương", String((e as Error).message ?? e));
      navigate("/admin/lessons", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, notifyError]);

  useEffect(() => {
    void load();
  }, [load]);

  const practiceByLane = useMemo(() => {
    const map: Record<LessonTestLane, Question[]> = {
      VOCAB_MCQ: [],
      MATCHING: [],
      PHRASE_SCENARIO: [],
      FILL_ARRANGE: [],
    };
    for (const q of draft.practice) {
      map[resolvedLane(q as Question)].push(q as Question);
    }
    return map;
  }, [draft.practice]);

  const persist = async () => {
    setSaving(true);
    try {
      await lessonService.updateLesson(draft.id, draft);
      notifySuccess("Đã lưu chương", `Chương ${draft.id}`);
      await load();
      await onLessonsUpdated();
    } catch (e) {
      console.error(e);
      notifyError("Lưu thất bại", String((e as Error).message ?? e));
    } finally {
      setSaving(false);
    }
  };

  const editorScope: LessonEditorScope | null =
    activeView === "overview" ? null : (activeView as LessonEditorScope);

  if (loading) {
    return (
      <AdminPageLayout title="Đang tải…" description="">
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Không gian soạn chương"
      description="Chọn mục bên dưới để soạn từng phần; chỉ có một nút Lưu trên header."
      actions={null}
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link
                to="/admin/lessons"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Danh sách chương
              </Link>
              <ChevronRight className="h-4 w-4 opacity-50" />
              <span className="font-mono text-primary font-semibold">
                Chương {draft.id}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              {draft.title || `Chương ${draft.id}`}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-3xl leading-relaxed">
              {draft.description || "Chưa có mô tả."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a
                href={`/lesson/${draft.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Xem như học viên
              </a>
            </Button>
            <Button
              size="sm"
              className="gap-2"
              disabled={saving}
              onClick={() => void persist()}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu chương
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-border/80 bg-card p-2">
          <button
            type="button"
            onClick={() => setView("overview")}
            aria-current={activeView === "overview" ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              activeView === "overview"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Tổng quan
          </button>
          {VIEW_LIST.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-current={activeView === key ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                activeView === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {activeView === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
              <button
                type="button"
                onClick={() => setView("vocabulary")}
                className="rounded-lg text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="police-shadow border-border/80 h-full hover:border-primary/40">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                      <BookMarked className="h-4 w-4 text-primary" />
                      Từ vựng
                    </CardDescription>
                    <CardTitle className="text-4xl tabular-nums">
                      {draft.vocabulary.length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-primary font-semibold">Soạn →</span>{" "}
                    chỉnh sửa danh sách từ trong chương.
                  </CardContent>
                </Card>
              </button>
              <button
                type="button"
                onClick={() => setView("phrases")}
                className="rounded-lg text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="police-shadow border-border/80 h-full hover:border-primary/40">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                      <Layers className="h-4 w-4 text-primary" />
                      Mẫu câu
                    </CardDescription>
                    <CardTitle className="text-4xl tabular-nums">
                      {draft.phrases.length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-primary font-semibold">Soạn →</span>{" "}
                    câu mẫu và bản dịch.
                  </CardContent>
                </Card>
              </button>
              <button
                type="button"
                onClick={() => setView("practice")}
                className="rounded-lg text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="police-shadow border-border/80 h-full hover:border-primary/40">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                      <PencilLine className="h-4 w-4 text-primary" />
                      Bài kiểm tra (DB)
                    </CardDescription>
                    <CardTitle className="text-4xl tabular-nums">
                      {draft.practice.length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-primary font-semibold">Soạn →</span>{" "}
                    câu luyện theo từng dạng.
                  </CardContent>
                </Card>
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Phân bổ theo dạng luyện tập (UI học viên)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LANES.map((lane) => {
                  const meta = SECTION_META[lane];
                  const items = practiceByLane[lane];
                  return (
                    <Card
                      key={lane}
                      className="border-border/90 overflow-hidden police-shadow"
                    >
                      <CardHeader className="bg-muted/40 pb-3">
                        <CardTitle className="text-base flex items-center justify-between gap-2">
                          <span>{meta.title}</span>
                          <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {items.length}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-xs leading-snug">
                          {meta.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-2 max-h-[220px] overflow-y-auto">
                        {items.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            Chưa có câu trong nhóm này.
                          </p>
                        ) : (
                          <ul className="space-y-2 text-sm">
                            {items.map((q) => (
                              <li
                                key={q.id}
                                className="rounded-md border border-border/60 bg-background px-3 py-2"
                              >
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                  {q.type}
                                  {q.testLane ? ` · ${q.testLane}` : ""}
                                </span>
                                <p className="mt-1 line-clamp-2 text-foreground/90">
                                  {q.prompt || "(Không có đề)"}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setView("meta")}>
                Thông tin chương
              </Button>
              <Button type="button" onClick={() => setView("vocabulary")}>
                Bắt đầu soạn từ vựng
              </Button>
            </div>
          </div>
        )}

        {editorScope != null && editorScope !== "full" && (
          <div className="animate-in fade-in duration-200 overflow-hidden rounded-xl border border-border bg-card police-shadow">
            <div className="max-h-[min(85vh,1200px)] overflow-y-auto overscroll-contain p-5 md:p-7">
              <LessonEditorForm
                mode="edit"
                draft={draft}
                setDraft={setDraft}
                phraseTemplates={phraseTemplates}
                setPhraseTemplates={setPhraseTemplates}
                grammarStructures={grammarStructures}
                setGrammarStructures={setGrammarStructures}
                idPrefix={`workspace-${draft.id}`}
                saving={saving}
                onCancel={() => navigate("/admin/lessons")}
                onSave={() => void persist()}
                scope={editorScope}
              />
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
