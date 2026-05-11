/** Set at build time (Vite). Example: `https://backend.espforpolice.vn` — no trailing slash. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "https://backend.espforpolice.vn";
export const ASR_API_BASE_URL = "/api/asr";
export const TTS_API_BASE_URL = "/api/tts";
export const DEFAULT_TTS_VOICE = "larynx:ljspeech-glow_tts";
