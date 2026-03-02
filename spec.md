# Specification

## Summary
**Goal:** Add an admin-managed advertisement system to the Open-Jobs app, enabling admins to create and display ads in key areas of the platform for monetisation.

**Planned changes:**
- Add an `Advertisement` data type to the backend with fields for id, title, imageUrl, linkUrl, placement, isActive, createdAt, and optional expiresAt
- Implement admin-only backend functions: `createAd`, `updateAd`, `deleteAd`, `toggleAdActive`, and a public `getAdsByPlacement` query
- Add TanStack Query hooks for all advertisement operations (`useGetAdsByPlacement`, `useCreateAd`, `useUpdateAd`, `useDeleteAd`, `useToggleAdActive`)
- Create a reusable `AdBanner` component that fetches and displays active ads for a given placement, with a dismissible banner, ad image, title, external link, and an "Advertisement" label
- Integrate `AdBanner` into JobBoard, JobDetailPage, LandingPage, SeekerDashboard, and PosterDashboard with the appropriate placement value for each
- Add an "Advertisements" management tab to the AdminDashboard with a table listing all ads, toggle active/inactive and delete actions, and a "Create New Ad" modal form with fields for title, image URL, link URL, placement, and optional expiry date

**User-visible outcome:** Admins can manage advertisements from the AdminDashboard, and users will see non-intrusive ad banners in relevant areas of the app (job board, job details, landing page, seeker dashboard, poster dashboard).
