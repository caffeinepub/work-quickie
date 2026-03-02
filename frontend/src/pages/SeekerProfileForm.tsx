import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateSeekerProfile, useGetCallerUserProfile, useGetSeekerProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import TagInput from '../components/TagInput';
import { toast } from 'sonner';
import { User, Briefcase, Link as LinkIcon, BookOpen, Star } from 'lucide-react';

export default function SeekerProfileForm() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  // Pass Principal directly — hook now accepts Principal | string | null | undefined
  const { data: existingProfile } = useGetSeekerProfile(identity?.getPrincipal() ?? null);
  const createProfile = useCreateSeekerProfile();

  const [form, setForm] = useState({
    name: '',
    bio: '',
    skills: [] as string[],
    qualifications: [] as string[],
    experience: '',
    portfolioUrl: '',
    available: true,
  });

  useEffect(() => {
    if (existingProfile) {
      setForm({
        name: existingProfile.name,
        bio: existingProfile.bio,
        skills: existingProfile.skills,
        qualifications: existingProfile.qualifications,
        experience: existingProfile.experience,
        portfolioUrl: existingProfile.portfolioUrl,
        available: existingProfile.available,
      });
    } else if (userProfile?.name) {
      setForm((f) => ({ ...f, name: userProfile.name }));
    }
  }, [existingProfile, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      await createProfile.mutateAsync({
        name: form.name,
        bio: form.bio,
        skills: form.skills,
        qualifications: form.qualifications,
        experience: form.experience,
        portfolioUrl: form.portfolioUrl,
      });
      toast.success('Profile saved successfully!');
      navigate({ to: '/seeker/dashboard' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile');
    }
  };

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {existingProfile ? 'Edit Your Profile' : 'Create Seeker Profile'}
            </h1>
            <p className="text-sm text-muted-foreground">Showcase your skills to find the best opportunities</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Basic Information
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              placeholder="Tell employers about yourself..."
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="available" className="font-medium">Available for Work</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show employers you're open to opportunities</p>
            </div>
            <Switch
              id="available"
              checked={form.available}
              onCheckedChange={(v) => update('available', v)}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Skills & Qualifications
          </h2>
          <div className="space-y-1.5">
            <Label>Skills</Label>
            <TagInput
              tags={form.skills}
              onChange={(skills) => update('skills', skills)}
              placeholder="Add a skill (press Enter)..."
            />
            <p className="text-xs text-muted-foreground">Press Enter or comma to add each skill</p>
          </div>
          <div className="space-y-1.5">
            <Label>Qualifications</Label>
            <TagInput
              tags={form.qualifications}
              onChange={(qualifications) => update('qualifications', qualifications)}
              placeholder="Add qualification (e.g. BSc Computer Science)..."
            />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Experience
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="experience">Work Experience</Label>
            <Textarea
              id="experience"
              value={form.experience}
              onChange={(e) => update('experience', e.target.value)}
              placeholder="Describe your work history and relevant experience..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" />
            Portfolio
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="portfolioUrl">Portfolio URL</Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={form.portfolioUrl}
              onChange={(e) => update('portfolioUrl', e.target.value)}
              placeholder="https://your-portfolio.com"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createProfile.isPending}
            className="flex-1 gradient-primary text-white border-0 hover:opacity-90"
          >
            {createProfile.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              existingProfile ? 'Update Profile' : 'Create Profile'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
