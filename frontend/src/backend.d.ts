import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Application {
    status: string;
    jobId: bigint;
    seekerId: Principal;
    message: string;
}
export interface Rating {
    revieweeId: Principal;
    reviewerId: Principal;
    score: bigint;
    comment: string;
    timestamp: bigint;
}
export interface Analytics {
    totalSeekers: bigint;
    totalJobs: bigint;
    averageRating: number;
    totalPosters: bigint;
    totalApplications: bigint;
}
export interface JobFilter {
    jobType?: string;
    minPay?: bigint;
    keyword?: string;
    maxPay?: bigint;
    skills?: Array<string>;
    location?: string;
}
export interface SeekerProfile {
    id: Principal;
    bio: string;
    name: string;
    qualifications: Array<string>;
    available: boolean;
    experience: string;
    portfolioUrl: string;
    skills: Array<string>;
}
export interface JobListing {
    id: bigint;
    pay: bigint;
    title: string;
    active: boolean;
    postedBy: Principal;
    jobType: string;
    description: string;
    timestamp: bigint;
    requiredSkills: Array<string>;
    location: string;
}
export interface PosterProfile {
    id: Principal;
    verified: boolean;
    contactInfo: string;
    name: string;
    companyName: string;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminApproveJobListing(jobId: bigint): Promise<void>;
    adminGetAnalytics(): Promise<Analytics>;
    adminListJobListings(): Promise<Array<JobListing>>;
    adminListPosters(): Promise<Array<PosterProfile>>;
    adminListSeekers(): Promise<Array<SeekerProfile>>;
    adminRemoveJobListing(jobId: bigint): Promise<void>;
    adminVerifyPoster(posterId: Principal): Promise<void>;
    applyToJob(jobId: bigint, message: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createJobListing(title: string, description: string, requiredSkills: Array<string>, location: string, pay: bigint, jobType: string): Promise<bigint>;
    createPosterProfile(name: string, companyName: string, contactInfo: string): Promise<void>;
    createSeekerProfile(name: string, bio: string, skills: Array<string>, qualifications: Array<string>, experience: string, portfolioUrl: string): Promise<void>;
    getApplicationsForJob(jobId: bigint): Promise<Array<Application>>;
    getAverageRatingForUser(userId: Principal): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJobListing(id: bigint): Promise<JobListing | null>;
    getMatchedJobsForSeeker(seekerId: Principal): Promise<Array<JobListing>>;
    getMyApplications(): Promise<Array<Application>>;
    getPosterProfile(id: Principal): Promise<PosterProfile | null>;
    getRatingsForUser(userId: Principal): Promise<Array<Rating>>;
    getSeekerProfile(id: Principal): Promise<SeekerProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchJobs(filter: JobFilter): Promise<Array<JobListing>>;
    submitRating(revieweeId: Principal, score: bigint, comment: string): Promise<void>;
    updateApplicationStatus(jobId: bigint, seekerId: Principal, newStatus: string): Promise<void>;
    updateJobListingStatus(jobId: bigint, active: boolean): Promise<void>;
    updateSeekerAvailability(available: boolean): Promise<void>;
}
