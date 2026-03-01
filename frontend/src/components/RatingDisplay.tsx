import type { Rating } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';
import { useGetRatingsForUser, useGetAverageRating } from '../hooks/useQueries';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  userId: Principal;
}

function StarRating({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${starSize} ${i <= score ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export { StarRating };

export default function RatingDisplay({ userId }: RatingDisplayProps) {
  const { data: ratings = [], isLoading: ratingsLoading } = useGetRatingsForUser(userId);
  const { data: avgRating = 0 } = useGetAverageRating(userId);

  if (ratingsLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <StarRating score={Math.round(avgRating)} size="md" />
        <span className="font-display font-bold text-lg text-foreground">
          {avgRating > 0 ? avgRating.toFixed(1) : '—'}
        </span>
        <span className="text-sm text-muted-foreground">
          ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
        </span>
      </div>

      {ratings.length > 0 && (
        <div className="space-y-3 mt-4">
          {ratings.slice(0, 5).map((rating, idx) => (
            <div key={idx} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <StarRating score={Number(rating.score)} />
                <span className="text-xs text-muted-foreground">
                  {new Date(Number(rating.timestamp) / 1_000_000).toLocaleDateString()}
                </span>
              </div>
              {rating.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">{rating.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
