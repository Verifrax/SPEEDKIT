
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanId(value) {
  return String(value || "").trim().replace(/[^A-Za-z0-9_:.@-]/g, "").slice(0, 160);
}

function toUnits(value) {
  const n = Number(value || 1);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(Math.floor(n), 1000);
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  return "{" + Object.keys(value).sort().map(k => JSON.stringify(k) + ":" + stableStringify(value[k])).join(",") + "}";
}

async function sha256Hex(input) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(String(input)));
  return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join("");
}

async function readLedger(env, sessionId) {
  const key = "usage-ledger:session:" + sessionId;
  const value = await env.SPEEDKIT_COMMERCE_KV.get(key, "json");
  return value || {
    schema: "speedkit.usage_ledger_session.v1",
    status: "LEDGER_EMPTY",
    session_id: sessionId,
    hash_algorithm: "SHA-256",
    entries_count: 0,
    latest_hash: "GENESIS",
    entries: [],
    created_at: new Date().toISOString(),
    updated_at: null
  };
}

async function appendLedger(env, sessionId, usagePayload, requestBody) {
  const ledger = await readLedger(env, sessionId);
  const previousHash = ledger.latest_hash || "GENESIS";
  const now = new Date().toISOString();

  const eventId = usagePayload.event_id || crypto.randomUUID();

  const baseEntry = {
    schema: "speedkit.usage_ledger_entry.v1",
    status: "LEDGER_ENTRY_ACTIVE",
    event_id: eventId,
    session_id: sessionId,
    sequence: Number(ledger.entries_count || 0) + 1,
    previous_hash: previousHash,
    usage_status: usagePayload.status,
    usage_event_id: usagePayload.event_id || null,
    plan: usagePayload.plan || requestBody.plan,
    capability: usagePayload.capability || requestBody.capability,
    units: usagePayload.units || requestBody.units || 1,
    decision: usagePayload.decision || null,
    usage_total_events: usagePayload.usage ? usagePayload.usage.total_events : null,
    usage_total_units: usagePayload.usage ? usagePayload.usage.total_units : null,
    metadata: requestBody.metadata && typeof requestBody.metadata === "object" ? requestBody.metadata : {},
    created_at: now
  };

  const entryHash = await sha256Hex(stableStringify(baseEntry));
  const entry = { ...baseEntry, entry_hash: entryHash };

  ledger.status = "LEDGER_ACTIVE";
  ledger.entries_count = Number(ledger.entries_count || 0) + 1;
  ledger.latest_hash = entryHash;
  ledger.updated_at = now;
  ledger.entries = Array.isArray(ledger.entries) ? ledger.entries : [];
  ledger.entries.push(entry);
  ledger.entries = ledger.entries.slice(-100);

  await Promise.all([
    env.SPEEDKIT_COMMERCE_KV.put("usage-ledger:session:" + sessionId, JSON.stringify(ledger, null, 2), {
      metadata: { schema: "speedkit.usage_ledger_session.v1", session_id: sessionId }
    }),
    env.SPEEDKIT_COMMERCE_KV.put("usage-ledger:event:" + eventId, JSON.stringify(entry, null, 2), {
      metadata: { schema: "speedkit.usage_ledger_entry.v1", event_id: eventId, session_id: sessionId }
    })
  ]);

  return { ledger, entry };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = cleanId(url.searchParams.get("session_id"));

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.usage_ledger_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      fake_checkout: false
    }, 503);
  }

  if (!sessionId) {
    return json({
      schema: "speedkit.usage_ledger_response.v1",
      status: "SESSION_ID_REQUIRED",
      fake_checkout: false,
      parameter: "session_id"
    }, 400);
  }

  const ledger = await readLedger(env, sessionId);

  return json({
    schema: "speedkit.usage_ledger_response.v1",
    status: "USAGE_LEDGER_READ",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    ledger
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.usage_ledger_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      fake_checkout: false
    }, 503);
  }

  const body = await request.json().catch(() => ({}));
  const sessionId = cleanId(body.session_id);
  const plan = cleanId(body.plan).toLowerCase();
  const capability = cleanId(body.capability).toLowerCase();
  const event = cleanId(body.event || "usage_ledger_event") || "usage_ledger_event";
  const units = toUnits(body.units);

  if (!sessionId || !plan || !capability) {
    return json({
      schema: "speedkit.usage_ledger_response.v1",
      status: "SESSION_PLAN_CAPABILITY_REQUIRED",
      fake_checkout: false,
      required: ["session_id", "plan", "capability"]
    }, 400);
  }

  const usageResponse = await fetch(url.origin + "/api/marketplace/usage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      plan,
      capability,
      event,
      units,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {}
    })
  });

  const usagePayload = await usageResponse.json().catch(() => ({
    schema: "speedkit.usage_response.v1",
    status: "USAGE_RESPONSE_PARSE_FAILED"
  }));

  if (usagePayload.status !== "USAGE_RECORDED" || usagePayload.recorded !== true) {
    return json({
      schema: "speedkit.usage_ledger_response.v1",
      status: "USAGE_NOT_RECORDED_BY_POLICY",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      ledger_written: false,
      usage_response: usagePayload
    }, usageResponse.status || 403);
  }

  const written = await appendLedger(env, sessionId, usagePayload, { ...body, plan, capability, units, event });

  return json({
    schema: "speedkit.usage_ledger_response.v1",
    status: "USAGE_LEDGER_RECORDED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    ledger_written: true,
    event_hash: written.entry.entry_hash,
    previous_hash: written.entry.previous_hash,
    sequence: written.entry.sequence,
    entry: written.entry,
    ledger: {
      session_id: written.ledger.session_id,
      entries_count: written.ledger.entries_count,
      latest_hash: written.ledger.latest_hash,
      hash_algorithm: written.ledger.hash_algorithm
    },
    usage_response: usagePayload
  });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({
    schema: "speedkit.usage_ledger_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
