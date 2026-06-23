
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

  const [chainResult, receiptVerifyResult, receiptResult, digestResult, osResult, routeResult, policyResult] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-chain-index?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-receipt-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-receipt?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-digest?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-chain-verify-policy.json?t=" + Date.now())
  ]);

  const chainIndex = chainResult.payload || {};
  const receiptVerify = receiptVerifyResult.payload || {};
  const receiptPayload = receiptResult.payload || {};
  const digestPayload = digestResult.payload || {};
  const osPayload = osResult.payload || {};
  const routePayload = routeResult.payload || {};
  const policyPayload = policyResult.payload || {};

  const chain = chainIndex.chain || {};
  const chainMaterial = chainIndex.chain_material || {};
  const recomputedChainHash = await sha256Hex(stableStringify(chainMaterial));

  const receiptVerification = receiptVerify.verification || {};
  const receipt = receiptPayload.receipt || {};
  const digest = digestPayload.digest || {};

  const chainNodes = Array.isArray(chainIndex.chain_nodes) ? chainIndex.chain_nodes : [];
  const routeCount = Number(chain.route_count ?? routePayload.route_count ?? 0);

  const invariants = {
    chain_hash_ok: recomputedChainHash === chain.chain_hash,
    chain_index_ready: chainIndex.status === "PUBLIC_CONTROL_CHAIN_INDEX_READY" && chainIndex.ready === true,
    chain_failures_zero: chainIndex.failures_count === 0,
    chain_nodes_accepted: chainNodes.length === 6 && chainNodes.every(node => node.accepted === true),
    receipt_verifier_ready: receiptVerify.status === "PUBLIC_CONTROL_RECEIPT_VERIFIED" && receiptVerify.verified === true,
    receipt_hash_ok: receiptVerification.receipt_hash_ok === true,
    digest_match: receiptVerification.digest_match === true,
    receipt_issued: receiptPayload.status === "PUBLIC_CONTROL_RECEIPT_ISSUED" && receiptPayload.ready === true,
    digest_ready: digestPayload.status === "PUBLIC_CONTROL_DIGEST_READY" && digestPayload.degraded_count === 0,
    chain_digest_match: chain.public_control_digest === digest.value,
    chain_receipt_hash_match: chain.public_control_receipt_hash === receipt.receipt_hash,
    chain_verification_hash_match: chain.public_control_receipt_verification_hash === receiptVerify.verification_hash,
    product_os_live: osPayload.status === "LIVE",
    route_map_live: routePayload.status === "LIVE",
    private_remaining_zero: chain.private_remaining === 0 && receipt.private_remaining === 0 && Number(liveStateValue(osPayload, "private_remaining") ?? -1) === 0,
    workspace_entries_135: chain.workspace_entries === 135 && receipt.workspace_entries === 135 && Number(liveStateValue(osPayload, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: chain.recognized_execution_systems === 4 && receipt.recognized_execution_systems === 4 && Number(liveStateValue(osPayload, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 63,
    marketplace_os_chain_index_live: liveStateValue(osPayload, "marketplace_os_chain_index") === "LIVE",
    chain_verify_policy_live: policyPayload.status === "LIVE"
  };

  const failures = Object.entries(invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const verified = failures.length === 0;

  const verificationMaterial = {
    schema: "speedkit.public_control_chain_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    chain_hash: chain.chain_hash,
    recomputed_chain_hash: recomputedChainHash,
    public_control_digest: chain.public_control_digest,
    public_control_receipt_hash: chain.public_control_receipt_hash,
    public_control_receipt_verification_hash: chain.public_control_receipt_verification_hash,
    private_remaining: chain.private_remaining,
    workspace_entries: chain.workspace_entries,
    recognized_execution_systems: chain.recognized_execution_systems,
    route_count: routeCount,
    node_count: chain.node_count,
    invariants
  };

  const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

  return json({
    schema: "speedkit.public_control_chain_verify_response.v1",
    status: verified ? "PUBLIC_CONTROL_CHAIN_VERIFIED" : "PUBLIC_CONTROL_CHAIN_VERIFY_FAILED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    verified,
    verification_hash: verificationHash,
    verification: {
      chain_hash: chain.chain_hash,
      recomputed_chain_hash: recomputedChainHash,
      chain_hash_ok: recomputedChainHash === chain.chain_hash,
      public_control_digest: chain.public_control_digest,
      current_control_digest: digest.value || null,
      digest_match: chain.public_control_digest === digest.value,
      public_control_receipt_hash: chain.public_control_receipt_hash,
      current_receipt_hash: receipt.receipt_hash || null,
      receipt_hash_match: chain.public_control_receipt_hash === receipt.receipt_hash,
      public_control_receipt_verification_hash: chain.public_control_receipt_verification_hash,
      current_receipt_verification_hash: receiptVerify.verification_hash || null,
      receipt_verification_hash_match: chain.public_control_receipt_verification_hash === receiptVerify.verification_hash,
      private_remaining: chain.private_remaining,
      workspace_entries: chain.workspace_entries,
      recognized_execution_systems: chain.recognized_execution_systems,
      route_count: routeCount,
      node_count: chain.node_count,
      failures_count: failures.length,
      failures
    },
    invariants,
    source_status: {
      chain_index: chainIndex.status,
      receipt_verifier: receiptVerify.status,
      receipt: receiptPayload.status,
      digest: digestPayload.status,
      product_os: osPayload.status,
      route_map: routePayload.status,
      verifier_policy: policyPayload.status
    },
    authorities: {
      chain_index: "/api/marketplace/control-chain-index",
      receipt_verifier: "/api/marketplace/control-receipt-verify",
      receipt: "/api/marketplace/control-receipt",
      digest: "/api/marketplace/control-digest",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json",
      verifier_policy: "/marketplace/control-chain-verify-policy.json"
    }
  }, verified ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_chain_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
