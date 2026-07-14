import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFilterProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
}

export const SelectFilter = React.forwardRef<HTMLSelectElement, SelectFilterProps>(
  ({ className, options, label, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5">
        {label && <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 [&>option]:bg-background [&>option]:text-foreground',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
SelectFilter.displayName = 'SelectFilter';
