export type FlashcardDeckMode = "vocabulary" | "sentencePatterns";

export const getFlashcardStatusStorageKey = (
  unitId: number,
  deckMode: FlashcardDeckMode,
) => `police_english_flashcards_unit_${unitId}_${deckMode}`;

export const getFlashcardHistoryStorageKey = (
  unitId: number,
  deckMode: FlashcardDeckMode,
) => `police_english_flashcards_history_unit_${unitId}_${deckMode}`;
