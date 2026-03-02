import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { AdvertisementPlacement } from '../backend';
import { useGetAdsByPlacement } from '../hooks/useQueries';

interface AdBannerProps {
  placement: AdvertisementPlacement;
  className?: string;
}

export default function AdBanner({ placement, className = '' }: AdBannerProps) {
  const { data: ads, isLoading } = useGetAdsByPlacement(placement);
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || dismissed || !ads || ads.length === 0) {
    return null;
  }

  const ad = ads[0];

  return (
    <div
      className={`relative w-full rounded-lg border border-border bg-muted/40 overflow-hidden shadow-sm ${className}`}
      role="complementary"
      aria-label="Advertisement"
    >
      {/* Advertisement label */}
      <div className="absolute top-2 left-2 z-10">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border">
          Advertisement
        </span>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        aria-label="Dismiss advertisement"
      >
        <X className="w-3 h-3" />
      </button>

      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 pt-8 group hover:bg-muted/60 transition-colors"
      >
        {/* Ad image */}
        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted border border-border">
          <img
            src={ad.image.getDirectURL()}
            alt={ad.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Ad content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
            {ad.title}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{ad.linkUrl}</p>
        </div>

        {/* External link icon */}
        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
      </a>
    </div>
  );
}
