import type { Application } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock, MessageSquare } from 'lucide-react';

interface ApplicationsListProps {
  applications: Application[];
  isLoading?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Accepted: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
};

export default function ApplicationsList({ applications, isLoading }: ApplicationsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No applications yet</p>
        <p className="text-sm mt-1">Browse jobs and apply to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app, idx) => (
        <div
          key={`${app.jobId}-${idx}`}
          className="bg-card rounded-lg border border-border p-4 flex items-start justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-sm text-foreground">Job #{app.jobId.toString()}</span>
            </div>
            {app.message && (
              <div className="flex items-start gap-1.5 mt-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground line-clamp-2">{app.message}</p>
              </div>
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[app.status] || 'bg-secondary text-secondary-foreground border-border'}`}
          >
            {app.status}
          </span>
        </div>
      ))}
    </div>
  );
}
