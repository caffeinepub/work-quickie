import { Link } from '@tanstack/react-router';
import type { JobListing } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Clock, Users, Edit, Trash2, Eye } from 'lucide-react';

interface JobListingCardProps {
  job: JobListing;
  mode?: 'browse' | 'poster' | 'seeker';
  onEdit?: (job: JobListing) => void;
  onDelete?: (job: JobListing) => void;
  onViewApplicants?: (job: JobListing) => void;
  applicantCount?: number;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FullTime: 'Full-Time',
  PartTime: 'Part-Time',
  ShortTerm: 'Short-Term',
  Artisan: 'Artisan',
};

const JOB_TYPE_COLORS: Record<string, string> = {
  FullTime: 'bg-primary/10 text-primary',
  PartTime: 'bg-blue-100 text-blue-700',
  ShortTerm: 'bg-amber-100 text-amber-700',
  Artisan: 'bg-purple-100 text-purple-700',
};

export default function JobListingCard({
  job,
  mode = 'browse',
  onEdit,
  onDelete,
  onViewApplicants,
  applicantCount,
}: JobListingCardProps) {
  const typeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType;
  const typeColor = JOB_TYPE_COLORS[job.jobType] || 'bg-secondary text-secondary-foreground';

  return (
    <div className="bg-card rounded-xl border border-border card-shadow hover:card-shadow-md transition-all p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            to="/jobs/$jobId"
            params={{ jobId: job.id.toString() }}
            className="font-display font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {job.title}
          </Link>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{job.location}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
          {!job.active && (
            <Badge variant="secondary" className="text-xs">Inactive</Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {job.location || 'Remote'}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          {Number(job.pay).toLocaleString()} / job
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date(Number(job.timestamp) / 1_000_000).toLocaleDateString()}
        </span>
        {applicantCount !== undefined && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md font-medium"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-md">
              +{job.requiredSkills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        {mode === 'browse' && (
          <Link to="/jobs/$jobId" params={{ jobId: job.id.toString() }} className="flex-1">
            <Button size="sm" className="w-full gradient-primary text-white border-0 hover:opacity-90">
              View & Apply
            </Button>
          </Link>
        )}
        {mode === 'poster' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onViewApplicants?.(job)}
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Applicants
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit?.(job)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete?.(job)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
        {mode === 'seeker' && (
          <Link to="/jobs/$jobId" params={{ jobId: job.id.toString() }} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
