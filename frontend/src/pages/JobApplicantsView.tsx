import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetJobListing,
  useGetApplicationsForJob,
  useUpdateApplicationStatus,
  useGetSeekerProfile,
  useGetAverageRating,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '../components/RatingDisplay';
import RatingForm from '../components/RatingForm';
import type { Application } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Accepted: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
};

function ApplicantCard({
  application,
  onAccept,
  onReject,
  isUpdating,
  posterId,
}: {
  application: Application;
  onAccept: () => void;
  onReject: () => void;
  isUpdating: boolean;
  posterId: Principal | null;
}) {
  const { data: seekerProfile } = useGetSeekerProfile(application.seekerId);
  const { data: avgRating = 0 } = useGetAverageRating(application.seekerId);
  const [showRatingForm, setShowRatingForm] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border card-shadow p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold shrink-0">
            {seekerProfile?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">
              {seekerProfile?.name || `Seeker ${application.seekerId.toString().slice(0, 8)}...`}
            </p>
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <StarRating score={Math.round(avgRating)} size="sm" />
                <span className="text-xs text-muted-foreground">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
            STATUS_STYLES[application.status] || 'bg-secondary text-secondary-foreground border-border'
          }`}
        >
          {application.status}
        </span>
      </div>

      {/* Seeker Skills */}
      {seekerProfile && seekerProfile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {seekerProfile.skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Message */}
      {application.message && (
        <div className="flex items-start gap-2 mb-3 p-3 bg-secondary/50 rounded-lg">
          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">{application.message}</p>
        </div>
      )}

      {/* Actions */}
      {application.status === 'Pending' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onAccept}
            disabled={isUpdating}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white border-0"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={isUpdating}
            className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Reject
          </Button>
        </div>
      )}

      {/* Rating for accepted applications */}
      {application.status === 'Accepted' && posterId && (
        <div className="mt-3 pt-3 border-t border-border">
          {showRatingForm ? (
            <RatingForm
              revieweeId={application.seekerId}
              revieweeName={seekerProfile?.name}
              onSuccess={() => setShowRatingForm(false)}
            />
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRatingForm(true)}
              className="w-full"
            >
              Rate this Applicant
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobApplicantsView() {
  const { jobId } = useParams({ from: '/poster/jobs/$jobId/applicants' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const jobIdBigInt = jobId ? BigInt(jobId) : null;

  const { data: job, isLoading: jobLoading } = useGetJobListing(jobIdBigInt);
  const { data: applications = [], isLoading: appsLoading } = useGetApplicationsForJob(jobIdBigInt);
  const updateStatus = useUpdateApplicationStatus();

  const handleUpdateStatus = async (application: Application, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        jobId: application.jobId,
        seekerId: application.seekerId,
        newStatus,
      });
      toast.success(`Application ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update application status');
    }
  };

  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'Accepted').length;

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/poster/dashboard' })}
        className="-ml-2 mb-4 text-muted-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </Button>

      {/* Job Info */}
      {job && (
        <div className="bg-card rounded-xl border border-border card-shadow p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">{job.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{job.location}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-border text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{applications.length} total applicant{applications.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600">
              <Clock className="w-4 h-4" />
              <span>{pendingCount} pending</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>{acceptedCount} accepted</span>
            </div>
          </div>
        </div>
      )}

      {/* Applicants */}
      <h2 className="font-display font-semibold text-foreground mb-4">
        Applicants ({applications.length})
      </h2>

      {appsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-display font-semibold text-foreground mb-1">No applicants yet</p>
          <p className="text-sm">Share your job listing to attract candidates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, idx) => (
            <ApplicantCard
              key={`${app.seekerId.toString()}-${idx}`}
              application={app}
              onAccept={() => handleUpdateStatus(app, 'Accepted')}
              onReject={() => handleUpdateStatus(app, 'Rejected')}
              isUpdating={updateStatus.isPending}
              posterId={identity?.getPrincipal() ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
