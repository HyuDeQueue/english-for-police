import { ASR_API_BASE_URL } from "./config";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "recording.wav");

  const url = new URL(`${ASR_API_BASE_URL}/asr`, window.location.origin);
  url.searchParams.append("encode", "false");
  url.searchParams.append("task", "transcribe");
  url.searchParams.append("output", "json");

  const response = await fetch(url.toString(), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ASR API failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return typeof data === "string" ? data : data.text || "";
}

export async function detectLanguage(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "recording.wav");

  const url = new URL(
    `${ASR_API_BASE_URL}/detect-language`,
    window.location.origin,
  );
  url.searchParams.append("encode", "true");

  const response = await fetch(url.toString(), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Detect Language API failed: ${response.status}`);
  }

  return await response.json();
}
