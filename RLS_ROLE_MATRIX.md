# RLS Role Matrix

**Project:** `nadjimlab/wil`  
**Status:** Proposed target state for implementation and testing.  
**Important:** This document is not proof of the currently deployed policy state. The repository contains SQL files but no versioned migration directory, so the effective Supabase policies must be exported and compared before changes.

## Roles

| Role | Business meaning | Security boundary |
|---|---|---|
| `wali` | Wilaya executive authority | Broad administrative visibility and approval, subject to audit and least privilege. |
| `chef_cabinet` | Cabinet/general coordination | Broad operational visibility and coordination; not technical ownership. |
| `head_department` | Department head | Department-scoped operational access. |
| `supervisor` | Listening-cell supervisor | Operational supervision and assignment within approved scope. |
| `employee` | Assigned case worker | Assigned complaints and permitted drafting only. |
| `super_admin` | Technical administrator | Technical configuration and account support; no independent administrative decision authority. |
| citizen/anonymous | Public citizen | Submit and track only through dedicated public functions. |

## Legend

- **A** — Allowed after server-side authorization and audit where applicable.
- **S** — Allowed only within department, municipality, or assignment scope.
- **D** — Denied.
- **R** — Read-only.
- **RPC** — Must be implemented through a secure RPC or view; direct table access is not sufficient.

## Resource matrix

| Capability | Anonymous/citizen | employee | supervisor | head_department | chef_cabinet | wali | super_admin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Public complaint submission | A via insert RPC | A via insert RPC | A via insert RPC | A via insert RPC | A via insert RPC | A via insert RPC | A via insert RPC |
| Public complaint tracking | A via tracking RPC | A via tracking RPC | A via tracking RPC | A via tracking RPC | A via tracking RPC | A via tracking RPC | A via tracking RPC |
| Dashboard shell | D | A/S | A/S | A/S | A | A | A for technical views |
| Complaint list | D | S assigned | S department/supervision | S department | A operational | A operational | D by default; explicit break-glass only |
| Complaint details | D | S assigned | S in scope | S in department | A operational | A operational | D by default; support view only if approved |
| Citizen phone/NIN | D | S only when necessary | S only when necessary | S only when necessary | S only when necessary | S only when necessary | D by default |
| Assignment | D | D | A/S | A/S | A | A | D |
| Status change | D | A/S through transition RPC | A/S through transition RPC | A/S through transition RPC | A through transition RPC | A through transition RPC | D |
| Priority change | D | D or request only | A/S | A/S | A | A | D |
| Internal notes read | D | S complaint scope | S complaint scope | S complaint scope | A complaint scope | A complaint scope | D by default |
| Internal notes insert | D | S complaint scope | S complaint scope | S complaint scope | A complaint scope | A complaint scope | D by default |
| Internal notes update | D | Own note or policy-approved scope | S | S | A | A | D |
| Internal note delete | D | D | D | D | D unless retention process | D unless retention process | D |
| Departments read | A for public reference fields | A/R | A/R | A/R | A/R | A/R | A/R |
| Departments manage | D | D | D | Request only | A/S | A | A only technical metadata |
| Municipalities read | A | A/R | A/R | A/R | A/R | A/R | A/R |
| Municipalities manage | D | D | D | D | A/S | A | A only technical metadata |
| Users read own profile | D | A | A | A | A | A | A |
| Users read directory | D | D or minimum directory | S | S | A | A | A technical minimum |
| Users create/update | D | D | D or delegated limited | S delegated | A | A | A technical fields only |
| Users activate/deactivate | D | D | D | D | A delegated | A | A technical support only |
| Role changes | D | D | D | D | Request/approve | A | A only through controlled support process |
| Permission changes | D | D | D | D | D | A business permissions | A technical permissions only |
| Audit logs read | D | D | S minimum | S minimum | A | A | A technical security events |
| Audit logs insert | D | RPC only | RPC only | RPC only | RPC only | RPC only | RPC only |
| Audit logs update/delete | D | D | D | D | D | D | D |
| Settings read | D | S operational | S operational | S operational | A operational | A | A technical settings only |
| Settings update | D | D | D | D | A delegated | A | A technical settings only |
| Reports/analytics | D | S assigned/aggregated | S operational | S department | A | A | A technical aggregates only |
| Attachments upload | A via submission path | S complaint scope | S complaint scope | S department | A complaint scope | A complaint scope | D by default |
| Attachments read | D except public-safe response | S complaint scope | S complaint scope | S department | A complaint scope | A complaint scope | D by default |
| Attachments delete | D | D | D | D | A policy-approved | A policy-approved | D |

## Required database rules

The table above must be enforced by PostgreSQL RLS, secure RPCs, and storage policies. React visibility, local permission arrays, route guards, URL parameters, and localStorage state are not enforcement mechanisms.

Complaint operations should be exposed through separate server functions rather than a general update path. A transition function must derive the actor from `auth.uid()`, load the actor profile, verify active status, verify scope, validate the current and target states, validate field changes, write an audit event, and commit atomically.

Sensitive citizen fields should not be granted through a general complaint select policy. Use explicit views or RPC return types that omit phone, NIN, PIN/hash, internal notes, and attachment metadata unless the actor and purpose are authorized.

## RLS test matrix

Each test must run with a real Supabase JWT for the role, not a client-supplied role field. Every operation must record expected and actual result without storing sensitive values in test output.

| Test family | Anonymous/citizen | employee | supervisor | head_department | chef_cabinet | wali | super_admin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Read own allowed complaint scope | Public RPC only | Pass | Pass | Pass | Pass | Pass | Pass according to support policy |
| Read another scope | Deny | Deny | Deny | Deny | Deny unless global operational scope | Deny only outside authority | Deny by default |
| Insert complaint | Pass via public RPC | Pass via public RPC | Pass via public RPC | Pass via public RPC | Pass via public RPC | Pass via public RPC | Pass via public RPC |
| Update assignment illegally | Deny | Deny | Deny | Deny | Deny outside delegation | Deny outside authority | Deny |
| Skip workflow transition | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| Change priority illegally | Deny | Deny | Deny | Deny | Deny outside scope | Deny outside authority | Deny |
| Read internal note outside scope | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| Update/delete audit row | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| Subscribe to unrelated realtime event | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| Read private attachment outside scope | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

## Current-state discrepancies requiring verification

`supabase/schema.sql:162-172` contains broad active-staff complaint policies. `supabase/role_permissions.sql` contains role-scoped policies with the same table and different policy names. Because PostgreSQL can combine permissive policies, the effective state cannot be inferred safely from source ordering. Export `pg_policies`, function definitions, grants, and storage policies from the actual project before relying on this matrix.

`src/services/adminService.ts:65-72` defines UI permission arrays, and `:181-204` uses a local authentication flag. These are implementation details to remove from the authorization path. The database actor role and active status must remain authoritative.

## References

[1]: https://github.com/nadjimlab/wil "Wilaya El Oued citizen portal repository"
[2]: https://www.postgresql.org/docs/current/ddl-priv.html "PostgreSQL privilege system"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security documentation"
[4]: https://supabase.com/docs/guides/auth/row-level-security "Supabase Auth and Row Level Security guidance"
