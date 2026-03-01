import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, ArrowRight } from 'lucide-react';

export default function ProfileSetupModal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-card-md">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Welcome to Work-Quickie!
          </h1>
          <p className="text-muted-foreground">
            Let's set up your profile. How would you like to use the platform?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Job Seeker */}
          <button
            onClick={() => navigate({ to: '/onboarding/seeker' })}
            className="group bg-card border-2 border-border hover:border-primary rounded-xl p-6 text-left transition-all hover:shadow-card-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">I'm Looking for Work</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Create a seeker profile, showcase your skills, and apply to jobs that match your expertise.
            </p>
            <div className="flex items-center text-primary text-sm font-medium">
              Create Seeker Profile
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Job Poster */}
          <button
            onClick={() => navigate({ to: '/onboarding/poster' })}
            className="group bg-card border-2 border-border hover:border-accent rounded-xl p-6 text-left transition-all hover:shadow-card-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent-foreground flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">I'm Hiring</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Post job listings, review applicants, and find the right talent for your needs.
            </p>
            <div className="flex items-center text-amber-600 text-sm font-medium">
              Create Poster Profile
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
