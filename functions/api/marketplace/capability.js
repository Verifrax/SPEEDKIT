
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
  const plan = String(url.searchParams.get("plan") || "").trim().toLowerCase();
  const bundleId = String(url.searchParams.get("bundle") || "").trim().toLowerCase();

  const manifest = await fetch(url.origin + "/marketplace/capabilities.json?t=" + Date.now())
    .then(r => r.json());

  const bundles = Array.isArray(manifest.bundles) ? manifest.bundles : [];

  if (!plan && !bundleId) {
    return json({
      schema: "speedkit.capability_response.v1",
      status: "CAPABILITY_MATRIX",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      count: bundles.length,
      bundles
    });
  }

  const bundle = bundles.find(b => b.plan === plan || b.id === bundleId);

  if (!bundle) {
    return json({
      schema: "speedkit.capability_response.v1",
      status: "CAPABILITY_NOT_FOUND",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      plan,
      bundle: bundleId
    }, 404);
  }

  return json({
    schema: "speedkit.capability_response.v1",
    status: "CAPABILITY_FOUND",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    capability: bundle
  });
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return json({
      schema: "speedkit.capability_response.v1",
      status: "METHOD_NOT_ALLOWED"
    }, 405);
  }
  return onRequestGet(context);
}
