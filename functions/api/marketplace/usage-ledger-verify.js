
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
  return value || null;
}

async function verifyEntries(ledger) {
  const entries = Array.isArray(ledger.entries) ? ledger.entries : [];
  const chain = [];
  const failures = [];

  let expectedPrevious = "GENESIS";

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] || {};
    const { entry_hash, ...withoutHash } = entry;
    const recomputed = await sha256Hex(stableStringify(withoutHash));
    const sequenceExpected = i + 1;

    const hashOk = entry_hash === recomputed;
    const previousOk = entry.previous_hash === expectedPrevious;
    const sequenceOk = Number(entry.sequence) === sequenceExpected;

    const item = {
      sequence: entry.sequence,
      event_id: entry.event_id,
      previous_hash: entry.previous_hash,
      entry_hash,
      recomputed_hash: recomputed,
      hash_ok: hashOk,
      previous_hash_ok: previousOk,
      sequence_ok: sequenceOk
    };

    chain.push(item);

    if (!hashOk || !previousOk || !sequenceOk) {
      failures.push(item);
    }

    expectedPrevious = entry_hash || recomputed;
  }

  const latestHashOk = entries.length === 0
    ? ledger.latest_hash === "GENESIS"
    : ledger.latest_hash === entries[entries.length - 1].entry_hash;

  if (!latestHashOk) {
    failures.push({
      failure: "LATEST_HASH_MISMATCH",
      ledger_latest_hash: ledger.latest_hash,
      expected_latest_hash: entries.length ? entries[entries.length - 1].entry_hash : "GENESIS"
    });
  }

  return {
    valid: failures.length === 0,
    entries_count: entries.length,
    latest_hash_ok: latestHashOk,
    failures_count: failures.length,
    failures,
    chain
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = cleanId(url.searchParams.get("session_id"));

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.ledger_verify_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      fake_checkout: false
    }, 503);
  }

  if (!sessionId) {
    return json({
      schema: "speedkit.ledger_verify_response.v1",
      status: "SESSION_ID_REQUIRED",
      fake_checkout: false,
      parameter: "session_id"
    }, 400);
  }

  const ledger = await readLedger(env, sessionId);

  if (!ledger) {
    return json({
      schema: "speedkit.ledger_verify_response.v1",
      status: "LEDGER_NOT_FOUND",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      session_id: sessionId
    }, 404);
  }

  const verification = await verifyEntries(ledger);

  return json({
    schema: "speedkit.ledger_verify_response.v1",
    status: verification.valid ? "USAGE_LEDGER_VERIFIED" : "USAGE_LEDGER_INVALID",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    session_id: sessionId,
    valid: verification.valid,
    hash_algorithm: "SHA-256",
    verification,
    ledger: {
      session_id: ledger.session_id,
      entries_count: ledger.entries_count,
      visible_entries_count: Array.isArray(ledger.entries) ? ledger.entries.length : 0,
      latest_hash: ledger.latest_hash,
      updated_at: ledger.updated_at
    }
  }, verification.valid ? 200 : 409);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.ledger_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
