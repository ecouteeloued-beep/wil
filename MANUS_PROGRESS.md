# MANUS Progress Report

**Date:** 2026-09-09  
**Repository:** `nadjimlab/wil`  
**Branch:** `security/foundation-20260909`  
**Commit:** `c5b463f`  
**Supabase project inspected:** `Wil` (`tprybrdeipnhvcwjuwxz`)

## Completed

Implemented and locally verified the security-foundation slice on a dedicated branch. The branch removes localStorage-based privileged session state, adds Supabase Auth session/profile validation, replaces the client complaint upsert path with an insert-only RPC contract, narrows complaint projections, removes sensitive realtime mapping, and adds a rollback-documented migration.

A read-only inspection of the actual Supabase project was also completed. The project is active and healthy. The observed non-sensitive baseline was six Auth users, six public staff profiles, one complaint, zero internal notes, and zero audit log rows. No storage buckets were returned by the inspected storage catalog query.

## Fixed

The following changes are committed in `c5b463f`:

- Supabase Auth is the only active application-level privileged session authority.
- Admin login no longer serializes a user profile into localStorage.
- Complaint submission calls `submit_complaint(jsonb)` rather than client-side `upsert`.
- Complaint reads use explicit fields rather than `select('*')`.
- Realtime mapping no longer copies phone, NIN, or PIN/hash fields.
- Local complaint persistence is removed from `GrievanceService` for the cloud path.
- A versioned migration defines additive submission and scoped transition RPCs.

## Tested

| Check | Result |
|---|---|
| `npm run lint` | Passed |
| `npm run build` | Passed |
| `git diff --check` | Passed |
| Supabase deployed policy inventory | Completed read-only |
| Supabase function inventory | Completed read-only |
| Supabase index/trigger/realtime inventory | Completed read-only |
| Storage bucket inventory | No buckets returned |
| Vercel linked-project inventory | No project linked to `nadjimlab/wil` |
| Production backup/restore | Not available through configured tools |
| Migration execution | Not executed |
| Staging test | Not executed; no staging project discovered |
| Production deployment | Not executed |

## Actual production blockers

1. **Backup gate is not satisfied.** The available Supabase connector exposes project inspection and migration execution, but no backup/restore operation. The protocol requires a restorable safety point before a production-affecting database change.
2. **Staging is not available.** Supabase project discovery returned one active project and no separate staging project.
3. **Vercel is not linked to this repository.** The configured Vercel team contains only the unrelated `souf360` project linked to `ouedna-web`. No `wil` deployment target exists.
4. **The deployed RLS state needs further remediation.** The inspection found duplicate permissive complaint INSERT policies, broad direct UPDATE policy behavior, and `public.complaints` in the `supabase_realtime` publication.
5. **The new frontend expects an RPC that is not yet installed.** Deploying the branch before applying and testing the migration would break real complaint submission.
6. **Storage is unconfigured or not exposed through the inspected catalog.** Attachment persistence cannot be safely enabled without a private bucket and policies.

## Database changes

None were executed. The production database remains unchanged. This was required because no restorable backup or staging environment was available. The migration remains a repository artifact and must be applied in staging first, then Production only after backup and role/RLS tests pass.

## Deployment status

The branch was pushed to GitHub for review. It was not merged into `main` and was not deployed to Vercel. No Vercel deployment was created because there is no linked project or verified environment configuration for this repository.

## Remaining

- Provision or identify a restorable backup mechanism.
- Create a separate Supabase staging project or approved isolated clone.
- Create/link a Vercel project for `nadjimlab/wil` with verified staging and production environment variables.
- Refactor remaining direct complaint mutations before removing broad UPDATE policies.
- Apply and test the migration in staging.
- Consolidate duplicate INSERT policies and replace direct UPDATE with transition/assignment RPCs.
- Implement private Storage and attachment policies.
- Add server-side rate limiting, RLS JWT regression tests, smoke tests, health checks, monitoring, and disaster recovery.

## Final status

**Code corrected on branch and locally verified. Not deployed. Production deployment is blocked for safety and would be unsafe until the backup, staging, migration, RLS, Storage, and Vercel gates are satisfied.**

## 2026-09-10 feature update

- Added an optional citizen **meeting request** addressed to the Wali, the Secretary-General, or the Chief of Cabinet.
- Added server/client mapping for `meeting_request`, including a new additive migration and display in the citizen confirmation and administrative inbox.
- Renamed the role-management presentation from district chief to **Chief of Cabinet — attached to the Wali Office** while retaining the stable internal role key `head_department` for compatibility.
- Redesigned the admin login surface in the dark-green official visual style from the supplied reference without exposing demo credentials or weakening Supabase Auth.
- Local verification passed again: `npm run lint`, `npm run build`, and `git diff --check`.
- The feature migration has not been executed on Production; the Vercel project is still not linked to this repository.
