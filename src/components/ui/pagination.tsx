import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button'; // [Kế thừa S1]

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationProps) => {
  return (
    <div className="flex items-center justify-between px-2 py-4 border-t">
      <p className="text-sm text-slate-500">
        Trang {currentPage} trên {totalPages}
      </p>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          Sau <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
