import React, { useState } from 'react';
import type { Unit } from '../../types';

interface AdminViewProps {
  lessons: Unit[];
  onSave: (newLessons: Unit[]) => void;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ lessons, onSave, onBack }) => {
  const [json, setJson] = useState(JSON.stringify(lessons, null, 2));
  const [status, setStatus] = useState('');

  return (
    <div className="view-admin">
      <button className="back-btn" onClick={onBack}>← EXIT ADMIN</button>
      <div className="card">
        <div className="asymmetry-label">ROOT</div>
        <h2>Intelligence Management</h2>
        <p>Modify the mission parameters via JSON injection.</p>
        <textarea 
          value={json} 
          onChange={(e) => setJson(e.target.value)}
          className="admin-json"
        />
        <div className="admin-actions">
          <button className="primary-gradient" onClick={() => {
            try {
              onSave(JSON.parse(json));
              setStatus('INTEL UPDATED SUCCESSFULLY.');
            } catch {
              setStatus('ERROR: INVALID MISSION DATA.');
            }
          }}>OVERWRITE MISSION DATA</button>
        </div>
        {status && <p className={`status-msg ${status.includes('ERROR') ? 'fail' : 'success'}`}>{status}</p>}
      </div>
    </div>
  );
};
