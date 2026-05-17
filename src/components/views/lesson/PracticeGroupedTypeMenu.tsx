import { useState } from "react";
import { ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PRACTICE_MENU_GROUPS } from "./practice-menu-groups";

interface PracticeGroupedTypeMenuProps {
  /** Các dạng bài có nội dung trong phạm vi hiện tại. */
  availableLabels: Set<string>;
  onSelectType: (typeLabel: string) => void;
  variant?: "sidebar" | "dialog";
  /** Sidebar: hiện cả dạng chưa có nội dung (disabled). Dialog: chỉ dạng có sẵn. */
  showUnavailable?: boolean;
  emptyMessage?: string;
  unavailableHint?: (typeLabel: string) => string;
}

export function PracticeGroupedTypeMenu({
  availableLabels,
  onSelectType,
  variant = "sidebar",
  showUnavailable = false,
  emptyMessage = "Chưa có bài tập cho phần này.",
  unavailableHint,
}: PracticeGroupedTypeMenuProps) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const isDialog = variant === "dialog";

  const groupsToRender = PRACTICE_MENU_GROUPS.map((group) => {
    const types = showUnavailable
      ? group.typeLabels
      : group.typeLabels.filter((label) => availableLabels.has(label));
    return { ...group, types };
  }).filter((group) => group.types.length > 0);

  if (groupsToRender.length === 0) {
    return (
      <p
        className={cn(
          "italic text-muted-foreground",
          isDialog
            ? "px-2 py-6 text-center text-sm"
            : "px-2 py-1.5 text-[10px]",
        )}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("space-y-0.5", isDialog && "space-y-1")}>
      {groupsToRender.map((group) => {
        const isOpen = expandedGroupId === group.id;

        return (
          <div key={group.id} className="space-y-0.5">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "w-full justify-between font-semibold transition-all",
                isDialog
                  ? "h-11 rounded-lg px-4 text-sm text-foreground hover:bg-primary/5 hover:text-primary"
                  : "h-8 px-2 text-[11px] text-primary hover:text-primary",
              )}
              onClick={() =>
                setExpandedGroupId((prev) =>
                  prev === group.id ? null : group.id,
                )
              }
            >
              <span className="truncate">• {group.title}</span>
              <ChevronRight
                className={cn(
                  "shrink-0 transition-transform",
                  isDialog ? "h-4 w-4 text-muted-foreground" : "h-3.5 w-3.5",
                  isOpen && "rotate-90",
                )}
              />
            </Button>

            {isOpen ? (
              <div
                className={cn(
                  "space-y-0.5",
                  isDialog
                    ? "ml-3 border-l-2 border-muted pl-2"
                    : "ml-2 border-l-2 border-muted/80 pl-2",
                )}
              >
                {group.types.map((typeLabel) => {
                  const isAvailable = availableLabels.has(typeLabel);

                  const row = (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!isAvailable}
                      className={cn(
                        "w-full justify-between font-medium transition-all",
                        isDialog
                          ? "h-10 rounded-lg px-3 text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          : "h-8 px-2 text-[11px]",
                        isAvailable
                          ? "text-muted-foreground hover:text-primary"
                          : "cursor-not-allowed text-muted-foreground/30 line-through",
                      )}
                      onClick={() => isAvailable && onSelectType(typeLabel)}
                    >
                      <span className="truncate text-left">• {typeLabel}</span>
                      {!isAvailable ? (
                        <HelpCircle className="h-3 w-3 shrink-0 opacity-40" />
                      ) : (
                        <ChevronRight
                          className={cn(
                            "shrink-0 opacity-60",
                            isDialog ? "h-3.5 w-3.5" : "h-3 w-3",
                          )}
                        />
                      )}
                    </Button>
                  );

                  if (!isAvailable && unavailableHint) {
                    return (
                      <Tooltip key={typeLabel} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="w-full">{row}</div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="text-[10px] font-medium">
                            {unavailableHint(typeLabel)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <div key={typeLabel} className="w-full">
                      {row}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
