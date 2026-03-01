import { useState } from 'react';
import AdminGuard from '../components/AdminGuard';
import {
  useAdminGetAnalytics,
  useAdminListSeekers,
  useAdminListPosters,
  useAdminListJobListings,
  useAdminApproveJob,
  useAdminRemoveJob,
  useAdminVerifyPoster,
} from '../hooks/useQueries';
import type { JobListing, SeekerProfile, PosterProfile } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Shield,
  Users,
  Briefcase,
  BarChart3,
  Star,
  Search,
  CheckCircle,
  XCircle,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const JOB_TYPE_LABELS: Record<string, string> = {
  fullTime: 'Full-Time',
  partTime: 'Part-Time',
  nysc: 'NYSC (Youth Corps)',
  artisan: 'Artisan',
  shortTerm: 'Short-Term',
};

function AnalyticsCards() {
  const { data: analytics, isLoading } = useAdminGetAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const cards = [
    { label: 'Total Seekers', value: analytics.totalSeekers.toString(), icon: <Users className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Total Posters', value: analytics.totalPosters.toString(), icon: <Briefcase className="w-5 h-5" />, color: 'text-amber-600' },
    { label: 'Total Jobs', value: analytics.totalJobs.toString(), icon: <BarChart3 className="w-5 h-5" />, color: 'text-blue-600' },
    { label: 'Applications', value: analytics.totalApplications.toString(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-600' },
    { label: 'Avg Rating', value: analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : '—', icon: <Star className="w-5 h-5" />, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-card rounded-xl border border-border card-shadow p-4 text-center">
          <div className={`flex items-center justify-center mb-2 ${card.color}`}>{card.icon}</div>
          <div className="font-display font-bold text-2xl text-foreground">{card.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

function JobsTable() {
  const { data: jobs = [], isLoading } = useAdminListJobListings();
  const approveJob = useAdminApproveJob();
  const removeJob = useAdminRemoveJob();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [jobToRemove, setJobToRemove] = useState<JobListing | null>(null);

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleApprove = async (job: JobListing) => {
    try {
      await approveJob.mutateAsync(job.id);
      toast.success('Job listing approved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve job');
    }
  };

  const handleRemove = async () => {
    if (!jobToRemove) return;
    try {
      await removeJob.mutateAsync(jobToRemove.id);
      toast.success('Job listing removed');
      setJobToRemove(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove job');
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} jobs</span>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((job) => (
                <TableRow key={job.id.toString()}>
                  <TableCell className="font-medium max-w-[200px] truncate">{job.title}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-md">
                      {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{job.location || '—'}</TableCell>
                  <TableCell className="text-sm">${Number(job.pay).toLocaleString()}</TableCell>
                  <TableCell>
                    {job.active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!job.active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(job)}
                          disabled={approveJob.isPending}
                          className="text-green-600 hover:text-green-700 h-7 px-2"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {job.active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setJobToRemove(job)}
                          className="text-destructive hover:text-destructive h-7 px-2"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <AlertDialog open={!!jobToRemove} onOpenChange={(open) => !open && setJobToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Job Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate "{jobToRemove?.title}" and remove it from the public job board.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SeekersTable() {
  const { data: seekers = [], isLoading } = useAdminListSeekers();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = seekers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.skills.some((sk) => sk.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search seekers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} seekers</span>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Portfolio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No seekers found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((seeker) => (
                <TableRow key={seeker.id.toString()}>
                  <TableCell className="font-medium">{seeker.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {seeker.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {seeker.skills.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{seeker.skills.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {seeker.available ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {seeker.portfolioUrl ? (
                      <a
                        href={seeker.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function PostersTable() {
  const { data: posters = [], isLoading } = useAdminListPosters();
  const verifyPoster = useAdminVerifyPoster();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = posters.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleVerify = async (poster: PosterProfile) => {
    try {
      await verifyPoster.mutateAsync(poster.id);
      toast.success(`${poster.name} verified successfully`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to verify poster');
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posters..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} posters</span>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No posters found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((poster) => (
                <TableRow key={poster.id.toString()}>
                  <TableCell className="font-medium">{poster.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{poster.companyName || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{poster.contactInfo || '—'}</TableCell>
                  <TableCell>
                    {poster.verified ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!poster.verified && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVerify(poster)}
                        disabled={verifyPoster.isPending}
                        className="text-green-600 hover:text-green-700 h-7 px-2 text-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function AdminDashboardContent() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform management and analytics</p>
        </div>
      </div>

      <AnalyticsCards />

      <Tabs defaultValue="jobs">
        <TabsList className="mb-4">
          <TabsTrigger value="jobs">
            <Briefcase className="w-4 h-4 mr-1.5" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="seekers">
            <Users className="w-4 h-4 mr-1.5" />
            Seekers
          </TabsTrigger>
          <TabsTrigger value="posters">
            <UserCheck className="w-4 h-4 mr-1.5" />
            Posters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <JobsTable />
        </TabsContent>
        <TabsContent value="seekers">
          <SeekersTable />
        </TabsContent>
        <TabsContent value="posters">
          <PostersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
