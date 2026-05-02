import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PracticeSidebarProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
  footer?: React.ReactNode;
}

export const PracticeSidebar: React.FC<PracticeSidebarProps> = ({
  title,
  description,
  children,
  icon = <Brain className="h-4 w-4 text-primary" />,
  progress,
  footer,
}) => {
  return (
    <aside className="w-full lg:w-[400px] space-y-6 shrink-0 lg:sticky lg:top-24">
      <Card className="police-shadow border-none overflow-hidden">
        <CardHeader className="bg-muted/50 border-b p-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {description && (
            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3">
              "{description}"
            </p>
          )}

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>{progress.label || "Tiến độ"}</span>
                <span>
                  {progress.current}/{progress.total}
                </span>
              </div>
              <Progress
                value={(progress.current / progress.total) * 100}
                className="h-2"
              />
            </div>
          )}

          <div className="space-y-4">{children}</div>

          {footer && <div className="pt-4 border-t space-y-3">{footer}</div>}
        </CardContent>
      </Card>
    </aside>
  );
};
