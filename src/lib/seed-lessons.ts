import type { Unit } from "@/types";

export async function loadSeedLessons(): Promise<Unit[]> {
  const { initialLessons } = await import("@/data/lesson/lessons");
  return initialLessons;
}
