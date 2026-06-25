
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  return "{" + Object.keys(value).sort().map(k => JSON.stringify(k) + ":" + stableStringify(value[k])).join(",") + "}";
}
async function sha256Hex(input) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(input)));
  return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function fetchJson(url) {
  const response = await fetch(url, { headers: { "cache-control": "no-store" } });
  const payload = await response.json().catch(() => ({ status: "JSON_PARSE_FAILED" }));
  return { http_status: response.status, payload };
}
async function fetchReady(origin, path, predicate) {
  let last = {};
  for (let i=0;i<10;i++) {
    const r = await fetchJson(origin + path + "?t=" + Date.now() + "-" + i);
    last = r.payload || {};
    if (r.http_status === 200 && predicate(last)) return last;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  return last;
}
function liveStateValue(os,key){ return os && os.live_state ? os.live_state[key] : undefined; }

export async function onRequestGet(context) {
  const origin = new URL(context.request.url).origin;

  const verifierPayload = await fetchReady(origin, "/api/marketplace/control-evidence-manifest-verify",
    p => p.status === "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED" && p.verified === true && p.verification && p.verification.failures_count === 0);

  const [osR, routeR, policyR] = await Promise.all([
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-final-attestation-policy.json?t=" + Date.now())
  ]);

  const os = osR.payload || {};
  const route = routeR.payload || {};
  const policy = policyR.payload || {};
  const v = verifierPayload.verification || {};
  const routeCount = Number(route.route_count ?? v.route_count ?? 0);

  const attestationMaterial = {
    schema: "speedkit.public_control_final_attestation_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    evidence_manifest_verification_hash: verifierPayload.verification_hash || null,
    manifest_hash: v.manifest_hash || null,
    archive_verification_hash: v.archive_verification_hash || null,
    archive_hash: v.archive_hash || null,
    seal_verification_hash: v.seal_verification_hash || null,
    seal_hash: v.seal_hash || null,
    certificate_verification_hash: v.certificate_verification_hash || null,
    certificate_hash: v.certificate_hash || null,
    chain_hash: v.chain_hash || null,
    chain_verification_hash: v.chain_verification_hash || null,
    public_control_digest: v.public_control_digest || null,
    route_count: routeCount,
    workspace_entries: v.workspace_entries,
    private_remaining: v.private_remaining,
    recognized_execution_systems: v.recognized_execution_systems,
    source_status: verifierPayload.source_status || {}
  };

  const attestationHash = await sha256Hex(stableStringify(attestationMaterial));

  const invariants = {
    evidence_manifest_verified: verifierPayload.status === "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED" && verifierPayload.verified === true,
    evidence_manifest_verify_failures_zero: v.failures_count === 0,
    manifest_hash_ok: v.manifest_hash_ok === true,
    archive_verified: verifierPayload.source_status && verifierPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: verifierPayload.source_status && verifierPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: v.private_remaining === 0 && Number(liveStateValue(os,"private_remaining") ?? -1) === 0,
    workspace_entries_135: v.workspace_entries === 135 && Number(liveStateValue(os,"workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: v.recognized_execution_systems === 4 && Number(liveStateValue(os,"recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 93,
    marketplace_os_evidence_manifest_verified_live: liveStateValue(os,"marketplace_os_evidence_manifest_verified") === "LIVE",
    final_attestation_live: liveStateValue(os,"public_control_final_attestation") === "LIVE",
    final_attestation_policy_live: policy.status === "LIVE"
  };

  const failures = Object.entries(invariants).filter(([,ok]) => ok !== true).map(([k]) => k);
  const attested = failures.length === 0;

  return json({
    schema: "speedkit.public_control_final_attestation_response.v1",
    status: attested ? "PUBLIC_CONTROL_FINAL_ATTESTED" : "PUBLIC_CONTROL_FINAL_ATTESTATION_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    attested,
    attestation: {
      id: "speedkit-final-attestation-" + String(attestationMaterial.manifest_hash || attestationHash).slice(0,16),
      hash_algorithm: "SHA-256",
      attestation_hash: attestationHash,
      attestation_hash_excludes_issued_at: true,
      material_schema: attestationMaterial.schema,
      evidence_manifest_verification_hash: attestationMaterial.evidence_manifest_verification_hash,
      manifest_hash: attestationMaterial.manifest_hash,
      archive_verification_hash: attestationMaterial.archive_verification_hash,
      archive_hash: attestationMaterial.archive_hash,
      seal_verification_hash: attestationMaterial.seal_verification_hash,
      seal_hash: attestationMaterial.seal_hash,
      certificate_verification_hash: attestationMaterial.certificate_verification_hash,
      certificate_hash: attestationMaterial.certificate_hash,
      chain_hash: attestationMaterial.chain_hash,
      chain_verification_hash: attestationMaterial.chain_verification_hash,
      public_control_digest: attestationMaterial.public_control_digest,
      route_count: routeCount,
      workspace_entries: v.workspace_entries,
      private_remaining: v.private_remaining,
      recognized_execution_systems: v.recognized_execution_systems
    },
    failures_count: failures.length,
    failures,
    invariants,
    attestation_material: attestationMaterial,
    source_status: {
      evidence_manifest_verify: verifierPayload.status,
      manifest: verifierPayload.source_status ? verifierPayload.source_status.manifest : null,
      archive_verify: verifierPayload.source_status ? verifierPayload.source_status.archive_verify : null,
      archive: verifierPayload.source_status ? verifierPayload.source_status.archive : null,
      product_os: os.status,
      route_map: route.status,
      policy: policy.status
    }
  }, attested ? 200 : 503);
}
export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ schema: "speedkit.public_control_final_attestation_response.v1", status: "METHOD_NOT_ALLOWED" }, 405);
}
