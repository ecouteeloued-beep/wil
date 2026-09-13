import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://wilaya-eloued.dz",
  "https://www.wilaya-eloued.dz",
  "https://wil-seven-tan.vercel.app",
  ...(Deno.env.get("APP_ORIGINS") || "").split(",").map(value => value.trim()).filter(Boolean),
]);
const headersFor = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const allowedRoles = new Set(["super_admin", "head_department", "supervisor", "employee"]);
const rolePermissions: Record<string, string[]> = {
  super_admin: ["manage_users", "view_audit_logs", "manage_settings"],
  head_department: ["view_department", "assign_grievance", "draft_reply", "view_audit_logs"],
  supervisor: ["view_department", "assign_grievance", "draft_reply", "approve_reply", "view_audit_logs"],
  employee: ["view_assigned", "draft_reply"],
};

const json = (body: unknown, status = 200, origin = "") =>
  new Response(JSON.stringify(body), { status, headers: { ...headersFor(origin), "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  if (!allowedOrigins.has(origin)) return new Response("", { status: 403 });
  if (req.method === "OPTIONS") return new Response("ok", { headers: headersFor(origin) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401, origin);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(url, serviceKey);

  const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !caller) return json({ error: "unauthorized" }, 401, origin);
  const { data: callerProfile, error: profileError } = await admin
    .from("users").select("role,is_active").eq("id", caller.id).maybeSingle();
  if (profileError || !callerProfile?.is_active || !["super_admin"].includes(callerProfile.role)) return json({ error: "administrative_permission_required" }, 403, origin);
  const callerLimit = await admin.rpc("consume_api_rate_limit", { p_bucket: `edge:create-staff:user:${caller.id}`, p_limit: 10, p_window_seconds: 3600 });
  if (callerLimit.error || callerLimit.data !== true) return json({ error: "rate_limited" }, 429, origin);

  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const username = String(body?.username || "").trim().toLowerCase();
  const name = String(body?.name || "").trim();
  const phone = String(body?.phone || "").trim();
  const department = String(body?.department || "").trim();
  const role = String(body?.role || "employee");
  const requestedPermissions = Array.isArray(body?.permissions) ? body.permissions.filter((value: unknown): value is string => typeof value === "string") : [];
  const permissions = requestedPermissions.length ? [...new Set(requestedPermissions.filter(permission => (rolePermissions[role] || []).includes(permission)))] : rolePermissions[role] || [];
  if (!email || !username || !name || !department || !allowedRoles.has(role)) return json({ error: "invalid_staff_payload" }, 400, origin);
  if (!/^[A-Za-z0-9._-]{3,40}$/.test(username) || !/^\S+@\S+\.\S+$/.test(email) || phone.length > 32) return json({ error: "invalid_username_or_email" }, 400, origin);

  const { data: existingUsername } = await admin.from("users").select("id").eq("username", username).maybeSingle();
  if (existingUsername) return json({ error: "username_already_exists" }, 409, origin);
  const { data: existingEmail } = await admin.from("users").select("id").eq("email", email).maybeSingle();
  if (existingEmail) return json({ error: "email_already_exists" }, 409, origin);

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name, username, role },
  });
  if (inviteError || !invited.user) return json({ error: "invite_failed" }, 400, origin);

  const { error: insertError } = await admin.from("users").insert({
    id: invited.user.id, username, name, email, phone: phone || null, department,
    role, permissions, is_active: true,
  });
  if (insertError) {
    await admin.auth.admin.deleteUser(invited.user.id);
    return json({ error: "staff_creation_failed" }, 400, origin);
  }
  return json({ success: true, user_id: invited.user.id }, 200, origin);
});
