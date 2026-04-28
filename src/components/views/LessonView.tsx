import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Unit, FlaggedItem } from "../../types";
import { BookMarked } from "lucide-react";
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
  const startGeneralTest = () => navigate(`/generaltest/${unit.id}`);
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
      <aside className="w-full lg:w-64 sticky top-24 self-start space-y-6">
        <LessonTableOfContents
          unitId={unit.id}
          activeSection={activeSection}
          onBack={onBack}
          onScrollToSection={scrollToSection}
        />

        {/* Notebook + Shortcuts */}
        <div className="bg-card rounded-xl border police-shadow overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h4 className="font-heading font-bold flex items-center gap-2 text-sm">
              <BookMarked className="h-4 w-4 text-secondary" />
              SỔ TAY BÀI HỌC
            </h4>
          </div>
          <div className="p-4">
            {flaggedItems.filter((f) => f.unitId === unit.id).length > 0 ? (
              <div className="space-y-3 max-h-240px overflow-y-auto pr-2 custom-scrollbar">
                {flaggedItems
                  .filter((f) => f.unitId === unit.id)
                  .map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 group cursor-default py-1 border-b border-dashed last:border-0 pb-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                          {f.type === "vocabulary"
                            ? "Từ vựng"
                            : f.type === "phrase"
                              ? "Mẫu câu"
                              : "Công thức"}
                        </p>
                        <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                          {f.key}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Chưa có mục nào được lưu vào sổ tay.
              </p>
            )}
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
