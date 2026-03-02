import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useAdminGetAnalytics,
  useAdminListSeekers,
  useAdminListPosters,
  useAdminListJobListings,
  useAdminApproveJobListing,
  useAdminRemoveJobListing,
  useAdminVerifyPoster,
  useGetAllAds,
  useCreateAd,
  useDeleteAd,
  useToggleAdActive,
} from '../hooks/useQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Briefcase,
  BarChart3,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Megaphone,
} from 'lucide-react';
import { AdvertisementPlacement, ExternalBlob } from '../backend';

const JOB_TYPE_LABELS: Record<string, string> = {
  fullTime: 'Full Time',
  partTime: 'Part Time',
  shortTerm: 'Short Term',
  artisan: 'Artisan',
  nysc: 'NYSC (Youth Corps)',
};

const PLACEMENT_LABELS: Record<AdvertisementPlacement, string> = {
  [AdvertisementPlacement.jobBoard]: 'Job Board',
  [AdvertisementPlacement.jobDetail]: 'Job Detail',
  [AdvertisementPlacement.seekerDashboard]: 'Seeker Dashboard',
  [AdvertisementPlacement.posterDashboard]: 'Poster Dashboard',
  [AdvertisementPlacement.landing]: 'Landing Page',
};

const ITEMS_PER_PAGE = 10;

