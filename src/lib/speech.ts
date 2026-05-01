let preferredVoice: SpeechSynthesisVoice | null = null;

export function initSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      preferredVoice =
        voices.find((v) => v.lang && v.lang.startsWith("en")) || voices[0];

      try {
        const warm = new SpeechSynthesisUtterance(" ");
        warm.volume = 0;
        warm.voice = preferredVoice;
        window.speechSynthesis.speak(warm);
      } catch (e) {
        // ignore warming errors
      }
    }
  };

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function speak(text: string, opts?: { onend?: () => void }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // ignore
  }

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  if (preferredVoice) u.voice = preferredVoice;
  if (opts && opts.onend) u.onend = opts.onend;
  window.speechSynthesis.speak(u);
}

export default { initSpeech, speak };
