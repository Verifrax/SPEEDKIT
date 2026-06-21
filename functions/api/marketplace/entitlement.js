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

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!env.SPEEDKIT_COMMERCE_KV) {
    return json({
      schema: "speedkit.entitlement_response.v1",
      status: "COMMERCE_KV_NOT_CONFIGURED",
      error: "SPEEDKIT_COMMERCE_KV_BINDING_MISSING"
    }, 503);
  }

  if (!sessionId) {
    return json({
      schema: "speedkit.entitlement_response.v1",
      status: "BAD_REQUEST",
      error: "SESSION_ID_REQUIRED"
    }, 400);
  }

  const raw = await env.SPEEDKIT_COMMERCE_KV.get(`entitlement:session:${sessionId}`);
  if (!raw) {
    return json({
      schema: "speedkit.entitlement_response.v1",
      status: "NOT_FOUND",
      session_id: sessionId
    }, 404);
  }

  const entitlement = JSON.parse(raw);
  return json({
    schema: "speedkit.entitlement_response.v1",
    status: "FOUND",
    entitlement
  });
}
