'use client';

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LoadingSpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'default' | 'lg';
  'data-testid'?: string;
};

export const LoadingSpinner = ({
  size = 'default',
  className,
  'data-testid': dataTestId,
  ...props
}: LoadingSpinnerProps) => {
  const sizeClasses: Record<'sm' | 'default' | 'lg', string> = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      data-testid={dataTestId ?? 'loading-spinner'}
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-green-600',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
};
