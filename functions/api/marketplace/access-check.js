
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const planId = String(url.searchParams.get("plan") || "").trim().toLowerCase();
  const capId = String(url.searchParams.get("capability") || "").trim().toLowerCase();

  const policy = await fetch(url.origin + "/marketplace/access-policy.json?t=" + Date.now()).then(r => r.json());
  const plan = Array.isArray(policy.plans) ? policy.plans.find(p => p.id === planId) : null;
  const capability = Array.isArray(policy.capabilities) ? policy.capabilities.find(c => c.id === capId) : null;

  if (!planId || !capId) {
    return json({
      schema: "speedkit.access_check_response.v1",
      status: "PLAN_AND_CAPABILITY_REQUIRED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      required: ["plan", "capability"],
      example: "/api/marketplace/access-check?plan=starter&capability=receipt_lookup"
    }, 400);
  }

  if (!plan) {
    return json({
      schema: "speedkit.access_check_response.v1",
      status: "PLAN_NOT_FOUND",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      plan: planId
    }, 404);
  }

  if (!capability) {
    return json({
      schema: "speedkit.access_check_response.v1",
      status: "CAPABILITY_NOT_FOUND",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      capability: capId
    }, 404);
  }

  const allowed = plan.level >= capability.min_level;

  return json({
    schema: "speedkit.access_check_response.v1",
    status: allowed ? "ACCESS_ALLOWED" : "ACCESS_DENIED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    decision: allowed,
    plan: {
      id: plan.id,
      sku: plan.sku,
      entitlement_level: plan.level,
      price_eur_month: plan.price_eur_month
    },
    capability,
    reason: allowed
      ? "PLAN_ENTITLEMENT_LEVEL_MEETS_CAPABILITY_MINIMUM"
      : "PLAN_ENTITLEMENT_LEVEL_BELOW_CAPABILITY_MINIMUM",
    authority: {
      policy: "/marketplace/access-policy.json",
      model: "plan.entitlement_level >= capability.min_level"
    }
  }, allowed ? 200 : 403);
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return json({
      schema: "speedkit.access_check_response.v1",
      status: "METHOD_NOT_ALLOWED"
    }, 405);
  }
  return onRequestGet(context);
}
