import React, { useState, useMemo } from "react";
import type { Unit } from "../../types";

interface SearchSidebarProps {
  lessons: Unit[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUnit: (unit: Unit) => void;
}

interface SearchResult {
  unitId: number;
  unitTitle: string;
  type: "vocabulary" | "phrase";
  primary: string;
  secondary: string;
  unit: Unit;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  lessons,
  isOpen,
  onClose,
  onNavigateToUnit,
}) => {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    for (const unit of lessons) {
      for (const v of unit.vocabulary) {
        if (
          v.word.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q)
        ) {
          matches.push({
            unitId: unit.id,
            unitTitle: unit.title,
            type: "vocabulary",
            primary: v.word,
            secondary: v.meaning,
            unit,
          });
        }
      }
      for (const p of unit.phrases) {
        if (
          p.text.toLowerCase().includes(q) ||
          p.translation.toLowerCase().includes(q)
        ) {
          matches.push({
            unitId: unit.id,
            unitTitle: unit.title,
            type: "phrase",
            primary: p.text,
            secondary: p.translation,
            unit,
          });
        }
      }
    }
    return matches.slice(0, 20);
  }, [query, lessons]);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`search-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>🔍 Tìm kiếm</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="Nhập từ vựng hoặc mẫu câu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={isOpen}
        />
        <div className="sidebar-results">
          {query.trim().length >= 2 && results.length === 0 && (
            <p className="no-results">Không tìm thấy kết quả.</p>
          )}
          {results.map((r, i) => (
            <div
              key={i}
              className="search-result-item"
              onClick={() => {
                onNavigateToUnit(r.unit);
                onClose();
              }}
            >
              <span className="result-type-badge">
                {r.type === "vocabulary" ? "Từ vựng" : "Mẫu câu"}
              </span>
              <div className="result-primary">{r.primary}</div>
              <div className="result-secondary">{r.secondary}</div>
              <div className="result-unit">Tuần {r.unitId}</div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
