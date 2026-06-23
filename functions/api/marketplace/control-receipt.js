
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
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

async function fetchJson(url) {
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({
    schema: "speedkit.fetch_response.v1",
    status: "JSON_PARSE_FAILED"
  }));
  return { ok: response.ok, http_status: response.status, payload };
}

function liveStateValue(os, key) {
  return os && os.live_state ? os.live_state[key] : undefined;
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const origin = url.origin;
  const issuedAt = new Date().toISOString();

  const [digest, closure, productOs, routeMap, policy] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-digest?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-closure?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-receipt-policy.json?t=" + Date.now())
  ]);

  const digestPayload = digest.payload || {};
  const closurePayload = closure.payload || {};
  const osPayload = productOs.payload || {};
  const routePayload = routeMap.payload || {};
  const policyPayload = policy.payload || {};

  const digestValue = digestPayload.digest ? digestPayload.digest.value : null;
  const routeCount = Number(routePayload.route_count || closurePayload.route_count || 0);
  const workspaceEntries = Number(liveStateValue(osPayload, "workspace_entries") || 0);
  const privateRemaining = Number(liveStateValue(osPayload, "private_remaining") || -1);
  const systems = Number(liveStateValue(osPayload, "recognized_execution_systems") || 0);

  const ready =
    digestPayload.status === "PUBLIC_CONTROL_DIGEST_READY" &&
    closurePayload.status === "CONTROL_CLOSURE_READY" &&
    osPayload.status === "LIVE" &&
    routePayload.status === "LIVE" &&
    /^[a-f0-9]{64}$/.test(String(digestValue || "")) &&
    routeCount >= 54 &&
    workspaceEntries === 135 &&
    privateRemaining === 0 &&
    systems === 4 &&
    liveStateValue(osPayload, "marketplace_os_digest") === "LIVE";

  const receiptMaterial = {
    schema: "speedkit.public_control_receipt_material.v1",
    receipt_subject: "SPEEDKIT_MARKETPLACE_OS",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    public_control_digest: digestValue,
    digest_algorithm: digestPayload.digest ? digestPayload.digest.algorithm : "SHA-256",
    digest_surface_count: digestPayload.digest ? digestPayload.digest.surface_count : null,
    route_count: routeCount,
    workspace_entries: workspaceEntries,
    private_remaining: privateRemaining,
    recognized_execution_systems: systems,
    marketplace_os_consolidated: liveStateValue(osPayload, "marketplace_os_consolidated"),
    public_control_digest_status: liveStateValue(osPayload, "public_control_digest"),
    marketplace_os_digest_status: liveStateValue(osPayload, "marketplace_os_digest"),
    control_closure_status: closurePayload.status,
    product_os_status: osPayload.status,
    route_map_status: routePayload.status,
    source_base_commit: policyPayload.source_base_commit || null,
    private_repository_access_included: false
  };

  const receiptHash = await sha256Hex(stableStringify(receiptMaterial));

  return json({
    schema: "speedkit.public_control_receipt_response.v1",
    status: ready ? "PUBLIC_CONTROL_RECEIPT_ISSUED" : "PUBLIC_CONTROL_RECEIPT_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    issued_at: issuedAt,
    receipt: {
      id: "speedkit-marketplace-os-" + String(digestValue || "missing").slice(0, 16),
      hash_algorithm: "SHA-256",
      receipt_hash: receiptHash,
      receipt_hash_excludes_issued_at: true,
      material_schema: receiptMaterial.schema,
      public_control_digest: digestValue,
      route_count: routeCount,
      workspace_entries: workspaceEntries,
      private_remaining: privateRemaining,
      recognized_execution_systems: systems,
      source_base_commit: receiptMaterial.source_base_commit
    },
    ready,
    receipt_material: receiptMaterial,
    authorities: {
      public_control_digest: "/api/marketplace/control-digest",
      control_closure: "/api/marketplace/control-closure",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json",
      policy: "/marketplace/control-receipt-policy.json"
    },
    source_status: {
      digest: digestPayload.status,
      closure: closurePayload.status,
      product_os: osPayload.status,
      route_map: routePayload.status
    }
  }, ready ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_receipt_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
