import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import SeekerProfileForm from './pages/SeekerProfileForm';
import PosterProfileForm from './pages/PosterProfileForm';
import SeekerDashboard from './pages/SeekerDashboard';
import PosterDashboard from './pages/PosterDashboard';
import JobBoard from './pages/JobBoard';
import JobDetailPage from './pages/JobDetailPage';
import JobPostingForm from './pages/JobPostingForm';
import JobApplicantsView from './pages/JobApplicantsView';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';

function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function HomeRoute() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const showProfileSetup = isAuthenticated && !isLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  if (userProfile) {
    if (userProfile.role === 'seeker') {
      navigate({ to: '/seeker/dashboard' });
      return null;
    }
    if (userProfile.role === 'poster') {
      navigate({ to: '/poster/dashboard' });
      return null;
    }
  }

  return <LandingPage />;
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoute,
});

const jobBoardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs',
  component: JobBoard,
});

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs/$jobId',
  component: JobDetailPage,
});

const seekerProfileFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding/seeker',
  component: SeekerProfileForm,
});

const posterProfileFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding/poster',
  component: PosterProfileForm,
});

const seekerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seeker/dashboard',
  component: SeekerDashboard,
});

const posterDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poster/dashboard',
  component: PosterDashboard,
});

const jobPostingFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poster/jobs/new',
  component: JobPostingForm,
});

const jobEditFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poster/jobs/$jobId/edit',
  component: JobPostingForm,
});

const jobApplicantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poster/jobs/$jobId/applicants',
  component: JobApplicantsView,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  jobBoardRoute,
  jobDetailRoute,
  seekerProfileFormRoute,
  posterProfileFormRoute,
  seekerDashboardRoute,
  posterDashboardRoute,
  jobPostingFormRoute,
  jobEditFormRoute,
  jobApplicantsRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
