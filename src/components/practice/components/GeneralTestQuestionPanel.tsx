import React from "react";
import type { Question } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionRenderer } from "./QuestionRenderer";

export interface GeneralTestQuestionPanelViewModel {
  currentSectionTitle?: string;
  currentQuestion?: Question;
  currentPageIndex: number;
  currentIndexInSection: number;
  questionsPerPage: number;
  sectionQuestionsLength: number;
  pagedSectionQuestionsLength: number;
  answers: Record<string, string>;
  matchingAnswers: Record<string, Record<string, string>>;
  arrangementAnswers: Record<string, string[]>;
  selectedLeft: Record<string, string | null>;
  matchingRightOptionsByQuestionId: Record<
    string,
    { left: string; right: string }[]
  >;
  showResults: boolean;
}

export interface GeneralTestQuestionPanelActions {
  onAnswerChange: (qid: string, value: string) => void;
  onMatchingSelectLeft: (qid: string, left: string) => void;
  onMatchingMatch: (qid: string, left: string, right: string) => void;
  onArrangementAdd: (qid: string, word: string) => void;
  onArrangementRemove: (qid: string, index: number) => void;
  onArrangementReset: (qid: string) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
}

interface GeneralTestQuestionPanelProps {
  vm: GeneralTestQuestionPanelViewModel;
  actions: GeneralTestQuestionPanelActions;
}

export const GeneralTestQuestionPanel: React.FC<GeneralTestQuestionPanelProps> = ({
  vm,
  actions,
}) => {
  const {
    currentSectionTitle,
    currentQuestion,
    currentPageIndex,
    currentIndexInSection,
    questionsPerPage,
    sectionQuestionsLength,
    pagedSectionQuestionsLength,
    answers,
    matchingAnswers,
    arrangementAnswers,
    selectedLeft,
    matchingRightOptionsByQuestionId,
    showResults,
  } = vm;

  const {
    onAnswerChange,
    onMatchingSelectLeft,
    onMatchingMatch,
    onArrangementAdd,
    onArrangementRemove,
    onArrangementReset,
    onPrevQuestion,
    onNextQuestion,
  } = actions;

  const absoluteIndex =
    currentPageIndex * questionsPerPage + currentIndexInSection + 1;
  const isFirstQuestion = currentIndexInSection === 0 && currentPageIndex === 0;
  const isLastQuestion = absoluteIndex >= sectionQuestionsLength;

  return (
    <Card className="police-shadow border-none min-h-360px flex flex-col">
      <CardHeader className="border-b bg-muted/20 py-2.5 px-4 sm:px-5 flex flex-row justify-between items-center">
        <Badge className="bg-primary/10 text-primary border-none px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider">
          {currentSectionTitle}
        </Badge>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
          Câu {absoluteIndex} / {sectionQuestionsLength}
        </span>
      </CardHeader>

      <CardContent className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
        <div className="space-y-6 max-w-3xl mx-auto w-full">
          {currentQuestion && (
            <>
              <h3 className="text-xl sm:text-2xl font-heading font-black text-primary leading-tight">
                {currentQuestion.prompt}
              </h3>
              {currentQuestion.vnPrompt && (
                <div className="p-3 bg-secondary/5 border-l-4 border-secondary rounded-r-xl italic text-secondary text-sm font-medium">
                  {currentQuestion.vnPrompt}
                </div>
              )}

              <div className="space-y-3 py-1">
                <QuestionRenderer
                  question={currentQuestion}
                  answers={answers}
                  matchingAnswers={matchingAnswers}
                  arrangementAnswers={arrangementAnswers}
                  selectedLeft={selectedLeft}
                  matchingRightOptions={
                    matchingRightOptionsByQuestionId[currentQuestion.id] || []
                  }
                  onAnswerChange={onAnswerChange}
                  onMatchingSelectLeft={onMatchingSelectLeft}
                  onMatchingMatch={onMatchingMatch}
                  onArrangementAdd={onArrangementAdd}
                  onArrangementRemove={onArrangementRemove}
                  onArrangementReset={onArrangementReset}
                  showResults={showResults}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>

      {currentQuestion && (
        <div className="border-t bg-muted/10 px-5 py-3 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-bold text-xs border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-30"
            disabled={isFirstQuestion}
            onClick={onPrevQuestion}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Câu Trước
          </Button>

          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {absoluteIndex}
            {" / "}
            {sectionQuestionsLength}
          </span>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-bold text-xs border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-30"
            disabled={isLastQuestion || pagedSectionQuestionsLength === 0}
            onClick={onNextQuestion}
          >
            Câu Sau
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </Card>
  );
};
