import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Zap, Search, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Smart Job Matching',
      desc: 'Our algorithm matches your skills to the best opportunities automatically.',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Verified Employers',
      desc: 'Connect with trusted companies and individuals posting real jobs.',
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: 'Ratings & Reviews',
      desc: 'Build your reputation with verified ratings from past employers.',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Quick Applications',
      desc: 'Apply to jobs in seconds with your saved profile and skills.',
    },
  ];

  const jobTypes = ['Full-Time', 'Part-Time', 'NYSC (Youth Corps)', 'Artisan'];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1440x600.png)' }}
        />
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
              🚀 The fastest way to find work
            </Badge>
            {/* Logo in hero */}
            <div className="mb-6">
              <img
                src="/assets/openj1.png"
                alt="Open-Jobs"
                className="h-20 md:h-24 w-auto object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find Your Next{' '}
              <span className="text-amber-300">Opportunity</span>{' '}
              Fast
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Open-Jobs connects skilled professionals with employers posting full-time, part-time,
              NYSC, and artisan jobs. Get matched instantly based on your skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="bg-amber-400 hover:bg-amber-300 text-amber-900 font-semibold border-0 shadow-lg"
              >
                {isLoggingIn ? 'Connecting...' : 'Get Started Free'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 bg-transparent"
                onClick={() => window.location.href = '/jobs'}
              >
                Browse Jobs
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {jobTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 rounded-full bg-white/15 text-white/90 text-sm font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Job Categories', value: '4+' },
              { label: 'Skill Matching', value: 'AI-Powered' },
              { label: 'Application Time', value: '< 1 min' },
              { label: 'Secure Auth', value: 'Internet Identity' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-bold text-xl text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Whether you're looking for work or hiring talent, Open-Jobs has the tools to make it happen.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-md transition-shadow border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign in and set up your seeker or poster profile with your skills and experience.' },
              { step: '02', title: 'Browse or Post Jobs', desc: 'Search for matching opportunities or post your job listing to find the right talent.' },
              { step: '03', title: 'Connect & Work', desc: 'Apply to jobs, review applicants, and start working with confidence.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full gradient-primary text-white font-display font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-card">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/openj1.png"
              alt="Open-Jobs"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join Open-Jobs today and connect with opportunities that match your skills.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="gradient-primary text-white border-0 shadow-card-md hover:opacity-90"
          >
            {isLoggingIn ? 'Connecting...' : 'Sign In with Internet Identity'}
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
