import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const fallbackOrigins = new Set([
  "https://wilaya-eloued.dz",
  "https://www.wilaya-eloued.dz",
  "https://wil-seven-tan.vercel.app",
]);
const configuredOrigins = (Deno.env.get("APP_ORIGINS") || "")
  .split(",").map((value) => value.trim()).filter(Boolean);
const allowedOrigins = new Set([...fallbackOrigins, ...configuredOrigins]);
const maxBodyBytes = 64 * 1024;

const originFor = (request: Request) => {
  const origin = request.headers.get("origin") || "";
  return allowedOrigins.has(origin) ? origin : "";
};
const headersFor = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Content-Type": "application/json",
});
const json = (body: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(body), { status, headers: headersFor(origin) });

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
};
const clientAddress = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("cf-connecting-ip") || "unknown";
};
const validText = (value: unknown, max: number) => typeof value === "string" && value.trim().length <= max;
const validPhone = (value: unknown) => typeof value === "string" && /^0[567][0-9]{8}$/.test(value.trim());
const validTrackingId = (value: unknown) => typeof value === "string" && /^[A-Z0-9-]{6,64}$/i.test(value.trim());
const validPin = (value: unknown) => typeof value === "string" && /^[0-9]{6,12}$/.test(value.trim());

Deno.serve(async (request: Request) => {
  const origin = originFor(request);
  if (request.method === "OPTIONS") {
    return origin ? new Response("ok", { status: 204, headers: headersFor(origin) }) : new Response("", { status: 403 });
  }
  if (!origin || request.method !== "POST") return json({ error: "request_not_allowed" }, 403, origin);

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > maxBodyBytes) return json({ error: "request_too_large" }, 413, origin);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBodyBytes) return json({ error: "request_too_large" }, 413, origin);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ error: "invalid_json" }, 400, origin); }

  const action = body?.action;
  if (!['submit_complaint', 'track_complaint', 'resolve_login_identifier'].includes(action)) {
    return json({ error: "unsupported_action" }, 400, origin);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "gateway_not_configured" }, 503, origin);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const caller = clientAddress(request);
  const ipHash = await sha256(caller);
  const limit = action === "submit_complaint" ? 10 : action === "track_complaint" ? 30 : 10;
  const window = 60;
  const ipAllowed = await admin.rpc("consume_api_rate_limit", {
    p_bucket: `edge:${action}:ip:${ipHash}`,
    p_limit: limit,
    p_window_seconds: window,
  });
  if (ipAllowed.error || ipAllowed.data !== true) return json({ error: "rate_limited" }, 429, origin);

  const payload = body?.payload;
  if (action === "submit_complaint") {
    if (!payload || typeof payload !== "object" || !validText(payload.full_name, 160) || !validPhone(payload.phone) ||
      !validText(payload.subject, 240) || !validText(payload.description, 10000) || !validText(payload.category, 120) ||
      !validText(payload.municipality, 120) || !validText(payload.daira, 120)) {
      return json({ error: "invalid_complaint_payload" }, 400, origin);
    }
    if (payload.attachments !== undefined) {
      if (!Array.isArray(payload.attachments) || payload.attachments.length > 5) return json({ error: "invalid_attachments" }, 400, origin);
      for (const file of payload.attachments) {
        if (!file || typeof file !== "object" || "dataUrl" in file || "blob" in file || !validText(file.name, 120) ||
          !/^[a-zA-Z0-9._-]+$/.test(file.name) || !/^(application\/pdf|image\/(jpeg|png|webp))$/.test(String(file.type || ""))) {
          return json({ error: "invalid_attachment_metadata" }, 400, origin);
        }
      }
    }
  } else if (action === "track_complaint") {
    if (!payload || !validTrackingId(payload.tracking_id) || !validPhone(payload.phone) || !validPin(payload.secret_pin)) {
      return json({ error: "invalid_tracking_request" }, 400, origin);
    }
    const keyHash = await sha256(`${payload.tracking_id.trim().toUpperCase()}:${payload.phone.trim()}`);
    const keyAllowed = await admin.rpc("consume_api_rate_limit", {
      p_bucket: `edge:track:key:${keyHash}`, p_limit: 5, p_window_seconds: 60,
    });
    if (keyAllowed.error || keyAllowed.data !== true) return json({ error: "rate_limited" }, 429, origin);
  } else if (!payload || !validText(payload.identifier, 80) || payload.identifier.trim().length < 3) {
    return json({ error: "invalid_login_identifier" }, 400, origin);
  }

  const publicClient = admin;
  if (action === "submit_complaint") {
    const result = await publicClient.rpc("submit_complaint", { p_payload: payload });
    if (result.error) return json({ error: "request_rejected" }, 400, origin);
    return json(result.data, 200, origin);
  }
  if (action === "track_complaint") {
    const result = await publicClient.rpc("track_complaint", {
      p_tracking_id: payload.tracking_id.trim().toUpperCase(), p_phone: payload.phone.trim(), p_secret_pin: payload.secret_pin.trim(),
    });
    if (result.error) return json({ error: "request_rejected" }, 400, origin);
    return json(result.data, 200, origin);
  }
  const result = await publicClient.rpc("resolve_login_identifier", { p_identifier: payload.identifier.trim() });
  if (result.error) return json({ error: "request_rejected" }, 400, origin);
  return json(result.data, 200, origin);
});
