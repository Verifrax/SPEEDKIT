
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function getStaticJson(origin, path) {
  try {
    const res = await fetch(origin + path + "?t=" + Date.now(), { headers: { "accept": "application/json" } });
    if (!res.ok) return { error: "FETCH_FAILED", status: res.status, path };
    return await res.json();
  } catch (error) {
    return { error: "FETCH_ERROR", message: String(error && error.message ? error.message : error), path };
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = new URL(request.url).origin;

  const configured = {
    stripe_secret_key: Boolean(env.STRIPE_SECRET_KEY),
    stripe_webhook_secret: Boolean(env.STRIPE_WEBHOOK_SECRET),
    stripe_price_starter: Boolean(env.STRIPE_PRICE_SPEEDKIT_STARTER),
    stripe_price_pro: Boolean(env.STRIPE_PRICE_SPEEDKIT_PRO),
    stripe_price_enterprise: Boolean(env.STRIPE_PRICE_SPEEDKIT_ENTERPRISE),
    speedkit_base_url: Boolean(env.SPEEDKIT_BASE_URL),
    commerce_kv: Boolean(env.SPEEDKIT_COMMERCE_KV)
  };

  const allReady = Object.values(configured).every(Boolean);

  const [productOs, planMatrix, routeMap, buyerPath, pricing, postPayment] = await Promise.all([
    getStaticJson(origin, "/marketplace/product-os.json"),
    getStaticJson(origin, "/marketplace/plan-matrix.json"),
    getStaticJson(origin, "/marketplace/route-map.json"),
    getStaticJson(origin, "/marketplace/buyer-path.json"),
    getStaticJson(origin, "/marketplace/pricing.json"),
    getStaticJson(origin, "/marketplace/post-payment-proof.json")
  ]);

  return json({
    schema: "speedkit.marketplace_control_response.v1",
    status: allReady ? "PRODUCT_CONTROL_OS_READY" : "PRODUCT_CONTROL_OS_PARTIAL",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    generated_at: new Date().toISOString(),
    configured,
    control_state: {
      commerce_ready: allReady,
      product_os: productOs.status || null,
      pricing: pricing.status || null,
      post_payment_proof: postPayment.status || null,
      plan_count: Array.isArray(planMatrix.plans) ? planMatrix.plans.length : 0,
      route_count: routeMap.route_count || 0,
      buyer_path_stages: Array.isArray(buyerPath.stages) ? buyerPath.stages.length : 0
    },
    endpoints: {
      pricing: "/pricing/",
      marketplace: "/marketplace/",
      control_page: "/marketplace/control/",
      entitlement_page: "/marketplace/entitlement/",
      product_os_json: "/marketplace/product-os.json",
      plan_matrix_json: "/marketplace/plan-matrix.json",
      route_map_json: "/marketplace/route-map.json",
      buyer_path_json: "/marketplace/buyer-path.json"
    },
    plans: Array.isArray(planMatrix.plans) ? planMatrix.plans : []
  });
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return json({
      schema: "speedkit.marketplace_control_response.v1",
      status: "METHOD_NOT_ALLOWED"
    }, 405);
  }
  return onRequestGet(context);
}
