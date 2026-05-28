import * as React from 'react';
import { cn } from '@/lib/utils'; // [Kế thừa S1]

// Wrapper cho bảng
export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-md border border-slate-200">
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
);
Table.displayName = 'Table';

// Header của bảng
export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b bg-slate-50/50', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

// Dòng trong bảng (Row)
export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

// Ô trong bảng (Cell)
export const TableCell = React.forwardRef<
  HTMLTableDataCellElement,
  React.TdHTMLAttributes<HTMLTableDataCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

// Body của bảng
export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));

TableBody.displayName = 'TableBody';
