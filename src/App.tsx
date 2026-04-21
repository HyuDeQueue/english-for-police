import { useState, useEffect } from "react";
import { initialLessons } from "./data/lessons";
import type { Unit, UserProgress } from "./types";
import "./App.css";

// Component Imports
import { MainLayout } from "./components/layout/MainLayout";
import { HomeView } from "./components/views/HomeView";
import { LessonView } from "./components/views/LessonView";
import { AdminView } from "./components/views/AdminView";
import { TrainingGround } from "./components/practice/TrainingGround";
import {
  FlashcardReview,
  type FlashcardSessionSummary,
} from "./components/practice/FlashcardReview";
import { FlashcardSessionResults } from "./components/practice/FlashcardSessionResults";
import { getFlashcardStatusStorageKey } from "./components/practice/flashcardStorage";

function App() {
  const [currentView, setCurrentView] = useState<
    "home" | "lesson" | "practice" | "flashcards" | "flashcardResults" | "admin"
  >("home");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [flashcardRound, setFlashcardRound] = useState(1);
  const [flashcardSummary, setFlashcardSummary] =
    useState<FlashcardSessionSummary | null>(null);
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

  // Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem("police_english_progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("police_english_lessons", JSON.stringify(lessons));
  }, [lessons]);

  // Navigation handlers
  const navigateToHome = () => setCurrentView("home");
  const navigateToLesson = (unit: Unit) => {
    setSelectedUnit(unit);
    setCurrentView("lesson");
  };
  const navigateToPractice = (unit: Unit) => {
    setSelectedUnit(unit);
    setCurrentView("practice");
  };
  const navigateToFlashcards = (unit: Unit) => {
    setSelectedUnit(unit);
    setCurrentView("flashcards");
  };
  // const navigateToAdmin = () => setCurrentView("admin");

  return (
    <MainLayout selectedUnitId={selectedUnit?.id} onLogoClick={navigateToHome}>
      {currentView === "home" && (
        <HomeView
          lessons={lessons}
          progress={progress}
          onSelectUnit={navigateToLesson}
        />
      )}

      {currentView === "lesson" && selectedUnit && (
        <LessonView
          unit={selectedUnit}
          onBack={navigateToHome}
          onStartPractice={navigateToPractice}
          onStartFlashcards={navigateToFlashcards}
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

      {currentView === "admin" && (
        <AdminView
          lessons={lessons}
          onBack={navigateToHome}
          onSave={(newLessons) => {
            setLessons(newLessons);
          }}
        />
      )}

      {/* Hidden toggle for Admin if needed, or link in HomeView hero */}
      {/* {currentView === "home" && (
        <button
          onClick={navigateToAdmin}
          style={{
            marginTop: "2rem",
            opacity: 0.3,
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          [ACCESS INTEL MANAGEMENT]
        </button>
      )} */}
    </MainLayout>
  );
}

export default App;
