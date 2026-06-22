
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function hashString(input) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(String(input || "")))
    .then(buffer => [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join(""));
}

function cleanSessionId(value) {
  const s = String(value || "").trim();
  if (!/^cs_(test|live)_[A-Za-z0-9_]+/.test(s)) return "";
  return s;
}

async function retrieveStripeSession(env, sessionId) {
  const url = "https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId) + "?expand[]=line_items";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "authorization": "Bearer " + env.STRIPE_SECRET_KEY
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = payload && payload.error ? payload.error.message || payload.error.type : "STRIPE_SESSION_RETRIEVE_FAILED";
    return { ok: false, status: response.status, error, raw: payload };
  }

  return { ok: true, status: response.status, session: payload };
}

function sanitizeSession(session) {
  const customerDetails = session.customer_details || {};
  const metadata = session.metadata || {};
  const lineItems = session.line_items && Array.isArray(session.line_items.data) ? session.line_items.data : [];

  return {
    id: session.id,
    object: session.object,
    livemode: session.livemode,
    status: session.status,
    payment_status: session.payment_status,
    mode: session.mode,
    amount_subtotal: session.amount_subtotal,
    amount_total: session.amount_total,
    currency: session.currency,
    customer: session.customer || null,
    subscription: session.subscription || null,
    invoice: session.invoice || null,
    created: session.created,
    expires_at: session.expires_at,
    metadata: {
      offer_id: metadata.offer_id || null,
      plan: metadata.plan || null,
      sku: metadata.sku || null,
      source: metadata.source || null
    },
    customer_email_sha256_present: Boolean(customerDetails.email || session.customer_email),
    line_items: lineItems.map(item => ({
      id: item.id,
      object: item.object,
      quantity: item.quantity,
      description: item.description,
      amount_subtotal: item.amount_subtotal,
      amount_total: item.amount_total,
      currency: item.currency,
      price: item.price ? {
        id: item.price.id,
        currency: item.price.currency,
        unit_amount: item.price.unit_amount,
        recurring: item.price.recurring || null,
        lookup_key: item.price.lookup_key || null
      } : null
    }))
  };
}

function isPaidOrComplete(session) {
  return session && (session.payment_status === "paid" || session.status === "complete");
}

async function buildEntitlement(session, source) {
  const customerDetails = session.customer_details || {};
  const email = customerDetails.email || session.customer_email || "";
  const emailHash = email ? await hashString(email.toLowerCase()) : null;
  const metadata = session.metadata || {};
  const plan = metadata.plan || "unknown";
  const offerId = metadata.offer_id || "unknown";
  const sku = metadata.sku || ("SPEEDKIT-" + String(plan).toUpperCase());

  return {
    schema: "speedkit.entitlement.v1",
    status: "ACTIVE",
    source,
    fake_checkout: false,
    provider: "stripe_checkout",
    session_id: session.id,
    stripe_mode: session.livemode ? "live" : "test",
    plan,
    sku,
    offer_id: offerId,
    payment_status: session.payment_status,
    checkout_status: session.status,
    amount_total: session.amount_total,
    currency: session.currency,
    subscription: session.subscription || null,
    customer: session.customer || null,
    customer_email_sha256: emailHash,
    entitlement_started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proof: {
      checkout_session_retrieved: true,
      kv_written: true,
      public_only: true,
      private_repository_access: false
    }
  };
}


export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = cleanSessionId(url.searchParams.get("session_id"));

  if (!env.STRIPE_SECRET_KEY) {
    return json({
      schema: "speedkit.entitlement_reconcile_response.v1",
      status: "STRIPE_SECRET_KEY_MISSING",
      fake_checkout: false
    }, 503);
  }

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.entitlement_reconcile_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      fake_checkout: false
    }, 503);
  }

  if (!sessionId) {
    return json({
      schema: "speedkit.entitlement_reconcile_response.v1",
      status: "SESSION_ID_REQUIRED",
      fake_checkout: false,
      parameter: "session_id"
    }, 400);
  }

  const result = await retrieveStripeSession(env, sessionId);
  if (!result.ok) {
    return json({
      schema: "speedkit.entitlement_reconcile_response.v1",
      status: "STRIPE_SESSION_RETRIEVE_FAILED",
      fake_checkout: false,
      error: result.error
    }, result.status || 502);
  }

  const stripeSession = result.session;
  const session = sanitizeSession(stripeSession);

  if (!isPaidOrComplete(stripeSession)) {
    return json({
      schema: "speedkit.entitlement_reconcile_response.v1",
      status: "ENTITLEMENT_PENDING",
      fake_checkout: false,
      reason: "CHECKOUT_SESSION_NOT_PAID_OR_COMPLETE",
      session
    }, 202);
  }

  const entitlement = await buildEntitlement(stripeSession, "stripe_session_reconcile");
  await env.SPEEDKIT_COMMERCE_KV.put(
    "entitlement:session:" + sessionId,
    JSON.stringify(entitlement, null, 2),
    { metadata: { schema: "speedkit.entitlement.v1", session_id: sessionId, plan: entitlement.plan } }
  );

  await env.SPEEDKIT_COMMERCE_KV.put(
    "receipt:session:" + sessionId,
    JSON.stringify({
      schema: "speedkit.receipt_proof.v1",
      status: "RECEIPT_CLOSED",
      fake_checkout: false,
      provider: "stripe_checkout",
      session_id: sessionId,
      entitlement_key: "entitlement:session:" + sessionId,
      plan: entitlement.plan,
      sku: entitlement.sku,
      offer_id: entitlement.offer_id,
      amount_total: entitlement.amount_total,
      currency: entitlement.currency,
      payment_status: entitlement.payment_status,
      checkout_status: entitlement.checkout_status,
      created_at: new Date().toISOString()
    }, null, 2),
    { metadata: { schema: "speedkit.receipt_proof.v1", session_id: sessionId } }
  );

  return json({
    schema: "speedkit.entitlement_reconcile_response.v1",
    status: "ENTITLEMENT_ACTIVE",
    fake_checkout: false,
    provider: "stripe_checkout",
    kv_written: true,
    entitlement
  });
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return json({
      schema: "speedkit.entitlement_reconcile_response.v1",
      status: "METHOD_NOT_ALLOWED"
    }, 405);
  }
  return onRequestGet(context);
}
