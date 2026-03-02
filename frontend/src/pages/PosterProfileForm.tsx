import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreatePosterProfile, useGetCallerUserProfile, useGetPosterProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, User } from 'lucide-react';

export default function PosterProfileForm() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  // Pass Principal directly — hook now accepts Principal | string | null | undefined
  const { data: existingProfile } = useGetPosterProfile(identity?.getPrincipal() ?? null);
  const createProfile = useCreatePosterProfile();

  const [form, setForm] = useState({
    name: '',
    companyName: '',
    contactInfo: '',
  });

  useEffect(() => {
    if (existingProfile) {
      setForm({
        name: existingProfile.name,
        companyName: existingProfile.companyName,
        contactInfo: existingProfile.contactInfo,
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
      await createProfile.mutateAsync(form);
      toast.success('Profile saved successfully!');
      navigate({ to: '/poster/dashboard' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile');
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {existingProfile ? 'Edit Poster Profile' : 'Create Poster Profile'}
            </h1>
            <p className="text-sm text-muted-foreground">Set up your hiring profile to post jobs</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            Contact Details
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="Your company or organization name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactInfo">Contact Information</Label>
            <Input
              id="contactInfo"
              value={form.contactInfo}
              onChange={(e) => update('contactInfo', e.target.value)}
              placeholder="Email, phone, or website"
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
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-white border-0"
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
