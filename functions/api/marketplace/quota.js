
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function ym() {
  return new Date().toISOString().slice(0, 7);
}

function cleanId(value) {
  return String(value || "").trim().replace(/[^A-Za-z0-9_:.@-]/g, "").slice(0, 160);
}

async function getPlanUsage(env, planId, month) {
  const key = "usage:plan:" + planId + ":" + month;
  const value = await env.SPEEDKIT_COMMERCE_KV.get(key, "json");
  return value || {
    schema: "speedkit.usage_plan_month.v1",
    plan: planId,
    month,
    total_events: 0,
    total_units: 0
  };
}

function quotaView(quota, usage) {
  const totalEvents = Number(usage.total_events || 0);
  const totalUnits = Number(usage.total_units || 0);
  const eventRemaining = Math.max(0, Number(quota.monthly_event_limit || 0) - totalEvents);
  const unitRemaining = Math.max(0, Number(quota.monthly_unit_limit || 0) - totalUnits);

  return {
    plan: quota.plan,
    sku: quota.sku,
    entitlement_level: quota.entitlement_level,
    month: usage.month,
    monthly_event_limit: quota.monthly_event_limit,
    monthly_unit_limit: quota.monthly_unit_limit,
    current_events: totalEvents,
    current_units: totalUnits,
    remaining_events: eventRemaining,
    remaining_units: unitRemaining,
    exhausted: eventRemaining <= 0 || unitRemaining <= 0
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const planId = cleanId(url.searchParams.get("plan")).toLowerCase();
  const month = cleanId(url.searchParams.get("month")) || ym();

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.quota_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      fake_checkout: false
    }, 503);
  }

  const quotaPolicy = await fetch(url.origin + "/marketplace/quota-policy.json?t=" + Date.now()).then(r => r.json());
  const quotas = Array.isArray(quotaPolicy.plan_quotas) ? quotaPolicy.plan_quotas : [];

  if (!planId) {
    const views = [];
    for (const quota of quotas) {
      const usage = await getPlanUsage(env, quota.plan, month);
      views.push(quotaView(quota, usage));
    }

    return json({
      schema: "speedkit.quota_response.v1",
      status: "QUOTA_MATRIX",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      month,
      quotas: views
    });
  }

  const quota = quotas.find(q => q.plan === planId);

  if (!quota) {
    return json({
      schema: "speedkit.quota_response.v1",
      status: "PLAN_NOT_FOUND",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      plan: planId
    }, 404);
  }

  const usage = await getPlanUsage(env, planId, month);

  return json({
    schema: "speedkit.quota_response.v1",
    status: "QUOTA_READ",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    quota: quotaView(quota, usage)
  });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.quota_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
