import React, { useState, useRef, useEffect, useMemo } from "react";
import { speak } from "@/lib/speech";
import { useNavigate } from "react-router-dom";
import type { Unit, FlaggedItem } from "../../types";
import { useAuth } from "@/hooks/use-auth";
import { LessonTableOfContents } from "./lesson/LessonTableOfContents";
import { LessonShortcutButtons } from "./lesson/LessonShortcutButtons";
import { LessonVocabularySection } from "./lesson/LessonVocabularySection";
import { LessonPhrasesSection } from "./lesson/LessonPhrasesSection";
import {
  PRACTICE_MENU_LABEL_TO_LANE,
  resolvedLane,
  getPhraseSubNavItems,
} from "@/components/practice/utils/testUtils";
import { lessonService } from "@/services/lesson.service";
import type { LessonTestLane } from "@/types";

interface LessonViewProps {
  unit: Unit;
  onBack: () => void;
  flaggedItems: FlaggedItem[];
  toggleFlag: (item: FlaggedItem) => void;
  onPhraseAction?: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  unit,
  onBack,
  flaggedItems,
  toggleFlag,
  onPhraseAction,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [availableLanes, setAvailableLanes] = useState<Set<LessonTestLane>>(
    new Set(),
  );

  useEffect(() => {
    let isMounted = true;
    const checkAvailability = async () => {
      try {
        const questions = await lessonService.getLessonTests(unit.id);
        if (!isMounted) return;

        const lanes = new Set<LessonTestLane>();
        questions.forEach((q) => {
          lanes.add(resolvedLane(q));
        });
        setAvailableLanes(lanes);
      } catch (err) {
        console.error("Failed to fetch unit tests for availability check", err);
      }
    };
    void checkAvailability();
    return () => {
      isMounted = false;
    };
  }, [unit.id]);

  const testsLocked = !isAuthenticated;

  const startPractice = () => navigate(`/practice/${unit.id}`);
  const startFlashcards = () => navigate(`/flashcards/${unit.id}`);
  const startGeneralTest = (mode?: "type" | "bank", sectionTitle?: string) => {
    if (mode === "bank") {
      navigate(`/generaltest/${unit.id}?mode=bank`);
      return;
    }
    if (mode === "type" && sectionTitle) {
      const lane = PRACTICE_MENU_LABEL_TO_LANE[sectionTitle];
      if (lane) {
        navigate(`/generaltest/${unit.id}?lane=${encodeURIComponent(lane)}`);
        return;
      }
    }
    navigate(`/generaltest/${unit.id}`);
  };

  const playAudio = (
    text: string,
    buttonEl?: HTMLButtonElement,
    isPhrase?: boolean,
  ) => {
    if (buttonEl) {
      buttonEl.classList.add("text-primary", "animate-pulse");
      buttonEl.disabled = true;
    }

    if (isPhrase && onPhraseAction) {
      onPhraseAction();
    }

    speak(text, {
      onend: () => {
        if (buttonEl) {
          buttonEl.classList.remove("text-primary", "animate-pulse");
          buttonEl.disabled = false;
        }
      },
    });
  };

  const [activeSection, setActiveSection] = useState<string>("vocabulary");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const scrollLockUntilRef = useRef(0);

  const isScrollLocked = () => Date.now() < scrollLockUntilRef.current;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const phraseSubNavItems = useMemo(() => getPhraseSubNavItems(unit), [unit]);

  const [selectedPhraseSubId, setSelectedPhraseSubId] = useState("");

  useEffect(() => {
    const first = phraseSubNavItems[0]?.id;
    if (!first) return;
    queueMicrotask(() => {
      setSelectedPhraseSubId((prev) =>
        phraseSubNavItems.some((item) => item.id === prev) ? prev : first,
      );
    });
  }, [phraseSubNavItems]);

  useEffect(() => {
    if (isScrollLocked()) return;
    if (!activeSection.startsWith("phrases-")) return;
    const subId = activeSection.slice("phrases-".length);
    if (!phraseSubNavItems.some((item) => item.id === subId)) return;
    queueMicrotask(() => {
      setSelectedPhraseSubId(subId);
    });
  }, [activeSection, phraseSubNavItems]);

  const scrollToSection = (id: string) => {
    scrollLockUntilRef.current = Date.now() + 1500;

    const element =
      document.getElementById(id) ??
      document.querySelector<HTMLElement>(`[data-section="${id}"]`) ??
      sectionRefs.current[id] ??
      null;

    if (!element) return;

    setActiveSection(id);
    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  const handlePhraseSubSelect = (id: string) => {
    scrollLockUntilRef.current = Date.now() + 1500;
    setSelectedPhraseSubId(id);
    setActiveSection(`phrases-${id}`);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollLocked()) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        const topEntry = visible[0];
        if (!topEntry) return;

        const id =
          topEntry.target.getAttribute("data-section") ||
          topEntry.target.id ||
          topEntry.target.getAttribute("data-phrase-anchor");
        if (id) {
          if (id === "vocabulary" || id === "phrases") {
            setActiveSection(id);
          } else if (id.startsWith("phrases-")) {
            setActiveSection(id);
          } else {
            setActiveSection(`phrases-${id}`);
          }
        }
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );

    const observeElements = () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref as Element);
      });

      document.querySelectorAll(".phrase-section-anchor").forEach((el) => {
        observer.observe(el);
      });
    };

    observeElements();
    return () => observer.disconnect();
  }, [unit.id]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Sticky TOC Sidebar */}
      <aside className="w-full lg:w-64 lg:sticky lg:top-20 lg:self-start space-y-2">
        <LessonTableOfContents
          unitId={unit.id}
          activeSection={activeSection}
          onBack={onBack}
          onScrollToSection={scrollToSection}
          phraseSubNavItems={phraseSubNavItems}
          selectedPhraseSubId={selectedPhraseSubId}
          onPhraseSubSelect={handlePhraseSubSelect}
        />

        {/* Shortcuts */}
        <div className="bg-card rounded-md border police-shadow overflow-hidden">
          <div className="p-4">
            <LessonShortcutButtons
              testsLocked={testsLocked}
              availableLanes={availableLanes}
              onStartPractice={startPractice}
              onStartFlashcards={startFlashcards}
              onStartGeneralTest={startGeneralTest}
              onStartVocabDrill={(drill) => {
                const lane = drill === "matching" ? "MATCHING" : "VOCAB_MCQ";
                navigate(
                  `/generaltest/${unit.id}?lane=${encodeURIComponent(lane)}&vocabDrill=${drill}`,
                );
              }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-12 pb-24">
        <LessonVocabularySection
          unit={unit}
          flaggedItems={flaggedItems}
          onToggleFlag={toggleFlag}
          onPlayAudio={playAudio}
          sectionRef={(el) => {
            sectionRefs.current["vocabulary"] = el;
          }}
        />

        <LessonPhrasesSection
          unit={unit}
          flaggedItems={flaggedItems}
          onToggleFlag={toggleFlag}
          onPlayAudio={playAudio}
          selectedSubId={
            phraseSubNavItems.length > 1 ? selectedPhraseSubId : undefined
          }
          onStartPractice={(mode, group) => {
            if (mode === "PHRASE_SCENARIO" && group) {
              navigate(
                `/generaltest/${unit.id}?lane=PHRASE_SCENARIO&subId=${group}`,
              );
            } else {
              startGeneralTest();
            }
          }}
        />
      </div>
    </div>
  );
};
