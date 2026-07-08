'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHalfFilled = starValue - 0.5 === displayRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={cn(
                'relative transition-all',
                !readonly && 'cursor-pointer hover:scale-110',
                readonly && 'cursor-default',
              )}
              aria-label={`Calificar ${starValue} ${starValue === 1 ? 'estrella' : 'estrellas'}`}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-gray-300 transition-colors',
                  !readonly && 'group-hover:text-yellow-400',
                )}
              />

              {/* Foreground star (filled) */}
              {(isFilled || isHalfFilled) && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'absolute inset-0 text-yellow-400 transition-colors',
                    hoverRating > 0 && 'text-yellow-500',
                  )}
                  fill="currentColor"
                  style={{
                    clipPath: isHalfFilled ? 'inset(0 50% 0 0)' : 'none',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-2 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
