import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { DailyTask, FlaggedItem, Unit, UserProgress } from "@/types";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MainLayout } from "@/components/layout/MainLayout";
import { HomeView } from "@/components/views/HomeView";
import { LessonView } from "@/components/views/LessonView";
import { AdminView } from "@/components/views/AdminView";
import { TrainingGround } from "@/components/practice/TrainingGround";
import { FlashcardReview } from "@/components/practice/FlashcardReview";
import type { FlashcardSessionSummary } from "@/components/practice/FlashcardReview";
import { FlashcardSessionResults } from "@/components/practice/FlashcardSessionResults";
import { QuickTest } from "@/components/practice/QuickTest";
import { GeneralKnowledgeTest } from "@/components/practice/GeneralKnowledgeTest";
import { getFlashcardStatusStorageKey } from "@/components/practice/flashcardStorage";
import { initialLessons } from "@/data/lesson/lessons";

const LessonViewPage = ({
  lessons,
  flaggedItems,
  updateDailyTask,
  setFlaggedItems,
  onBack,
}: {
  lessons: Unit[];
  flaggedItems: FlaggedItem[];
  updateDailyTask: (id: string, inc: number) => void;
  setFlaggedItems: (items: FlaggedItem[]) => void;
  onBack: () => void;
}) => {
  const { unitId } = useParams();
  const unit = lessons.find((l) => l.id === Number(unitId));
  if (!unit) return null;

  return (
    <LessonView
      unit={unit}
      onBack={onBack}
      flaggedItems={flaggedItems}
      onPhraseAction={() => updateDailyTask("speak", 1)}
      toggleFlag={(item) => {
        const exists = flaggedItems.find(
          (f) =>
            f.unitId === item.unitId &&
            f.type === item.type &&
            f.key === item.key,
        );
        if (exists) {
          setFlaggedItems(
            flaggedItems.filter(
              (f) =>
                !(
                  f.unitId === item.unitId &&
                  f.type === item.type &&
                  f.key === item.key
                ),
            ),
          );
        } else {
          setFlaggedItems([...flaggedItems, item]);
        }
      }}
    />
  );
};

const TrainingGroundPage = ({
  lessons,
  progress,
  setProgress,
  onBack,
  onComplete,
}: {
  lessons: Unit[];
  progress: UserProgress;
  setProgress: (p: UserProgress) => void;
  onBack: (u: Unit) => void;
  onComplete: () => void;
}) => {
  const { unitId } = useParams();
  const unit = lessons.find((l) => l.id === Number(unitId));
  if (!unit) return null;

  return (
    <TrainingGround
      unit={unit}
      onBack={() => onBack(unit)}
      onComplete={() => {
        const newProgress = {
          ...progress,
          completedUnits: Array.from(
            new Set([...progress.completedUnits, unit.id]),
          ),
        };
        setProgress(newProgress);
        onComplete();
      }}
    />
  );
};

const FlashcardReviewPage = ({
  lessons,
  flashcardRound,
  onBack,
  onComplete,
}: {
  lessons: Unit[];
  flashcardRound: number;
  onBack: (u: Unit) => void;
  onComplete: (s: FlashcardSessionSummary) => void;
}) => {
  const { unitId } = useParams();
  const location = useLocation();
  const initialMode = location.state?.initialMode;
  const unit = lessons.find((l) => l.id === Number(unitId));
  if (!unit) return null;

  return (
    <FlashcardReview
      key={`${unit.id}-${flashcardRound}-${initialMode}`}
      unit={unit}
      onBack={() => onBack(unit)}
      onComplete={onComplete}
      initialMode={initialMode}
    />
  );
};

const FlashcardResultsPage = ({
  lessons,
  flashcardSummary,
  onBack,
  onRetry,
  onContinue,
}: {
  lessons: Unit[];
  flashcardSummary: FlashcardSessionSummary | null;
  onBack: (u: Unit) => void;
  onRetry: (u: Unit) => void;
  onContinue: (u: Unit) => void;
}) => {
  const { unitId } = useParams();
  const unit = lessons.find((l) => l.id === Number(unitId));
  if (!unit || !flashcardSummary) return null;

  return (
    <FlashcardSessionResults
      summary={flashcardSummary}
      onBackToLesson={() => onBack(unit)}
      onRetry={() => onRetry(unit)}
      onContinue={() => onContinue(unit)}
    />
  );
};

