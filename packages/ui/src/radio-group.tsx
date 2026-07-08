import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import * as React from 'react';
import { Label } from './label';
import { cn } from './lib/utils';

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    error?: string;
  }
>(({ className, label, error, children, ...props }, ref) => {
  return (
    <div className="space-y-3">
      {label && (
        <Label className="text-sm font-medium leading-none">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref}>
        {children}
      </RadioGroupPrimitive.Root>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    label?: string;
    description?: string;
  }
>(({ className, label, description, id, ...props }, ref) => {
  const generatedId = React.useId();
  const itemId = id || generatedId;

  return (
    <div className="flex items-start space-x-3">
      <RadioGroupPrimitive.Item
        ref={ref}
        id={itemId}
        className={cn(
          'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator
          data-testid="radio-indicator"
          className="flex items-center justify-center"
        >
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>

      {(label || description) && (
        <div className="grid gap-1.5 leading-none">
          {label && (
            <Label htmlFor={itemId} className="cursor-pointer">
              {label}
            </Label>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
    </div>
  );
});

RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
