import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetSeekerProfile,
  useGetMyApplications,
  useGetMatchedJobs,
  useGetAverageRating,
  useGetRatingsForUser,
  useUpdateSeekerAvailability,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApplicationsList from '../components/ApplicationsList';
import JobListingCard from '../components/JobListingCard';
import RatingDisplay from '../components/RatingDisplay';
import { Edit, MapPin, Link as LinkIcon, Star, Briefcase, Zap, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SeekerDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;

  const { data: profile, isLoading: profileLoading } = useGetSeekerProfile(principal);
  const { data: applications = [], isLoading: appsLoading } = useGetMyApplications();
  const { data: matchedJobs = [], isLoading: jobsLoading } = useGetMatchedJobs(principal);
  const { data: avgRating = 0 } = useGetAverageRating(principal);
  const updateAvailability = useUpdateSeekerAvailability();

  const handleAvailabilityToggle = async () => {
    if (!profile) return;
    try {
      await updateAvailability.mutateAsync(!profile.available);
      toast.success(`Availability updated to ${!profile.available ? 'Available' : 'Unavailable'}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update availability');
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
        <p className="text-muted-foreground mb-4">No seeker profile found.</p>
        <Button onClick={() => navigate({ to: '/onboarding/seeker' })}>Create Profile</Button>
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'Accepted').length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="bg-card rounded-xl border border-border card-shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-white font-display font-bold text-xl shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-foreground">{profile.name}</h1>
                <Badge
                  className={profile.available
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-secondary text-muted-foreground border-border'
                  }
                >
                  {profile.available ? '✓ Available' : 'Unavailable'}
                </Badge>
                {avgRating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {avgRating.toFixed(1)}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">{profile.bio}</p>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  Portfolio
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAvailabilityToggle}
              disabled={updateAvailability.isPending}
            >
              {profile.available ? (
                <><XCircle className="w-3.5 h-3.5 mr-1.5" />Set Unavailable</>
              ) : (
                <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Set Available</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: '/onboarding/seeker' })}
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <span key={skill} className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Qualifications */}
        {profile.qualifications.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Qualifications</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.qualifications.map((q) => (
                <span key={q} className="px-2.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md">
                  {q}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Applications', value: applications.length, icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Pending', value: pendingCount, icon: <Zap className="w-4 h-4" /> },
          { label: 'Accepted', value: acceptedCount, icon: <CheckCircle className="w-4 h-4" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center card-shadow">
            <div className="flex items-center justify-center gap-1.5 text-primary mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-2xl text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="applications">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="recommended">Recommended Jobs</TabsTrigger>
          <TabsTrigger value="ratings">My Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <ApplicationsList applications={applications} isLoading={appsLoading} />
        </TabsContent>

        <TabsContent value="recommended">
          {profile.skills.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Add skills to see recommendations</p>
              <p className="text-sm mt-1">Update your profile with your skills to get matched jobs.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate({ to: '/onboarding/seeker' })}
              >
                Add Skills
              </Button>
            </div>
          ) : jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : matchedJobs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No matching jobs found</p>
              <p className="text-sm mt-1">Check back later as new jobs are posted.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedJobs.slice(0, 6).map((job) => (
                <JobListingCard key={job.id.toString()} job={job} mode="seeker" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ratings">
          {principal && <RatingDisplay userId={principal} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
