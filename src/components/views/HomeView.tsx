import React from "react";
import type { Unit, UserProgress } from "../../types";

interface HomeViewProps {
  lessons: Unit[];
  progress: UserProgress;
  onSelectUnit: (unit: Unit) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lessons,
  progress,
  onSelectUnit,
}) => {
  return (
    <div className="view-home">
      <div className="hero-section card">
        <div className="asymmetry-label">OPS</div>
        <h2>Nhiệm Vụ Huấn Luyện</h2>
        <p>Chọn một bài học để bắt đầu rèn luyện tiếng Anh chuyên ngành.</p>
        <div className="stats-row">
          <div className="stat">
            <label>Đã Hoàn Thành</label>
            <span>{progress.completedUnits.length} Bài</span>
          </div>
          <div className="stat">
            <label>Trạng Thái</label>
            <span className="status-active">ĐANG HOẠT ĐỘNG</span>
          </div>
        </div>
      </div>

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
                  width: progress.completedUnits.includes(unit.id)
                    ? "100%"
                    : "0%",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
