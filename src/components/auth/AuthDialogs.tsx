import { useState, useEffect } from "react";
import { Shield, ArrowRight, Lock, Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

interface AuthDialogsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  view: "login" | "register";
  setView: (view: "login" | "register") => void;
}

export function AuthDialogs({
  isOpen,
  onOpenChange,
  view,
  setView,
}: AuthDialogsProps) {
  const { login, register, isLoading, setError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen, view, setError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch {
      // Error notification is handled inside hook.
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ email, fullName, dateOfBirth: dob, password });
      setView("login");
      setError(null);
      setFullName("");
      setDob("");
    } catch {
      // Error notification is handled inside hook.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 border-none overflow-hidden glass police-shadow">
        {view === "login" ? (
          <form onSubmit={handleLogin}>
            <DialogHeader className="primary-gradient p-8 text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield className="h-24 w-24" />
              </div>
              <div className="space-y-1 relative z-10 text-left">
                <DialogTitle className="text-3xl font-heading font-black tracking-tight text-white">
                  Đăng nhập
                </DialogTitle>
                <p className="text-sm text-white/70 font-medium">
                  Vui lòng xác thực danh tính để truy cập hệ thống.
                </p>
              </div>
            </DialogHeader>

            <div className="p-8 space-y-6 bg-white/40">
              <div className="space-y-4">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors"
                  >
                    Email công vụ
                  </Label>
                  <div className="relative tactical-border">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@police.gov.vn"
                      required
                      className="border-none bg-transparent h-11 pl-7 pr-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="password"
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors"
                    >
                      Mật khẩu
                    </Label>
                    <button
                      type="button"
                      className="text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative tactical-border">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="border-none bg-transparent h-11 pl-7 pr-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 font-medium"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 primary-gradient text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang xác
                      thực...
                    </>
                  ) : (
                    <>
                      Truy cập hệ thống{" "}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/10" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-white/40 px-3 text-muted-foreground/60">
                    Hoặc
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => setView("register")}
                    className="text-primary font-bold hover:underline underline-offset-4"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <DialogHeader className="primary-gradient p-8 text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield className="h-24 w-24" />
              </div>
              <div className="space-y-1 relative z-10 text-left">
                <DialogTitle className="text-3xl font-heading font-black tracking-tight text-white">
                  Đăng ký
                </DialogTitle>
                <p className="text-sm text-white/70 font-medium">
                  Hoàn thành các thông tin bên dưới để khởi tạo tài khoản.
                </p>
              </div>
            </DialogHeader>

            <div className="p-8 space-y-6 bg-white/40 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="fullName"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
                  >
                    Họ và tên
                  </Label>
                  <div className="tactical-border">
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                      className="border-none bg-transparent h-11 px-0 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="dob"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
                  >
                    Ngày sinh
                  </Label>
                  <div className="tactical-border">
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="border-none bg-transparent h-11 px-0 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="registerEmail"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
                  >
                    Email công vụ
                  </Label>
                  <div className="tactical-border">
                    <Input
                      id="registerEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@police.gov.vn"
                      required
                      className="border-none bg-transparent h-11 px-0 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="registerPassword"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary"
                  >
                    Mật khẩu
                  </Label>
                  <div className="tactical-border">
                    <Input
                      id="registerPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      required
                      className="border-none bg-transparent h-11 px-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 primary-gradient text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      Hoàn tất đăng ký{" "}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Đã có hồ sơ?{" "}
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="text-primary font-bold hover:underline underline-offset-4"
                  >
                    Đăng nhập
                  </button>
                </p>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
