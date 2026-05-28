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
            'flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50',
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
