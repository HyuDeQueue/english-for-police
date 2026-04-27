import { useState, useCallback } from "react";
import type { Question } from "@/types";
import type { SectionResult } from "../utils/testUtils";

type MatchingAnswer = Record<string, string>;
type ArrangementAnswer = string[];

export function useGeneralTestState() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, MatchingAnswer>>({});
  const [arrangementAnswers, setArrangementAnswers] = useState<Record<string, ArrangementAnswer>>({});
  const [selectedLeft, setSelectedLeft] = useState<Record<string, string | null>>({});
  const [showResults, setShowResults] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [sectionResults, setSectionResults] = useState<Record<number, SectionResult>>({});

  const isQuestionAnswered = useCallback((q: Question): boolean => {
    if (!q) return false;
    if (q.type === "Matching") {
      const pairCount = q.pairs?.length || 0;
      return (
        pairCount > 0 &&
        Object.keys(matchingAnswers[q.id] || {}).length === pairCount
      );
    }
    if (q.type === "Arrangement") {
      return (arrangementAnswers[q.id] || []).length > 0;
    }
    return (
      typeof answers[q.id] === "string" &&
      (answers[q.id] as string).trim().length > 0
    );
  }, [answers, matchingAnswers, arrangementAnswers]);

  const calculateScore = useCallback((questionList: Question[]) => {
    let correctCount = 0;

    questionList.forEach((q) => {
      if (q.type === "Matching") {
        const userPairs = matchingAnswers[q.id] || {};
        const allCorrect = (q.pairs || []).every(
          (pair) => userPairs[pair.left] === pair.right,
        );
        if (allCorrect) correctCount++;
        return;
      }

      if (q.type === "Arrangement") {
        const userArranged = (arrangementAnswers[q.id] || []).join(" ").trim();
        const correctAnswer = String(q.answer || "").trim();
        if (userArranged.toLowerCase() === correctAnswer.toLowerCase()) {
          correctCount++;
        }
        return;
      }

      const userAnswer = String(answers[q.id] || "")
        .trim()
        .toLowerCase();
      const correctAnswer = String(q.answer || "")
        .trim()
        .toLowerCase();
      const acceptable = (q.acceptableAnswers || []).map((a) =>
        a.trim().toLowerCase(),
      );
      if (userAnswer === correctAnswer || acceptable.includes(userAnswer)) {
        correctCount++;
      }
    });

    return {
      correctCount,
      total: questionList.length,
      score:
        questionList.length > 0
          ? Math.round((correctCount / questionList.length) * 100)
          : 0,
    };
  }, [answers, matchingAnswers, arrangementAnswers]);

  const resetBaseState = useCallback(() => {
    setAnswers({});
    setMatchingAnswers({});
    setArrangementAnswers({});
    setSelectedLeft({});
    setSectionResults({});
    setShowResults(false);
    setOverallScore(0);
  }, []);

  return {
    answers,
    setAnswers,
    matchingAnswers,
    setMatchingAnswers,
    arrangementAnswers,
    setArrangementAnswers,
    selectedLeft,
    setSelectedLeft,
    showResults,
    setShowResults,
    overallScore,
    setOverallScore,
    sectionResults,
    setSectionResults,
    isQuestionAnswered,
    calculateScore,
    resetBaseState,
  };
}
