
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanSessionId(value) {
  const s = String(value || "").trim();
  if (!/^cs_(test|live)_[A-Za-z0-9_]+/.test(s)) return "";
  return s;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = cleanSessionId(url.searchParams.get("session_id"));

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.receipt_lookup_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      fake_checkout: false
    }, 503);
  }

  if (!sessionId) {
    return json({
      schema: "speedkit.receipt_lookup_response.v1",
      status: "SESSION_ID_REQUIRED",
      fake_checkout: false,
      parameter: "session_id"
    }, 400);
  }

  const value = await env.SPEEDKIT_COMMERCE_KV.get("receipt:session:" + sessionId, "json");

  if (!value) {
    return json({
      schema: "speedkit.receipt_lookup_response.v1",
      status: "RECEIPT_NOT_FOUND",
      fake_checkout: false,
      session_id: sessionId
    }, 404);
  }

  return json({
    schema: "speedkit.receipt_lookup_response.v1",
    status: "RECEIPT_FOUND",
    fake_checkout: false,
    receipt: value
  });
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return json({
      schema: "speedkit.receipt_lookup_response.v1",
      status: "METHOD_NOT_ALLOWED"
    }, 405);
  }
  return onRequestGet(context);
}
