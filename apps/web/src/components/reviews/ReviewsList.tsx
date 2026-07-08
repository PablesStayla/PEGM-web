'use client';

import { Button } from '@pranakaia/ui';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { type Review, ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { StarRating } from './StarRating';

interface ReviewsListProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  canReview?: boolean;
  onSubmitReview: (data: Record<string, unknown>) => Promise<void>;
}

export function ReviewsList({
  productId,
  reviews,
  averageRating,
  totalReviews,
  canReview = false,
  onSubmitReview,
}: ReviewsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100,
  }));

  const filteredAndSortedReviews = reviews
    .filter((review) => !filterRating || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-linear-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              <div>
                <StarRating rating={averageRating} size="lg" readonly />
                <p className="text-sm text-gray-600 mt-1">Basado en {totalReviews} reseñas</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className="flex items-center gap-3 w-full group hover:bg-white/50 rounded px-2 py-1 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 w-12">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {canReview && !showForm && (
        <div className="text-center">
          <Button onClick={() => setShowForm(true)} size="lg" variant="default">
            Escribir una reseña
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSubmit={async (data) => {
            await onSubmitReview(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {filterRating
              ? `Mostrando reseñas de ${filterRating} estrellas`
              : `${filteredAndSortedReviews.length} reseñas`}
          </span>
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Limpiar filtro
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'recent' || v === 'helpful' || v === 'rating') {
              setSortBy(v);
            }
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="recent">Más recientes</option>
          <option value="helpful">Más útiles</option>
          <option value="rating">Mayor calificación</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedReviews.length > 0 ? (
          filteredAndSortedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {filterRating
                ? `No hay reseñas de ${filterRating} estrellas aún`
                : 'No hay reseñas aún. ¡Sé el primero en escribir una!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
