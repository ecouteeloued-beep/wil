# Production Readiness Plan

**Project:** `nadjimlab/wil`  
**Assessment date:** 2026-09-09  
**Decision:** **Do not deploy yet.**  
**Scope:** Evidence-based implementation plan only. No production changes were executed.

## Executive decision

The application passes local typecheck and production build, but build health is not production readiness. The system still has browser-local operational state, duplicated plaintext citizen identifiers, broad complaint reads, unverified effective RLS state, public upsert behavior, and no verified storage or abuse-control posture. The first release candidate must be a security foundation release, not a feature release.

## Readiness score

| Area | Score | Rationale |
|---|---:|---|
| Security | 3/10 | Headers and client-safe env conventions exist, but authentication, data minimization, realtime, and public-write risks remain. |
| Architecture | 4/10 | Supabase integration exists, but local and cloud repositories compete as sources of truth. |
| Database | 3/10 | Schema and helper functions exist, but migrations are not versioned and policy state is ambiguous. |
| RBAC | 3/10 | Intended roles are documented; effective enforcement and regression coverage are not verified. |
| Privacy | 2/10 | Plaintext citizen identifiers coexist with hashed fields and realtime mapping. |
| Performance | 5/10 | Build succeeds, but dashboard bundles and unbounded reads require work. |
| Frontend | 5/10 | Typecheck/build pass; client-side authorization assumptions and file handling remain. |
| Deployment | 4/10 | CI builds and Vercel headers exist; staging, release, rollback, and environment gates are incomplete. |
| Observability | 2/10 | No verified health endpoint, recovery runbook, or security event monitoring. |
| **Overall** | **3/10** | Not ready for public or institutional production use. |

## Mandatory gates

| Gate | Pass condition | Evidence required |
|---|---|---|
| Backup | A restorable pre-change database snapshot exists and restore has been tested in isolation. | Backup ID, restore timestamp, checksum or row-count reconciliation. |
| Authentication | Supabase Auth session plus active staff profile is the only privileged authority. | Session bootstrap tests and inactive-account denial. |
| Authorization/RLS | The deployed policy inventory matches the approved role matrix. | Policy export and automated matrix results. |
| Privacy | No plaintext phone/NIN is written or returned to unauthorized clients. | Database inspection, RPC response contract, realtime payload test. |
| Workflow | Status, assignment, priority, and approval transitions are server-validated and audited. | Transition test report and audit rows. |
| Storage | Attachments are private, validated, scoped, and delivered by short-lived signed URL. | Bucket policy test report. |
| Abuse prevention | Submission, tracking, uploads, contact, and login have rate-limit and abuse controls. | Burst/lockout test report and monitoring alerts. |
| Performance | Dashboard reads are paginated and query plans are acceptable at target data volume. | EXPLAIN plans, bundle report, responsive test results. |
| Deployment | Staging smoke test passes before production promotion. | Commit SHA, environment checklist, smoke report. |
| Recovery | Rollback procedure is rehearsed and documented. | `DISASTER_RECOVERY.md` and rollback drill record. |

## Authentication and session plan

The client must call Supabase Auth for sign-in, sign-out, session restoration, and token refresh. A local boolean must never grant access. On bootstrap, the client should obtain the Auth session, query a minimal active profile, and clear the session when the profile is absent or inactive. The server must repeat the active-profile check in every privileged RPC because client route guards are not an authorization boundary.

The implementation should add tests for fresh login, page refresh, expired token, explicit sign-out, forged local flags, deleted profile, inactive profile, and role change during an active session. The expected result for each unauthorized condition is denial without exposing complaint data.

## Data and database plan

Before any SQL is proposed for execution, export the deployed schema, policies, functions, triggers, publication membership, storage objects, and relevant row counts. Create a timestamped migration directory. Each migration must declare affected objects, preconditions, verification queries, rollback SQL, downtime risk, and data-loss risk.

The first database change should be additive and protective: introduce server-side insert and transition functions, explicit response types, and policy tests. Plaintext removal must be staged. First stop new plaintext writes, then inventory existing rows, then backfill or re-encrypt only after the business retention decision, and finally remove plaintext columns in a separate approved migration.

## Security and privacy plan

The production data contract should be allow-listed. Public tracking should return only the minimum status information needed by a citizen. Administrative complaint details should be returned by role-scoped RPC or views, not `select('*')`. Realtime should carry a non-sensitive event identifier or a scoped notification, not the complete complaint row.

The fields named `phone_encrypted` and `national_id_encrypted` are currently SHA-256 digests generated by a trigger. They are not encrypted and cannot be decrypted. This naming and the plaintext duplicates must be addressed in the migration design; no column rename should occur before inventory and approval.

