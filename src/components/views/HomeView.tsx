import React from 'react';
import type { Unit, UserProgress } from '../../types';

interface HomeViewProps {
  lessons: Unit[];
  progress: UserProgress;
  onSelectUnit: (unit: Unit) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ lessons, progress, onSelectUnit }) => {
  return (
    <div className="view-home">
      <div className="hero-section card">
        <div className="asymmetry-label">OPS</div>
        <h2>Current Operations</h2>
        <p>Select a mission to begin your specialized English training.</p>
        <div className="stats-row">
          <div className="stat">
            <label>Completed</label>
            <span>{progress.completedUnits.length} Units</span>
          </div>
          <div className="stat">
            <label>Status</label>
            <span className="status-active">ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid cols-1 lesson-list">
        {lessons.map(unit => (
          <div key={unit.id} className="card lesson-card" onClick={() => onSelectUnit(unit)}>
            <div className="lesson-header">
              <h3>Week {unit.id}: {unit.title}</h3>
              <span className="unit-tag">LVL {unit.id}</span>
            </div>
            <p>{unit.description}</p>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: progress.completedUnits.includes(unit.id) ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
