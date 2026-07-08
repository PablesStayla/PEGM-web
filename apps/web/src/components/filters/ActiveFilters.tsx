'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilters({ filters, onClearAll, className }: ActiveFiltersProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm font-medium text-gray-700">Filtros activos:</span>

      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={filter.onRemove}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors group"
        >
          <span>
            {filter.label}: {filter.value}
          </span>
          <X className="w-3.5 h-3.5 group-hover:text-primary-900" />
        </button>
      ))}

      <button
        onClick={onClearAll}
        className="text-sm font-medium text-gray-500 hover:text-gray-700 underline"
      >
        Limpiar todos
      </button>
    </div>
  );
}
