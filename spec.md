# Specification

## Summary
**Goal:** Replace the existing placeholder/text logo in the app with the uploaded Work-Quickie logo image (lightning bolt graphic with red "Work-Quickie" text).

**Planned changes:**
- Save the uploaded Work-Quickie logo as a static asset at `frontend/public/assets/generated/work-quickie-logo.png`
- Replace any text-only or placeholder logo in the header/navbar (`Layout.tsx`) with the logo image at ~40px height, linking to the home route
- Replace any text-only or placeholder logo in the landing page hero section (`LandingPage.tsx`) with the logo image at ~64px height

**User-visible outcome:** The Work-Quickie logo image appears in both the sticky header and the landing page hero section, replacing any previous text or placeholder logo.
