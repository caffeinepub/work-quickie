import { useState } from 'react';
import type { Principal } from '@icp-sdk/core/principal';
import { useSubmitRating } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

interface RatingFormProps {
  revieweeId: Principal;
  revieweeName?: string;
  onSuccess?: () => void;
}

export default function RatingForm({ revieweeId, revieweeName, onSuccess }: RatingFormProps) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const submitRating = useSubmitRating();

  const handleSubmit = async () => {
    if (score === 0) {
      toast.error('Please select a star rating');
      return;
    }
    try {
      await submitRating.mutateAsync({ revieweeId, score: BigInt(score), comment });
      toast.success('Rating submitted successfully!');
      setScore(0);
      setComment('');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit rating');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Rate {revieweeName || 'this user'}
      </h3>
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setScore(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                i <= (hovered || score)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
        {score > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][score]}
          </span>
        )}
      </div>
      <Textarea
        placeholder="Share your experience (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3 resize-none"
        rows={3}
      />
      <Button
        onClick={handleSubmit}
        disabled={submitRating.isPending || score === 0}
        size="sm"
        className="gradient-primary text-white border-0 hover:opacity-90"
      >
        {submitRating.isPending ? (
          <span className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-3.5 h-3.5" />
            Submit Rating
          </span>
        )}
      </Button>
    </div>
  );
}
