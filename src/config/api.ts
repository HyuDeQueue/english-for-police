export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://115.73.218.193:1608";
export const ASR_API_BASE_URL = "/api/asr";
export const TTS_API_BASE_URL = "/api/tts";
export const DEFAULT_TTS_VOICE = "larynx:ljspeech-glow_tts";
