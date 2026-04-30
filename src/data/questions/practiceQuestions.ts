import type { Question } from "@/types";
import { unit1Questions } from "./unit1-questions";
import { unit2Questions } from "./unit2-questions";
import { unit3Questions } from "./unit3-questions";

export const practiceQuestionsByUnit: Record<number, Question[]> = {
  1: unit1Questions,
  2: unit2Questions,
  3: unit3Questions,
};
