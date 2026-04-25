import { Search, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  selectedUnitId?: number;
  onLogoClick: () => void;
  showPracticeButtons?: boolean;
  onStartPractice?: () => void;
  onStartFlashcards?: () => void;
  onToggleSearch?: () => void;
  onToggleNotebook?: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  selectedUnitId,
  onLogoClick,
  showPracticeButtons,
  onStartPractice,
  onStartFlashcards,
  onToggleSearch,
  onToggleNotebook,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full glass border-b primary-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-95"
            onClick={onLogoClick}
          >
            <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold tracking-widest text-white/90">
              BÀI-{selectedUnitId?.toString().padStart(2, "0") || "00"}
            </span>
            <h1 className="text-lg font-heading font-bold tracking-tight text-white group-hover:text-secondary transition-colors">
              TIẾNG ANH CẢNH SÁT
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {showPracticeButtons && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={onStartFlashcards}
                >
                  Ôn tập
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={onStartPractice}
                >
                  Kiểm tra
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full"
              onClick={onToggleSearch}
              title="Tìm kiếm từ vựng"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full"
              onClick={onToggleNotebook}
              title="Mở Sổ tay cá nhân"
            >
              <BookMarked className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
};
