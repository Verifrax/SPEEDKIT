
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
  const [accessPolicy, usagePolicy] = await Promise.all([
    fetch(origin + "/marketplace/access-policy.json?t=" + Date.now()).then(r => r.json()),
    fetch(origin + "/marketplace/usage-policy.json?t=" + Date.now()).then(r => r.json())
  ]);
  return { accessPolicy, usagePolicy };
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

async function writeUsage(env, sessionId, planId, capabilityId, eventName, units, decision, metadata) {
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
  planUsage.total_events += 1;
  planUsage.total_units += units;
  planUsage.updated_at = now;

  const capabilityUsage = await env.SPEEDKIT_COMMERCE_KV.get(capabilityKey, "json") || {
    schema: "speedkit.usage_capability_month.v1",
    capability: capabilityId,
    month,
    total_events: 0,
    total_units: 0
  };
  capabilityUsage.total_events += 1;
  capabilityUsage.total_units += units;
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

  const { accessPolicy, usagePolicy } = await loadPolicy(url.origin);
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
        usage_policy: "/marketplace/usage-policy.json"
      }
    }, 403);
  }

  const written = await writeUsage(env, sessionId, planId, capabilityId, eventName, units, {
    status: decision.status,
    allowed: true,
    reason: decision.reason,
    plan_level: decision.plan.level,
    capability_min_level: decision.capability.min_level
  }, metadata);

  return json({
    schema: "speedkit.usage_response.v1",
    status: "USAGE_RECORDED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    recorded: true,
    plan: planId,
    capability: capabilityId,
    units,
    event_id: written.event.event_id,
    decision: {
      status: decision.status,
      allowed: true,
      reason: decision.reason
    },
    usage_policy: {
      schema: usagePolicy.schema,
      status: usagePolicy.status
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
