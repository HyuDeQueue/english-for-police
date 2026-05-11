import React, { useState, useEffect } from "react";
import {
  ArrowUp,
  ChevronDown,
  LogOut,
  BarChart3,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthDialogs } from "@/components/auth/AuthDialogs";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/models/user.model";
import { OPEN_AUTH_LOGIN_EVENT } from "@/lib/auth-ui-events";
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
  onOpenMenu?: () => void;
  children: React.ReactNode;
  noPadding?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  onLogoClick,
  onOpenMenu,
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

  useEffect(() => {
    const openLoginFromLesson = () => {
      setAuthView("login");
      setAuthOpen(true);
    };
    window.addEventListener(OPEN_AUTH_LOGIN_EVENT, openLoginFromLesson);
    return () =>
      window.removeEventListener(OPEN_AUTH_LOGIN_EVENT, openLoginFromLesson);
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

  const joinDateLabel = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
    : "-";

  return (
    <div className="flex flex-col relative min-h-screen">
      <header className="sticky top-0 z-40 w-full h-16 border-b border-primary/20 primary-gradient shrink-0 flex items-center">
        <div className="px-4 flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/20 transition-colors"
              onClick={onOpenMenu}
            >
              <img
                src="https://zoox.com/assets/images/icons/menu.svg"
                className="h-5 w-5 invert"
                alt="Menu"
                onError={(e) => {
                  // Fallback to lucide icon if zoox icon fails
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement
                    ?.querySelector(".fallback-icon")
                    ?.classList.remove("hidden");
                }}
              />
              <span className="fallback-icon hidden">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="4" y1="18" x2="20" y2="18"></line>
                </svg>
              </span>
            </Button>

            <div
              className="flex items-center gap-2 cursor-pointer group transition-transform active:scale-95"
              onClick={onLogoClick}
            >
              <h1 className="text-lg font-heading font-bold tracking-tight text-white group-hover:text-secondary transition-colors flex items-center gap-2">
                <div className="bg-white/20 p-1 rounded-lg">
                  <img
                    src="/police.png"
                    alt="Police"
                    className="h-6 w-6 rounded-sm object-cover"
                  />
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

                <div className="mx-1.5 mb-1.5 rounded-md border border-border bg-background px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Ngày tham gia</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {joinDateLabel}
                  </p>
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
                      <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent transition-colors group"
                        onClick={() => navigate("/admin/lessons")}
                      >
                        <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-foreground">
                          Quản lý bài học
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
    </div>
  );
};
