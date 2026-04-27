import { Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  selectedUnitId?: number;
  onLogoClick: () => void;
  onOpenSidebar?: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  onLogoClick,
  onOpenSidebar,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full glass border-b primary-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group transition-transform active:scale-95"
            onClick={onLogoClick}
          >
            <h1 className="text-lg font-heading font-bold tracking-tight text-white group-hover:text-secondary transition-colors flex items-center gap-2">
              TIẾNG ANH
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Shield className="h-5 w-5 text-secondary fill-secondary" />
              </div>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="font-bold bg-white text-primary hover:bg-white/90"
              onClick={onOpenSidebar}
              title="Mở bảng công cụ"
            >
              <Menu className="h-4 w-4 mr-1" />
              Công cụ
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
