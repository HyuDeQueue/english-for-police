import type { ReactNode } from "react";

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageLayout({
  title,
  description,
  actions,
  children,
}: AdminPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8 space-y-8 animate-fade-in">
      <div className="rounded-lg border border-border bg-card p-6 md:p-8 police-shadow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">
              Bảng Điều Khiển Quản Trị
            </p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary uppercase">
              {title}
            </h1>
            {description ? (
              <p className="text-sm text-muted-foreground max-w-3xl">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="w-full lg:w-auto">{actions}</div> : null}
        </div>
      </div>

      {children}
    </div>
  );
}