const GeneralTestPage = ({
  lessons,
  onBack,
  onComplete,
}: {
  lessons: Unit[];
  onBack: (u?: Unit) => void;
  onComplete: () => void;
}) => {
  const { unitId } = useParams();
  const unit = lessons.find((l) => l.id === Number(unitId));
  return (
    <GeneralKnowledgeTest
      lessons={unit ? [unit] : lessons}
      mode={unit ? "unit" : "all"}
      onBack={() => onBack(unit)}
      onComplete={onComplete}
    />
  );
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [lessons, setLessons] = useState<Unit[]>(() => {
    const savedLessons = localStorage.getItem("police_english_lessons");
    return savedLessons ? JSON.parse(savedLessons) : initialLessons;
  });
  const [progress, setProgress] = useState<UserProgress>(() => {
    const savedProgress = localStorage.getItem("police_english_progress");
    return savedProgress
      ? JSON.parse(savedProgress)
      : { completedUnits: [], scores: {} };
  });
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>(() => {
    const saved = localStorage.getItem("police_english_flagged");
    return saved ? JSON.parse(saved) : [];
  });

  const [flashcardRound, setFlashcardRound] = useState(1);
  const [flashcardSummary, setFlashcardSummary] =
    useState<FlashcardSessionSummary | null>(null);

  // Daily Tasks state
  const [dailyTasks, setDailyTasks] = useState<DailyTask>(() => {
    const getTodayKey = () => new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("police_english_daily");

    const defaultTasks = [
      {
        id: "vocab",
        label: "Ôn 5 từ vựng ngẫu nhiên",
        description:
          "Vào phần Flashcard của bất kỳ bài nào và đánh dấu 'Đã thuộc' ít nhất 5 từ.",
        navigatePath: "/flashcards/1",
        completed: false,
        current: 0,
        target: 5,
      },
      {
        id: "test",
        label: "Hoàn thành 1 bài test nhanh",
        description: "Làm 1 bài kiểm tra tổng hợp để củng cố kiến thức đã học.",
        navigatePath: "/quicktest",
        completed: false,
        current: 0,
        target: 1,
      },
      {
        id: "speak",
        label: "Luyện nói 3 câu mẫu",
        description:
          "Bấm vào biểu tượng loa để nghe và luyện phát âm ít nhất 3 mẫu câu.",
        navigatePath: "/lesson/1",
        completed: false,
        current: 0,
        target: 3,
      },
    ];

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DailyTask;
        if (parsed.date === getTodayKey()) {
          const enrichedTasks = parsed.tasks.map((task) => {
            const def = defaultTasks.find((d) => d.id === task.id);
            return {
              ...task,
              description: task.description || def?.description,
              navigatePath: task.navigatePath || def?.navigatePath,
            };
          });
          return { ...parsed, tasks: enrichedTasks };
        }
      } catch (e) {
        console.error("Failed to parse daily tasks", e);
      }
    }
    return {
      date: getTodayKey(),
      tasks: defaultTasks,
    };
  });

  // Persist
  useEffect(() => {
    localStorage.setItem("police_english_progress", JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem("police_english_lessons", JSON.stringify(lessons));
  }, [lessons]);
  useEffect(() => {
    localStorage.setItem(
      "police_english_flagged",
      JSON.stringify(flaggedItems),
    );
  }, [flaggedItems]);
  useEffect(() => {
    localStorage.setItem("police_english_daily", JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const updateDailyTask = useCallback(
    (taskId: string, increment: number = 1) => {
      setDailyTasks((prev) => {
        const newTasks = prev.tasks.map((t) => {
          if (t.id === taskId) {
            const newCurrent = Math.min(t.target, t.current + increment);
            return {
              ...t,
              current: newCurrent,
              completed: newCurrent >= t.target,
            };
          }
          return t;
        });
        return { ...prev, tasks: newTasks };
      });
    },
    [],
  );
  // Auto scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const navigateToHome = () => {
    navigate("/");
  };
  const navigateToLesson = (unit: Unit) => {
    navigate(`/lesson/${unit.id}`);
  };

  const activeUnitId = useMemo(() => {
    const path = location.pathname;
    const match = path.match(
      /\/(lesson|practice|flashcards|generaltest)\/(\d+)/,
    );
    return match ? Number(match[2]) : undefined;
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <AppSidebar
        lessons={lessons}
        flaggedItems={flaggedItems}
        onNavigateToUnit={navigateToLesson}
        onRemoveItem={(item) => {
          setFlaggedItems(
            flaggedItems.filter(
              (f) =>
                !(
                  f.unitId === item.unitId &&
                  f.type === item.type &&
                  f.key === item.key
                ),
            ),
          );
        }}
      />
      <MainLayout selectedUnitId={activeUnitId} onLogoClick={navigateToHome}>
        <Routes location={location}>
          <Route
            path="/"
            element={
              <HomeView
                lessons={lessons}
                progress={progress}
                flaggedItems={flaggedItems}
                dailyTasks={dailyTasks}
                onSelectUnit={navigateToLesson}
                onNavigate={(path) =>
                  navigate(path.startsWith("#") ? path.slice(1) : path)
                }
              />
            }
          />
          <Route
            path="/lesson/:unitId"
            element={
              <LessonViewPage
                lessons={lessons}
                flaggedItems={flaggedItems}
                setFlaggedItems={setFlaggedItems}
                updateDailyTask={updateDailyTask}
                onBack={navigateToHome}
              />
            }
          />
          <Route
            path="/practice/:unitId"
            element={
              <TrainingGroundPage
                lessons={lessons}
                progress={progress}
                setProgress={setProgress}
                onBack={navigateToLesson}
                onComplete={navigateToHome}
              />
            }
          />
          <Route
            path="/flashcards/:unitId"
            element={
              <FlashcardReviewPage
                lessons={lessons}
                flashcardRound={flashcardRound}
                onBack={navigateToLesson}
                onComplete={(summary) => {
                  setFlashcardSummary(summary);
                  const { unitId } = parseHashForFlashcardWorkaround(
                    location.pathname,
                  );
                  navigate(`/flashcards/${unitId}/results`);
                  updateDailyTask("vocab", summary.knownCount);
                }}
              />
            }
          />
          <Route
            path="/flashcards/:unitId/results"
            element={
              <FlashcardResultsPage
                lessons={lessons}
                flashcardSummary={flashcardSummary}
                onBack={navigateToLesson}
                onRetry={(unit) => {
                  localStorage.removeItem(
                    getFlashcardStatusStorageKey(
                      unit.id,
                      flashcardSummary!.deckMode,
                    ),
                  );
                  setFlashcardRound((prev) => prev + 1);
                  navigate(`/flashcards/${unit.id}`);
                }}
                onContinue={(unit) => {
                  const nextMode =
                    flashcardSummary?.deckMode === "vocabulary"
                      ? "sentencePatterns"
                      : "vocabulary";
                  navigate(`/flashcards/${unit.id}`, {
                    state: { initialMode: nextMode },
                  });
                }}
              />
            }
          />
          <Route
            path="/quicktest"
            element={
              <QuickTest
                lessons={lessons}
                completedUnitIds={progress.completedUnits}
                onBack={navigateToHome}
                onComplete={() => updateDailyTask("test", 1)}
              />
            }
          />
          <Route
            path="/generaltest"
            element={
              <GeneralTestPage
                lessons={lessons}
                onBack={navigateToHome}
                onComplete={() => updateDailyTask("test", 1)}
              />
            }
          />
          <Route
            path="/generaltest/:unitId"
            element={
              <GeneralTestPage
                lessons={lessons}
                onBack={(u) => (u ? navigateToLesson(u) : navigateToHome())}
                onComplete={() => updateDailyTask("test", 1)}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminView
                lessons={lessons}
                onBack={navigateToHome}
                onSave={(newLessons) => setLessons(newLessons)}
              />
            }
          />
        </Routes>
      </MainLayout>
    </SidebarProvider>
  );
}

function parseHashForFlashcardWorkaround(path: string) {
  const parts = path.split("/");
  return { unitId: parts[2] };
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
