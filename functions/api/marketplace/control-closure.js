
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
  return String(value || "").trim().replace(/[^A-Za-z0-9_:.@-]/g, "").slice(0, 220);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({
    schema: "speedkit.fetch_response.v1",
    status: "JSON_PARSE_FAILED"
  }));
  return { ok: response.ok, http_status: response.status, payload };
}

function statusOf(result) {
  return result && result.payload ? result.payload.status : "UNAVAILABLE";
}

function okStatus(result, expected) {
  return result && result.payload && result.payload.status === expected;
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const sessionId = cleanId(url.searchParams.get("session_id"));

  const [
    productOs,
    runtime,
    marketplaceControl,
    quotaMatrix,
    routeMap,
    closurePolicy
  ] = await Promise.all([
    fetchJson(url.origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(url.origin + "/api/marketplace/runtime?t=" + Date.now()),
    fetchJson(url.origin + "/api/marketplace/control?t=" + Date.now()),
    fetchJson(url.origin + "/api/marketplace/quota?t=" + Date.now()),
    fetchJson(url.origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(url.origin + "/marketplace/control-closure-policy.json?t=" + Date.now())
  ]);

  let buyerControl = null;
  let ledgerVerify = null;

  if (sessionId) {
    buyerControl = await fetchJson(url.origin + "/api/marketplace/buyer-control?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now());
    ledgerVerify = await fetchJson(url.origin + "/api/marketplace/usage-ledger-verify?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now());
  }

  const osState = productOs.payload && productOs.payload.live_state ? productOs.payload.live_state : {};
  const controlReady = okStatus(marketplaceControl, "PRODUCT_CONTROL_OS_READY");
  const runtimeReady = statusOf(runtime) === "COMMERCE_READY";
  const quotaReady = statusOf(quotaMatrix) === "QUOTA_MATRIX";
  const routeReady = routeMap.payload && routeMap.payload.status === "LIVE";
  const osReady = productOs.payload && productOs.payload.status === "LIVE";

  const requiredLive = [
    osState.commerce === "COMMERCE_READY",
    osState.checkout === "STRIPE_CHECKOUT_LIVE",
    osState.capability_bundles === "LIVE",
    osState.access_policy === "LIVE",
    osState.capability_enforcement === "LIVE",
    osState.usage_metering === "LIVE",
    osState.usage_ledger === "LIVE",
    osState.hash_chained_usage === "LIVE",
    osState.quota_enforcement === "LIVE",
    osState.usage_quota_blocks === "LIVE",
    osState.ledger_verification === "LIVE",
    osState.cold_replay === "LIVE",
    osState.entitlement_usage === "LIVE",
    osState.session_bound_usage === "LIVE",
    osState.buyer_control === "LIVE",
    osState.session_evidence_capsule === "LIVE"
  ];

  const buyerStatus = buyerControl ? statusOf(buyerControl) : null;

  const ready = controlReady && runtimeReady && quotaReady && routeReady && osReady && requiredLive.every(Boolean);
  const status = ready ? "CONTROL_CLOSURE_READY" : "CONTROL_CLOSURE_DEGRADED";

  return json({
    schema: "speedkit.control_closure_response.v1",
    status,
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    session_id: sessionId || null,
    closure: {
      marketplace_os_ready: ready,
      runtime_ready: runtimeReady,
      product_control_ready: controlReady,
      quota_matrix_ready: quotaReady,
      route_map_ready: routeReady,
      product_os_ready: osReady,
      buyer_control_attached: !!buyerControl,
      buyer_control_status: buyerStatus,
      ledger_verify_attached: !!ledgerVerify,
      caller_plan_authority: false,
      private_repository_access_included: false
    },
    live_state: osState,
    route_count: routeMap.payload ? routeMap.payload.route_count : null,
    buyer_path_stages: marketplaceControl.payload && marketplaceControl.payload.control_state ? marketplaceControl.payload.control_state.buyer_path_stages : null,
    control_state: marketplaceControl.payload ? marketplaceControl.payload.control_state : null,
    runtime: runtime.payload,
    quota_matrix: quotaMatrix.payload,
    buyer_control: buyerControl ? buyerControl.payload : null,
    ledger_verify: ledgerVerify ? ledgerVerify.payload : null,
    policy: closurePolicy.payload,
    routes: {
      product_os: "/marketplace/product-os.json",
      runtime: "/api/marketplace/runtime",
      marketplace_control: "/api/marketplace/control",
      buyer_control: "/api/marketplace/buyer-control",
      entitlement_usage: "/api/marketplace/entitlement-usage",
      quota: "/api/marketplace/quota",
      usage: "/api/marketplace/usage",
      usage_ledger: "/api/marketplace/usage-ledger",
      ledger_verify: "/api/marketplace/usage-ledger-verify",
      checkout: "/api/marketplace/checkout"
    }
  }, status === "CONTROL_CLOSURE_READY" ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.control_closure_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