interface CreateAdForm {
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: AdvertisementPlacement | '';
  expiresAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [seekerPage, setSeekerPage] = useState(1);
  const [posterPage, setPosterPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  const [adPage, setAdPage] = useState(1);
  const [showCreateAdDialog, setShowCreateAdDialog] = useState(false);
  const [createAdForm, setCreateAdForm] = useState<CreateAdForm>({
    title: '',
    imageUrl: '',
    linkUrl: '',
    placement: '',
    expiresAt: '',
  });
  const [createAdErrors, setCreateAdErrors] = useState<Partial<CreateAdForm>>({});

  const { data: analytics, isLoading: analyticsLoading } = useAdminGetAnalytics();
  const { data: seekers = [], isLoading: seekersLoading } = useAdminListSeekers();
  const { data: posters = [], isLoading: postersLoading } = useAdminListPosters();
  const { data: jobs = [], isLoading: jobsLoading } = useAdminListJobListings();
  const { data: allAds = [], isLoading: adsLoading } = useGetAllAds();

  const approveJob = useAdminApproveJobListing();
  const removeJob = useAdminRemoveJobListing();
  const verifyPoster = useAdminVerifyPoster();
  const createAd = useCreateAd();
  const deleteAd = useDeleteAd();
  const toggleAdActive = useToggleAdActive();

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You must be logged in as an administrator to access this page.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>Go Home</Button>
        </Card>
      </div>
    );
  }

  // Pagination helpers
  const paginate = <T,>(arr: T[], page: number) =>
    arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalPages = (arr: unknown[]) => Math.ceil(arr.length / ITEMS_PER_PAGE);

  const validateCreateAdForm = (): boolean => {
    const errors: Partial<CreateAdForm> = {};
    if (!createAdForm.title.trim()) errors.title = 'Title is required';
    if (!createAdForm.imageUrl.trim()) errors.imageUrl = 'Image URL is required';
    if (!createAdForm.linkUrl.trim()) {
      errors.linkUrl = 'Link URL is required';
    } else {
      try {
        new URL(createAdForm.linkUrl);
      } catch {
        errors.linkUrl = 'Must be a valid URL';
      }
    }
    if (!createAdForm.placement) errors.placement = 'Placement is required' as AdvertisementPlacement;
    setCreateAdErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAd = async () => {
    if (!validateCreateAdForm()) return;
    const image = ExternalBlob.fromURL(createAdForm.imageUrl);
    let expiresAt: bigint | null = null;
    if (createAdForm.expiresAt) {
      const ts = new Date(createAdForm.expiresAt).getTime();
      if (!isNaN(ts)) {
        expiresAt = BigInt(ts) * BigInt(1_000_000); // convert ms to nanoseconds
      }
    }
    await createAd.mutateAsync({
      title: createAdForm.title,
      image,
      linkUrl: createAdForm.linkUrl,
      placement: createAdForm.placement as AdvertisementPlacement,
      expiresAt,
    });
    setShowCreateAdDialog(false);
    setCreateAdForm({ title: '', imageUrl: '', linkUrl: '', placement: '', expiresAt: '' });
    setCreateAdErrors({});
  };

  const formatExpiry = (expiresAt?: bigint) => {
    if (!expiresAt) return 'Never';
    const ms = Number(expiresAt) / 1_000_000;
    return new Date(ms).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage users, job listings, advertisements, and platform analytics.
          </p>
        </div>

        {/* Analytics Cards */}
        {analyticsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalSeekers.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Seekers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalPosters.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Posters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalJobs.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalApplications.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.averageRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Tabs */}
        <Tabs defaultValue="jobs">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="jobs">
              <Briefcase className="w-4 h-4 mr-1" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="seekers">
              <Users className="w-4 h-4 mr-1" />
              Seekers
            </TabsTrigger>
            <TabsTrigger value="posters">
              <Shield className="w-4 h-4 mr-1" />
              Posters
            </TabsTrigger>
            <TabsTrigger value="advertisements">
              <Megaphone className="w-4 h-4 mr-1" />
              Advertisements
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Pay</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginate(jobs, jobPage).map((job) => (
                          <TableRow key={job.id.toString()}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {JOB_TYPE_LABELS[job.jobType as string] || job.jobType}
                              </Badge>
                            </TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>₦{job.pay.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={job.active ? 'default' : 'secondary'}>
                                {job.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {!job.active ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => approveJob.mutate(job.id)}
                                    disabled={approveJob.isPending}
                                  >
                                    {approveJob.isPending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3" />
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeJob.mutate(job.id)}
                                    disabled={removeJob.isPending}
                                  >
                                    {removeJob.isPending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <XCircle className="w-3 h-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {totalPages(jobs) > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                          disabled={jobPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground py-2">
                          {jobPage} / {totalPages(jobs)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setJobPage((p) => Math.min(totalPages(jobs), p + 1))}
                          disabled={jobPage === totalPages(jobs)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seekers Tab */}
          <TabsContent value="seekers">
            <Card>
              <CardHeader>
                <CardTitle>Job Seekers</CardTitle>
              </CardHeader>
              <CardContent>
                {seekersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Skills</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Available</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginate(seekers, seekerPage).map((seeker) => (
                          <TableRow key={seeker.id.toString()}>
                            <TableCell className="font-medium">{seeker.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {seeker.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {seeker.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{seeker.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {seeker.experience || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={seeker.available ? 'default' : 'secondary'}>
                                {seeker.available ? 'Available' : 'Unavailable'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {totalPages(seekers) > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSeekerPage((p) => Math.max(1, p - 1))}
                          disabled={seekerPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground py-2">
                          {seekerPage} / {totalPages(seekers)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSeekerPage((p) => Math.min(totalPages(seekers), p + 1))
                          }
                          disabled={seekerPage === totalPages(seekers)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posters Tab */}
          <TabsContent value="posters">
            <Card>
              <CardHeader>
                <CardTitle>Job Posters</CardTitle>
              </CardHeader>
              <CardContent>
                {postersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Verified</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginate(posters, posterPage).map((poster) => (
                          <TableRow key={poster.id.toString()}>
                            <TableCell className="font-medium">{poster.name}</TableCell>
                            <TableCell>{poster.companyName}</TableCell>
                            <TableCell>{poster.contactInfo}</TableCell>
                            <TableCell>
                              <Badge variant={poster.verified ? 'default' : 'secondary'}>
                                {poster.verified ? 'Verified' : 'Unverified'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {!poster.verified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyPoster.mutate(poster.id.toString())}
                                  disabled={verifyPoster.isPending}
                                >
                                  {verifyPoster.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verify
                                    </>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {totalPages(posters) > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPosterPage((p) => Math.max(1, p - 1))}
                          disabled={posterPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground py-2">
                          {posterPage} / {totalPages(posters)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPosterPage((p) => Math.min(totalPages(posters), p + 1))
                          }
                          disabled={posterPage === totalPages(posters)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advertisements Tab */}
          <TabsContent value="advertisements">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Advertisements
                  </CardTitle>
                  <Button
                    onClick={() => setShowCreateAdDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Ad
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {adsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : allAds.length === 0 ? (
                  <div className="text-center py-12">
                    <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No advertisements yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first ad to start monetising the platform.
                    </p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Placement</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Link</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginate(allAds, adPage).map((ad) => (
                          <TableRow key={ad.id.toString()}>
                            <TableCell className="font-medium">{ad.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {PLACEMENT_LABELS[ad.placement] || ad.placement}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={ad.isActive ? 'default' : 'secondary'}>
                                {ad.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatExpiry(ad.expiresAt)}
                            </TableCell>
                            <TableCell>
                              <a
                                href={ad.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm truncate max-w-[150px] block"
                              >
                                {ad.linkUrl}
                              </a>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    toggleAdActive.mutate({
                                      adId: ad.id,
                                      isActive: !ad.isActive,
                                    })
                                  }
                                  disabled={toggleAdActive.isPending}
                                  title={ad.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {toggleAdActive.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : ad.isActive ? (
                                    <ToggleRight className="w-4 h-4 text-primary" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteAd.mutate(ad.id)}
                                  disabled={deleteAd.isPending}
                                  title="Delete"
                                >
                                  {deleteAd.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {totalPages(allAds) > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdPage((p) => Math.max(1, p - 1))}
                          disabled={adPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground py-2">
                          {adPage} / {totalPages(allAds)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdPage((p) => Math.min(totalPages(allAds), p + 1))}
                          disabled={adPage === totalPages(allAds)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Ad Dialog */}
      <Dialog open={showCreateAdDialog} onOpenChange={setShowCreateAdDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Create New Advertisement
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new advertisement for the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="ad-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ad-title"
                placeholder="e.g. Hire Top Talent with JobsNG"
                value={createAdForm.title}
                onChange={(e) =>
                  setCreateAdForm((f) => ({ ...f, title: e.target.value }))
                }
              />
              {createAdErrors.title && (
                <p className="text-xs text-destructive">{createAdErrors.title}</p>
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-1">
              <Label htmlFor="ad-image">
                Image URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ad-image"
                placeholder="https://example.com/ad-banner.jpg"
                value={createAdForm.imageUrl}
                onChange={(e) =>
                  setCreateAdForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
              />
              {createAdErrors.imageUrl && (
                <p className="text-xs text-destructive">{createAdErrors.imageUrl}</p>
              )}
            </div>

            {/* Link URL */}
            <div className="space-y-1">
              <Label htmlFor="ad-link">
                Link URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ad-link"
                placeholder="https://advertiser-website.com"
                value={createAdForm.linkUrl}
                onChange={(e) =>
                  setCreateAdForm((f) => ({ ...f, linkUrl: e.target.value }))
                }
              />
              {createAdErrors.linkUrl && (
                <p className="text-xs text-destructive">{createAdErrors.linkUrl}</p>
              )}
            </div>

            {/* Placement */}
            <div className="space-y-1">
              <Label htmlFor="ad-placement">
                Placement <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createAdForm.placement}
                onValueChange={(val) =>
                  setCreateAdForm((f) => ({
                    ...f,
                    placement: val as AdvertisementPlacement,
                  }))
                }
              >
                <SelectTrigger id="ad-placement">
                  <SelectValue placeholder="Select placement area" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createAdErrors.placement && (
                <p className="text-xs text-destructive">{createAdErrors.placement}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <Label htmlFor="ad-expiry">Expiry Date (optional)</Label>
              <Input
                id="ad-expiry"
                type="date"
                value={createAdForm.expiresAt}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setCreateAdForm((f) => ({ ...f, expiresAt: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave blank for no expiry.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateAdDialog(false);
                setCreateAdErrors({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAd} disabled={createAd.isPending}>
              {createAd.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ad
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
