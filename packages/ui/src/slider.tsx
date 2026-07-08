'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';
import { cn } from './lib/utils';

const Slider = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    label?: string;
    showValue?: boolean;
    formatValue?: (value: number) => string;
  }
>(({ className, label, showValue, formatValue, ...props }, ref) => {
  const value = props.value || props.defaultValue || [0];
  const displayValue = formatValue ? formatValue(value[0] || 0) : value[0] || 0;

  return (
    <div className="w-full space-y-3">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
          {showValue && <span className="text-sm text-gray-500">{displayValue}</span>}
        </div>
      )}

      <SliderPrimitive.Root
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
