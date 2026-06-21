function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2) + "\n", {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*"
    }
  });
}

export async function onRequestGet({ env }) {
  const configured = {
    stripe_secret_key: Boolean(env.STRIPE_SECRET_KEY),
    stripe_webhook_secret: Boolean(env.STRIPE_WEBHOOK_SECRET),
    stripe_price_starter: Boolean(env.STRIPE_PRICE_SPEEDKIT_STARTER),
    stripe_price_pro: Boolean(env.STRIPE_PRICE_SPEEDKIT_PRO),
    stripe_price_enterprise: Boolean(env.STRIPE_PRICE_SPEEDKIT_ENTERPRISE),
    speedkit_base_url: Boolean(env.SPEEDKIT_BASE_URL),
    commerce_kv: Boolean(env.SPEEDKIT_COMMERCE_KV)
  };

  const ready =
    configured.stripe_secret_key &&
    configured.stripe_webhook_secret &&
    configured.stripe_price_starter &&
    configured.stripe_price_pro &&
    configured.stripe_price_enterprise &&
    configured.speedkit_base_url &&
    configured.commerce_kv;

  return json({
    schema: "speedkit.marketplace_runtime.v1",
    status: ready ? "COMMERCE_READY" : "COMMERCE_FAIL_CLOSED",
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
