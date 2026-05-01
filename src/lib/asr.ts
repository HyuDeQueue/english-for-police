import { ASR_API_BASE_URL } from "./config";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "recording.wav");

  const url = new URL(`${ASR_API_BASE_URL}/asr`, window.location.origin);
  url.searchParams.append("encode", "true");
  url.searchParams.append("task", "transcribe");
  url.searchParams.append("output", "json");

  console.log("Starting transcription...", {
    url: url.toString(),
    blobSize: audioBlob.size,
    blobType: audioBlob.type,
  });

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      body: formData,
    });

    console.log("ASR Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ASR Error body:", errorText);
      throw new Error(`ASR API failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("ASR Data received:", data);
    return typeof data === "string" ? data : data.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
}

export async function detectLanguage(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "recording.wav");

  const url = new URL(
    `${ASR_API_BASE_URL}/detect-language`,
    window.location.origin,
  );
  url.searchParams.append("encode", "true");

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Detect Language API failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Language detection error:", error);
    throw error;
  }
}
