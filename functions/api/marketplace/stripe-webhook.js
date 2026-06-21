function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2) + "\n", {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
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

export async function onRequestGet({ env }) {
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

export async function onRequestPost({ request, env }) {
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
