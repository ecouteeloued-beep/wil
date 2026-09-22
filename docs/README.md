# Repository Guide

## Purpose

`wil` is the public citizen portal for submitting and tracking complaints for Wilaya El Oued. The repository contains the public-facing React application and the Supabase schema and security scripts required to operate it.

## Directory layout

| Path | Responsibility |
| --- | --- |
| `src/` | Public React application, pages, components, services, and shared types |
| `public/` | Small static verification and configuration files only |
| `supabase/schema.sql` | Baseline database schema, functions, triggers, Realtime setup, and baseline RLS |
| `supabase/role_permissions.sql` | Role-scoped RLS policies and helper functions |
| `supabase/admin_accounts.sql` | Explicit account-to-profile linking template |
| `supabase/admin_management.sql` | Explicit operational SQL examples; replace placeholders before use |
| `.env.example` | Public client configuration template; never add real secrets |

## Operational rules

1. Keep production data and credentials outside Git.
2. Apply database changes through reviewed SQL and verify RLS after each change.
3. Do not place generated builds, dependency directories, or large media files under version control.
4. Run `npm run lint` and `npm run build` before merging changes.
5. Treat `supabase/` as production-sensitive: review SQL with the same care as application code.
