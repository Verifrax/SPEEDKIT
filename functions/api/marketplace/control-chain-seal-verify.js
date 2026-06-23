
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

  const [sealResult, certVerifyResult, certResult, chainVerifyResult, chainIndexResult, osResult, routeResult, policyResult] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-chain-seal?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-certificate-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-certificate?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-index?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-chain-seal-verify-policy.json?t=" + Date.now())
  ]);

  const sealPayload = sealResult.payload || {};
  const certVerifyPayload = certVerifyResult.payload || {};
  const certPayload = certResult.payload || {};
  const chainVerifyPayload = chainVerifyResult.payload || {};
  const chainIndexPayload = chainIndexResult.payload || {};
  const osPayload = osResult.payload || {};
  const routePayload = routeResult.payload || {};
  const policyPayload = policyResult.payload || {};

  const seal = sealPayload.seal || {};
  const sealMaterial = sealPayload.seal_material || {};
  const certVerification = certVerifyPayload.verification || {};
  const certificate = certPayload.certificate || {};
  const chainVerification = chainVerifyPayload.verification || {};
  const chain = chainIndexPayload.chain || {};
  const routeCount = Number(routePayload.route_count ?? seal.route_count ?? certVerification.route_count ?? 0);

  const recomputedSealHash = await sha256Hex(stableStringify(sealMaterial));

  const invariants = {
    seal_hash_ok: recomputedSealHash === seal.seal_hash,
    seal_issued: sealPayload.status === "PUBLIC_CONTROL_CHAIN_SEALED" && sealPayload.sealed === true,
    seal_failures_zero: sealPayload.failures_count === 0,
    certificate_verified: certVerifyPayload.status === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_VERIFIED" && certVerifyPayload.verified === true,
    certificate_hash_ok: certVerification.certificate_hash_ok === true,
    certificate_issued: certPayload.status === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_ISSUED" && certPayload.issued === true,
    certificate_failures_zero: certPayload.failures_count === 0,
    chain_verified: chainVerifyPayload.status === "PUBLIC_CONTROL_CHAIN_VERIFIED" && chainVerifyPayload.verified === true,
    chain_hash_ok: chainVerification.chain_hash_ok === true,
    chain_index_ready: chainIndexPayload.status === "PUBLIC_CONTROL_CHAIN_INDEX_READY" && chainIndexPayload.ready === true,
    seal_certificate_verification_hash_match: seal.certificate_verification_hash === certVerifyPayload.verification_hash,
    seal_certificate_hash_match: seal.certificate_hash === certificate.certificate_hash,
    seal_chain_hash_match: seal.chain_hash === certificate.chain_hash && seal.chain_hash === chainVerification.chain_hash && seal.chain_hash === chain.chain_hash,
    seal_chain_verification_hash_match: seal.chain_verification_hash === chainVerifyPayload.verification_hash,
    product_os_live: osPayload.status === "LIVE",
    route_map_live: routePayload.status === "LIVE",
    private_remaining_zero: seal.private_remaining === 0 && Number(liveStateValue(osPayload, "private_remaining") ?? -1) === 0,
    workspace_entries_135: seal.workspace_entries === 135 && Number(liveStateValue(osPayload, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: seal.recognized_execution_systems === 4 && Number(liveStateValue(osPayload, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 75,
    marketplace_os_chain_seal_live: liveStateValue(osPayload, "marketplace_os_chain_seal") === "LIVE",
    seal_verify_policy_live: policyPayload.status === "LIVE"
  };

  const failures = Object.entries(invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const verified = failures.length === 0;

  const verificationMaterial = {
    schema: "speedkit.public_control_chain_seal_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    seal_hash: seal.seal_hash,
    recomputed_seal_hash: recomputedSealHash,
    certificate_verification_hash: seal.certificate_verification_hash,
    certificate_hash: seal.certificate_hash,
    chain_hash: seal.chain_hash,
    chain_verification_hash: seal.chain_verification_hash,
    public_control_digest: seal.public_control_digest,
    private_remaining: seal.private_remaining,
    workspace_entries: seal.workspace_entries,
    recognized_execution_systems: seal.recognized_execution_systems,
    route_count: routeCount,
    invariants
  };

  const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

  return json({
    schema: "speedkit.public_control_chain_seal_verify_response.v1",
    status: verified ? "PUBLIC_CONTROL_CHAIN_SEAL_VERIFIED" : "PUBLIC_CONTROL_CHAIN_SEAL_VERIFY_FAILED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    verified,
    verification_hash: verificationHash,
    verification: {
      seal_hash: seal.seal_hash,
      recomputed_seal_hash: recomputedSealHash,
      seal_hash_ok: recomputedSealHash === seal.seal_hash,
      certificate_verification_hash: seal.certificate_verification_hash,
      current_certificate_verification_hash: certVerifyPayload.verification_hash || null,
      certificate_verification_hash_match: seal.certificate_verification_hash === certVerifyPayload.verification_hash,
      certificate_hash: seal.certificate_hash,
      current_certificate_hash: certificate.certificate_hash || null,
      certificate_hash_match: seal.certificate_hash === certificate.certificate_hash,
      chain_hash: seal.chain_hash,
      current_chain_hash: chainVerification.chain_hash || chain.chain_hash || null,
      chain_hash_match: seal.chain_hash === chainVerification.chain_hash && seal.chain_hash === chain.chain_hash,
      chain_verification_hash: seal.chain_verification_hash,
      current_chain_verification_hash: chainVerifyPayload.verification_hash || null,
      chain_verification_hash_match: seal.chain_verification_hash === chainVerifyPayload.verification_hash,
      public_control_digest: seal.public_control_digest,
      private_remaining: seal.private_remaining,
      workspace_entries: seal.workspace_entries,
      recognized_execution_systems: seal.recognized_execution_systems,
      route_count: routeCount,
      failures_count: failures.length,
      failures
    },
    invariants,
    source_status: {
      seal: sealPayload.status,
      certificate_verify: certVerifyPayload.status,
      certificate: certPayload.status,
      chain_verify: chainVerifyPayload.status,
      chain_index: chainIndexPayload.status,
      product_os: osPayload.status,
      route_map: routePayload.status,
      verifier_policy: policyPayload.status
    },
    authorities: {
      seal: "/api/marketplace/control-chain-seal",
      certificate_verify: "/api/marketplace/control-chain-certificate-verify",
      certificate: "/api/marketplace/control-chain-certificate",
      chain_verify: "/api/marketplace/control-chain-verify",
      chain_index: "/api/marketplace/control-chain-index",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json",
      verifier_policy: "/marketplace/control-chain-seal-verify-policy.json"
    }
  }, verified ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_chain_seal_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
