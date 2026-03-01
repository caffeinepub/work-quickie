import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetJobListing,
  useGetPosterProfile,
  useApplyToJob,
  useGetMyApplications,
  useGetCallerUserProfile,
  useGetAverageRating,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '../components/RatingDisplay';
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  ArrowLeft,
  Building2,
  CheckCircle,
  Send,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const JOB_TYPE_LABELS: Record<string, string> = {
  fullTime: 'Full-Time',
  partTime: 'Part-Time',
  nysc: 'NYSC (Youth Corps)',
  artisan: 'Artisan',
  shortTerm: 'Short-Term',
};

const JOB_TYPE_COLORS: Record<string, string> = {
  fullTime: 'bg-primary/10 text-primary',
  partTime: 'bg-blue-100 text-blue-700',
  nysc: 'bg-amber-100 text-amber-700',
  artisan: 'bg-purple-100 text-purple-700',
  shortTerm: 'bg-amber-100 text-amber-700',
};

export default function JobDetailPage() {
  const { jobId } = useParams({ from: '/jobs/$jobId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const jobIdBigInt = jobId ? BigInt(jobId) : null;

  const { data: job, isLoading: jobLoading } = useGetJobListing(jobIdBigInt);
  const { data: posterProfile } = useGetPosterProfile(job?.postedBy ?? null);
  const { data: posterRating = 0 } = useGetAverageRating(job?.postedBy ?? null);
  const { data: myApplications = [] } = useGetMyApplications();
  const { data: userProfile } = useGetCallerUserProfile();
  const applyToJob = useApplyToJob();

  const [message, setMessage] = useState('');
  const [applied, setApplied] = useState(false);

  const isSeeker = userProfile?.role === 'seeker';
  const isPoster = userProfile?.role === 'poster';
  const isMyJob = job && identity && job.postedBy.toString() === identity.getPrincipal().toString();

  const alreadyApplied =
    applied ||
    myApplications.some((app) => app.jobId.toString() === jobId);

  const handleApply = async () => {
    if (!job) return;
    try {
      await applyToJob.mutateAsync({ jobId: job.id, message });
      setApplied(true);
      toast.success('Application submitted successfully!');
      setMessage('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application');
    }
  };

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">This job listing may have been removed.</p>
        <Button variant="outline" onClick={() => navigate({ to: '/jobs' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  const typeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType;
  const typeColor = JOB_TYPE_COLORS[job.jobType] || 'bg-secondary text-secondary-foreground';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/jobs' })}
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Jobs
      </Button>

      {/* Job Header */}
      <div className="bg-card rounded-xl border border-border card-shadow p-6 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">{job.title}</h1>
            {posterProfile && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Building2 className="w-4 h-4" />
                <span>{posterProfile.companyName || posterProfile.name}</span>
                {posterRating > 0 && (
                  <span className="flex items-center gap-1 ml-2">
                    <StarRating score={Math.round(posterRating)} size="sm" />
                    <span className="text-xs">{posterRating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${typeColor}`}>
              {typeLabel}
            </span>
            {!job.active && (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            {job.location || 'Remote'}
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-primary" />
            ${Number(job.pay).toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            Posted {new Date(Number(job.timestamp) / 1_000_000).toLocaleDateString()}
          </span>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h2 className="font-display font-semibold text-foreground mb-2">Job Description</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Required Skills */}
        {job.requiredSkills.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-foreground mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Poster Info */}
      {posterProfile && (
        <div className="bg-card rounded-xl border border-border p-5 mb-4">
          <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            About the Employer
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
              {posterProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-foreground">{posterProfile.name}</p>
              {posterProfile.companyName && (
                <p className="text-sm text-muted-foreground">{posterProfile.companyName}</p>
              )}
              {posterProfile.contactInfo && (
                <p className="text-xs text-muted-foreground">{posterProfile.contactInfo}</p>
              )}
            </div>
            {posterProfile.verified && (
              <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Application Section */}
      {!job.active ? (
        <div className="bg-secondary/50 rounded-xl border border-border p-5 text-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">This job listing is no longer active.</p>
        </div>
      ) : isMyJob ? (
        <div className="bg-secondary/50 rounded-xl border border-border p-5 text-center text-muted-foreground">
          <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">This is your job listing.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate({ to: '/poster/jobs/$jobId/applicants', params: { jobId: jobId } })}
          >
            View Applicants
          </Button>
        </div>
      ) : isPoster ? (
        <div className="bg-secondary/50 rounded-xl border border-border p-5 text-center text-muted-foreground">
          <p className="text-sm">Only job seekers can apply to listings.</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <h2 className="font-display font-semibold text-foreground mb-2">Interested in this job?</h2>
          <p className="text-muted-foreground text-sm mb-4">Sign in to apply for this position.</p>
          <Button
            onClick={() => navigate({ to: '/' })}
            className="gradient-primary text-white border-0 hover:opacity-90"
          >
            Sign In to Apply
          </Button>
        </div>
      ) : alreadyApplied ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="font-display font-semibold text-green-800">Application Submitted!</p>
          <p className="text-sm text-green-700 mt-1">
            You've already applied to this job. The employer will review your application.
          </p>
        </div>
      ) : isSeeker ? (
        <div className="bg-card rounded-xl border border-border card-shadow p-6">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Apply for this Position
          </h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="message">Cover Message (optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you're a great fit..."
                rows={4}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleApply}
              disabled={applyToJob.isPending}
              className="w-full gradient-primary text-white border-0 hover:opacity-90"
            >
              {applyToJob.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Application
                </span>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-5 text-center text-muted-foreground">
          <p className="text-sm">Complete your seeker profile to apply for jobs.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate({ to: '/onboarding/seeker' })}
          >
            Create Seeker Profile
          </Button>
        </div>
      )}
    </div>
  );
}
