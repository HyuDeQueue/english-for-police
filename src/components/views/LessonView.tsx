import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Unit, FlaggedItem } from "../../types";
import { LessonTableOfContents } from "./lesson/LessonTableOfContents";
import { LessonShortcutButtons } from "./lesson/LessonShortcutButtons";
import { LessonVocabularySection } from "./lesson/LessonVocabularySection";
import { LessonPhrasesSection } from "./lesson/LessonPhrasesSection";
import { LessonMemoryBoostSection } from "./lesson/LessonMemoryBoostSection";

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

  const startPractice = () => navigate(`/practice/${unit.id}`);
  const startFlashcards = () => navigate(`/flashcards/${unit.id}`);
  const startGeneralTest = (mode?: "type" | "bank", sectionTitle?: string) => {
    navigate(`/generaltest/${unit.id}`, { state: { mode, sectionTitle } });
  };
  const startQuickTest = () => navigate(`/quicktest`);

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

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onend = () => {
      if (buttonEl) {
        buttonEl.classList.remove("text-primary", "animate-pulse");
        buttonEl.disabled = false;
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const [activeSection, setActiveSection] = useState<string>("vocabulary");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      setActiveSection(id);
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section");
            if (id) setActiveSection(id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px" },
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Sticky TOC Sidebar */}
      <aside className="w-full lg:w-64 sticky top-16 self-start space-y-2">
        <LessonTableOfContents
          unitId={unit.id}
          activeSection={activeSection}
          onBack={onBack}
          onScrollToSection={scrollToSection}
        />

        {/* Shortcuts */}
        <div className="bg-card rounded-xl border police-shadow overflow-hidden">
          <div className="p-4">
            <LessonShortcutButtons
              onStartPractice={startPractice}
              onStartFlashcards={startFlashcards}
              onStartGeneralTest={startGeneralTest}
              onStartQuickTest={startQuickTest}
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
          sectionRef={(el) => {
            sectionRefs.current["phrases"] = el;
          }}
        />

        <LessonMemoryBoostSection
          unit={unit}
          flaggedItems={flaggedItems}
          onToggleFlag={toggleFlag}
          sectionRef={(el) => {
            sectionRefs.current["memory"] = el;
          }}
        />
      </div>
    </div>
  );
};
