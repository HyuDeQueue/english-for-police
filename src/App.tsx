import { useState, useEffect, useCallback } from "react";
import { initialLessons } from "./data/lessons";
import type { Unit, UserProgress, FlaggedItem, DailyTask } from "@/types";
import "./App.css";

import { MainLayout } from "./components/layout/MainLayout";
import { HomeView } from "./components/views/HomeView";
import { LessonView } from "./components/views/LessonView";
import { AdminView } from "./components/views/AdminView";
import { TrainingGround } from "./components/practice/TrainingGround";
import { SearchSidebar } from "./components/layout/SearchSidebar";
import {
  FlashcardReview,
  type FlashcardSessionSummary,
} from "./components/practice/FlashcardReview";
import { FlashcardSessionResults } from "./components/practice/FlashcardSessionResults";
import { QuickTest } from "./components/practice/QuickTest";
import { GeneralKnowledgeTest } from "./components/practice/GeneralKnowledgeTest";
import { NotebookSidebar } from "./components/layout/NotebookSidebar";
import { getFlashcardStatusStorageKey } from "./components/practice/flashcardStorage";

type ViewType =
  | "home"
  | "lesson"
  | "practice"
  | "flashcards"
  | "flashcardResults"
  | "quicktest"
  | "generaltest"
  | "admin";

function parseHash(): { view: ViewType; unitId?: number } {
  const hash = window.location.hash.replace("#", "");
  if (!hash || hash === "/") return { view: "home" };
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "lesson" && parts[1])
    return { view: "lesson", unitId: Number(parts[1]) };
  if (parts[0] === "practice" && parts[1])
    return { view: "practice", unitId: Number(parts[1]) };
  if (parts[0] === "flashcards" && parts[1])
    return { view: "flashcards", unitId: Number(parts[1]) };
  if (parts[0] === "quicktest") return { view: "quicktest" };
  if (parts[0] === "generaltest" && parts[1])
    return { view: "generaltest", unitId: Number(parts[1]) };
  if (parts[0] === "generaltest") return { view: "generaltest" };
  if (parts[0] === "admin") return { view: "admin" };
  return { view: "home" };
}

