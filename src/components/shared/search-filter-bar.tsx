'use client';

import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Search } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
  filterClassName?: string;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filterOptions,
  filterValue,
  onFilterChange,
  filterLabel,
  filterClassName,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {filterOptions && onFilterChange && (
        <SelectFilter
          label={filterLabel}
          options={filterOptions}
          value={filterValue ?? ''}
          onChange={(e) => onFilterChange(e.target.value)}
          className={filterClassName}
        />
      )}
    </div>
  );
}
