
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

function toUnits(value) {
  const n = Number(value || 1);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(Math.floor(n), 1000);
}

async function loadPolicy(origin) {
  const [accessPolicy, usagePolicy, quotaPolicy] = await Promise.all([
    fetch(origin + "/marketplace/access-policy.json?t=" + Date.now()).then(r => r.json()),
    fetch(origin + "/marketplace/usage-policy.json?t=" + Date.now()).then(r => r.json()),
    fetch(origin + "/marketplace/quota-policy.json?t=" + Date.now()).then(r => r.json())
  ]);
  return { accessPolicy, usagePolicy, quotaPolicy };
}

function decide(accessPolicy, planId, capabilityId) {
  const plan = Array.isArray(accessPolicy.plans) ? accessPolicy.plans.find(p => p.id === planId) : null;
  const capability = Array.isArray(accessPolicy.capabilities) ? accessPolicy.capabilities.find(c => c.id === capabilityId) : null;

  if (!plan) return { ok: false, status: "PLAN_NOT_FOUND" };
  if (!capability) return { ok: false, status: "CAPABILITY_NOT_FOUND", plan };

  const allowed = plan.level >= capability.min_level;

  return {
    ok: true,
    allowed,
    status: allowed ? "ACCESS_ALLOWED" : "ACCESS_DENIED",
    plan,
    capability,
    reason: allowed ? "PLAN_ENTITLEMENT_LEVEL_MEETS_CAPABILITY_MINIMUM" : "PLAN_ENTITLEMENT_LEVEL_BELOW_CAPABILITY_MINIMUM"
  };
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

function quotaLimitFor(quotaPolicy, usagePolicy, planId) {
  const quota = Array.isArray(quotaPolicy.plan_quotas) ? quotaPolicy.plan_quotas.find(q => q.plan === planId) : null;
  if (quota) return quota;

  const fallback = Array.isArray(usagePolicy.plan_policies) ? usagePolicy.plan_policies.find(q => q.plan === planId) : null;
  if (fallback) return fallback;

  return null;
}

function checkQuota(quota, planUsage, requestedUnits) {
  if (!quota) {
    return {
      ok: false,
      status: "QUOTA_PLAN_NOT_FOUND",
      allowed: false
    };
  }

  const currentEvents = Number(planUsage.total_events || 0);
  const currentUnits = Number(planUsage.total_units || 0);
  const nextEvents = currentEvents + 1;
  const nextUnits = currentUnits + requestedUnits;

  const monthlyEventLimit = Number(quota.monthly_event_limit || 0);
  const monthlyUnitLimit = Number(quota.monthly_unit_limit || 0);

  const eventAllowed = nextEvents <= monthlyEventLimit;
  const unitAllowed = nextUnits <= monthlyUnitLimit;
  const allowed = eventAllowed && unitAllowed;

  return {
    ok: true,
    status: allowed ? "QUOTA_AVAILABLE" : "USAGE_QUOTA_EXCEEDED",
    allowed,
    plan: quota.plan,
    month: planUsage.month,
    current_events: currentEvents,
    current_units: currentUnits,
    requested_events: 1,
    requested_units: requestedUnits,
    next_events: nextEvents,
    next_units: nextUnits,
    monthly_event_limit: monthlyEventLimit,
    monthly_unit_limit: monthlyUnitLimit,
    remaining_events_before: Math.max(0, monthlyEventLimit - currentEvents),
    remaining_units_before: Math.max(0, monthlyUnitLimit - currentUnits),
    exceeded: {
      events: !eventAllowed,
      units: !unitAllowed
    }
  };
}

async function readUsage(env, sessionId) {
  const key = "usage:session:" + sessionId;
  const value = await env.SPEEDKIT_COMMERCE_KV.get(key, "json");
  return value || {
    schema: "speedkit.usage_session.v1",
    status: "USAGE_EMPTY",
    session_id: sessionId,
    total_events: 0,
    total_units: 0,
    capabilities: {},
    plans: {},
    events: [],
    updated_at: null
  };
}

async function writeUsage(env, sessionId, planId, capabilityId, eventName, units, decision, metadata, quotaDecision) {
  const month = ym();
  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();

  const sessionKey = "usage:session:" + sessionId;
  const planKey = "usage:plan:" + planId + ":" + month;
  const capabilityKey = "usage:capability:" + capabilityId + ":" + month;
  const eventKey = "usage:event:" + eventId;

  const sessionUsage = await readUsage(env, sessionId);
  sessionUsage.status = "USAGE_ACTIVE";
  sessionUsage.total_events = Number(sessionUsage.total_events || 0) + 1;
  sessionUsage.total_units = Number(sessionUsage.total_units || 0) + units;
  sessionUsage.capabilities = sessionUsage.capabilities || {};
  sessionUsage.plans = sessionUsage.plans || {};
  sessionUsage.events = Array.isArray(sessionUsage.events) ? sessionUsage.events : [];
  sessionUsage.capabilities[capabilityId] = Number(sessionUsage.capabilities[capabilityId] || 0) + units;
  sessionUsage.plans[planId] = Number(sessionUsage.plans[planId] || 0) + units;
  sessionUsage.events.push({ event_id: eventId, plan: planId, capability: capabilityId, event: eventName, units, at: now });
  sessionUsage.events = sessionUsage.events.slice(-50);
  sessionUsage.updated_at = now;

  const event = {
    schema: "speedkit.usage_event.v1",
    status: "USAGE_RECORDED",
    event_id: eventId,
    session_id: sessionId,
    plan: planId,
    capability: capabilityId,
    event: eventName,
    units,
    month,
    decision,
    quota_decision: quotaDecision,
    metadata: metadata && typeof metadata === "object" ? metadata : {},
    created_at: now
  };

  const planUsage = await env.SPEEDKIT_COMMERCE_KV.get(planKey, "json") || {
    schema: "speedkit.usage_plan_month.v1",
    plan: planId,
    month,
    total_events: 0,
    total_units: 0
  };
  planUsage.total_events = Number(planUsage.total_events || 0) + 1;
  planUsage.total_units = Number(planUsage.total_units || 0) + units;
  planUsage.updated_at = now;

  const capabilityUsage = await env.SPEEDKIT_COMMERCE_KV.get(capabilityKey, "json") || {
    schema: "speedkit.usage_capability_month.v1",
    capability: capabilityId,
    month,
    total_events: 0,
    total_units: 0
  };
  capabilityUsage.total_events = Number(capabilityUsage.total_events || 0) + 1;
  capabilityUsage.total_units = Number(capabilityUsage.total_units || 0) + units;
  capabilityUsage.updated_at = now;

  await Promise.all([
    env.SPEEDKIT_COMMERCE_KV.put(sessionKey, JSON.stringify(sessionUsage, null, 2), { metadata: { schema: "speedkit.usage_session.v1", session_id: sessionId } }),
    env.SPEEDKIT_COMMERCE_KV.put(planKey, JSON.stringify(planUsage, null, 2), { metadata: { schema: "speedkit.usage_plan_month.v1", plan: planId, month } }),
    env.SPEEDKIT_COMMERCE_KV.put(capabilityKey, JSON.stringify(capabilityUsage, null, 2), { metadata: { schema: "speedkit.usage_capability_month.v1", capability: capabilityId, month } }),
    env.SPEEDKIT_COMMERCE_KV.put(eventKey, JSON.stringify(event, null, 2), { metadata: { schema: "speedkit.usage_event.v1", event_id: eventId } })
  ]);

  return { event, session_usage: sessionUsage, plan_usage: planUsage, capability_usage: capabilityUsage };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = cleanId(url.searchParams.get("session_id"));

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.usage_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      fake_checkout: false
    }, 503);
  }

  if (!sessionId) {
    return json({
      schema: "speedkit.usage_response.v1",
      status: "SESSION_ID_REQUIRED",
      fake_checkout: false,
      parameter: "session_id"
    }, 400);
  }

  const usage = await readUsage(env, sessionId);

  return json({
    schema: "speedkit.usage_response.v1",
    status: "USAGE_READ",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    usage
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.usage_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      fake_checkout: false
    }, 503);
  }

  const body = await request.json().catch(() => ({}));
  const sessionId = cleanId(body.session_id);
  const planId = cleanId(body.plan).toLowerCase();
  const capabilityId = cleanId(body.capability).toLowerCase();
  const eventName = cleanId(body.event || "usage_event") || "usage_event";
  const units = toUnits(body.units);
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

  if (!sessionId || !planId || !capabilityId) {
    return json({
      schema: "speedkit.usage_response.v1",
      status: "SESSION_PLAN_CAPABILITY_REQUIRED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      required: ["session_id", "plan", "capability"]
    }, 400);
  }

  const { accessPolicy, usagePolicy, quotaPolicy } = await loadPolicy(url.origin);
  const decision = decide(accessPolicy, planId, capabilityId);

  if (!decision.ok) {
    return json({
      schema: "speedkit.usage_response.v1",
      status: decision.status,
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      plan: planId,
      capability: capabilityId
    }, 404);
  }

  if (!decision.allowed) {
    return json({
      schema: "speedkit.usage_response.v1",
      status: "USAGE_DENIED_BY_POLICY",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      recorded: false,
      quota_checked: false,
      decision: {
        status: decision.status,
        allowed: false,
        reason: decision.reason,
        plan: {
          id: decision.plan.id,
          entitlement_level: decision.plan.level
        },
        capability: decision.capability
      },
      authority: {
        access_policy: "/marketplace/access-policy.json",
        usage_policy: "/marketplace/usage-policy.json",
        quota_policy: "/marketplace/quota-policy.json"
      }
    }, 403);
  }

  const month = ym();
  const planUsage = await getPlanUsage(env, planId, month);
  const quotaLimit = quotaLimitFor(quotaPolicy, usagePolicy, planId);
  const quotaDecision = checkQuota(quotaLimit, planUsage, units);

  if (!quotaDecision.allowed) {
    return json({
      schema: "speedkit.usage_response.v1",
      status: "USAGE_QUOTA_EXCEEDED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      recorded: false,
      quota_checked: true,
      decision: {
        status: decision.status,
        allowed: true,
        reason: decision.reason
      },
      quota_decision: quotaDecision,
      authority: {
        access_policy: "/marketplace/access-policy.json",
        usage_policy: "/marketplace/usage-policy.json",
        quota_policy: "/marketplace/quota-policy.json"
      }
    }, 429);
  }

  const written = await writeUsage(env, sessionId, planId, capabilityId, eventName, units, {
    status: decision.status,
    allowed: true,
    reason: decision.reason,
    plan_level: decision.plan.level,
    capability_min_level: decision.capability.min_level
  }, metadata, quotaDecision);

  return json({
    schema: "speedkit.usage_response.v1",
    status: "USAGE_RECORDED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    recorded: true,
    quota_checked: true,
    plan: planId,
    capability: capabilityId,
    units,
    event_id: written.event.event_id,
    decision: {
      status: decision.status,
      allowed: true,
      reason: decision.reason
    },
    quota_decision: quotaDecision,
    usage_policy: {
      schema: usagePolicy.schema,
      status: usagePolicy.status
    },
    quota_policy: {
      schema: quotaPolicy.schema,
      status: quotaPolicy.status
    },
    usage: written.session_usage
  });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({
    schema: "speedkit.usage_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
