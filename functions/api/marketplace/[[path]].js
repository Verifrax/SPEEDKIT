import * as ControlChainArchiveApi from "./control-chain-archive.js";
import * as ControlChainSealVerifyApi from "./control-chain-seal-verify.js";
import * as ControlChainSealApi from "./control-chain-seal.js";
import * as ControlChainCertificateVerifyApi from "./control-chain-certificate-verify.js";
import * as ControlChainCertificateApi from "./control-chain-certificate.js";
import * as ControlChainVerifyApi from "./control-chain-verify.js";
import * as ControlChainIndexApi from "./control-chain-index.js";
import * as ControlReceiptVerifyApi from "./control-receipt-verify.js";
import * as ControlReceiptApi from "./control-receipt.js";
import * as ControlDigestApi from "./control-digest.js";
import * as ControlClosureApi from "./control-closure.js";
import * as BuyerControlApi from "./buyer-control.js";
import * as EntitlementUsageApi from "./entitlement-usage.js";
import * as UsageLedgerVerifyApi from "./usage-ledger-verify.js";
import * as QuotaApi from "./quota.js";
import * as SessionApi from "./session.js";
import * as EntitlementReconcileApi from "./entitlement-reconcile.js";
import * as ReceiptApi from "./receipt.js";
import * as ControlApi from "./control.js";
import * as PlanApi from "./plan.js";
import * as CapabilityApi from "./capability.js";
import * as AccessCheckApi from "./access-check.js";
import * as UsageApi from "./usage.js";
import * as UsageLedgerApi from "./usage-ledger.js";

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
      "access-control-allow-headers": "content-type,stripe-signature"
    }
  });
}

function commerceConfigured(env) {
  return {
    stripe_secret_key: Boolean(env.STRIPE_SECRET_KEY),
    stripe_webhook_secret: Boolean(env.STRIPE_WEBHOOK_SECRET),
    stripe_price_starter: Boolean(env.STRIPE_PRICE_SPEEDKIT_STARTER),
    stripe_price_pro: Boolean(env.STRIPE_PRICE_SPEEDKIT_PRO),
    stripe_price_enterprise: Boolean(env.STRIPE_PRICE_SPEEDKIT_ENTERPRISE),
    speedkit_base_url: Boolean(env.SPEEDKIT_BASE_URL),
    commerce_kv: Boolean(env.SPEEDKIT_COMMERCE_KV)
  };
}

function allReady(c) {
  return c.stripe_secret_key &&
    c.stripe_webhook_secret &&
    c.stripe_price_starter &&
    c.stripe_price_pro &&
    c.stripe_price_enterprise &&
    c.speedkit_base_url &&
    c.commerce_kv;
}

function parseStripeSignature(header) {
  const out = {};
  for (const part of String(header || "").split(",")) {
    const [k, v] = part.split("=");
    if (k && v) out[k] = v;
  }
  return out;
}

function hex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function hmac(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

async function checkoutGet(env) {
  return json({
    schema: "speedkit.checkout_endpoint.v1",
    status: "READY_FAIL_CLOSED",
    fake_checkout: false,
    provider: "stripe_checkout",
    configured: commerceConfigured(env),
    required_body: {
      plan: Object.keys(PLANS),
      offer_id: "offer-wsp-001"
    }
  });
}

async function checkoutPost(request, env) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({
      schema: "speedkit.checkout_response.v1",
      status: "BAD_REQUEST",
      error: "JSON_BODY_REQUIRED",
      fake_checkout: false
    }, 400);
  }

  const planId = String(body.plan || "").toLowerCase();
  const offerId = String(body.offer_id || "");

  if (!PLANS[planId]) {
    return json({
      schema: "speedkit.checkout_response.v1",
      status: "BAD_REQUEST",
      error: "UNKNOWN_PLAN",
      fake_checkout: false,
      allowed_plans: Object.keys(PLANS)
    }, 400);
  }

  if (!/^offer-wsp-\d{3}$/.test(offerId)) {
    return json({
      schema: "speedkit.checkout_response.v1",
      status: "BAD_REQUEST",
      error: "INVALID_OFFER_ID",
      fake_checkout: false
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

async function runtimeGet(env) {
  const configured = commerceConfigured(env);
  return json({
    schema: "speedkit.marketplace_runtime.v1",
    status: allReady(configured) ? "COMMERCE_READY" : "COMMERCE_FAIL_CLOSED",
    fake_checkout: false,
    provider: "stripe_checkout",
    configured,
    endpoints: {
      checkout: "/api/marketplace/checkout",
      webhook: "/api/marketplace/stripe-webhook",
      entitlement: "/api/marketplace/entitlement"
    }
  });
}

async function webhookGet(env) {
  return json({
    schema: "speedkit.stripe_webhook_endpoint.v1",
    status: "READY_FAIL_CLOSED",
    fake_webhook: false,
    configured: {
      stripe_webhook_secret: Boolean(env.STRIPE_WEBHOOK_SECRET),
      commerce_kv: Boolean(env.SPEEDKIT_COMMERCE_KV)
    }
  });
}

async function webhookPost(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return json({
      schema: "speedkit.stripe_webhook_response.v1",
      status: "WEBHOOK_NOT_CONFIGURED",
      error: "STRIPE_WEBHOOK_SECRET_MISSING"
    }, 503);
  }

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.stripe_webhook_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      error: "SPEEDKIT_COMMERCE_KV_BINDING_MISSING"
    }, 503);
  }

  const raw = await request.text();
  const sig = parseStripeSignature(request.headers.get("stripe-signature"));
  if (!sig.t || !sig.v1) {
    return json({
      schema: "speedkit.stripe_webhook_response.v1",
      status: "BAD_SIGNATURE",
      error: "STRIPE_SIGNATURE_HEADER_INVALID"
    }, 400);
  }

  const expected = await hmac(env.STRIPE_WEBHOOK_SECRET, `${sig.t}.${raw}`);
  if (!safeEqual(expected, sig.v1)) {
    return json({
      schema: "speedkit.stripe_webhook_response.v1",
      status: "BAD_SIGNATURE",
      error: "STRIPE_SIGNATURE_VERIFICATION_FAILED"
    }, 400);
  }

  const event = JSON.parse(raw);
  await env.SPEEDKIT_COMMERCE_KV.put(`stripe:event:${event.id}`, raw);

  let entitlement = null;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    entitlement = {
      schema: "speedkit.entitlement.v1",
      status: "ACTIVE",
      provider: "stripe_checkout",
      event_id: event.id,
      session_id: session.id,
      customer_id: session.customer || null,
      customer_email_hash: session.customer_details?.email
        ? await hmac(env.STRIPE_WEBHOOK_SECRET, session.customer_details.email)
        : null,
      offer_id: session.metadata?.offer_id || session.client_reference_id || null,
      plan: session.metadata?.plan || null,
      sku: session.metadata?.sku || null,
      created: Date.now()
    };

    await env.SPEEDKIT_COMMERCE_KV.put(
      `entitlement:session:${session.id}`,
      JSON.stringify(entitlement)
    );
  }

  return json({
    schema: "speedkit.stripe_webhook_response.v1",
    status: "ACCEPTED",
    event_id: event.id,
    event_type: event.type,
    entitlement_written: Boolean(entitlement)
  });
}

