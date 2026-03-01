import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  SeekerProfile,
  PosterProfile,
  JobListing,
  Application,
  Rating,
  Analytics,
  JobFilter,
} from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ─── User Profile ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Seeker Profile ────────────────────────────────────────────────────────

export function useGetSeekerProfile(id: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SeekerProfile | null>({
    queryKey: ['seekerProfile', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getSeekerProfile(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useCreateSeekerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      bio: string;
      skills: string[];
      qualifications: string[];
      experience: string;
      portfolioUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSeekerProfile(
        data.name,
        data.bio,
        data.skills,
        data.qualifications,
        data.experience,
        data.portfolioUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seekerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateSeekerAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (available: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSeekerAvailability(available);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seekerProfile'] });
    },
  });
}

// ─── Poster Profile ────────────────────────────────────────────────────────

export function useGetPosterProfile(id: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PosterProfile | null>({
    queryKey: ['posterProfile', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getPosterProfile(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useCreatePosterProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      companyName: string;
      contactInfo: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPosterProfile(data.name, data.companyName, data.contactInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posterProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Job Listings ──────────────────────────────────────────────────────────

export function useSearchJobs(filter: JobFilter) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobListing[]>({
    queryKey: ['jobs', filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchJobs(filter);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetJobListing(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobListing | null>({
    queryKey: ['job', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getJobListing(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useCreateJobListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      requiredSkills: string[];
      location: string;
      pay: bigint;
      jobType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createJobListing(
        data.title,
        data.description,
        data.requiredSkills,
        data.location,
        data.pay,
        data.jobType
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['posterJobs'] });
    },
  });
}

export function useUpdateJobListingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, active }: { jobId: bigint; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJobListingStatus(jobId, active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['posterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['job'] });
    },
  });
}

export function useGetMatchedJobs(seekerId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobListing[]>({
    queryKey: ['matchedJobs', seekerId?.toString()],
    queryFn: async () => {
      if (!actor || !seekerId) return [];
      return actor.getMatchedJobsForSeeker(seekerId);
    },
    enabled: !!actor && !actorFetching && !!seekerId,
  });
}

// ─── Applications ──────────────────────────────────────────────────────────

export function useGetMyApplications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Application[]>({
    queryKey: ['myApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyApplications();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetApplicationsForJob(jobId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Application[]>({
    queryKey: ['jobApplications', jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return [];
      return actor.getApplicationsForJob(jobId);
    },
    enabled: !!actor && !actorFetching && jobId !== null,
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, message }: { jobId: bigint; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyToJob(jobId, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      seekerId,
      newStatus,
    }: {
      jobId: bigint;
      seekerId: Principal;
      newStatus: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateApplicationStatus(jobId, seekerId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
  });
}

// ─── Ratings ───────────────────────────────────────────────────────────────

export function useGetRatingsForUser(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Rating[]>({
    queryKey: ['ratings', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getRatingsForUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetAverageRating(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['averageRating', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return 0;
      return actor.getAverageRatingForUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useSubmitRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      revieweeId,
      score,
      comment,
    }: {
      revieweeId: Principal;
      score: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitRating(revieweeId, score, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['averageRating'] });
    },
  });
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAdminGetAnalytics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Analytics>({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminGetAnalytics();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAdminListSeekers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SeekerProfile[]>({
    queryKey: ['adminSeekers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListSeekers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAdminListPosters() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PosterProfile[]>({
    queryKey: ['adminPosters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListPosters();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAdminListJobListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobListing[]>({
    queryKey: ['adminJobs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListJobListings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAdminApproveJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminApproveJobListing(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useAdminRemoveJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminRemoveJobListing(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useAdminVerifyPoster() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (posterId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminVerifyPoster(posterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosters'] });
      queryClient.invalidateQueries({ queryKey: ['posterProfile'] });
    },
  });
}
