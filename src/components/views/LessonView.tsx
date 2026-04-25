import React, { useState, useRef, useEffect } from "react";
import type { Unit, FlaggedItem } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronLeft,
  Volume2,
  Star,
  BookOpen,
  Video,
  List,
  Bookmark,
  Zap,
  Play,
} from "lucide-react";

interface LessonViewProps {
  unit: Unit;
  onBack: () => void;
  onStartPractice: (unit: Unit) => void;
  onStartFlashcards: (unit: Unit) => void;
  isFlagged: (
    unitId: number,
    type: "vocabulary" | "phrase",
    key: string,
  ) => boolean;
  toggleFlag: (item: FlaggedItem) => void;
  onPhraseAction?: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  unit,
  onBack,
  onStartPractice,
  onStartFlashcards,
  isFlagged,
  toggleFlag,
  onPhraseAction,
}) => {
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

  const [activeSection, setActiveSection] = useState<string>("summary");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = sectionRefs.current[id];
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Intersection Observer to update active TOC item on scroll
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

  const flaggedVocab = unit.vocabulary.filter((v) =>
    isFlagged(unit.id, "vocabulary", v.word),
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Sticky TOC Sidebar */}
      <aside className="w-full lg:w-64 lg:sticky lg:top-24 space-y-6">
        <div className="bg-card rounded-xl border police-shadow overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h4 className="font-heading font-bold flex items-center gap-2 text-sm">
              <List className="h-4 w-4 text-primary" />
              MỤC LỤC
            </h4>
          </div>
          <div className="p-2 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary"
              onClick={onBack}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              QUAY LẠI
            </Button>

            {[
              { id: "summary", label: "Tóm tắt bài học", icon: BookOpen },
              ...(unit.videoUrl
                ? [{ id: "video", label: "Video thực tế", icon: Video }]
                : []),
              { id: "vocabulary", label: "01 Từ vựng", icon: Zap },
              { id: "phrases", label: "02 Cấu trúc", icon: List },
              { id: "memory", label: "03 Ghi nhớ", icon: Bookmark },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${
                  activeSection === item.id
                    ? "bg-primary text-white font-bold police-shadow"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 ${activeSection === item.id ? "text-secondary" : ""}`}
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flagged Items Sidebar */}
        <div className="bg-card rounded-xl border police-shadow overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h4 className="font-heading font-bold flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-secondary fill-current" />
              ĐANG ĐÁNH DẤU
            </h4>
          </div>
          <div className="p-4">
            {flaggedVocab.length > 0 ? (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {flaggedVocab.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 group cursor-default py-1"
                    title={v.meaning}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                    <span className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                      {v.word}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Chưa có từ nào được đánh dấu ôn tập.
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-12 pb-24">
        {/* 1. Summary & Video */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <section
            data-section="summary"
            ref={(el) => {
              sectionRefs.current["summary"] = el;
            }}
            className="scroll-mt-24"
          >
            <Card className="border-none primary-gradient police-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-white font-heading">
                  Tóm tắt bài học
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/90 leading-relaxed">
                {unit.memoryBoost.summary}
              </CardContent>
            </Card>
          </section>

          {unit.videoUrl && (
            <section
              data-section="video"
              ref={(el) => {
                sectionRefs.current["video"] = el;
              }}
              className="scroll-mt-24"
            >
              <Card className="overflow-hidden border-none police-shadow">
                <div className="aspect-video relative group">
                  <iframe
                    src={unit.videoUrl}
                    title="Video thực tế"
                    allowFullScreen
                    className="w-full h-full border-none"
                  />
                  <div className="absolute inset-0 bg-primary/20 pointer-events-none group-hover:opacity-0 transition-opacity flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-6 w-6 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* 2. Vocabulary */}
        <section
          data-section="vocabulary"
          ref={(el) => {
            sectionRefs.current["vocabulary"] = el;
          }}
          className="scroll-mt-24"
        >
          <div className="flex items-center gap-4 mb-6">
            <Badge
              variant="outline"
              className="text-lg px-3 py-1 font-bold border-primary text-primary bg-primary/5"
            >
              01
            </Badge>
            <h2 className="text-2xl font-heading font-extrabold tracking-tight">
              TỪ VỰNG CHUYÊN NGÀNH
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {unit.vocabulary.map((v, i) => {
              const flagged = isFlagged(unit.id, "vocabulary", v.word);
              return (
                <Card
                  key={i}
                  className={`group relative hover:police-shadow transition-all border-l-4 ${flagged ? "border-l-secondary" : "border-l-primary/20 hover:border-l-primary"}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-primary">
                            {v.word}
                          </h3>
                          <Badge variant="outline" className="text-[10px] py-0">
                            {v.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {v.phonetic}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${flagged ? "text-secondary" : "text-muted-foreground"}`}
                        onClick={() =>
                          toggleFlag({
                            unitId: unit.id,
                            type: "vocabulary",
                            key: v.word,
                          })
                        }
                      >
                        <Star
                          className={`h-4 w-4 ${flagged ? "fill-current" : ""}`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-bold text-base leading-tight">
                      {v.meaning}
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full text-xs font-bold group-hover:bg-primary group-hover:text-white transition-all"
                        onClick={(e) => playAudio(v.word, e.currentTarget)}
                      >
                        <Volume2 className="h-3 w-3 mr-1.5" />
                        PHÁT ÂM
                      </Button>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg border italic text-xs leading-relaxed">
                      "Ex: {v.example}"
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 3. Phrases */}
        <section
          data-section="phrases"
          ref={(el) => {
            sectionRefs.current["phrases"] = el;
          }}
          className="scroll-mt-24"
        >
          <div className="flex items-center gap-4 mb-6">
            <Badge
              variant="outline"
              className="text-lg px-3 py-1 font-bold border-primary text-primary bg-primary/5"
            >
              02
            </Badge>
            <h2 className="text-2xl font-heading font-extrabold tracking-tight">
              CẤU TRÚC CHUYÊN NGHIỆP
            </h2>
          </div>

          <div className="space-y-4">
            {unit.phrases.map((p, i) => {
              const flagged = isFlagged(unit.id, "phrase", p.text);
              return (
                <Card
                  key={i}
                  className={`overflow-hidden border-l-4 ${flagged ? "border-l-secondary" : "border-l-primary/20"}`}
                >
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`item-${i}`} className="border-none">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-primary text-lg mb-1">
                            {p.text}
                          </h4>
                          <p className="text-muted-foreground font-medium">
                            {p.translation}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-9 w-9 rounded-full ${flagged ? "text-secondary" : "text-muted-foreground"}`}
                            onClick={() =>
                              toggleFlag({
                                unitId: unit.id,
                                type: "phrase",
                                key: p.text,
                              })
                            }
                          >
                            <Star
                              className={`h-5 w-5 ${flagged ? "fill-current" : ""}`}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-primary hover:text-white"
                            onClick={(e) =>
                              playAudio(p.text, e.currentTarget, true)
                            }
                          >
                            <Volume2 className="h-5 w-5" />
                          </Button>
                          <AccordionTrigger className="hover:no-underline p-0 ml-2" />
                        </div>
                      </div>
                      <AccordionContent className="px-6 pb-6 pt-2 bg-muted/30">
                        <div className="space-y-4 text-sm">
                          <div className="flex gap-2">
                            <Badge
                              variant="outline"
                              className="h-fit shrink-0 bg-white"
                            >
                              NGỮ CẢNH
                            </Badge>
                            <p className="leading-relaxed">{p.context}</p>
                          </div>
                          <div className="space-y-2">
                            <Badge variant="outline" className="bg-white">
                              VÍ DỤ THỰC TẾ
                            </Badge>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
                              {p.realWorldExamples &&
                              p.realWorldExamples.length > 0 ? (
                                p.realWorldExamples.map((ex, j) => (
                                  <li
                                    key={j}
                                    className="italic text-muted-foreground"
                                  >
                                    {ex}
                                  </li>
                                ))
                              ) : (
                                <li className="italic text-muted-foreground opacity-60">
                                  Sử dụng trong các tình huống giao tiếp tuần
                                  tra thực tế.
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 4. Memory Boost */}
        <section
          data-section="memory"
          ref={(el) => {
            sectionRefs.current["memory"] = el;
          }}
          className="scroll-mt-24"
        >
          <div className="flex items-center gap-4 mb-6">
            <Badge
              variant="outline"
              className="text-lg px-3 py-1 font-bold border-primary text-primary bg-primary/5"
            >
              03
            </Badge>
            <h2 className="text-2xl font-heading font-extrabold tracking-tight">
              GHI NHỚ NHANH
            </h2>
          </div>
          <Card className="police-shadow border-none bg-secondary/5 overflow-hidden">
            <CardHeader className="bg-secondary/10 border-b border-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5 fill-current text-secondary" />
                Cụm từ đi kèm (Collocations)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {unit.memoryBoost.collocations.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-secondary/10 hover:border-secondary transition-colors"
                  >
                    <span className="font-bold text-primary">{c.verb}</span>
                    <span className="text-muted-foreground">+</span>
                    <span className="font-medium">{c.noun}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Button
            variant="outline"
            className="flex-1 h-14 text-lg font-bold border-2 border-primary text-primary hover:bg-primary/5 rounded-xl transition-all"
            onClick={() => onStartFlashcards(unit)}
          >
            ÔN TẬP FLASHCARDS
          </Button>
          <Button
            className="flex-1 h-14 text-lg font-bold primary-gradient police-shadow rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => onStartPractice(unit)}
          >
            BẮT ĐẦU KIỂM TRA
          </Button>
        </div>
      </div>
    </div>
  );
};
