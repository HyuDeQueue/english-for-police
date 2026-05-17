export const PRACTICE_MENU_GROUPS = [
  {
    id: "vocab",
    title: "Từ vựng",
    typeLabels: ["Trắc nghiệm từ vựng", "Ghép từ - nghĩa"],
  },
  {
    id: "phrase",
    title: "Mẫu câu",
    typeLabels: ["Mẫu câu & tình huống", "Điền từ & sắp xếp câu"],
  },
] as const;

export type PracticeMenuGroupId = (typeof PRACTICE_MENU_GROUPS)[number]["id"];
