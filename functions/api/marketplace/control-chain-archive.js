
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
  const archivedAt = new Date().toISOString();

  const [sealVerifyResult, sealResult, certVerifyResult, certResult, chainVerifyResult, chainIndexResult, osResult, routeResult, policyResult] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-chain-seal-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-seal?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-certificate-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-certificate?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-chain-index?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-chain-archive-policy.json?t=" + Date.now())
  ]);

  const sealVerify = sealVerifyResult.payload || {};
  const sealPayload = sealResult.payload || {};
  const certVerify = certVerifyResult.payload || {};
  const certPayload = certResult.payload || {};
  const chainVerify = chainVerifyResult.payload || {};
  const chainIndex = chainIndexResult.payload || {};
  const osPayload = osResult.payload || {};
  const routePayload = routeResult.payload || {};
  const policyPayload = policyResult.payload || {};

  const sealVerification = sealVerify.verification || {};
  const seal = sealPayload.seal || {};
  const certVerification = certVerify.verification || {};
  const certificate = certPayload.certificate || {};
  const chainVerification = chainVerify.verification || {};
  const chain = chainIndex.chain || {};
  const routeCount = Number(routePayload.route_count ?? sealVerification.route_count ?? seal.route_count ?? 0);

  const archiveMaterial = {
    schema: "speedkit.public_control_chain_archive_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    archive_subject: "SPEEDKIT_MARKETPLACE_OS_FINAL_PUBLIC_CONTROL_CHAIN_EVIDENCE",
    seal_verification_hash: sealVerify.verification_hash || null,
    seal_hash: seal.seal_hash || sealVerification.seal_hash || null,
    certificate_verification_hash: seal.certificate_verification_hash || certVerify.verification_hash || null,
    certificate_hash: seal.certificate_hash || certificate.certificate_hash || null,
    chain_hash: seal.chain_hash || chainVerification.chain_hash || chain.chain_hash || null,
    chain_verification_hash: seal.chain_verification_hash || chainVerify.verification_hash || null,
    public_control_digest: seal.public_control_digest || certificate.public_control_digest || null,
    route_count: routeCount,
    workspace_entries: Number(liveStateValue(osPayload, "workspace_entries") ?? seal.workspace_entries ?? 0),
    private_remaining: Number(liveStateValue(osPayload, "private_remaining") ?? seal.private_remaining ?? -1),
    recognized_execution_systems: Number(liveStateValue(osPayload, "recognized_execution_systems") ?? seal.recognized_execution_systems ?? 0),
    source_status: {
      seal_verify: sealVerify.status,
      seal: sealPayload.status,
      certificate_verify: certVerify.status,
      certificate: certPayload.status,
      chain_verify: chainVerify.status,
      chain_index: chainIndex.status,
      product_os: osPayload.status,
      route_map: routePayload.status,
      policy: policyPayload.status
    },
    public_only_invariants: {
      seal_verified: sealVerify.status === "PUBLIC_CONTROL_CHAIN_SEAL_VERIFIED" && sealVerify.verified === true,
      seal_hash_ok: sealVerification.seal_hash_ok === true,
      seal_issued: sealPayload.status === "PUBLIC_CONTROL_CHAIN_SEALED" && sealPayload.sealed === true,
      seal_failures_zero: sealPayload.failures_count === 0,
      certificate_verified: certVerify.status === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_VERIFIED" && certVerify.verified === true,
      certificate_hash_ok: certVerification.certificate_hash_ok === true,
      certificate_issued: certPayload.status === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_ISSUED" && certPayload.issued === true,
      chain_verified: chainVerify.status === "PUBLIC_CONTROL_CHAIN_VERIFIED" && chainVerify.verified === true,
      chain_hash_ok: chainVerification.chain_hash_ok === true,
      chain_index_ready: chainIndex.status === "PUBLIC_CONTROL_CHAIN_INDEX_READY" && chainIndex.ready === true,
      product_os_live: osPayload.status === "LIVE",
      route_map_live: routePayload.status === "LIVE",
      private_remaining_zero: Number(liveStateValue(osPayload, "private_remaining") ?? -1) === 0,
      workspace_entries_135: Number(liveStateValue(osPayload, "workspace_entries") ?? 0) === 135,
      recognized_execution_systems_4: Number(liveStateValue(osPayload, "recognized_execution_systems") ?? 0) === 4,
      route_count_floor: routeCount >= 81,
      marketplace_os_chain_seal_verified_live: liveStateValue(osPayload, "marketplace_os_chain_seal_verified") === "LIVE",
      archive_policy_live: policyPayload.status === "LIVE"
    }
  };

  const failures = Object.entries(archiveMaterial.public_only_invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const archiveHash = await sha256Hex(stableStringify(archiveMaterial));
  const archived = failures.length === 0;

  return json({
    schema: "speedkit.public_control_chain_archive_response.v1",
    status: archived ? "PUBLIC_CONTROL_CHAIN_ARCHIVED" : "PUBLIC_CONTROL_CHAIN_ARCHIVE_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    archived,
    archived_at: archivedAt,
    archive: {
      id: "speedkit-chain-archive-" + String(archiveMaterial.seal_hash || "missing").slice(0, 16),
      hash_algorithm: "SHA-256",
      archive_hash: archiveHash,
      archive_hash_excludes_archived_at: true,
      material_schema: archiveMaterial.schema,
      seal_verification_hash: archiveMaterial.seal_verification_hash,
      seal_hash: archiveMaterial.seal_hash,
      certificate_verification_hash: archiveMaterial.certificate_verification_hash,
      certificate_hash: archiveMaterial.certificate_hash,
      chain_hash: archiveMaterial.chain_hash,
      chain_verification_hash: archiveMaterial.chain_verification_hash,
      public_control_digest: archiveMaterial.public_control_digest,
      route_count: archiveMaterial.route_count,
      workspace_entries: archiveMaterial.workspace_entries,
      private_remaining: archiveMaterial.private_remaining,
      recognized_execution_systems: archiveMaterial.recognized_execution_systems
    },
    failures_count: failures.length,
    failures,
    archive_material: archiveMaterial,
    source_status: archiveMaterial.source_status
  }, archived ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_chain_archive_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
