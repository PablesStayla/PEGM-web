'use client';

import { Button } from '@pranakaia/ui';
import { Flag, MoreVertical, ThumbsDown, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { StarRating } from './StarRating';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onNotHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  className?: string;
}

// Memoized to prevent re-renders in review lists
export const ReviewCard = memo(function ReviewCard({
  review,
  onHelpful,
  onNotHelpful,
  onReport,
  className,
}: ReviewCardProps) {
  const [userVote, setUserVote] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);

  const handleHelpful = useCallback(() => {
    if (userVote === 'helpful') {
      setUserVote(null);
    } else {
      setUserVote('helpful');
      onHelpful?.(review.id);
    }
  }, [userVote, onHelpful, review.id]);

  const handleNotHelpful = useCallback(() => {
    if (userVote === 'not-helpful') {
      setUserVote(null);
    } else {
      setUserVote('not-helpful');
      onNotHelpful?.(review.id);
    }
  }, [userVote, onNotHelpful, review.id]);

  // Memoize expensive calculations
  const displayImages = useMemo(
    () => (showAllImages ? review.images : review.images?.slice(0, 3)),
    [showAllImages, review.images],
  );
  const hasMoreImages = useMemo(() => (review.images?.length || 0) > 3, [review.images]);

  return (
    <div className={cn('border-b border-gray-200 py-6 last:border-b-0', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative h-10 w-10 rounded-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
            {review.userAvatar ? (
              <Image
                src={review.userAvatar}
                alt={review.userName}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              review.userName.charAt(0).toUpperCase()
            )}
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{review.userName}</h4>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  ✓ Compra verificada
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} size="sm" readonly />
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* More Options */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Review Title */}
      {review.title && <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>}

      {/* Review Content */}
      <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {displayImages?.map((image, index) => (
              <div
                key={index}
                className="relative h-20 w-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {hasMoreImages && !showAllImages && (
              <button
                onClick={() => setShowAllImages(true)}
                className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                +{(review.images?.length || 0) - 3}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">¿Te fue útil?</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpful}
            className={cn('gap-1', userVote === 'helpful' && 'text-green-600 bg-green-50')}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{review.helpful}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNotHelpful}
            className={cn('gap-1', userVote === 'not-helpful' && 'text-red-600 bg-red-50')}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{review.notHelpful}</span>
          </Button>
        </div>

        <button
          onClick={() => onReport?.(review.id)}
          className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          <Flag className="w-4 h-4" />
          Reportar
        </button>
      </div>
    </div>
  );
});
