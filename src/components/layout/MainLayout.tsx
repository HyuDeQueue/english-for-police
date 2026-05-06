import React, { useState, useEffect } from "react";
import { Shield, ArrowUp } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AuthDialogs } from "@/components/auth/AuthDialogs";

interface MainLayoutProps {
  selectedUnitId?: number;
  onLogoClick: () => void;
  children: React.ReactNode;
  noPadding?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  onLogoClick,
  children,
  noPadding = false,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const openLogin = () => {
    setAuthView("login");
    setAuthOpen(true);
  };

  const openRegister = () => {
    setAuthView("register");
    setAuthOpen(true);
  };

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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="default"
              className="h-11 px-5 text-base font-semibold text-white hover:bg-white/20 hover:text-white"
              onClick={openLogin}
            >
              Đăng nhập
            </Button>
            <Button
              variant="secondary"
              size="default"
              className="h-11 px-5 text-base font-semibold bg-white text-primary hover:bg-white/90"
              onClick={openRegister}
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </header>

      <div
        className={`flex-1 flex flex-col w-full ${noPadding ? "" : "px-6 py-8"}`}
      >
        {children}
      </div>

      <AuthDialogs
        isOpen={authOpen}
        onOpenChange={setAuthOpen}
        view={authView}
        setView={setAuthView}
      />

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
