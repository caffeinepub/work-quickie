import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSearchJobs } from '../hooks/useQueries';
import AdBanner from './AdBanner';
import { AdvertisementPlacement } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Briefcase,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
  Shield,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';

const FEATURE_HIGHLIGHTS = [
  {
    icon: Search,
    title: 'Smart Job Matching',
    description:
      'Our algorithm matches your skills and experience to the most relevant opportunities.',
  },
  {
    icon: Shield,
    title: 'Verified Employers',
    description: 'All employers are verified to ensure legitimate job postings.',
  },
  {
    icon: Zap,
    title: 'Quick Apply',
    description: 'Apply to multiple jobs with a single profile and cover message.',
  },
  {
    icon: Globe,
    title: 'Nationwide Coverage',
    description: 'Jobs from Lagos to Abuja, Port Harcourt to Kano — all of Nigeria.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up and build your professional profile with skills and experience.',
  },
  {
    step: '02',
    title: 'Browse & Match',
    description: 'Explore jobs or let our matching engine find the best fits for you.',
  },
  {
    step: '03',
    title: 'Apply & Connect',
    description: 'Submit applications and connect directly with verified employers.',
  },
];

const JOB_TYPE_LABELS: Record<string, string> = {
  fullTime: 'Full-Time',
  partTime: 'Part-Time',
  nysc: 'NYSC (Youth Corps)',
  artisan: 'Artisan',
  shortTerm: 'Short-Term',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { data: recentJobs = [] } = useSearchJobs({});

  const featuredJobs = recentJobs.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/generated/hero-bg.dim_1440x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
            🇳🇬 Nigeria's Premier Job Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Find Your Dream Job
            <span className="text-primary block">Across Nigeria</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with top employers for full-time, part-time, artisan, NYSC (Youth Corps), and
            short-term opportunities. Your next career move starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/jobs' })}>
              <Search className="w-5 h-5 mr-2" />
              Browse Jobs
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ to: '/onboarding/poster' })}>
              <Users className="w-5 h-5 mr-2" />
              Post a Job
            </Button>
          </div>
        </div>
      </section>

      {/* Ad Banner below hero */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <AdBanner placement={AdvertisementPlacement.landing} />
      </div>

      {/* Stats */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Active Jobs', value: `${recentJobs.length}+`, icon: Briefcase },
            { label: 'Verified Employers', value: '500+', icon: Shield },
            { label: 'Job Seekers', value: '10K+', icon: Users },
            { label: 'Placements Made', value: '2K+', icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-6 h-6 text-primary" />
              <p className="text-3xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Open-Jobs?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We're built specifically for the Nigerian job market with features that matter.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Latest Opportunities</h2>
                <p className="text-muted-foreground">Fresh jobs posted by verified employers</p>
              </div>
              <Button variant="outline" onClick={() => navigate({ to: '/jobs' })}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id.toString()}
                  to="/jobs/$jobId"
                  params={{ jobId: job.id.toString() }}
                  className="block"
                >
                  <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location || 'Remote'}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            ₦{Number(job.pay).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {JOB_TYPE_LABELS[job.jobType as string] || String(job.jobType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Join thousands of Nigerians who have found their dream jobs through Open-Jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate({ to: '/jobs' })}
            >
              <Search className="w-5 h-5 mr-2" />
              Find Jobs Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate({ to: '/onboarding/seeker' })}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
