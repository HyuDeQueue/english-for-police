import type { Unit } from "@/types";
import { API_BASE_URL } from "@/config/api";

interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "";
    try {
      const payload = (await response.json()) as Partial<ApiResponse<T>> & {
        message?: string;
      };
      if (payload?.message) {
        detail = `: ${payload.message}`;
      }
    } catch {
      // Ignore parsing errors and keep status-only message
    }
    throw new Error(`Request failed with status ${response.status}${detail}`);
  }
  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export async function fetchLessons(): Promise<Unit[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/lessons`);
  return parseResponse<Unit[]>(response);
}

export async function importLessons(lessons: Unit[]): Promise<void> {
  const endpoint = `${API_BASE_URL}/api/v1/lessons/import`;

  const postImport = async (payload: unknown) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    await parseResponse<void>(response);
  };

  try {
    await postImport(lessons);
    return;
  } catch {
    try {
      await postImport({ lessons });
      return;
    } catch {
      for (const lesson of lessons) {
        try {
          await postImport([lesson]);
        } catch {
          await postImport({ lessons: [lesson] });
        }
      }
      return;
    }
  }
}
