'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';
import { cn } from './lib/utils';

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    label?: string;
    showValue?: boolean;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'error';
  }
>(
  (
    { className, value, label, showValue, size = 'default', variant = 'default', ...props },
    ref,
  ) => {
    const sizeClasses = {
      sm: 'h-2',
      default: 'h-4',
      lg: 'h-6',
    };

    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
            {showValue && <span className="text-sm text-gray-500">{value}%</span>}
          </div>
        )}

        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative overflow-hidden rounded-full bg-secondary',
            sizeClasses[size],
            className,
          )}
          value={value}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn('h-full w-full flex-1 transition-all', variantClasses[variant])}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress };
