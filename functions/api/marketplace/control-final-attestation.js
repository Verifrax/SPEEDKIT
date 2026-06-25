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
  for (let i = 0; i < 10; i++) {
    const r = await fetchJson(origin + path + "?t=" + Date.now() + "-" + i);
    last = r.payload || {};
    if (r.http_status === 200 && predicate(last)) return last;
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  return last;
}

function liveStateValue(os, key) {
  return os && os.live_state ? os.live_state[key] : undefined;
}

export async function onRequestGet(context) {
  const origin = new URL(context.request.url).origin;

  const manifestPayload = await fetchReady(
    origin,
    "/api/marketplace/control-evidence-manifest",
    p =>
      p.schema === "speedkit.public_control_evidence_manifest_response.v1" &&
      p.status === "PUBLIC_CONTROL_EVIDENCE_MANIFEST_READY" &&
      p.ready === true &&
      p.failures_count === 0 &&
      p.manifest &&
      p.manifest_material
  );

  const [osR, routeR, policyR] = await Promise.all([
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-final-attestation-policy.json?t=" + Date.now())
  ]);

  const os = osR.payload || {};
  const route = routeR.payload || {};
  const policy = policyR.payload || {};
  const manifest = manifestPayload.manifest || {};
  const material = manifestPayload.manifest_material || {};
  const routeCount = Number(route.route_count ?? manifest.route_count ?? material.route_count ?? 0);

  const recomputedManifestHash = await sha256Hex(stableStringify(material));

  const evidenceManifestVerifyInvariants = {
    manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
    manifest_ready: manifestPayload.status === "PUBLIC_CONTROL_EVIDENCE_MANIFEST_READY" && manifestPayload.ready === true,
    manifest_failures_zero: manifestPayload.failures_count === 0,
    archive_verified: manifestPayload.source_status && manifestPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: manifestPayload.source_status && manifestPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: manifest.private_remaining === 0 && Number(liveStateValue(os, "private_remaining") ?? -1) === 0,
    workspace_entries_135: manifest.workspace_entries === 135 && Number(liveStateValue(os, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: manifest.recognized_execution_systems === 4 && Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 90,
    marketplace_os_evidence_manifest_live: liveStateValue(os, "marketplace_os_evidence_manifest") === "LIVE",
    evidence_manifest_verifier_live: liveStateValue(os, "public_control_evidence_manifest_verifier") === "LIVE"
  };

  const evidenceManifestVerifyFailures = Object.entries(evidenceManifestVerifyInvariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const evidenceManifestVerificationMaterial = {
    schema: "speedkit.public_control_evidence_manifest_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    manifest_hash: manifest.manifest_hash || null,
    recomputed_manifest_hash: recomputedManifestHash,
    archive_verification_hash: manifest.archive_verification_hash || null,
    archive_hash: manifest.archive_hash || null,
    seal_verification_hash: manifest.seal_verification_hash || null,
    seal_hash: manifest.seal_hash || null,
    certificate_verification_hash: manifest.certificate_verification_hash || null,
    certificate_hash: manifest.certificate_hash || null,
    chain_hash: manifest.chain_hash || null,
    chain_verification_hash: manifest.chain_verification_hash || null,
    public_control_digest: manifest.public_control_digest || null,
    route_count: routeCount,
    workspace_entries: manifest.workspace_entries,
    private_remaining: manifest.private_remaining,
    recognized_execution_systems: manifest.recognized_execution_systems,
    invariants: evidenceManifestVerifyInvariants
  };

  const evidenceManifestVerificationHash = await sha256Hex(stableStringify(evidenceManifestVerificationMaterial));

  const attestationMaterial = {
    schema: "speedkit.public_control_final_attestation_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    evidence_manifest_verification_hash: evidenceManifestVerificationHash,
    manifest_hash: manifest.manifest_hash || null,
    archive_verification_hash: manifest.archive_verification_hash || null,
    archive_hash: manifest.archive_hash || null,
    seal_verification_hash: manifest.seal_verification_hash || null,
    seal_hash: manifest.seal_hash || null,
    certificate_verification_hash: manifest.certificate_verification_hash || null,
    certificate_hash: manifest.certificate_hash || null,
    chain_hash: manifest.chain_hash || null,
    chain_verification_hash: manifest.chain_verification_hash || null,
    public_control_digest: manifest.public_control_digest || null,
    route_count: routeCount,
    workspace_entries: manifest.workspace_entries,
    private_remaining: manifest.private_remaining,
    recognized_execution_systems: manifest.recognized_execution_systems,
    source_status: {
      evidence_manifest_verify: evidenceManifestVerifyFailures.length === 0
        ? "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED"
        : "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFY_FAILED",
      manifest: manifestPayload.status,
      archive_verify: manifestPayload.source_status ? manifestPayload.source_status.archive_verify : null,
      archive: manifestPayload.source_status ? manifestPayload.source_status.archive : null,
      product_os: os.status,
      route_map: route.status,
      policy: policy.status
    }
  };

  const attestationHash = await sha256Hex(stableStringify(attestationMaterial));

  const invariants = {
    evidence_manifest_verified: evidenceManifestVerifyFailures.length === 0,
    evidence_manifest_verify_failures_zero: evidenceManifestVerifyFailures.length === 0,
    manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
    archive_verified: manifestPayload.source_status && manifestPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: manifestPayload.source_status && manifestPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: manifest.private_remaining === 0 && Number(liveStateValue(os, "private_remaining") ?? -1) === 0,
    workspace_entries_135: manifest.workspace_entries === 135 && Number(liveStateValue(os, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: manifest.recognized_execution_systems === 4 && Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 93,
    marketplace_os_evidence_manifest_verified_live: liveStateValue(os, "marketplace_os_evidence_manifest_verified") === "LIVE",
    final_attestation_live: liveStateValue(os, "public_control_final_attestation") === "LIVE",
    final_attestation_policy_live: policy.status === "LIVE"
  };

  const failures = Object.entries(invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const attested = failures.length === 0;

  return json({
    schema: "speedkit.public_control_final_attestation_response.v1",
    status: attested ? "PUBLIC_CONTROL_FINAL_ATTESTED" : "PUBLIC_CONTROL_FINAL_ATTESTATION_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    attested,
    attestation: {
      id: "speedkit-final-attestation-" + String(attestationMaterial.manifest_hash || attestationHash).slice(0, 16),
      hash_algorithm: "SHA-256",
      attestation_hash: attestationHash,
      attestation_hash_excludes_issued_at: true,
      material_schema: attestationMaterial.schema,
      evidence_manifest_verification_hash: evidenceManifestVerificationHash,
      manifest_hash: manifest.manifest_hash || null,
      archive_verification_hash: manifest.archive_verification_hash || null,
      archive_hash: manifest.archive_hash || null,
      seal_verification_hash: manifest.seal_verification_hash || null,
      seal_hash: manifest.seal_hash || null,
      certificate_verification_hash: manifest.certificate_verification_hash || null,
      certificate_hash: manifest.certificate_hash || null,
      chain_hash: manifest.chain_hash || null,
      chain_verification_hash: manifest.chain_verification_hash || null,
      public_control_digest: manifest.public_control_digest || null,
      route_count: routeCount,
      workspace_entries: manifest.workspace_entries,
      private_remaining: manifest.private_remaining,
      recognized_execution_systems: manifest.recognized_execution_systems
    },
    failures_count: failures.length,
    failures,
    invariants,
    evidence_manifest_verification: {
      verification_hash: evidenceManifestVerificationHash,
      manifest_hash: manifest.manifest_hash || null,
      recomputed_manifest_hash: recomputedManifestHash,
      manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
      failures_count: evidenceManifestVerifyFailures.length,
      failures: evidenceManifestVerifyFailures,
      invariants: evidenceManifestVerifyInvariants
    },
    attestation_material: attestationMaterial,
    source_status: attestationMaterial.source_status
  }, attested ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_final_attestation_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
