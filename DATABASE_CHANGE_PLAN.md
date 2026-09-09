# Database Change Plan

**Project:** `nadjimlab/wil`  
**Status:** Design only. No SQL was executed.  
**Safety rule:** Do not apply any production migration until the deployed-state inventory, backup, approval, and rollback rehearsal are complete.

## Current database evidence

The repository contains `supabase/schema.sql`, `supabase/role_permissions.sql`, `supabase/admin_accounts.sql`, and `supabase/admin_management.sql`, but no `supabase/migrations/` directory. The schema creates `public.users`, `public.complaints`, `public.internal_notes`, `public.audit_logs`, departments, and municipalities. It enables RLS and creates triggers/functions, but source files alone do not prove the deployed state.

The most important conflict is between `schema.sql:162-172`, which grants active staff broad complaint SELECT/UPDATE access, and the role-scoped policies in `role_permissions.sql`. PostgreSQL policy composition must be inspected in the actual project before a change is designed as a simple replacement.

## Required pre-change inventory

Run the following read-only queries in the production project using an authorized database connection. Export results to a protected change record. Use explicit limits for sample data and never export citizen values unnecessarily.

```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as result_type,
       p.prosecdef as security_definer,
       p.proconfig as configuration
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname
limit 200;

select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname
limit 300;

select c.relname as table_name,
       c.relreplident as replica_identity,
       exists (select 1 from pg_publication_tables pt
               where pt.schemaname = 'public' and pt.tablename = c.relname) as in_realtime
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;
```

Also inventory storage buckets and object policies through the Supabase dashboard/API. The repository does not define a storage bucket or storage policy, so storage safety cannot be inferred from source.

## Backup and rollback preconditions

Before any production-affecting migration:

1. Create a managed database backup or export with a recorded identifier.
2. Record row counts for `users`, `complaints`, `internal_notes`, and `audit_logs`; do not copy sensitive values into the change record.
3. Restore the backup into an isolated project and run the verification queries.
4. Save the current policy/function/index/publication definitions.
5. Rehearse the rollback on the isolated project.
6. Confirm an owner, maintenance window, monitoring contact, and stop condition.

The plan intentionally does not prescribe `DROP TABLE`, `TRUNCATE`, broad `DELETE`, or destructive RLS removal.

## Proposed migration sequence

### Migration 1 — Versioning and protective functions

**Affected objects:** New migration files; new insert and transition functions; grants.  
**Change:** Add server-side functions that generate a tracking ID, insert a complaint once, transition status, assign a complaint, and write an audit event in one transaction. Functions must use `SECURITY DEFINER` only where necessary, set a fixed `search_path`, derive actor identity from `auth.uid()`, validate all input, and return minimal columns.  
**Data-loss risk:** Low; additive.  
**Downtime risk:** Low; deploy functions before switching the client.  
**Rollback:** Revoke execute from public/authenticated and restore the previous client only if duplicate-write risk is understood. Drop functions only after no client references remain.  
**Verification:** `pg_proc` configuration, grants, direct unauthorized RPC calls, duplicate insert, transition matrix, and audit-row assertions.

### Migration 2 — Policy consolidation

**Affected objects:** Complaint, users, internal notes, audit log, and related policies.  
**Change:** Remove only named obsolete policies after the deployed inventory confirms their names and semantics. Create one explicit policy set per operation using role and scope helpers. Do not assume `role_permissions.sql` was executed.  
**Data-loss risk:** No row deletion, but access outage or overgrant is possible.  
**Downtime risk:** Medium if policies are changed without staged tests.  
**Rollback:** Apply a tested down migration that restores the captured policy definitions. Do not use blanket `disable row level security` as rollback.  
**Verification:** `pg_policies`, role matrix tests, and anonymous/public tests.

### Migration 3 — Stop plaintext writes

**Affected objects:** Complaint insert RPC and application payload contract.  
**Change:** Stop writing `citizen_phone` and `citizen_nin` for new submissions. Continue using a normalized digest for phone verification. Keep the existing columns temporarily for controlled backfill/retention assessment; do not rename them in this phase.  
**Data-loss risk:** Low for new rows; citizen tracking must be tested before cutover.  
**Downtime risk:** Low if the old client is blocked only after the new RPC is verified.  
**Rollback:** Restore the previous insert payload only during a controlled rollback; do not re-enable plaintext writes for routine recovery.  
**Verification:** Insert a synthetic test complaint, inspect only null/non-sensitive indicators, call tracking, and inspect realtime payload shape.

