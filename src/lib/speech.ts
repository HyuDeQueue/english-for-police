import { TTS_API_BASE_URL, DEFAULT_TTS_VOICE } from "./config";

let preferredVoice: SpeechSynthesisVoice | null = null;
let currentAudio: HTMLAudioElement | null = null;

export function initSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      preferredVoice =
        voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
        voices.find((v) => v.lang === "en-US") ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
    }
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export function unlockSpeech() {
  if (typeof window === "undefined") return;

  // For SpeechSynthesis fallback
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  // Create a silent audio to unlock audio context
  const audio = new Audio();
  audio.play().catch(() => {});
}

export async function speak(text: string, opts?: { onend?: () => void }) {
  if (typeof window === "undefined") return;

  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Try Remote TTS first
  try {
    const apiUrl = `${window.location.origin}${TTS_API_BASE_URL}/api/tts`;
    const url = new URL(apiUrl);
    url.searchParams.append("voice", DEFAULT_TTS_VOICE);
    url.searchParams.append("text", text);
    url.searchParams.append("vocoder", "high");

    const audio = new Audio(url.toString());
    currentAudio = audio;

    audio.onended = () => {
      if (opts?.onend) opts.onend();
    };

    audio.onerror = (e) => {
      console.warn("Audio element error, falling back to browser TTS", e);
      speakWithBrowser(text, opts);
    };

    await audio.play();
    return;
  } catch (error) {
    console.warn(
      "Remote TTS execution failed, falling back to browser TTS",
      error,
    );
    speakWithBrowser(text, opts);
  }
}

function speakWithBrowser(text: string, opts?: { onend?: () => void }) {
  if (!("speechSynthesis" in window)) {
    if (opts?.onend) opts.onend();
    return;
  }

  window.speechSynthesis.cancel();

  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    u.pitch = 1;
    u.volume = 1;

    if (preferredVoice) {
      u.voice = preferredVoice;
    } else {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith("en"));
      if (voice) u.voice = voice;
    }

    if (opts?.onend) {
      u.onend = opts.onend;
    }

    u.onerror = (event) => {
      if (event.error !== "interrupted") {
        console.error("SpeechSynthesisUtterance error", event);
      }
      if (opts?.onend) opts.onend();
    };

    window.speechSynthesis.speak(u);
  }, 50);
}

export default { initSpeech, speak, unlockSpeech };
