let preferredVoice: SpeechSynthesisVoice | null = null;

export function initSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      // Prefer Google US English or any English voice
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

/**
 * Mobile browsers often require a user gesture to enable speech.
 * This function can be called on the first click to "unlock" audio.
 */
export function unlockSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // Create a silent utterance to kickstart the engine
  const u = new SpeechSynthesisUtterance("");
  u.volume = 0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function speak(text: string, opts?: { onend?: () => void }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // Crucial for mobile: cancel any current speech before starting new one
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    console.warn("Speech cancel failed", e);
  }

  // Small delay helps on iOS/mobile after cancel to ensure the engine is ready
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

    if (opts && opts.onend) {
      u.onend = opts.onend;
    }
    
    u.onerror = (event) => {
      // 'interrupted' usually happens when we call .cancel(), so we ignore it
      if (event.error !== "interrupted") {
        console.error("SpeechSynthesisUtterance error", event);
      }
      if (opts?.onend) opts.onend();
    };

    window.speechSynthesis.speak(u);
  }, 50);
}

export default { initSpeech, speak, unlockSpeech };
