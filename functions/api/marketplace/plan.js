
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
  const origin = url.origin;

  const matrix = await fetch(origin + "/marketplace/plan-matrix.json?t=" + Date.now()).then(r => r.json());
  const plans = Array.isArray(matrix.plans) ? matrix.plans : [];

  if (!planId) {
    return json({
      schema: "speedkit.plan_response.v1",
      status: "PLAN_MATRIX",
      mode: "PUBLIC_ONLY",
      plans
    });
  }

  const plan = plans.find(p => p.id === planId);
  if (!plan) {
    return json({
      schema: "speedkit.plan_response.v1",
      status: "PLAN_NOT_FOUND",
      mode: "PUBLIC_ONLY",
      plan: planId
    }, 404);
  }

  return json({
    schema: "speedkit.plan_response.v1",
    status: "PLAN_FOUND",
    mode: "PUBLIC_ONLY",
    plan
  });
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return json({
      schema: "speedkit.plan_response.v1",
      status: "METHOD_NOT_ALLOWED"
    }, 405);
  }
  return onRequestGet(context);
}