## Deployment plan

The existing CI workflow runs dependency installation, typecheck, and build. It should be extended with dependency audit, secret scan, unit tests, SQL/RLS tests against a disposable environment, bundle budgets, and artifact retention. Production environment variables must be configured only in the deployment provider. A staging project must use separate Auth, database, storage, and realtime resources.

The release process should use a version tag and an immutable commit SHA. Promotion should be blocked if the security gate fails. A production release requires a smoke test of home page, complaint submission, tracking, login, dashboard, role permissions, realtime, uploads, console, network, and errors.

## Ordered roadmap

### Phase 1 — Security foundation

Remove production reliance on localStorage for authentication and operational data. Add secret scanning, input limits, generic error responses, security event telemetry, and a documented threat model. Establish staging and backup ownership.

### Phase 2 — Database/RLS

Inventory the deployed state. Add versioned migrations. Consolidate duplicate policies. Implement scoped complaint, note, user, and audit policies. Add server-side insert and transition RPCs with locked-down `search_path`, authorization checks, validation, and minimal returns.

### Phase 3 — Authentication/RBAC

Build the role matrix in `RLS_ROLE_MATRIX.md` into automated tests. Enforce active-account checks on every privileged path. Separate administrative authority from technical administration and prevent frontend permission arrays from becoming security decisions.

### Phase 4 — Citizen experience

Keep the three-click citizen flow. Harden tracking against enumeration and brute force. Return only necessary information. Add clear failure states without leaking whether a record exists.

### Phase 5 — Dashboard/workflow

Replace unbounded reads with paginated queries. Enforce legal state transitions, assignment scope, approvals, SLA deadlines, escalation, duplicate review, and audit events on the server.

### Phase 6 — Storage/attachments

Move documents to private storage. Validate MIME, extension, size, content signature, and ownership. Use opaque paths and short-lived signed URLs. Prohibit public URLs and cross-complaint access.

### Phase 7 — Monitoring/observability

Add `/health` without secrets, structured errors, auth failure metrics, database/API latency, upload failures, realtime status, deployment alerts, and backup verification.

### Phase 8 — Testing

Add unit, integration, RLS, RPC, file, abuse, accessibility, responsive, and production smoke tests. Include all eight roles and anonymous access. Add regression fixtures for unauthorized cross-scope reads and writes.

### Phase 9 — Staging

Run migrations in staging from a clean baseline. Restore a production-like backup into an isolated environment. Run the security, performance, and smoke gates. Record the release candidate SHA and rollback drill.

### Phase 10 — Production release

Obtain the change record, backup confirmation, gate evidence, and rollback owner. Apply migrations in the approved order. Verify policy inventory, health, smoke paths, monitoring, and error rates. Promote only after verification. If a core workflow or privacy gate fails, roll back according to the runbook rather than hot-fixing blindly.

## Verification checklist for the first release candidate

| Domain | Verification |
|---|---|
| Auth | Forged local state does not open dashboard; inactive profile is denied; sign-out calls Supabase and clears the UI. |
| RLS | Anonymous, citizen, employee, supervisor, head_department, chef_cabinet, wali, and super_admin have only matrix-approved operations. |
| Complaint | Duplicate tracking IDs cannot overwrite records; assignment and status transitions are server-validated. |
| Privacy | Phone, NIN, PIN/hash, internal notes, and attachments are absent from public and unauthorized responses. |
| Realtime | Events are scoped and contain no sensitive row fields. |
| Storage | Invalid files are rejected; public URL access fails; signed URL access is scoped and expires. |
| Abuse | Tracking and submission burst tests trigger throttling without revealing record existence. |
| Performance | No unbounded dashboard query remains; indexes are justified by query plans. |
| Recovery | Backup restore and migration rollback complete in staging. |
| Production | Smoke test passes and console/network/error monitoring show no release regression. |

## Release classification

- **P0 — Must fix before any public production release:** SEC-001 through SEC-007, plus storage baseline SEC-013.
- **P1 — Must fix before official institutional use:** SEC-008 through SEC-015.
- **P2 — Important improvements:** SEC-016 through SEC-018.
- **P3 — Future enhancements:** SEC-019 and product enhancements such as advanced analytics and AI governance after the security foundation.

## References

[1]: https://github.com/nadjimlab/wil "Wilaya El Oued citizen portal repository"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security documentation"
[3]: https://supabase.com/docs/guides/auth/sessions "Supabase Auth session documentation"
[4]: https://supabase.com/docs/guides/realtime/authorization "Supabase Realtime authorization documentation"
[5]: https://supabase.com/docs/guides/storage/security/access-control "Supabase Storage access control documentation"
