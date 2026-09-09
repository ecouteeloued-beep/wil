# MANUS Progress Report

**Date:** 2026-09-09  
**Repository:** `nadjimlab/wil`  
**Branch:** `security/foundation-20260909`  
**Safety-point commit:** `45a57474baf6f4c8a82bb33005f7da50ccfd3111`

## Completed

Implemented the first security-foundation slice on a dedicated branch without touching Production:

- Added `src/services/authService.ts` as the single client-side Supabase Auth session/profile adapter.
- Removed the App and admin-login writes to `wilaya_eloued_current_session_user`.
- Removed the App's local admin-session restoration path.
- Added Supabase Auth bootstrap, `onAuthStateChange`, active-profile validation, role validation, and Supabase sign-out.
- Disabled legacy `AdminService` local authentication helpers so they cannot grant privileged access.
- Replaced client-side complaint `upsert` with a planned insert-only `submit_complaint(jsonb)` RPC call.
- Replaced the broad complaint query with an explicit column projection.
- Removed NIN, phone, and PIN/hash mapping from the realtime complaint payload.
- Removed local complaint persistence from `GrievanceService`; production submission now fails closed when Supabase is unavailable.
- Added `supabase/migrations/20260909233000_secure_public_complaint_submission.sql` containing additive submission and scoped transition RPCs with rollback comments.
- Preserved citizen-side attachment previews in memory only; persistent attachment storage remains blocked until private Storage policies are implemented.

## Fixed

The following verified code-level issues were addressed on this branch:

- Browser-local admin state is no longer used by the main application as proof of authorization.
- Login success no longer serializes the authenticated staff profile to localStorage.
- Public complaint submission no longer calls `.upsert()` from the client.
- Complaint cloud reads no longer use `select('*')` in `SupabaseService.fetchComplaints()`.
- Realtime mapping no longer copies `row.pin_hash`, `row.citizen_nin`, or `row.citizen_phone` into the browser.
- Local complaint writes are no longer treated as a production source of truth.

## Tested

| Check | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | Passed after implementation |
| `npm run build` | Passed after implementation |
| `git diff --check` | Passed |
| Privileged local-auth scan | No active local auth reads/writes found in application paths after cleanup |
| Broad complaint read/upsert scan | No `select('*')` or client complaint `upsert` found in the changed service/migration paths |
| Production database inspection | Not performed; no Supabase project connector is configured in this sandbox |
| Migration execution | Not performed |
| Staging smoke test | Not performed |
| Production deployment | Not performed |

## Database changes

No database changes were executed. The new migration is a repository artifact only. It must be applied first in an isolated staging project after a deployed-state inventory and backup. The application now expects the `submit_complaint` RPC for real cloud submission, so deployment must be coordinated with migration application; the current production database must not receive the new frontend build before that RPC is installed and tested.

## Security changes

The authentication and public-write surfaces improved. The following remain open:

- `AdminService` still contains legacy local operational repositories used by dashboard compatibility paths.
- The actual deployed RLS policy set is still unknown and must be exported before policy cleanup.
- Plaintext `citizen_phone` and `citizen_nin` columns remain in the schema and existing data model; new RPC writes do not populate them.
- Storage bucket and object policies remain unverified; attachments are not durably uploaded by the new path.
- Public tracking rate limiting and anti-enumeration controls remain unverified server-side.
- The transition RPC is planned but not deployed or tested against real JWTs.
- Realtime publication membership and authorization remain unverified in Supabase.
- Dashboard reads, workflow mutations, audit enforcement, health checks, monitoring, and disaster recovery remain open.

## Remaining

1. Configure or authorize a Supabase connector, then perform a read-only deployed-state inventory.
2. Create and verify a restorable backup before any production-affecting SQL.
3. Apply and test the new migration in staging, including RPC grants and rollback.
4. Consolidate effective RLS policies and add real-JWT role regression tests.
5. Replace remaining dashboard local repositories and direct mutation paths with scoped RPCs.
6. Implement private Storage and signed attachment URLs.
7. Add server-side rate limiting, health checks, monitoring, and disaster recovery.
8. Run staging smoke tests and only then assess production promotion.

## Next priority

**P0:** establish the actual Supabase deployed-state inventory and staging project. Do not deploy this branch until the migration exists in staging and the security/RLS test matrix passes.

## Release status

**Implemented on branch; not verified in staging or Production.** Build and typecheck pass locally. Production deployment is intentionally blocked because no Supabase backup, deployed-state inventory, migration execution, or production smoke verification has occurred.
