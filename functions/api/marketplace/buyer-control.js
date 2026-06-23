
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanId(value) {
  return String(value || "").trim().replace(/[^A-Za-z0-9_:.@-]/g, "").slice(0, 220);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({
    schema: "speedkit.fetch_response.v1",
    status: "JSON_PARSE_FAILED"
  }));
  return { ok: response.ok, http_status: response.status, payload };
}

function derivePlanFromSession(session) {
  const metadata = session && typeof session.metadata === "object" ? session.metadata : {};
  const plan = String(metadata.plan || "").toLowerCase();
  const sku = String(metadata.sku || "").toUpperCase();

  if (plan === "starter" || plan === "pro" || plan === "enterprise") return plan;
  if (sku.includes("ENTERPRISE")) return "enterprise";
  if (sku.includes("PRO")) return "pro";
  if (sku.includes("STARTER")) return "starter";

  return "";
}

function paidOrComplete(session) {
  if (!session || typeof session !== "object") return false;
  return session.payment_status === "paid" || session.status === "complete";
}

function controlStatus(session, plan) {
  if (!session) return "BUYER_CONTROL_SESSION_NOT_FOUND";
  if (!plan) return "BUYER_CONTROL_PLAN_NOT_RESOLVED";
  if (!paidOrComplete(session)) return "BUYER_CONTROL_PENDING";
  return "BUYER_CONTROL_READY";
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const sessionId = cleanId(url.searchParams.get("session_id"));

  if (!sessionId) {
    return json({
      schema: "speedkit.buyer_control_response.v1",
      status: "SESSION_ID_REQUIRED",
      fake_checkout: false,
      parameter: "session_id"
    }, 400);
  }

  const sessionProbe = await fetchJson(url.origin + "/api/marketplace/session?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now());
  const session = sessionProbe.payload && sessionProbe.payload.session ? sessionProbe.payload.session : null;
  const plan = derivePlanFromSession(session);
  const paid = paidOrComplete(session);
  const status = controlStatus(session, plan);

  let quota = null;
  let ledger = null;
  let verification = null;

  if (plan) {
    quota = await fetchJson(url.origin + "/api/marketplace/quota?plan=" + encodeURIComponent(plan) + "&t=" + Date.now());
  }

  ledger = await fetchJson(url.origin + "/api/marketplace/usage-ledger?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now());
  verification = await fetchJson(url.origin + "/api/marketplace/usage-ledger-verify?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now());

  const httpStatus = status === "BUYER_CONTROL_SESSION_NOT_FOUND" ? 404 : 200;

  return json({
    schema: "speedkit.buyer_control_response.v1",
    status,
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    session_id: sessionId,
    plan_from_session: plan || null,
    paid_or_complete: paid,
    caller_plan_authority: false,
    buyer_control: {
      can_write_entitlement_usage_now: status === "BUYER_CONTROL_READY",
      pending_reason: status === "BUYER_CONTROL_PENDING" ? "CHECKOUT_SESSION_NOT_PAID_OR_COMPLETE" : null,
      session_authority: "checkout_session_metadata",
      quota_attached: !!(quota && quota.payload && quota.payload.quota),
      ledger_attached: !!(ledger && ledger.payload && ledger.payload.ledger),
      cold_replay_attached: !!(verification && verification.payload && verification.payload.schema)
    },
    session: session ? {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      mode: session.mode,
      currency: session.currency,
      amount_total: session.amount_total,
      metadata: session.metadata || {}
    } : null,
    quota_response: quota ? {
      http_status: quota.http_status,
      status: quota.payload.status,
      quota: quota.payload.quota || null
    } : null,
    ledger_response: ledger ? {
      http_status: ledger.http_status,
      status: ledger.payload.status,
      ledger: ledger.payload.ledger || null
    } : null,
    ledger_verify_response: verification ? {
      http_status: verification.http_status,
      status: verification.payload.status,
      valid: verification.payload.valid === true,
      ledger: verification.payload.ledger || null,
      verification: verification.payload.verification || null
    } : null,
    routes: {
      entitlement_usage: "/api/marketplace/entitlement-usage",
      quota: plan ? "/api/marketplace/quota?plan=" + encodeURIComponent(plan) : "/api/marketplace/quota",
      usage_ledger: "/api/marketplace/usage-ledger?session_id=" + encodeURIComponent(sessionId),
      ledger_verify: "/api/marketplace/usage-ledger-verify?session_id=" + encodeURIComponent(sessionId)
    }
  }, httpStatus);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.buyer_control_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
