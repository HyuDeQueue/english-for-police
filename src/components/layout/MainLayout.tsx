import React from "react";

interface MainLayoutProps {
  selectedUnitId?: number;
  onLogoClick: () => void;
  showPracticeButtons?: boolean;
  onStartPractice?: () => void;
  onStartFlashcards?: () => void;
  onToggleSearch?: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  selectedUnitId,
  onLogoClick,
  showPracticeButtons,
  onStartPractice,
  onStartFlashcards,
  onToggleSearch,
  children,
}) => {
  return (
    <div className="app-container">
      <header className="primary-gradient glass compact-header">
        <div className="container header-content header-container">
          <div className="logo-section clickable" onClick={onLogoClick}>
            <span className="unit-label">
              BÀI-{selectedUnitId?.toString().padStart(2, "0") || "00"}
            </span>
            <h1>TIẾNG ANH CẢNH SÁT</h1>
          </div>

          <div className="header-actions">
            {showPracticeButtons && (
              <>
                <button
                  className="header-action-btn"
                  onClick={onStartFlashcards}
                >
                  📖 Ôn tập
                </button>
                <button
                  className="header-action-btn primary-gradient"
                  onClick={onStartPractice}
                >
                  ✍️ Kiểm tra
                </button>
              </>
            )}
            <button
              className="header-action-btn search-toggle"
              onClick={onToggleSearch}
              title="Tìm kiếm từ vựng"
            >
              🔍
            </button>
          </div>
        </div>
      </header>

      <main className="container">{children}</main>
    </div>
  );
};
