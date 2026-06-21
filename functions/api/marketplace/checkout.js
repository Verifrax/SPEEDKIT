const PLANS = {
  starter: {
    plan_id: "starter",
    sku: "SPEEDKIT-STARTER",
    mode: "subscription",
    price_env: "STRIPE_PRICE_SPEEDKIT_STARTER"
  },
  pro: {
    plan_id: "pro",
    sku: "SPEEDKIT-PRO",
    mode: "subscription",
    price_env: "STRIPE_PRICE_SPEEDKIT_PRO"
  },
  enterprise: {
    plan_id: "enterprise",
    sku: "SPEEDKIT-ENTERPRISE",
    mode: "subscription",
    price_env: "STRIPE_PRICE_SPEEDKIT_ENTERPRISE"
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2) + "\n", {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

function configured(env) {
  return {
    stripe_secret_key: Boolean(env.STRIPE_SECRET_KEY),
    stripe_price_starter: Boolean(env.STRIPE_PRICE_SPEEDKIT_STARTER),
    stripe_price_pro: Boolean(env.STRIPE_PRICE_SPEEDKIT_PRO),
    stripe_price_enterprise: Boolean(env.STRIPE_PRICE_SPEEDKIT_ENTERPRISE),
    base_url: Boolean(env.SPEEDKIT_BASE_URL)
  };
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet({ env }) {
  return json({
    schema: "speedkit.checkout_endpoint.v1",
    status: "READY_FAIL_CLOSED",
    fake_checkout: false,
    provider: "stripe_checkout",
    configured: configured(env),
    required_body: {
      plan: Object.keys(PLANS),
      offer_id: "offer-wsp-001"
    }
  });
}

export async function onRequestPost({ request, env }) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({
      schema: "speedkit.checkout_response.v1",
      status: "BAD_REQUEST",
      error: "JSON_BODY_REQUIRED"
    }, 400);
  }

  const planId = String(body.plan || "").toLowerCase();
  const offerId = String(body.offer_id || "");

  if (!PLANS[planId]) {
    return json({
      schema: "speedkit.checkout_response.v1",
      status: "BAD_REQUEST",
      error: "UNKNOWN_PLAN",
      allowed_plans: Object.keys(PLANS)
    }, 400);
  }

  if (!/^offer-wsp-\d{3}$/.test(offerId)) {
    return json({
      schema: "speedkit.checkout_response.v1",
      status: "BAD_REQUEST",
      error: "INVALID_OFFER_ID"
    }, 400);
  }

  const plan = PLANS[planId];
  const priceId = env[plan.price_env];
  const baseUrl = String(env.SPEEDKIT_BASE_URL || new URL(request.url).origin).replace(/\/+$/, "");

  if (!env.STRIPE_SECRET_KEY || !priceId) {
    return json({
      schema: "speedkit.checkout_response.v1",
      status: "COMMERCE_NOT_CONFIGURED",
      fake_checkout: false,
      error: "REAL_PROVIDER_SECRET_OR_PRICE_ID_MISSING",
      missing: {
        STRIPE_SECRET_KEY: !env.STRIPE_SECRET_KEY,
        [plan.price_env]: !priceId
      }
    }, 503);
  }

  const params = new URLSearchParams();
  params.set("mode", plan.mode);
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${baseUrl}/marketplace/billing/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${baseUrl}/marketplace/billing/?checkout=cancelled`);
  params.set("client_reference_id", offerId);
  params.set("metadata[offer_id]", offerId);
  params.set("metadata[plan]", planId);
  params.set("metadata[sku]", plan.sku);
  params.set("metadata[source]", "speedkit_marketplace");

  const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const result = await stripe.json();

  if (!stripe.ok) {
    return json({
      schema: "speedkit.checkout_response.v1",
      status: "PROVIDER_ERROR",
      fake_checkout: false,
      provider_status: stripe.status,
      provider_error: result
    }, 502);
  }

  return json({
    schema: "speedkit.checkout_response.v1",
    status: "CHECKOUT_SESSION_CREATED",
    fake_checkout: false,
    provider: "stripe_checkout",
    plan: planId,
    offer_id: offerId,
    session_id: result.id,
    checkout_url: result.url
  });
}
