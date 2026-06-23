
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

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const origin = url.origin;

  const [receiptResult, digestResult, productOsResult, routeMapResult, policyResult] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-receipt?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-digest?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-receipt-verify-policy.json?t=" + Date.now())
  ]);

  const receiptPayload = receiptResult.payload || {};
  const digestPayload = digestResult.payload || {};
  const osPayload = productOsResult.payload || {};
  const routePayload = routeMapResult.payload || {};
  const policyPayload = policyResult.payload || {};

  const receipt = receiptPayload.receipt || {};
  const receiptMaterial = receiptPayload.receipt_material || {};
  const recomputedReceiptHash = await sha256Hex(stableStringify(receiptMaterial));

  const receiptHashOk = recomputedReceiptHash === receipt.receipt_hash;
  const digestMatch = receipt.public_control_digest === (digestPayload.digest ? digestPayload.digest.value : null);
  const receiptIssued = receiptPayload.status === "PUBLIC_CONTROL_RECEIPT_ISSUED" && receiptPayload.ready === true;
  const digestReady = digestPayload.status === "PUBLIC_CONTROL_DIGEST_READY" && digestPayload.degraded_count === 0;
  const productOsLive = osPayload.status === "LIVE";
  const routeMapLive = routePayload.status === "LIVE";

  const invariants = {
    receipt_hash_ok: receiptHashOk,
    digest_match: digestMatch,
    receipt_issued: receiptIssued,
    digest_ready: digestReady,
    product_os_live: productOsLive,
    route_map_live: routeMapLive,
    private_remaining_zero: receipt.private_remaining === 0 && receiptMaterial.private_remaining === 0,
    workspace_entries_135: receipt.workspace_entries === 135 && receiptMaterial.workspace_entries === 135,
    recognized_execution_systems_4: receipt.recognized_execution_systems === 4 && receiptMaterial.recognized_execution_systems === 4,
    route_count_floor: Number(receipt.route_count || 0) >= 57 && Number(routePayload.route_count || 0) >= 57,
    marketplace_os_receipt_live: osPayload.live_state && osPayload.live_state.marketplace_os_receipt === "LIVE",
    verifier_policy_live: policyPayload.status === "LIVE"
  };

  const failures = Object.entries(invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const verified = failures.length === 0;

  const verificationMaterial = {
    schema: "speedkit.public_control_receipt_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    receipt_hash: receipt.receipt_hash,
    recomputed_receipt_hash: recomputedReceiptHash,
    public_control_digest: receipt.public_control_digest,
    current_control_digest: digestPayload.digest ? digestPayload.digest.value : null,
    private_remaining: receipt.private_remaining,
    workspace_entries: receipt.workspace_entries,
    recognized_execution_systems: receipt.recognized_execution_systems,
    route_count: receipt.route_count,
    invariants
  };

  const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

  return json({
    schema: "speedkit.public_control_receipt_verify_response.v1",
    status: verified ? "PUBLIC_CONTROL_RECEIPT_VERIFIED" : "PUBLIC_CONTROL_RECEIPT_VERIFY_FAILED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    verified,
    verification_hash: verificationHash,
    verification: {
      receipt_hash: receipt.receipt_hash,
      recomputed_receipt_hash: recomputedReceiptHash,
      receipt_hash_ok: receiptHashOk,
      public_control_digest: receipt.public_control_digest,
      current_control_digest: digestPayload.digest ? digestPayload.digest.value : null,
      digest_match: digestMatch,
      private_remaining: receipt.private_remaining,
      workspace_entries: receipt.workspace_entries,
      recognized_execution_systems: receipt.recognized_execution_systems,
      route_count: receipt.route_count,
      failures_count: failures.length,
      failures
    },
    invariants,
    source_status: {
      receipt: receiptPayload.status,
      digest: digestPayload.status,
      product_os: osPayload.status,
      route_map: routePayload.status,
      verifier_policy: policyPayload.status
    },
    authorities: {
      receipt: "/api/marketplace/control-receipt",
      digest: "/api/marketplace/control-digest",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json",
      verifier_policy: "/marketplace/control-receipt-verify-policy.json"
    }
  }, verified ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_receipt_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
