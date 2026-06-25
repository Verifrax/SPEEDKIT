
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

  const archiveVerify = await fetchReady(origin, "/api/marketplace/control-chain-archive-verify",
    p => p.status === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED" && p.verified === true && p.verification && p.verification.failures_count === 0);

  const archivePayload = await fetchReady(origin, "/api/marketplace/control-chain-archive",
    p => p.status === "PUBLIC_CONTROL_CHAIN_ARCHIVED" && p.archived === true && p.failures_count === 0);

  const [osR, routeR, policyR] = await Promise.all([
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-evidence-manifest-policy.json?t=" + Date.now())
  ]);

  const os = osR.payload || {};
  const route = routeR.payload || {};
  const policy = policyR.payload || {};
  const v = archiveVerify.verification || {};
  const a = archivePayload.archive || {};
  const routeCount = Number(route.route_count ?? v.route_count ?? a.route_count ?? 0);

  const manifestMaterial = {
    schema: "speedkit.public_control_evidence_manifest_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    archive_verification_hash: archiveVerify.verification_hash || null,
    archive_hash: v.archive_hash || a.archive_hash || null,
    seal_verification_hash: v.seal_verification_hash || a.seal_verification_hash || null,
    seal_hash: v.seal_hash || a.seal_hash || null,
    certificate_verification_hash: v.certificate_verification_hash || a.certificate_verification_hash || null,
    certificate_hash: v.certificate_hash || a.certificate_hash || null,
    chain_hash: v.chain_hash || a.chain_hash || null,
    chain_verification_hash: v.chain_verification_hash || a.chain_verification_hash || null,
    public_control_digest: v.public_control_digest || a.public_control_digest || null,
    route_count: routeCount,
    workspace_entries: v.workspace_entries ?? a.workspace_entries,
    private_remaining: v.private_remaining ?? a.private_remaining,
    recognized_execution_systems: v.recognized_execution_systems ?? a.recognized_execution_systems,
    source_status: archiveVerify.source_status || {}
  };

  const manifestHash = await sha256Hex(stableStringify(manifestMaterial));

  const invariants = {
    archive_verified: archiveVerify.status === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED" && archiveVerify.verified === true,
    archive_hash_ok: v.archive_hash_ok === true,
    archive_verify_failures_zero: v.failures_count === 0,
    archive_issued: archivePayload.status === "PUBLIC_CONTROL_CHAIN_ARCHIVED" && archivePayload.archived === true,
    archive_failures_zero: archivePayload.failures_count === 0,
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: manifestMaterial.private_remaining === 0 && Number(liveStateValue(os,"private_remaining") ?? -1) === 0,
    workspace_entries_135: manifestMaterial.workspace_entries === 135 && Number(liveStateValue(os,"workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: manifestMaterial.recognized_execution_systems === 4 && Number(liveStateValue(os,"recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 87,
    marketplace_os_chain_archive_verified_live: liveStateValue(os,"marketplace_os_chain_archive_verified") === "LIVE",
    evidence_manifest_policy_live: policy.status === "LIVE"
  };

  const failures = Object.entries(invariants).filter(([,ok]) => ok !== true).map(([k]) => k);
  const ready = failures.length === 0;

  return json({
    schema: "speedkit.public_control_evidence_manifest_response.v1",
    status: ready ? "PUBLIC_CONTROL_EVIDENCE_MANIFEST_READY" : "PUBLIC_CONTROL_EVIDENCE_MANIFEST_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    ready,
    manifest: {
      id: "speedkit-evidence-manifest-" + String(manifestMaterial.archive_hash || manifestHash).slice(0,16),
      hash_algorithm: "SHA-256",
      manifest_hash: manifestHash,
      manifest_hash_excludes_issued_at: true,
      material_schema: manifestMaterial.schema,
      archive_verification_hash: manifestMaterial.archive_verification_hash,
      archive_hash: manifestMaterial.archive_hash,
      seal_verification_hash: manifestMaterial.seal_verification_hash,
      seal_hash: manifestMaterial.seal_hash,
      certificate_verification_hash: manifestMaterial.certificate_verification_hash,
      certificate_hash: manifestMaterial.certificate_hash,
      chain_hash: manifestMaterial.chain_hash,
      chain_verification_hash: manifestMaterial.chain_verification_hash,
      public_control_digest: manifestMaterial.public_control_digest,
      route_count: routeCount,
      workspace_entries: manifestMaterial.workspace_entries,
      private_remaining: manifestMaterial.private_remaining,
      recognized_execution_systems: manifestMaterial.recognized_execution_systems
    },
    failures_count: failures.length,
    failures,
    invariants,
    manifest_material: manifestMaterial,
    source_status: {
      archive_verify: archiveVerify.status,
      archive: archivePayload.status,
      product_os: os.status,
      route_map: route.status,
      policy: policy.status
    }
  }, ready ? 200 : 503);
}
export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ schema: "speedkit.public_control_evidence_manifest_response.v1", status: "METHOD_NOT_ALLOWED" }, 405);
}