async function entitlementGet(request, env) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.entitlement_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      error: "SPEEDKIT_COMMERCE_KV_BINDING_MISSING"
    }, 503);
  }

  if (!sessionId) {
    return json({
      schema: "speedkit.entitlement_response.v1",
      status: "BAD_REQUEST",
      error: "SESSION_ID_REQUIRED"
    }, 400);
  }

  const raw = await env.SPEEDKIT_COMMERCE_KV.get(`entitlement:session:${sessionId}`);
  if (!raw) {
    return json({
      schema: "speedkit.entitlement_response.v1",
      status: "NOT_FOUND",
      session_id: sessionId
    }, 404);
  }

  return json({
    schema: "speedkit.entitlement_response.v1",
    status: "FOUND",
    entitlement: JSON.parse(raw)
  });
}

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") return json({ ok: true });

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");

  if (path === "/api/marketplace/runtime" && request.method === "GET") {
    return runtimeGet(env);
  }

  if (path === "/api/marketplace/checkout" && request.method === "GET") {
    return checkoutGet(env);
  }

  if (path === "/api/marketplace/checkout" && request.method === "POST") {
    return checkoutPost(request, env);
  }

  if (path === "/api/marketplace/stripe-webhook" && request.method === "GET") {
    return webhookGet(env);
  }

  if (path === "/api/marketplace/stripe-webhook" && request.method === "POST") {
    return webhookPost(request, env);
  }

  if (path === "/api/marketplace/entitlement" && request.method === "GET") {
    return entitlementGet(request, env);
  }


  if (path === "/api/marketplace/session") {
    return SessionApi.onRequest({ request, env });
  }

  if (path === "/api/marketplace/entitlement-reconcile") {
    return EntitlementReconcileApi.onRequest({ request, env });
  }

  if (path === "/api/marketplace/receipt") {
    return ReceiptApi.onRequest({ request, env });
  }

  if (path === "/api/marketplace/control") {
    return ControlApi.onRequest({ request, env });
  }

  if (path === "/api/marketplace/plan") {
    return PlanApi.onRequest({ request, env });
  }

  if (path === "/api/marketplace/capability") {
    return CapabilityApi.onRequest({ request, env });
  }

  if (path === "/api/marketplace/access-check") {
    return AccessCheckApi.onRequest({ request, env });
  }

  if (path === "/api/marketplace/usage") {
    return UsageApi.onRequest({ request, env });
  }

  if (path === "/api/marketplace/usage-ledger") {
    return UsageLedgerApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/quota") {
    return QuotaApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/usage-ledger-verify") {
    return UsageLedgerVerifyApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/entitlement-usage") {
    return EntitlementUsageApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/buyer-control") {
    return BuyerControlApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-closure") {
    return ControlClosureApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-digest") {
    return ControlDigestApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-receipt") {
    return ControlReceiptApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-receipt-verify") {
    return ControlReceiptVerifyApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-chain-index") {
    return ControlChainIndexApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-chain-verify") {
    return ControlChainVerifyApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-chain-certificate") {
    return ControlChainCertificateApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-chain-certificate-verify") {
    return ControlChainCertificateVerifyApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-chain-seal") {
    return ControlChainSealApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-chain-seal-verify") {
    return ControlChainSealVerifyApi.onRequest({ request, env });
  }


  if (path === "/api/marketplace/control-chain-archive") {
    return ControlChainArchiveApi.onRequest({ request, env });
  }

  return json({
    schema: "speedkit.marketplace_api.v1",
    status: "NOT_FOUND",
    path,
    fake_checkout: false
  }, 404);
}
