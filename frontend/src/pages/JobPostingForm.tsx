import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateJobListing, useGetJobListing, useUpdateJobListingStatus } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TagInput from '../components/TagInput';
import { toast } from 'sonner';
import { Briefcase, MapPin, DollarSign, ArrowLeft } from 'lucide-react';

export default function JobPostingForm() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  // Try to get jobId from params (edit mode)
  let jobId: string | undefined;
  try {
    const params = useParams({ from: '/poster/jobs/$jobId/edit' });
    jobId = params.jobId;
  } catch {
    jobId = undefined;
  }

  const isEditMode = !!jobId;
  const jobIdBigInt = jobId ? BigInt(jobId) : null;

  const { data: existingJob } = useGetJobListing(jobIdBigInt);
  const createJob = useCreateJobListing();

  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: [] as string[],
    location: '',
    pay: '',
    jobType: 'FullTime',
  });

  useEffect(() => {
    if (existingJob) {
      setForm({
        title: existingJob.title,
        description: existingJob.description,
        requiredSkills: existingJob.requiredSkills,
        location: existingJob.location,
        pay: Number(existingJob.pay).toString(),
        jobType: existingJob.jobType,
      });
    }
  }, [existingJob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    if (!form.jobType) {
      toast.error('Job type is required');
      return;
    }
    const payNum = parseInt(form.pay, 10);
    if (isNaN(payNum) || payNum < 0) {
      toast.error('Please enter a valid pay amount');
      return;
    }
    try {
      const newJobId = await createJob.mutateAsync({
        title: form.title,
        description: form.description,
        requiredSkills: form.requiredSkills,
        location: form.location,
        pay: BigInt(payNum),
        jobType: form.jobType,
      });
      toast.success(isEditMode ? 'Job listing updated!' : 'Job listing created!');
      navigate({ to: '/poster/dashboard' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save job listing');
    }
  };

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/poster/dashboard' })}
          className="-ml-2 mb-3 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isEditMode ? 'Edit Job Listing' : 'Post a New Job'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? 'Update your job listing details' : 'Find the right talent for your needs'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Job Details</h2>
          <div className="space-y-1.5">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Senior React Developer"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={5}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Job Type *</Label>
            <Select value={form.jobType} onValueChange={(v) => update('jobType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FullTime">Full-Time</SelectItem>
                <SelectItem value="PartTime">Part-Time</SelectItem>
                <SelectItem value="ShortTerm">Short-Term</SelectItem>
                <SelectItem value="Artisan">Artisan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location & Pay */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Location & Compensation
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="e.g. Lagos, Nigeria or Remote"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay">Pay / Budget ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="pay"
                type="number"
                min="0"
                value={form.pay}
                onChange={(e) => update('pay', e.target.value)}
                placeholder="0"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Required Skills</h2>
          <div className="space-y-1.5">
            <Label>Skills</Label>
            <TagInput
              tags={form.requiredSkills}
              onChange={(skills) => update('requiredSkills', skills)}
              placeholder="Add required skill (press Enter)..."
            />
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add each skill. These are used for matching seekers to your job.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/poster/dashboard' })}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createJob.isPending}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-white border-0"
          >
            {createJob.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              isEditMode ? 'Update Job' : 'Post Job'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
