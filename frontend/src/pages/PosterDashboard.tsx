import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetPosterProfile,
  useSearchJobs,
  useUpdateJobListingStatus,
  useGetAverageRating,
} from '../hooks/useQueries';
import type { JobListing } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobListingCard from '../components/JobListingCard';
import RatingDisplay from '../components/RatingDisplay';
import AdBanner from '../components/AdBanner';
import { AdvertisementPlacement } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Plus, Briefcase, Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PosterDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;

  const { data: profile, isLoading: profileLoading } = useGetPosterProfile(principal);
  const { data: allJobs = [], isLoading: jobsLoading } = useSearchJobs({});
  const { data: avgRating = 0 } = useGetAverageRating(principal);
  const updateStatus = useUpdateJobListingStatus();

  const [jobToDeactivate, setJobToDeactivate] = useState<JobListing | null>(null);

  const myJobs = allJobs.filter(
    (job) => principal && job.postedBy.toString() === principal.toString()
  );

  const activeJobs = myJobs.filter((j) => j.active);
  const inactiveJobs = myJobs.filter((j) => !j.active);

  const handleDeactivate = async () => {
    if (!jobToDeactivate) return;
    try {
      await updateStatus.mutateAsync({ jobId: jobToDeactivate.id, active: false });
      toast.success('Job listing deactivated');
      setJobToDeactivate(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to deactivate job');
    }
  };

  const handleReactivate = async (job: JobListing) => {
    try {
      await updateStatus.mutateAsync({ jobId: job.id, active: true });
      toast.success('Job listing reactivated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reactivate job');
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">No poster profile found.</p>
        <Button onClick={() => navigate({ to: '/onboarding/poster' })}>Create Profile</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Ad Banner */}
      <AdBanner placement={AdvertisementPlacement.posterDashboard} className="mb-6" />

      {/* Profile Header */}
      <div className="bg-card rounded-xl border border-border card-shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-display font-bold text-xl shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-foreground">{profile.name}</h1>
                {profile.verified && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {avgRating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {avgRating.toFixed(1)}
                  </span>
                )}
              </div>
              {profile.companyName && (
                <p className="text-sm text-muted-foreground mt-0.5">{profile.companyName}</p>
              )}
              {profile.contactInfo && (
                <p className="text-xs text-muted-foreground mt-0.5">{profile.contactInfo}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => navigate({ to: '/poster/jobs/new' })}
              className="gradient-primary text-white border-0 hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Post Job
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: '/onboarding/poster' })}
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Jobs Posted', value: myJobs.length, icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Active Listings', value: activeJobs.length, icon: <CheckCircle className="w-4 h-4" /> },
          { label: 'Your Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '—', icon: <Star className="w-4 h-4" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center card-shadow">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-2xl text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Jobs ({activeJobs.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveJobs.length})</TabsTrigger>
          <TabsTrigger value="ratings">My Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No active job listings</p>
              <Button
                size="sm"
                className="mt-4 gradient-primary text-white border-0"
                onClick={() => navigate({ to: '/poster/jobs/new' })}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeJobs.map((job) => (
                <JobListingCard
                  key={job.id.toString()}
                  job={job}
                  mode="poster"
                  onEdit={(j) => navigate({ to: '/poster/jobs/$jobId/edit', params: { jobId: j.id.toString() } })}
                  onDelete={(j) => setJobToDeactivate(j)}
                  onViewApplicants={(j) => navigate({ to: '/poster/jobs/$jobId/applicants', params: { jobId: j.id.toString() } })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive">
          {inactiveJobs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">No inactive job listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inactiveJobs.map((job) => (
                <div key={job.id.toString()} className="relative">
                  <JobListingCard
                    job={job}
                    mode="poster"
                    onEdit={(j) => navigate({ to: '/poster/jobs/$jobId/edit', params: { jobId: j.id.toString() } })}
                    onDelete={() => {}}
                    onViewApplicants={(j) => navigate({ to: '/poster/jobs/$jobId/applicants', params: { jobId: j.id.toString() } })}
                  />
                  <div className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReactivate(job)}
                      disabled={updateStatus.isPending}
                      className="bg-background"
                    >
                      Reactivate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ratings">
          {principal && <RatingDisplay userId={principal} />}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!jobToDeactivate} onOpenChange={(open) => !open && setJobToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Job Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate "{jobToDeactivate?.title}" and remove it from the public job board.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