function App() {
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

  // Initialize states directly from hash to avoid useEffect sync warnings
  const initialHash = parseHash();

  const [currentView, setCurrentView] = useState<ViewType>(initialHash.view);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(() => {
    if (initialHash.unitId) {
      return lessons.find((l) => l.id === initialHash.unitId) || null;
    }
    return null;
  });
  const [flashcardRound, setFlashcardRound] = useState(1);
  const [flashcardSummary, setFlashcardSummary] =
    useState<FlashcardSessionSummary | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);

  // Sync from hash on mount & popstate
  const syncFromHash = useCallback(() => {
    const { view, unitId } = parseHash();
    setCurrentView(view);
    if (unitId) {
      const unit = lessons.find((l) => l.id === unitId);
      if (unit) setSelectedUnit(unit);
    } else if (view === "home" || view === "generaltest") {
      setSelectedUnit(null);
    }
    // Close sidebars on navigation
    setSearchOpen(false);
    setNotebookOpen(false);
  }, [lessons]);

  useEffect(() => {
    window.addEventListener("popstate", syncFromHash);
    return () => window.removeEventListener("popstate", syncFromHash);
  }, [syncFromHash]);

  const [dailyTasks, setDailyTasks] = useState<DailyTask>(() => {
    const getTodayKey = () => new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("police_english_daily");

    const defaultTasks = [
      {
        id: "vocab",
        label: "Ôn 5 từ vựng ngẫu nhiên",
        description:
          "Vào phần Flashcard của bất kỳ bài nào và đánh dấu 'Đã thuộc' ít nhất 5 từ.",
        navigatePath: "flashcards/1",
        completed: false,
        current: 0,
        target: 5,
      },
      {
        id: "test",
        label: "Hoàn thành 1 bài test nhanh",
        description: "Làm 1 bài kiểm tra tổng hợp để củng cố kiến thức đã học.",
        navigatePath: "quicktest",
        completed: false,
        current: 0,
        target: 1,
      },
      {
        id: "speak",
        label: "Luyện nói 3 câu mẫu",
        description:
          "Bấm vào biểu tượng loa để nghe và luyện phát âm ít nhất 3 mẫu câu.",
        navigatePath: "lesson/1",
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

  // Navigation helpers that update hash
  const navigate = (hash: string) => {
    window.location.hash = hash;
  };
  const navigateToHome = () => navigate("/");
  const navigateToLesson = (unit: Unit) => {
    setSelectedUnit(unit);
    navigate(`/lesson/${unit.id}`);
  };
  const navigateToPractice = (unit: Unit) => {
    setSelectedUnit(unit);
    navigate(`/practice/${unit.id}`);
  };
  const navigateToFlashcards = (unit: Unit) => {
    setSelectedUnit(unit);
    navigate(`/flashcards/${unit.id}`);
  };
  const navigateToQuickTest = () => navigate("/quicktest");
  const navigateToGeneralTest = (unit?: Unit) => {
    if (unit) {
      setSelectedUnit(unit);
      navigate(`/generaltest/${unit.id}`);
      return;
    }
    setSelectedUnit(null);
    navigate("/generaltest");
  };

  // Toggle Sidebar Handlers
  const toggleSearch = () => setSearchOpen((prev) => !prev);
  const toggleNotebook = () => setNotebookOpen((prev) => !prev);

  return (
    <MainLayout
      selectedUnitId={selectedUnit?.id}
      onLogoClick={navigateToHome}
      showPracticeButtons={currentView === "lesson"}
      onStartPractice={() => selectedUnit && navigateToPractice(selectedUnit)}
      onStartFlashcards={() =>
        selectedUnit && navigateToFlashcards(selectedUnit)
      }
      onStartGeneralKnowledgeTest={() =>
        selectedUnit && navigateToGeneralTest(selectedUnit)
      }
      onToggleSearch={toggleSearch}
      onToggleNotebook={toggleNotebook}
    >
      {currentView === "home" && (
        <HomeView
          lessons={lessons}
          progress={progress}
          flaggedItems={flaggedItems}
          dailyTasks={dailyTasks}
          onSelectUnit={navigateToLesson}
          onStartQuickTest={navigateToQuickTest}
          onStartGeneralKnowledgeTest={navigateToGeneralTest}
          onNavigate={(path) => (window.location.hash = path)}
        />
      )}

      {currentView === "lesson" && selectedUnit && (
        <LessonView
          unit={selectedUnit}
          onBack={navigateToHome}
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
      )}

      {currentView === "practice" && selectedUnit && (
        <TrainingGround
          unit={selectedUnit}
          onBack={() => navigateToLesson(selectedUnit)}
          onComplete={() => {
            const newProgress = {
              ...progress,
              completedUnits: Array.from(
                new Set([...progress.completedUnits, selectedUnit.id]),
              ),
            };
            setProgress(newProgress);
            navigateToHome();
          }}
        />
      )}

      {currentView === "flashcards" && selectedUnit && (
        <FlashcardReview
          key={`${selectedUnit.id}-${flashcardRound}`}
          unit={selectedUnit}
          onBack={() => navigateToLesson(selectedUnit)}
          onComplete={(summary) => {
            setFlashcardSummary(summary);
            setCurrentView("flashcardResults");
            updateDailyTask("vocab", summary.knownCount);
          }}
        />
      )}

      {currentView === "flashcardResults" &&
        selectedUnit &&
        flashcardSummary && (
          <FlashcardSessionResults
            summary={flashcardSummary}
            onBackToLesson={() => navigateToLesson(selectedUnit)}
            onRetry={() => {
              localStorage.removeItem(
                getFlashcardStatusStorageKey(
                  selectedUnit.id,
                  flashcardSummary.deckMode,
                ),
              );
              setFlashcardRound((prev) => prev + 1);
              setCurrentView("flashcards");
            }}
          />
        )}

      {currentView === "quicktest" && (
        <QuickTest
          lessons={lessons}
          completedUnitIds={progress.completedUnits}
          onBack={navigateToHome}
          onComplete={() => updateDailyTask("test", 1)}
        />
      )}

      {currentView === "generaltest" && (
        <GeneralKnowledgeTest
          lessons={selectedUnit ? [selectedUnit] : lessons}
          mode={selectedUnit ? "unit" : "all"}
          onBack={() =>
            selectedUnit ? navigateToLesson(selectedUnit) : navigateToHome()
          }
          onComplete={() => updateDailyTask("test", 1)}
        />
      )}

      {currentView === "admin" && (
        <AdminView
          lessons={lessons}
          onBack={navigateToHome}
          onSave={(newLessons) => setLessons(newLessons)}
        />
      )}

      <SearchSidebar
        lessons={lessons}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigateToUnit={navigateToLesson}
      />

      <NotebookSidebar
        lessons={lessons}
        flaggedItems={flaggedItems}
        isOpen={notebookOpen}
        onClose={() => setNotebookOpen(false)}
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
        onNavigateToUnit={navigateToLesson}
      />
    </MainLayout>
  );
}

export default App;
