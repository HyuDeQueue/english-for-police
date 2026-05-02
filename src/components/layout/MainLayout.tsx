import React, { useState, useEffect } from "react";
import { Shield, ArrowUp } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  selectedUnitId?: number;
  onLogoClick: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  onLogoClick,
  children,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <SidebarInset className="flex flex-col relative">
      <header className="sticky top-0 z-40 w-full h-16 border-b border-primary/20 primary-gradient shrink-0 flex items-center">
        <div className="px-4 flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-10 w-10 text-white hover:bg-white/20 transition-colors" />

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
          </div>
        </div>
      </header>

      <div className="w-full max-w-[1600px] mx-auto px-6 py-8">
        {children}
      </div>

      {/* Scroll to Top Button */}
      <Button
        variant="secondary"
        size="icon"
        className={`fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-2xl transition-all duration-300 z-50 border-2 border-primary/20 hover:scale-110 active:scale-95 ${
          showScrollTop 
            ? "translate-y-0 opacity-100 visible" 
            : "translate-y-16 opacity-0 invisible"
        }`}
        onClick={scrollToTop}
      >
        <ArrowUp className="h-6 w-6 text-primary" />
      </Button>
    </SidebarInset>
  );
};
