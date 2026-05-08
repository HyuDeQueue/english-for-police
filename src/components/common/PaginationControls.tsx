import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  currentItemsCount: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  currentItemsCount,
  onPrevPage,
  onNextPage,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">
        Trang {currentPage}/{totalPages} - Hiển thị {currentItemsCount} mục
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={onPrevPage}
          disabled={currentPage === 1}
        >
          Trước
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
