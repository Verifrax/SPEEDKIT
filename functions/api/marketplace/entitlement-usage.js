
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
  return String(value || "").trim().replace(/[^A-Za-z0-9_:.@-]/g, "").slice(0, 200);
}

function toUnits(value) {
  const n = Number(value || 1);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(Math.floor(n), 1000);
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

async function probeSession(origin, sessionId) {
  const response = await fetch(origin + "/api/marketplace/session?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now());
  const payload = await response.json().catch(() => ({
    schema: "speedkit.checkout_session_probe.v1",
    status: "SESSION_PROBE_PARSE_FAILED"
  }));
  return { ok: response.ok, http_status: response.status, payload };
}

async function reconcileEntitlement(origin, sessionId) {
  const response = await fetch(origin + "/api/marketplace/entitlement-reconcile?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now());
  const payload = await response.json().catch(() => ({
    schema: "speedkit.entitlement_reconcile_response.v1",
    status: "ENTITLEMENT_RECONCILE_PARSE_FAILED"
  }));
  return { ok: response.ok, http_status: response.status, payload };
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const sessionId = cleanId(url.searchParams.get("session_id"));

  if (!sessionId) {
    return json({
      schema: "speedkit.entitlement_usage_response.v1",
      status: "SESSION_ID_REQUIRED",
      fake_checkout: false,
      parameter: "session_id"
    }, 400);
  }

  const probe = await probeSession(url.origin, sessionId);
  const session = probe.payload && probe.payload.session ? probe.payload.session : null;
  const plan = derivePlanFromSession(session);

  return json({
    schema: "speedkit.entitlement_usage_response.v1",
    status: "ENTITLEMENT_USAGE_SESSION_PROBE",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    session_id: sessionId,
    session_status: session ? session.status : null,
    payment_status: session ? session.payment_status : null,
    plan_from_session: plan || null,
    paid_or_complete: paidOrComplete(session),
    session_probe: probe.payload
  }, probe.ok ? 200 : probe.http_status);
}

export async function onRequestPost(context) {
  const { request } = context;
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));

  const sessionId = cleanId(body.session_id);
  const capability = cleanId(body.capability).toLowerCase();
  const event = cleanId(body.event || "entitlement_usage_event") || "entitlement_usage_event";
  const units = toUnits(body.units);
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

  if (!sessionId || !capability) {
    return json({
      schema: "speedkit.entitlement_usage_response.v1",
      status: "SESSION_ID_AND_CAPABILITY_REQUIRED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      required: ["session_id", "capability"]
    }, 400);
  }

  const probe = await probeSession(url.origin, sessionId);
  const session = probe.payload && probe.payload.session ? probe.payload.session : null;

  if (!probe.ok || !session) {
    return json({
      schema: "speedkit.entitlement_usage_response.v1",
      status: "ENTITLEMENT_USAGE_SESSION_PROBE_FAILED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      ledger_written: false,
      usage_recorded: false,
      session_id: sessionId,
      session_probe_http_status: probe.http_status,
      session_probe: probe.payload
    }, probe.http_status || 404);
  }

  const plan = derivePlanFromSession(session);

  if (!plan) {
    return json({
      schema: "speedkit.entitlement_usage_response.v1",
      status: "ENTITLEMENT_USAGE_PLAN_NOT_RESOLVED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      ledger_written: false,
      usage_recorded: false,
      session_id: sessionId,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        metadata: session.metadata || {}
      },
      reason: "SESSION_METADATA_DOES_NOT_CONTAIN_RECOGNIZED_PLAN"
    }, 409);
  }

  if (!paidOrComplete(session)) {
    return json({
      schema: "speedkit.entitlement_usage_response.v1",
      status: "ENTITLEMENT_USAGE_PENDING",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      ledger_written: false,
      usage_recorded: false,
      session_id: sessionId,
      plan_from_session: plan,
      capability,
      reason: "CHECKOUT_SESSION_NOT_PAID_OR_COMPLETE",
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        mode: session.mode,
        currency: session.currency,
        amount_total: session.amount_total,
        metadata: session.metadata || {}
      },
      authority: {
        session_probe_api: "/api/marketplace/session",
        entitlement_usage_policy: "/marketplace/entitlement-usage-policy.json"
      }
    }, 402);
  }

  const reconcile = await reconcileEntitlement(url.origin, sessionId);

  const ledgerResponse = await fetch(url.origin + "/api/marketplace/usage-ledger", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      plan,
      capability,
      event,
      units,
      metadata: {
        ...metadata,
        entitlement_bound: true,
        plan_authority: "checkout_session_metadata",
        checkout_session_id: sessionId
      }
    })
  });

  const ledgerPayload = await ledgerResponse.json().catch(() => ({
    schema: "speedkit.usage_ledger_response.v1",
    status: "USAGE_LEDGER_PARSE_FAILED"
  }));

  if (!ledgerResponse.ok || ledgerPayload.status !== "USAGE_LEDGER_RECORDED") {
    return json({
      schema: "speedkit.entitlement_usage_response.v1",
      status: "ENTITLEMENT_USAGE_NOT_RECORDED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      ledger_written: false,
      usage_recorded: false,
      session_id: sessionId,
      plan_from_session: plan,
      capability,
      ledger_response: ledgerPayload,
      entitlement_reconcile: reconcile.payload
    }, ledgerResponse.status || 409);
  }

  return json({
    schema: "speedkit.entitlement_usage_response.v1",
    status: "ENTITLEMENT_USAGE_LEDGER_RECORDED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    ledger_written: true,
    usage_recorded: true,
    session_id: sessionId,
    plan_from_session: plan,
    capability,
    units,
    event_hash: ledgerPayload.event_hash,
    sequence: ledgerPayload.sequence,
    ledger: ledgerPayload.ledger,
    ledger_verify_api: "/api/marketplace/usage-ledger-verify?session_id=" + encodeURIComponent(sessionId),
    entitlement_reconcile: reconcile.payload,
    ledger_response: ledgerPayload
  });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({
    schema: "speedkit.entitlement_usage_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
