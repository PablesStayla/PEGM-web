import { cn } from './lib/utils';

/**
 * Skeleton component for showing loading states with an animated pulse.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted/50', className)} {...props} />;
}

export { Skeleton };
