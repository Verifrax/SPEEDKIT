
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

  const [certificateResult, chainVerifyResult, chainIndexResult, receiptVerifyResult, receiptResult, digestResult, osResult, routeResult, policyResult] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-chain-certificate?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-index?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-receipt-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-receipt?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-digest?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-chain-certificate-verify-policy.json?t=" + Date.now())
  ]);

  const certificatePayload = certificateResult.payload || {};
  const chainVerifyPayload = chainVerifyResult.payload || {};
  const chainIndexPayload = chainIndexResult.payload || {};
  const receiptVerifyPayload = receiptVerifyResult.payload || {};
  const receiptPayload = receiptResult.payload || {};
  const digestPayload = digestResult.payload || {};
  const osPayload = osResult.payload || {};
  const routePayload = routeResult.payload || {};
  const policyPayload = policyResult.payload || {};

  const certificate = certificatePayload.certificate || {};
  const certificateMaterial = certificatePayload.certificate_material || {};
  const chainVerification = chainVerifyPayload.verification || {};
  const chain = chainIndexPayload.chain || {};
  const receiptVerification = receiptVerifyPayload.verification || {};
  const receipt = receiptPayload.receipt || {};
  const digest = digestPayload.digest || {};
  const routeCount = Number(routePayload.route_count ?? certificate.route_count ?? chainVerification.route_count ?? 0);

  const recomputedCertificateHash = await sha256Hex(stableStringify(certificateMaterial));

  const invariants = {
    certificate_hash_ok: recomputedCertificateHash === certificate.certificate_hash,
    certificate_issued: certificatePayload.status === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_ISSUED" && certificatePayload.issued === true,
    certificate_failures_zero: certificatePayload.failures_count === 0,
    chain_verified: chainVerifyPayload.status === "PUBLIC_CONTROL_CHAIN_VERIFIED" && chainVerifyPayload.verified === true,
    chain_hash_ok: chainVerification.chain_hash_ok === true,
    chain_index_ready: chainIndexPayload.status === "PUBLIC_CONTROL_CHAIN_INDEX_READY" && chainIndexPayload.ready === true,
    receipt_verified: receiptVerifyPayload.status === "PUBLIC_CONTROL_RECEIPT_VERIFIED" && receiptVerifyPayload.verified === true,
    receipt_hash_ok: receiptVerification.receipt_hash_ok === true,
    receipt_issued: receiptPayload.status === "PUBLIC_CONTROL_RECEIPT_ISSUED" && receiptPayload.ready === true,
    digest_ready: digestPayload.status === "PUBLIC_CONTROL_DIGEST_READY" && digestPayload.degraded_count === 0,
    certificate_chain_hash_match: certificate.chain_hash === chainVerification.chain_hash && certificate.chain_hash === chain.chain_hash,
    certificate_chain_verification_hash_match: certificate.chain_verification_hash === chainVerifyPayload.verification_hash,
    certificate_digest_match: certificate.public_control_digest === digest.value,
    certificate_receipt_hash_match: certificate.public_control_receipt_hash === receipt.receipt_hash,
    certificate_receipt_verification_hash_match: certificate.public_control_receipt_verification_hash === receiptVerifyPayload.verification_hash,
    product_os_live: osPayload.status === "LIVE",
    route_map_live: routePayload.status === "LIVE",
    private_remaining_zero: certificate.private_remaining === 0 && Number(liveStateValue(osPayload, "private_remaining") ?? -1) === 0,
    workspace_entries_135: certificate.workspace_entries === 135 && Number(liveStateValue(osPayload, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: certificate.recognized_execution_systems === 4 && Number(liveStateValue(osPayload, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 69,
    marketplace_os_chain_certificate_live: liveStateValue(osPayload, "marketplace_os_chain_certificate") === "LIVE",
    certificate_verify_policy_live: policyPayload.status === "LIVE"
  };

  const failures = Object.entries(invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const verified = failures.length === 0;

  const verificationMaterial = {
    schema: "speedkit.public_control_chain_certificate_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    certificate_hash: certificate.certificate_hash,
    recomputed_certificate_hash: recomputedCertificateHash,
    chain_hash: certificate.chain_hash,
    chain_verification_hash: certificate.chain_verification_hash,
    public_control_digest: certificate.public_control_digest,
    public_control_receipt_hash: certificate.public_control_receipt_hash,
    public_control_receipt_verification_hash: certificate.public_control_receipt_verification_hash,
    private_remaining: certificate.private_remaining,
    workspace_entries: certificate.workspace_entries,
    recognized_execution_systems: certificate.recognized_execution_systems,
    route_count: routeCount,
    invariants
  };

  const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

  return json({
    schema: "speedkit.public_control_chain_certificate_verify_response.v1",
    status: verified ? "PUBLIC_CONTROL_CHAIN_CERTIFICATE_VERIFIED" : "PUBLIC_CONTROL_CHAIN_CERTIFICATE_VERIFY_FAILED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    verified,
    verification_hash: verificationHash,
    verification: {
      certificate_hash: certificate.certificate_hash,
      recomputed_certificate_hash: recomputedCertificateHash,
      certificate_hash_ok: recomputedCertificateHash === certificate.certificate_hash,
      chain_hash: certificate.chain_hash,
      current_chain_hash: chainVerification.chain_hash || chain.chain_hash || null,
      chain_hash_match: certificate.chain_hash === chainVerification.chain_hash && certificate.chain_hash === chain.chain_hash,
      chain_verification_hash: certificate.chain_verification_hash,
      current_chain_verification_hash: chainVerifyPayload.verification_hash || null,
      chain_verification_hash_match: certificate.chain_verification_hash === chainVerifyPayload.verification_hash,
      public_control_digest: certificate.public_control_digest,
      current_control_digest: digest.value || null,
      digest_match: certificate.public_control_digest === digest.value,
      public_control_receipt_hash: certificate.public_control_receipt_hash,
      current_receipt_hash: receipt.receipt_hash || null,
      receipt_hash_match: certificate.public_control_receipt_hash === receipt.receipt_hash,
      public_control_receipt_verification_hash: certificate.public_control_receipt_verification_hash,
      current_receipt_verification_hash: receiptVerifyPayload.verification_hash || null,
      receipt_verification_hash_match: certificate.public_control_receipt_verification_hash === receiptVerifyPayload.verification_hash,
      private_remaining: certificate.private_remaining,
      workspace_entries: certificate.workspace_entries,
      recognized_execution_systems: certificate.recognized_execution_systems,
      route_count: routeCount,
      failures_count: failures.length,
      failures
    },
    invariants,
    source_status: {
      certificate: certificatePayload.status,
      chain_verify: chainVerifyPayload.status,
      chain_index: chainIndexPayload.status,
      receipt_verify: receiptVerifyPayload.status,
      receipt: receiptPayload.status,
      digest: digestPayload.status,
      product_os: osPayload.status,
      route_map: routePayload.status,
      verifier_policy: policyPayload.status
    },
    authorities: {
      certificate: "/api/marketplace/control-chain-certificate",
      chain_verify: "/api/marketplace/control-chain-verify",
      chain_index: "/api/marketplace/control-chain-index",
      receipt_verify: "/api/marketplace/control-receipt-verify",
      receipt: "/api/marketplace/control-receipt",
      digest: "/api/marketplace/control-digest",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json",
      verifier_policy: "/marketplace/control-chain-certificate-verify-policy.json"
    }
  }, verified ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_chain_certificate_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
