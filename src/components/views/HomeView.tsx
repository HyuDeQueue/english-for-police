import React, { useState, useEffect } from "react";
import type { Unit, UserProgress, FlaggedItem, DailyTask } from "../../types";

interface HomeViewProps {
  lessons: Unit[];
  progress: UserProgress;
  flaggedItems: FlaggedItem[];
  onSelectUnit: (unit: Unit) => void;
  onStartQuickTest: () => void;
}

const getTodayKey = () => new Date().toISOString().split("T")[0];

const generateDailyTasks = (): DailyTask => ({
  date: getTodayKey(),
  tasks: [
    { id: "vocab", label: "Ôn 5 từ vựng ngẫu nhiên", completed: false },
    { id: "test", label: "Hoàn thành 1 bài test nhanh", completed: false },
    { id: "speak", label: "Luyện nói 3 câu mẫu", completed: false },
  ],
});

export const HomeView: React.FC<HomeViewProps> = ({
  lessons,
  progress,
  flaggedItems,
  onSelectUnit,
  onStartQuickTest,
}) => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask>(() => {
    const saved = localStorage.getItem("police_english_daily");
    if (saved) {
      const parsed = JSON.parse(saved) as DailyTask;
      if (parsed.date === getTodayKey()) return parsed;
    }
    return generateDailyTasks();
  });

  useEffect(() => {
    localStorage.setItem("police_english_daily", JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const toggleDailyTask = (taskId: string) => {
    setDailyTasks((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const completedCount = dailyTasks.tasks.filter((t) => t.completed).length;
  const overallProgress =
    lessons.length > 0
      ? Math.round((progress.completedUnits.length / lessons.length) * 100)
      : 0;

  return (
    <div className="view-home">
      {/* Hero Section */}
      <div className="hero-section card">
        <div className="asymmetry-label">OPS</div>
        <h2>Luyện Tập</h2>
        <p>Chọn một bài học để bắt đầu rèn luyện tiếng Anh chuyên ngành.</p>
        <div className="progress-bar-container" style={{ marginTop: "1rem" }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="card daily-tasks-card">
        <h3>📋 Nhiệm vụ hôm nay</h3>
        <div className="daily-tasks-list">
          {dailyTasks.tasks.map((task) => (
            <label key={task.id} className={`daily-task-item ${task.completed ? "done" : ""}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleDailyTask(task.id)}
              />
              <span>{task.label}</span>
            </label>
          ))}
        </div>
        <div className="daily-progress">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${(completedCount / dailyTasks.tasks.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Flagged Items */}
      {flaggedItems.length > 0 && (
        <div className="card flagged-summary-card">
          <h3>🚩 Từ cần ôn lại ({flaggedItems.length})</h3>
          <div className="flagged-chips">
            {flaggedItems.slice(0, 8).map((item, i) => (
              <span key={i} className="flagged-chip">
                {item.key}
              </span>
            ))}
            {flaggedItems.length > 8 && (
              <span className="flagged-chip more">
                +{flaggedItems.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Test Button */}
      {progress.completedUnits.length > 0 && (
        <button className="quick-test-btn secondary" onClick={onStartQuickTest}>
          ⚡ Bài test nhanh — Ôn lại từ đã học
        </button>
      )}

      {/* Unit List */}
      <div className="grid cols-1 lesson-list">
        {lessons.map((unit) => (
          <div
            key={unit.id}
            className="card lesson-card"
            onClick={() => onSelectUnit(unit)}
          >
            <div className="lesson-header">
              <h3>
                Tuần {unit.id}: {unit.title}
              </h3>
              <span className="unit-tag">CẤP ĐỘ {unit.id}</span>
            </div>
            <p>{unit.description}</p>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: progress.completedUnits.includes(unit.id) ? "100%" : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
