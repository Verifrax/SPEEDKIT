
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

  const [chainVerifyResult, chainIndexResult, receiptVerifyResult, receiptResult, digestResult, osResult, routeResult, policyResult] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-chain-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-index?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-receipt-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-receipt?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-digest?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-chain-certificate-policy.json?t=" + Date.now())
  ]);

  const chainVerify = chainVerifyResult.payload || {};
  const chainIndex = chainIndexResult.payload || {};
  const receiptVerify = receiptVerifyResult.payload || {};
  const receiptPayload = receiptResult.payload || {};
  const digestPayload = digestResult.payload || {};
  const osPayload = osResult.payload || {};
  const routePayload = routeResult.payload || {};
  const policyPayload = policyResult.payload || {};

  const chainVerification = chainVerify.verification || {};
  const chain = chainIndex.chain || {};
  const receiptVerification = receiptVerify.verification || {};
  const receipt = receiptPayload.receipt || {};
  const digest = digestPayload.digest || {};
  const routeCount = Number(routePayload.route_count ?? chain.route_count ?? chainVerification.route_count ?? 0);

  const certificateMaterial = {
    schema: "speedkit.public_control_chain_certificate_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    certificate_subject: "SPEEDKIT_MARKETPLACE_OS_VERIFIED_PUBLIC_CONTROL_CHAIN",
    chain_hash: chainVerification.chain_hash || chain.chain_hash || null,
    recomputed_chain_hash: chainVerification.recomputed_chain_hash || null,
    chain_verification_hash: chainVerify.verification_hash || null,
    public_control_digest: digest.value || chain.public_control_digest || receipt.public_control_digest || null,
    public_control_receipt_hash: receipt.receipt_hash || chain.public_control_receipt_hash || null,
    public_control_receipt_verification_hash: receiptVerify.verification_hash || chain.public_control_receipt_verification_hash || null,
    route_count: routeCount,
    workspace_entries: Number(liveStateValue(osPayload, "workspace_entries") ?? receipt.workspace_entries ?? chain.workspace_entries ?? 0),
    private_remaining: Number(liveStateValue(osPayload, "private_remaining") ?? receipt.private_remaining ?? chain.private_remaining ?? -1),
    recognized_execution_systems: Number(liveStateValue(osPayload, "recognized_execution_systems") ?? receipt.recognized_execution_systems ?? chain.recognized_execution_systems ?? 0),
    source_status: {
      chain_verify: chainVerify.status,
      chain_index: chainIndex.status,
      receipt_verify: receiptVerify.status,
      receipt: receiptPayload.status,
      digest: digestPayload.status,
      product_os: osPayload.status,
      route_map: routePayload.status
    },
    public_only_invariants: {
      chain_verified: chainVerify.status === "PUBLIC_CONTROL_CHAIN_VERIFIED" && chainVerify.verified === true,
      chain_hash_ok: chainVerification.chain_hash_ok === true,
      chain_index_ready: chainIndex.status === "PUBLIC_CONTROL_CHAIN_INDEX_READY" && chainIndex.ready === true,
      receipt_verified: receiptVerify.status === "PUBLIC_CONTROL_RECEIPT_VERIFIED" && receiptVerify.verified === true,
      receipt_issued: receiptPayload.status === "PUBLIC_CONTROL_RECEIPT_ISSUED" && receiptPayload.ready === true,
      digest_ready: digestPayload.status === "PUBLIC_CONTROL_DIGEST_READY" && digestPayload.degraded_count === 0,
      product_os_live: osPayload.status === "LIVE",
      route_map_live: routePayload.status === "LIVE",
      private_remaining_zero: Number(liveStateValue(osPayload, "private_remaining") ?? -1) === 0,
      workspace_entries_135: Number(liveStateValue(osPayload, "workspace_entries") ?? 0) === 135,
      recognized_execution_systems_4: Number(liveStateValue(osPayload, "recognized_execution_systems") ?? 0) === 4,
      route_count_floor: routeCount >= 66,
      marketplace_os_chain_verified_live: liveStateValue(osPayload, "marketplace_os_chain_verified") === "LIVE",
      certificate_policy_live: policyPayload.status === "LIVE"
    }
  };

  const failures = Object.entries(certificateMaterial.public_only_invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const certificateHash = await sha256Hex(stableStringify(certificateMaterial));
  const issued = failures.length === 0;

  return json({
    schema: "speedkit.public_control_chain_certificate_response.v1",
    status: issued ? "PUBLIC_CONTROL_CHAIN_CERTIFICATE_ISSUED" : "PUBLIC_CONTROL_CHAIN_CERTIFICATE_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    issued,
    issued_at: issuedAt,
    certificate: {
      id: "speedkit-chain-certificate-" + String(certificateMaterial.chain_hash || "missing").slice(0, 16),
      hash_algorithm: "SHA-256",
      certificate_hash: certificateHash,
      certificate_hash_excludes_issued_at: true,
      material_schema: certificateMaterial.schema,
      chain_hash: certificateMaterial.chain_hash,
      chain_verification_hash: certificateMaterial.chain_verification_hash,
      public_control_digest: certificateMaterial.public_control_digest,
      public_control_receipt_hash: certificateMaterial.public_control_receipt_hash,
      public_control_receipt_verification_hash: certificateMaterial.public_control_receipt_verification_hash,
      route_count: certificateMaterial.route_count,
      workspace_entries: certificateMaterial.workspace_entries,
      private_remaining: certificateMaterial.private_remaining,
      recognized_execution_systems: certificateMaterial.recognized_execution_systems
    },
    failures_count: failures.length,
    failures,
    certificate_material: certificateMaterial,
    source_status: certificateMaterial.source_status,
    authorities: {
      chain_verify: "/api/marketplace/control-chain-verify",
      chain_index: "/api/marketplace/control-chain-index",
      receipt_verify: "/api/marketplace/control-receipt-verify",
      receipt: "/api/marketplace/control-receipt",
      digest: "/api/marketplace/control-digest",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json",
      policy: "/marketplace/control-chain-certificate-policy.json"
    }
  }, issued ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_chain_certificate_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