### Migration 4 — Sensitive-data remediation

**Affected objects:** Existing complaint rows and plaintext columns.  
**Change:** Inventory and classify existing plaintext values. Define whether authorized staff require reversible encryption or only verification digests. If reversible access is required, use a managed key path unavailable to the frontend. Backfill under a controlled job, verify counts, then schedule column removal as a separately approved migration.  
**Data-loss risk:** High if the key or backfill is wrong; no deletion in the first pass.  
**Downtime risk:** Medium for a large backfill; use batches and monitoring.  
**Rollback:** Restore from backup or restore encrypted values from the staged backup; do not claim rollback if plaintext has been irreversibly deleted.  
**Verification:** Row-count reconciliation, digest matching for synthetic fixtures, authorized field access tests, and no plaintext in responses/logs.

### Migration 5 — Indexes and bounded queries

**Affected objects:** Indexes on `tracking_id`, phone digest, status, priority, assigned department/user, municipality, created time, and deadline only where query plans justify them.  
**Change:** Capture `EXPLAIN (ANALYZE, BUFFERS)` in staging first. Add indexes concurrently where supported and safe.  
**Data-loss risk:** None expected.  
**Downtime risk:** Low to medium depending on table size and index method.  
**Rollback:** Drop only the named new indexes after observing query impact.  
**Verification:** Query plans, latency, write overhead, and index validity.

### Migration 6 — Realtime reduction

**Affected objects:** Publication membership, realtime event contract, and possibly scoped channel authorization.  
**Change:** Stop broadcasting complete complaint rows. Publish a non-sensitive event or use a server-mediated notification that reveals only authorized identifiers.  
**Data-loss risk:** None expected; missed notifications are the principal risk.  
**Downtime risk:** Low if the client has polling fallback during cutover.  
**Rollback:** Restore publication/channel membership only after confirming it does not re-expose sensitive data.  
**Verification:** Anonymous, citizen, and cross-department subscription tests; inspect payload keys.

## Verification queries after each migration

```sql
select count(*) as complaint_count
from public.complaints;

select count(*) as plaintext_phone_rows
from public.complaints
where citizen_phone is not null and length(trim(citizen_phone)) > 0;

select count(*) as plaintext_nin_rows
from public.complaints
where citizen_nin is not null and length(trim(citizen_nin)) > 0;

select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'complaints'
order by indexname;
```

The plaintext count queries are for controlled migration verification only. Their result must be stored as a count, not as exported citizen values.

## Post-migration security tests

The test harness must create isolated fixtures for each role and verify allowed and denied SELECT, INSERT, UPDATE, and DELETE operations. It must test complaint scope, field minimization, assignment, priority, state transitions, internal notes, audit immutability, tracking responses, realtime subscriptions, and storage access. Tests must include anonymous access and a disabled staff profile.

The harness must also verify that every `SECURITY DEFINER` function has a fixed `search_path`, derives identity from `auth.uid()`, validates input, returns minimal data, and cannot be called by unauthorized roles. A successful database build or frontend typecheck is not a substitute for these tests.

## Stop conditions

Stop and roll back the migration procedure if any of the following occurs:

- Row counts differ without a documented explanation.
- An unauthorized role can read or modify a complaint, note, attachment, or user record.
- A public response contains phone, NIN, PIN/hash, internal notes, or private attachment information.
- A duplicate public submission overwrites an existing complaint.
- A transition bypasses the approved state machine.
- Realtime sends a cross-scope or sensitive payload.
- Error rate, latency, or queue depth exceeds the agreed threshold.
- Backup restore cannot reproduce the pre-change verification state.

## References

[1]: https://github.com/nadjimlab/wil "Wilaya El Oued citizen portal repository"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security documentation"
[3]: https://supabase.com/docs/guides/database/functions "Supabase database functions documentation"
[4]: https://supabase.com/docs/guides/realtime/authorization "Supabase Realtime authorization documentation"
[5]: https://supabase.com/docs/guides/storage/security/access-control "Supabase Storage access control documentation"
