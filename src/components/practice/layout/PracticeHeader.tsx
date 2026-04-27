import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface PracticeHeaderProps {
  onBack: () => void;
  children?: React.ReactNode;
  backLabel?: string;
}

export const PracticeHeader: React.FC<PracticeHeaderProps> = ({
  onBack,
  children,
  backLabel = "QUAY LẠI",
}) => {
  return (
    <div className="flex justify-between items-center px-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="group text-primary font-bold"
      >
        <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {backLabel}
      </Button>

      <div className="flex gap-2">{children}</div>
    </div>
  );
};
