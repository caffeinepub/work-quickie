# Specification

## Summary
**Goal:** Replace the "Short-Time" job type label with "NYSC (Youth Corps)" across the entire application (frontend and backend).

**Planned changes:**
- Replace all frontend occurrences of "Short-Time" with "NYSC (Youth Corps)" in job type badges, filter dropdowns, and job posting form type selectors
- Rename the backend `ShortTime` job type variant to `NYSC` (or equivalent) in the Motoko canister
- Update all backend functions and filters that reference the old `ShortTime` variant to use the new name
- Ensure the frontend job type value sent to and received from the backend matches the updated backend variant

**User-visible outcome:** Users will see "NYSC (Youth Corps)" everywhere "Short-Time" previously appeared, including job listings, filters, and posting forms, while all other job types remain unchanged.
