
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

  const [certVerifyResult, certResult, chainVerifyResult, chainIndexResult, osResult, routeResult, policyResult] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-chain-certificate-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-certificate?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-index?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-chain-seal-policy.json?t=" + Date.now())
  ]);

  const certVerify = certVerifyResult.payload || {};
  const certPayload = certResult.payload || {};
  const chainVerify = chainVerifyResult.payload || {};
  const chainIndex = chainIndexResult.payload || {};
  const osPayload = osResult.payload || {};
  const routePayload = routeResult.payload || {};
  const policyPayload = policyResult.payload || {};

  const certVerification = certVerify.verification || {};
  const certificate = certPayload.certificate || {};
  const chainVerification = chainVerify.verification || {};
  const chain = chainIndex.chain || {};
  const routeCount = Number(routePayload.route_count ?? certificate.route_count ?? certVerification.route_count ?? 0);

  const sealMaterial = {
    schema: "speedkit.public_control_chain_seal_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    seal_subject: "SPEEDKIT_MARKETPLACE_OS_PUBLIC_CONTROL_CHAIN_CERTIFICATE_VERIFIED",
    certificate_verification_hash: certVerify.verification_hash || null,
    certificate_hash: certificate.certificate_hash || certVerification.certificate_hash || null,
    chain_hash: certificate.chain_hash || chainVerification.chain_hash || chain.chain_hash || null,
    chain_verification_hash: certificate.chain_verification_hash || chainVerify.verification_hash || null,
    public_control_digest: certificate.public_control_digest || certVerification.public_control_digest || null,
    public_control_receipt_hash: certificate.public_control_receipt_hash || null,
    public_control_receipt_verification_hash: certificate.public_control_receipt_verification_hash || null,
    route_count: routeCount,
    workspace_entries: Number(liveStateValue(osPayload, "workspace_entries") ?? certificate.workspace_entries ?? 0),
    private_remaining: Number(liveStateValue(osPayload, "private_remaining") ?? certificate.private_remaining ?? -1),
    recognized_execution_systems: Number(liveStateValue(osPayload, "recognized_execution_systems") ?? certificate.recognized_execution_systems ?? 0),
    source_status: {
      certificate_verify: certVerify.status,
      certificate: certPayload.status,
      chain_verify: chainVerify.status,
      chain_index: chainIndex.status,
      product_os: osPayload.status,
      route_map: routePayload.status,
      policy: policyPayload.status
    },
    public_only_invariants: {
      certificate_verified: certVerify.status === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_VERIFIED" && certVerify.verified === true,
      certificate_hash_ok: certVerification.certificate_hash_ok === true,
      certificate_issued: certPayload.status === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_ISSUED" && certPayload.issued === true,
      certificate_failures_zero: certPayload.failures_count === 0,
      chain_verified: chainVerify.status === "PUBLIC_CONTROL_CHAIN_VERIFIED" && chainVerify.verified === true,
      chain_hash_ok: chainVerification.chain_hash_ok === true,
      chain_index_ready: chainIndex.status === "PUBLIC_CONTROL_CHAIN_INDEX_READY" && chainIndex.ready === true,
      product_os_live: osPayload.status === "LIVE",
      route_map_live: routePayload.status === "LIVE",
      private_remaining_zero: Number(liveStateValue(osPayload, "private_remaining") ?? -1) === 0,
      workspace_entries_135: Number(liveStateValue(osPayload, "workspace_entries") ?? 0) === 135,
      recognized_execution_systems_4: Number(liveStateValue(osPayload, "recognized_execution_systems") ?? 0) === 4,
      route_count_floor: routeCount >= 72,
      marketplace_os_chain_certificate_verified_live: liveStateValue(osPayload, "marketplace_os_chain_certificate_verified") === "LIVE",
      seal_policy_live: policyPayload.status === "LIVE"
    }
  };

  const failures = Object.entries(sealMaterial.public_only_invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const sealHash = await sha256Hex(stableStringify(sealMaterial));
  const sealed = failures.length === 0;

  return json({
    schema: "speedkit.public_control_chain_seal_response.v1",
    status: sealed ? "PUBLIC_CONTROL_CHAIN_SEALED" : "PUBLIC_CONTROL_CHAIN_SEAL_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    sealed,
    issued_at: issuedAt,
    seal: {
      id: "speedkit-chain-seal-" + String(sealMaterial.certificate_hash || "missing").slice(0, 16),
      hash_algorithm: "SHA-256",
      seal_hash: sealHash,
      seal_hash_excludes_issued_at: true,
      material_schema: sealMaterial.schema,
      certificate_verification_hash: sealMaterial.certificate_verification_hash,
      certificate_hash: sealMaterial.certificate_hash,
      chain_hash: sealMaterial.chain_hash,
      chain_verification_hash: sealMaterial.chain_verification_hash,
      public_control_digest: sealMaterial.public_control_digest,
      route_count: sealMaterial.route_count,
      workspace_entries: sealMaterial.workspace_entries,
      private_remaining: sealMaterial.private_remaining,
      recognized_execution_systems: sealMaterial.recognized_execution_systems
    },
    failures_count: failures.length,
    failures,
    seal_material: sealMaterial,
    source_status: sealMaterial.source_status,
    authorities: {
      certificate_verify: "/api/marketplace/control-chain-certificate-verify",
      certificate: "/api/marketplace/control-chain-certificate",
      chain_verify: "/api/marketplace/control-chain-verify",
      chain_index: "/api/marketplace/control-chain-index",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json",
      policy: "/marketplace/control-chain-seal-policy.json"
    }
  }, sealed ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_chain_seal_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
