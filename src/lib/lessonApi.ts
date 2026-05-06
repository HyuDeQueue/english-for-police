import type { Unit } from "@/types";
import { API_BASE_URL } from "@/config/api";

interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export async function fetchLessons(): Promise<Unit[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/lessons`);
  return parseResponse<Unit[]>(response);
}

export async function importLessons(lessons: Unit[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/lessons/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lessons),
  });
  await parseResponse<void>(response);
}
