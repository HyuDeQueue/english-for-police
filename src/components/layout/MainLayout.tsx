import React, { useState, useEffect } from "react";
import {
  Shield,
  ArrowUp,
  ChevronDown,
  LogOut,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AuthDialogs } from "@/components/auth/AuthDialogs";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/models/user.model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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

  const initials = (user?.fullName ?? "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

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
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="h-10 px-3 rounded-md bg-white text-primary border border-white/20 shadow-sm hover:bg-white/90 transition-all gap-2 group"
                >
                  <div className="h-7 w-7 rounded-md bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm transition-transform">
                    {initials}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-primary truncate max-w-40">
                      {user.fullName}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-1.5 bg-white border-border shadow-lg rounded-lg animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-3 py-3 flex items-center gap-3 bg-muted/30 rounded-md mb-1.5">
                  <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-base font-bold text-white shadow-sm">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-1.5" />

                <div className="space-y-0.5">
                  {user.role === UserRole.ADMIN && (
                    <>
                      <div className="px-3 py-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          Quản trị viên
                        </span>
                      </div>
                      <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent transition-colors group"
                        onClick={() => navigate("/admin/units")}
                      >
                        <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-foreground">
                          Tiến độ chương trình
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1.5" />
                    </>
                  )}

                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive transition-colors group"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Đăng xuất</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
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
          )}
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
