import { useCallback, useEffect, useState } from "react";
import type { DailyTask, FlaggedItem, Unit, UserProgress } from "@/types";
import { initialLessons } from "@/data/lesson/lessons";

export function useAppState() {
  const [lessons, setLessons] = useState<Unit[]>(() => {
    const savedLessons = localStorage.getItem("police_english_lessons");
    if (savedLessons) {
      try {
        const parsed = JSON.parse(savedLessons) as Unit[];
        if (parsed.length < initialLessons.length) {
          const combined = [...initialLessons];
          parsed.forEach((savedUnit) => {
            const index = combined.findIndex((u) => u.id === savedUnit.id);
            if (index !== -1) combined[index] = savedUnit;
          });
          return combined;
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved lessons", e);
      }
    }
    return initialLessons;
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("police_english_progress");
    return saved ? JSON.parse(saved) : { completedUnits: [], scores: {} };
  });

  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>(() => {
    const saved = localStorage.getItem("police_english_flagged");
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyTasks, setDailyTasks] = useState<DailyTask>(() => {
    const getTodayKey = () => new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("police_english_daily");

    const defaultTasks = [
      {
        id: "vocab",
        label: "Ôn 5 từ vựng ngẫu nhiên",
        description:
          "Vào phần Flashcard của bất kỳ bài nào và đánh dấu 'Đã thuộc' ít nhất 5 từ.",
        navigatePath: "/flashcards/1",
        completed: false,
        current: 0,
        target: 5,
      },
      {
        id: "test",
        label: "Hoàn thành 1 bài test nhanh",
        description: "Làm 1 bài kiểm tra tổng hợp để củng cố kiến thức đã học.",
        navigatePath: "/quicktest",
        completed: false,
        current: 0,
        target: 1,
      },
      {
        id: "speak",
        label: "Luyện nói 3 câu mẫu",
        description:
          "Bấm vào biểu tượng loa để nghe và luyện phát âm ít nhất 3 mẫu câu.",
        navigatePath: "/lesson/1",
        completed: false,
        current: 0,
        target: 3,
      },
    ];

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DailyTask;
        if (parsed.date === getTodayKey()) {
          const enrichedTasks = parsed.tasks.map((task) => {
            const def = defaultTasks.find((d) => d.id === task.id);
            return {
              ...task,
              description: task.description || def?.description,
              navigatePath: task.navigatePath || def?.navigatePath,
            };
          });
          return { ...parsed, tasks: enrichedTasks };
        }
      } catch (e) {
        console.error("Failed to parse daily tasks", e);
      }
    }
    return { date: getTodayKey(), tasks: defaultTasks };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("police_english_progress", JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem("police_english_lessons", JSON.stringify(lessons));
  }, [lessons]);
  useEffect(() => {
    localStorage.setItem(
      "police_english_flagged",
      JSON.stringify(flaggedItems),
    );
  }, [flaggedItems]);
  useEffect(() => {
    localStorage.setItem("police_english_daily", JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const updateDailyTask = useCallback(
    (taskId: string, increment: number = 1) => {
      setDailyTasks((prev) => {
        const newTasks = prev.tasks.map((t) => {
          if (t.id === taskId) {
            const newCurrent = Math.min(t.target, t.current + increment);
            return {
              ...t,
              current: newCurrent,
              completed: newCurrent >= t.target,
            };
          }
          return t;
        });
        return { ...prev, tasks: newTasks };
      });
    },
    [],
  );

  const toggleFlag = useCallback((item: FlaggedItem) => {
    setFlaggedItems((prev) => {
      const exists = prev.find(
        (f) =>
          f.unitId === item.unitId &&
          f.type === item.type &&
          f.key === item.key,
      );
      if (exists) {
        return prev.filter(
          (f) =>
            !(
              f.unitId === item.unitId &&
              f.type === item.type &&
              f.key === item.key
            ),
        );
      }
      return [...prev, item];
    });
  }, []);

  return {
    lessons,
    setLessons,
    progress,
    setProgress,
    flaggedItems,
    setFlaggedItems,
    dailyTasks,
    updateDailyTask,
    toggleFlag,
  };
}
