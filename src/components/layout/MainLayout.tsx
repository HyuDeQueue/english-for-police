import React from "react";

interface MainLayoutProps {
  selectedUnitId?: number;
  onLogoClick: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  selectedUnitId,
  onLogoClick,
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
        </div>
      </header>

      <main className="container">{children}</main>
    </div>
  );
};
