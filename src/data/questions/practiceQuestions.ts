import type { Question } from "@/types";
import { unit1Questions } from "./unit1-questions";
import { unit2Questions } from "./unit2-questions";
import { unit3Questions } from "./unit3-questions";
import { unit4Questions } from "./unit4-questions";
import { unit5Questions } from "./unit5-questions";

export const practiceQuestionsByUnit: Record<number, Question[]> = {
  1: unit1Questions,
  2: unit2Questions,
  3: unit3Questions,
  4: unit4Questions,
  5: unit5Questions,
};
