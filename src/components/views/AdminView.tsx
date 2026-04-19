import React, { useState } from "react";
import type { Unit } from "../../types";

interface AdminViewProps {
  lessons: Unit[];
  onSave: (newLessons: Unit[]) => void;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  lessons,
  onSave,
  onBack,
}) => {
  const [json, setJson] = useState(JSON.stringify(lessons, null, 2));
  const [status, setStatus] = useState("");

  return (
    <div className="view-admin">
      <button className="back-btn" onClick={onBack}>
        ← THOÁT QUẢN TRỊ
      </button>
      <div className="card">
        <div className="asymmetry-label">ROOT</div>
        <h2>Quản Lý Tài Liệu Huấn Luyện</h2>
        <p>Sửa đổi các thông số nhiệm vụ thông qua việc nạp dữ liệu JSON.</p>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="admin-json"
        />
        <div className="admin-actions">
          <button
            className="primary-gradient"
            onClick={() => {
              try {
                onSave(JSON.parse(json));
                setStatus("DỮ LIỆU ĐÃ ĐƯỢC CẬP NHẬT THÀNH CÔNG.");
              } catch {
                setStatus("LỖI: DỮ LIỆU NHIỆM VỤ KHÔNG HỢP LỆ.");
              }
            }}
          >
            GHI ĐÈ DỮ LIỆU NHIỆM VỤ
          </button>
        </div>
        {status && (
          <p
            className={`status-msg ${status.includes("ERROR") ? "fail" : "success"}`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
};
