'use client';

import { Button } from '@pranakaia/ui';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface SortableHeaderProps {
  field: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader({ field, children, className }: SortableHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams?.get('sortBy');
  const currentOrder = searchParams?.get('sortOrder') || 'desc';

  const isActive = currentSort === field;

  const handleSort = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('sortBy', field);
    params.set('sortOrder', isActive && currentOrder === 'asc' ? 'desc' : 'asc');
    params.set('page', '1'); // Reset to first page on sort change
    router.push(`${pathname ?? '/'}?${params.toString()}`);
  }, [field, isActive, currentOrder, searchParams, pathname, router]);

  const Icon = isActive ? (currentOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`-ml-3 h-8 gap-1 font-semibold ${className || ''}`}
      onClick={handleSort}
    >
      {children}
      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
    </Button>
  );
}
