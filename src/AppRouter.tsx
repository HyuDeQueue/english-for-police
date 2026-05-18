import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { initSpeech, unlockSpeech } from "@/lib/speech";
import type { Unit } from "@/types";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAppState } from "@/hooks/useAppState";
import { getFlashcardStatusStorageKey } from "@/components/practice/flashcardStorage";
import type { FlashcardSessionSummary } from "@/components/practice/FlashcardReview";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/models/user.model";
import { fetchLessons } from "@/lib/lessonApi";

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
const LessonViewPage = lazy(() =>
  import("@/pages/LessonViewPage").then((m) => ({ default: m.LessonViewPage })),
);
const TrainingGroundPage = lazy(() =>
  import("@/pages/TrainingGroundPage").then((m) => ({
    default: m.TrainingGroundPage,
  })),
);
const FlashcardReviewPage = lazy(() =>
  import("@/pages/FlashcardReviewPage").then((m) => ({
    default: m.FlashcardReviewPage,
  })),
);
const FlashcardResultsPage = lazy(() =>
  import("@/pages/FlashcardResultsPage").then((m) => ({
    default: m.FlashcardResultsPage,
  })),
);
const GeneralTestPage = lazy(() =>
  import("@/pages/GeneralTestPage").then((m) => ({
    default: m.GeneralTestPage,
  })),
);
const UnitsProgressPage = lazy(() => import("@/pages/admin/UnitsProgressPage"));
const StudentEvaluationPage = lazy(
  () => import("@/pages/admin/StudentEvaluationPage"),
);
const AdminLessonsPage = lazy(() => import("@/pages/admin/AdminLessonsPage"));
const AdminLessonWorkspacePage = lazy(
  () => import("@/pages/admin/AdminLessonWorkspacePage"),
);

function parseUnitIdFromPath(path: string) {
  const parts = path.split("/");
  return { unitId: parts[2] };
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/** Guest attempting scored tests from URL → back to same lesson. */
function RequireAuthForLessonTests({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const { unitId } = useParams<{ unitId: string }>();
  if (!isAuthenticated) {
    return <Navigate to={`/lesson/${unitId}`} replace />;
  }
  return <>{children}</>;
}

export function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [flashcardRound, setFlashcardRound] = useState(1);
  const [flashcardSummary, setFlashcardSummary] =
    useState<FlashcardSessionSummary | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const reloadLessonsFromApi = useCallback(async () => {
    try {
      const next = await fetchLessons();
      if (next.length) {
        setLessons(next);
      }
    } catch {
      /* keep existing lessons on failure */
    }
  }, [setLessons]);

  const activeUnitId = useMemo(() => {
    const match = location.pathname.match(
      /\/(lesson|practice|flashcards|generaltest)\/(\d+)/,
    );
    return match ? Number(match[2]) : undefined;
  }, [location.pathname]);

  return (
    <>
      <AppSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
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
      <MainLayout
        selectedUnitId={activeUnitId}
        onLogoClick={navigateToHome}
        onOpenMenu={() => setSidebarOpen(true)}
      >
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
                user?.role === UserRole.ADMIN ? (
                  <Navigate to="/admin/units" replace />
                ) : (
                  <HomeView
                    lessons={lessons}
                    progress={progress}
                    flaggedItems={flaggedItems}
                    dailyTasks={dailyTasks}
                    onSelectUnit={navigateToLesson}
                    onNavigate={(path: string, state?: unknown) =>
                      navigate(path.startsWith("#") ? path.slice(1) : path, {
                        state,
                      })
                    }
                  />
                )
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
                <RequireAuthForLessonTests>
                  <TrainingGroundPage
                    lessons={lessons}
                    progress={progress}
                    setProgress={setProgress}
                    onBack={navigateToLesson}
                    onComplete={navigateToHome}
                  />
                </RequireAuthForLessonTests>
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
                <RequireAuth>
                  <QuickTest
                    lessons={lessons}
                    completedUnitIds={progress.completedUnits}
                    onBack={navigateToHome}
                    onComplete={() => updateDailyTask("test", 1)}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/generaltest"
              element={
                <RequireAuth>
                  <GeneralTestPage
                    lessons={lessons}
                    onBack={navigateToHome}
                    onComplete={() => updateDailyTask("test", 1)}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/generaltest/:unitId"
              element={
                <RequireAuthForLessonTests>
                  <GeneralTestPage
                    lessons={lessons}
                    onBack={(u) => (u ? navigateToLesson(u) : navigateToHome())}
                    onComplete={() => updateDailyTask("test", 1)}
                  />
                </RequireAuthForLessonTests>
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
            <Route path="/admin/units" element={<UnitsProgressPage />} />
            <Route
              path="/admin/students/:userId/evaluation"
              element={
                user?.role === UserRole.ADMIN ? (
                  <StudentEvaluationPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/admin/lessons"
              element={
                user?.role === UserRole.ADMIN ? (
                  <AdminLessonsPage onLessonsUpdated={reloadLessonsFromApi} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/admin/lessons/:unitId/workspace"
              element={
                user?.role === UserRole.ADMIN ? (
                  <AdminLessonWorkspacePage
                    onLessonsUpdated={reloadLessonsFromApi}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </Suspense>
      </MainLayout>
    </>
  );
}
