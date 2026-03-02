import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  JobFilter,
  JobListing,
  SeekerProfile,
  PosterProfile,
  Application,
  Rating,
  Analytics,
  UserProfile,
  JobType,
  Advertisement,
  AdvertisementPlacement,
  ExternalBlob,
} from '../backend';
import { toast } from 'sonner';
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
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

export function useGetSeekerProfile(id: Principal | string | null | undefined) {
  const { actor, isFetching } = useActor();
  const idStr = id ? (typeof id === 'string' ? id : id.toString()) : undefined;
  return useQuery<SeekerProfile | null>({
    queryKey: ['seekerProfile', idStr],
    queryFn: async () => {
      if (!actor || !idStr) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getSeekerProfile(Principal.fromText(idStr));
    },
    enabled: !!actor && !isFetching && !!idStr,
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

export function useGetPosterProfile(id: Principal | string | null | undefined) {
  const { actor, isFetching } = useActor();
  const idStr = id ? (typeof id === 'string' ? id : id.toString()) : undefined;
  return useQuery<PosterProfile | null>({
    queryKey: ['posterProfile', idStr],
    queryFn: async () => {
      if (!actor || !idStr) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getPosterProfile(Principal.fromText(idStr));
    },
    enabled: !!actor && !isFetching && !!idStr,
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
  const { actor, isFetching } = useActor();
  return useQuery<JobListing[]>({
    queryKey: ['jobs', filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchJobs(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJobListing(id: bigint | null | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<JobListing | null>({
    queryKey: ['job', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null || id === undefined) return null;
      return actor.getJobListing(id);
    },
    enabled: !!actor && !isFetching && id !== null && id !== undefined,
  });
}

export function useGetMatchedJobs(seekerId: Principal | string | null | undefined) {
  const { actor, isFetching } = useActor();
  const idStr = seekerId ? (typeof seekerId === 'string' ? seekerId : seekerId.toString()) : undefined;
  return useQuery<JobListing[]>({
    queryKey: ['matchedJobs', idStr],
    queryFn: async () => {
      if (!actor || !idStr) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getMatchedJobsForSeeker(Principal.fromText(idStr));
    },
    enabled: !!actor && !isFetching && !!idStr,
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
      jobType: JobType;
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
    },
  });
}

export function useUpdateJobListingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { jobId: bigint; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJobListingStatus(data.jobId, data.active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job'] });
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
    },
  });
}

// ─── Applications ──────────────────────────────────────────────────────────

export function useGetApplicationsForJob(jobId: bigint | null | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Application[]>({
    queryKey: ['applications', jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null || jobId === undefined) return [];
      return actor.getApplicationsForJob(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null && jobId !== undefined,
  });
}

export function useGetMyApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<Application[]>({
    queryKey: ['myApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { jobId: bigint; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyToJob(data.jobId, data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      jobId: bigint;
      seekerId: Principal | string;
      newStatus: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      const seekerPrincipal =
        typeof data.seekerId === 'string'
          ? Principal.fromText(data.seekerId)
          : data.seekerId;
      return actor.updateApplicationStatus(data.jobId, seekerPrincipal, data.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

// ─── Ratings ───────────────────────────────────────────────────────────────

export function useGetRatingsForUser(userId: Principal | string | null | undefined) {
  const { actor, isFetching } = useActor();
  const idStr = userId ? (typeof userId === 'string' ? userId : userId.toString()) : undefined;
  return useQuery<Rating[]>({
    queryKey: ['ratings', idStr],
    queryFn: async () => {
      if (!actor || !idStr) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getRatingsForUser(Principal.fromText(idStr));
    },
    enabled: !!actor && !isFetching && !!idStr,
  });
}

export function useGetAverageRating(userId: Principal | string | null | undefined) {
  const { actor, isFetching } = useActor();
  const idStr = userId ? (typeof userId === 'string' ? userId : userId.toString()) : undefined;
  return useQuery<number>({
    queryKey: ['averageRating', idStr],
    queryFn: async () => {
      if (!actor || !idStr) return 0;
      const { Principal } = await import('@dfinity/principal');
      return actor.getAverageRatingForUser(Principal.fromText(idStr));
    },
    enabled: !!actor && !isFetching && !!idStr,
  });
}

export function useSubmitRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      revieweeId: Principal | string;
      score: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      const revieweePrincipal =
        typeof data.revieweeId === 'string'
          ? Principal.fromText(data.revieweeId)
          : data.revieweeId;
      return actor.submitRating(revieweePrincipal, data.score, data.comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['averageRating'] });
    },
  });
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export function useAdminListSeekers() {
  const { actor, isFetching } = useActor();
  return useQuery<SeekerProfile[]>({
    queryKey: ['adminSeekers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListSeekers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminListPosters() {
  const { actor, isFetching } = useActor();
  return useQuery<PosterProfile[]>({
    queryKey: ['adminPosters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListPosters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminListJobListings() {
  const { actor, isFetching } = useActor();
  return useQuery<JobListing[]>({
    queryKey: ['adminJobs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListJobListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery<Analytics>({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminGetAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminApproveJobListing() {
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

export function useAdminRemoveJobListing() {
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
    mutationFn: async (posterId: Principal | string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      const p = typeof posterId === 'string' ? Principal.fromText(posterId) : posterId;
      return actor.adminVerifyPoster(p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosters'] });
    },
  });
}

// ─── Advertisements ────────────────────────────────────────────────────────

export function useGetAdsByPlacement(placement: AdvertisementPlacement) {
  const { actor, isFetching } = useActor();
  return useQuery<Advertisement[]>({
    queryKey: ['adsByPlacement', placement],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdsByPlacement(placement);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllAds() {
  const { actor, isFetching } = useActor();
  return useQuery<Advertisement[]>({
    queryKey: ['allAds'],
    queryFn: async () => {
      if (!actor) return [];
      const placements = [
        AdvertisementPlacement.jobBoard,
        AdvertisementPlacement.jobDetail,
        AdvertisementPlacement.seekerDashboard,
        AdvertisementPlacement.posterDashboard,
        AdvertisementPlacement.landing,
      ];
      const results = await Promise.all(
        placements.map((p) => actor.getAdsByPlacement(p))
      );
      const allAds = results.flat();
      const seen = new Set<string>();
      return allAds.filter((ad) => {
        const key = ad.id.toString();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAd() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      image: ExternalBlob;
      linkUrl: string;
      placement: AdvertisementPlacement;
      expiresAt: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAd(
        data.title,
        data.image,
        data.linkUrl,
        data.placement,
        data.expiresAt
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adsByPlacement'] });
      queryClient.invalidateQueries({ queryKey: ['allAds'] });
      toast.success('Advertisement created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create advertisement: ${error.message}`);
    },
  });
}

export function useUpdateAd() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      adId: bigint;
      title: string;
      image: ExternalBlob;
      linkUrl: string;
      placement: AdvertisementPlacement;
      expiresAt: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAd(
        data.adId,
        data.title,
        data.image,
        data.linkUrl,
        data.placement,
        data.expiresAt
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adsByPlacement'] });
      queryClient.invalidateQueries({ queryKey: ['allAds'] });
      toast.success('Advertisement updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update advertisement: ${error.message}`);
    },
  });
}

export function useDeleteAd() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAd(adId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adsByPlacement'] });
      queryClient.invalidateQueries({ queryKey: ['allAds'] });
      toast.success('Advertisement deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete advertisement: ${error.message}`);
    },
  });
}

export function useToggleAdActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { adId: bigint; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleAdActive(data.adId, data.isActive);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adsByPlacement'] });
      queryClient.invalidateQueries({ queryKey: ['allAds'] });
      toast.success(
        variables.isActive ? 'Advertisement activated' : 'Advertisement deactivated'
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle advertisement: ${error.message}`);
    },
  });
}
