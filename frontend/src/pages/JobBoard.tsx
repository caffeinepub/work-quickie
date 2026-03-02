import React, { useState, useMemo } from 'react';
import { useSearchJobs } from '../hooks/useQueries';
import JobFilters, { FilterState, DEFAULT_FILTERS } from '../components/JobFilters';
import JobListingCard from '../components/JobListingCard';
import AdBanner from '../components/AdBanner';
import type { JobFilter } from '../backend';
import { AdvertisementPlacement } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Briefcase, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function JobBoard() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const backendFilter = useMemo<JobFilter>(() => ({
    keyword: filters.keyword || undefined,
    skills: filters.skills.length > 0 ? filters.skills : undefined,
    location: filters.location || undefined,
    jobType: filters.jobType || undefined,
    minPay: filters.minPay > 0 ? BigInt(filters.minPay) : undefined,
    maxPay: filters.maxPay < 100000 ? BigInt(filters.maxPay) : undefined,
  }), [filters]);

  const { data: jobs = [], isLoading } = useSearchJobs(backendFilter);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters =
    !!filters.keyword ||
    filters.skills.length > 0 ||
    !!filters.location ||
    !!filters.jobType ||
    filters.minPay > 0 ||
    filters.maxPay < 100000;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Browse Jobs</h1>
          <p className="text-muted-foreground text-sm">
            {isLoading
              ? 'Loading...'
              : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} available`}
            {hasActiveFilters && !isLoading && ' (filtered)'}
          </p>
        </div>
        {/* Mobile filter button */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle>Filter Jobs</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <JobFilters
                filters={filters}
                onChange={(f) => { setFilters(f); setMobileFiltersOpen(false); }}
                onReset={() => { resetFilters(); setMobileFiltersOpen(false); }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Ad Banner */}
      <AdBanner placement={AdvertisementPlacement.jobBoard} className="mb-6" />

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24">
            <JobFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
          </div>
        </aside>

        {/* Job Listings */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-25" />
              <p className="font-display font-semibold text-lg text-foreground mb-1">No jobs found</p>
              <p className="text-sm mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'No job listings are available right now. Check back soon!'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobListingCard key={job.id.toString()} job={job} mode="browse" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
