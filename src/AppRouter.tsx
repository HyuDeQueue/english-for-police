import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { initSpeech, unlockSpeech } from "@/lib/speech";
import type { Unit } from "@/types";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAppState } from "@/hooks/useAppState";
import { getFlashcardStatusStorageKey } from "@/components/practice/flashcardStorage";
import type { FlashcardSessionSummary } from "@/components/practice/FlashcardReview";
import {
  LessonViewPage,
  TrainingGroundPage,
  FlashcardReviewPage,
  FlashcardResultsPage,
  GeneralTestPage,
} from "@/pages";

// Lazy-loaded route components
const HomeView = lazy(() =>
  import("@/components/views/HomeView").then((m) => ({ default: m.HomeView })),
);
const AdminView = lazy(() =>
  import("@/components/views/AdminView").then((m) => ({
    default: m.AdminView,
  })),
);
const QuickTest = lazy(() =>
  import("@/components/practice/QuickTest").then((m) => ({
    default: m.QuickTest,
  })),
);

function parseUnitIdFromPath(path: string) {
  const parts = path.split("/");
  return { unitId: parts[2] };
}

export function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [flashcardRound, setFlashcardRound] = useState(1);
  const [flashcardSummary, setFlashcardSummary] =
    useState<FlashcardSessionSummary | null>(null);

  const {
    lessons,
    setLessons,
    progress,
    setProgress,
    flaggedItems,
    setFlaggedItems,
    dailyTasks,
    updateDailyTask,
    toggleFlag,
  } = useAppState();

  useEffect(() => {
    initSpeech();
    const handleFirstInteraction = () => {
      unlockSpeech();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const navigateToHome = () => navigate("/");
  const navigateToLesson = (unit: Unit) => navigate(`/lesson/${unit.id}`);

  const activeUnitId = useMemo(() => {
    const match = location.pathname.match(
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
        onRemoveItem={(item) =>
          setFlaggedItems((prev) =>
            prev.filter(
              (f) =>
                !(
                  f.unitId === item.unitId &&
                  f.type === item.type &&
                  f.key === item.key
                ),
            ),
          )
        }
      />
      <MainLayout selectedUnitId={activeUnitId} onLogoClick={navigateToHome}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Đang tải...
            </div>
          }
        >
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
                  toggleFlag={toggleFlag}
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
                    const { unitId } = parseUnitIdFromPath(location.pathname);
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
        </Suspense>
      </MainLayout>
    </SidebarProvider>
  );
}
