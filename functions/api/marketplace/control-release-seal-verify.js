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

  const [osR, routeR, verifierPolicyR, sealPolicyR, recordVerifyPolicyR] = await Promise.all([
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-release-seal-verify-policy.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-release-seal-policy.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-release-record-verify-policy.json?t=" + Date.now())
  ]);

  const os = osR.payload || {};
  const route = routeR.payload || {};
  const verifierPolicy = verifierPolicyR.payload || {};
  const sealPolicy = sealPolicyR.payload || {};
  const recordVerifyPolicy = recordVerifyPolicyR.payload || {};
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

  const evidenceManifestVerifyFailures = Object.entries(evidenceManifestVerifyInvariants).filter(([, ok]) => ok !== true).map(([key]) => key);

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
      evidence_manifest_verify: evidenceManifestVerifyFailures.length === 0 ? "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED" : "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFY_FAILED",
      manifest: manifestPayload.status,
      archive_verify: manifestPayload.source_status ? manifestPayload.source_status.archive_verify : null,
      archive: manifestPayload.source_status ? manifestPayload.source_status.archive : null,
      product_os: os.status,
      route_map: route.status,
      policy: "LIVE"
    }
  };

  const attestationHash = await sha256Hex(stableStringify(attestationMaterial));

  const finalAttestationInvariants = {
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
    final_attestation_live: liveStateValue(os, "public_control_final_attestation") === "LIVE"
  };

  const finalAttestationFailures = Object.entries(finalAttestationInvariants).filter(([, ok]) => ok !== true).map(([key]) => key);

  const finalAttestationVerifyInvariants = {
    attestation_hash_ok: /^[a-f0-9]{64}$/.test(attestationHash),
    final_attested_by_local_replay: finalAttestationFailures.length === 0,
    final_attestation_failures_zero: finalAttestationFailures.length === 0,
    evidence_manifest_verified: evidenceManifestVerifyFailures.length === 0,
    evidence_manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
    evidence_manifest_failures_zero: evidenceManifestVerifyFailures.length === 0,
    archive_verified: manifestPayload.source_status && manifestPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: manifestPayload.source_status && manifestPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: manifest.private_remaining === 0 && Number(liveStateValue(os, "private_remaining") ?? -1) === 0,
    workspace_entries_135: manifest.workspace_entries === 135 && Number(liveStateValue(os, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: manifest.recognized_execution_systems === 4 && Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 96,
    final_attestation_live: liveStateValue(os, "public_control_final_attestation") === "LIVE",
    marketplace_os_final_attestation_live: liveStateValue(os, "marketplace_os_final_attestation") === "LIVE",
    final_attestation_verifier_live: liveStateValue(os, "public_control_final_attestation_verifier") === "LIVE"
  };

  const finalAttestationVerifyFailures = Object.entries(finalAttestationVerifyInvariants).filter(([, ok]) => ok !== true).map(([key]) => key);

  const finalAttestationVerificationMaterial = {
    schema: "speedkit.public_control_final_attestation_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    attestation_hash: attestationHash,
    recomputed_attestation_hash: attestationHash,
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
    invariants: finalAttestationVerifyInvariants
  };

  const finalAttestationVerificationHash = await sha256Hex(stableStringify(finalAttestationVerificationMaterial));

  const releaseRecordMaterial = {
    schema: "speedkit.public_control_release_record_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    final_attestation_verification_hash: finalAttestationVerificationHash,
    attestation_hash: attestationHash,
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
      final_attestation_verify: finalAttestationVerifyFailures.length === 0 ? "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFIED" : "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFY_FAILED",
      final_attestation: finalAttestationFailures.length === 0 ? "PUBLIC_CONTROL_FINAL_ATTESTED_BY_LOCAL_REPLAY" : "PUBLIC_CONTROL_FINAL_ATTESTATION_REPLAY_FAILED",
      evidence_manifest_verify: evidenceManifestVerifyFailures.length === 0 ? "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED" : "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFY_FAILED",
      manifest: manifestPayload.status,
      archive_verify: manifestPayload.source_status ? manifestPayload.source_status.archive_verify : null,
      archive: manifestPayload.source_status ? manifestPayload.source_status.archive : null,
      product_os: os.status,
      route_map: route.status,
      policy: "LIVE"
    }
  };

  const releaseRecordHash = await sha256Hex(stableStringify(releaseRecordMaterial));

  const releaseRecordInvariants = {
    final_attestation_verified: finalAttestationVerifyFailures.length === 0,
    final_attestation_verify_failures_zero: finalAttestationVerifyFailures.length === 0,
    final_attested_by_local_replay: finalAttestationFailures.length === 0,
    evidence_manifest_verified: evidenceManifestVerifyFailures.length === 0,
    manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
    archive_verified: manifestPayload.source_status && manifestPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: manifestPayload.source_status && manifestPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: manifest.private_remaining === 0 && Number(liveStateValue(os, "private_remaining") ?? -1) === 0,
    workspace_entries_135: manifest.workspace_entries === 135 && Number(liveStateValue(os, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: manifest.recognized_execution_systems === 4 && Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 99,
    final_attestation_verifier_live: liveStateValue(os, "public_control_final_attestation_verifier") === "LIVE",
    marketplace_os_final_attestation_verified_live: liveStateValue(os, "marketplace_os_final_attestation_verified") === "LIVE",
    release_record_live: liveStateValue(os, "public_control_release_record") === "LIVE"
  };

  const releaseRecordFailures = Object.entries(releaseRecordInvariants).filter(([, ok]) => ok !== true).map(([key]) => key);

  const releaseRecordVerifyInvariants = {
    release_record_hash_ok: /^[a-f0-9]{64}$/.test(releaseRecordHash),
    release_recorded_by_local_replay: releaseRecordFailures.length === 0,
    release_record_failures_zero: releaseRecordFailures.length === 0,
    final_attestation_verified: finalAttestationVerifyFailures.length === 0,
    final_attestation_verify_failures_zero: finalAttestationVerifyFailures.length === 0,
    evidence_manifest_verified: evidenceManifestVerifyFailures.length === 0,
    evidence_manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
    archive_verified: manifestPayload.source_status && manifestPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: manifestPayload.source_status && manifestPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: manifest.private_remaining === 0 && Number(liveStateValue(os, "private_remaining") ?? -1) === 0,
    workspace_entries_135: manifest.workspace_entries === 135 && Number(liveStateValue(os, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: manifest.recognized_execution_systems === 4 && Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 102,
    release_record_live: liveStateValue(os, "public_control_release_record") === "LIVE",
    marketplace_os_release_record_live: liveStateValue(os, "marketplace_os_release_record") === "LIVE",
    release_record_verifier_live: liveStateValue(os, "public_control_release_record_verifier") === "LIVE",
    release_record_verify_policy_live: recordVerifyPolicy.status === "LIVE"
  };

  const releaseRecordVerifyFailures = Object.entries(releaseRecordVerifyInvariants).filter(([, ok]) => ok !== true).map(([key]) => key);

  const releaseRecordVerificationMaterial = {
    schema: "speedkit.public_control_release_record_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    release_record_hash: releaseRecordHash,
    recomputed_release_record_hash: releaseRecordHash,
    final_attestation_verification_hash: finalAttestationVerificationHash,
    attestation_hash: attestationHash,
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
    invariants: releaseRecordVerifyInvariants
  };

  const releaseRecordVerificationHash = await sha256Hex(stableStringify(releaseRecordVerificationMaterial));

  const releaseSealMaterial = {
    schema: "speedkit.public_control_release_seal_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    release_record_verification_hash: releaseRecordVerificationHash,
    release_record_hash: releaseRecordHash,
    final_attestation_verification_hash: finalAttestationVerificationHash,
    attestation_hash: attestationHash,
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
      release_record_verify: releaseRecordVerifyFailures.length === 0 ? "PUBLIC_CONTROL_RELEASE_RECORD_VERIFIED" : "PUBLIC_CONTROL_RELEASE_RECORD_VERIFY_FAILED",
      release_record: releaseRecordFailures.length === 0 ? "PUBLIC_CONTROL_RELEASE_RECORDED_BY_LOCAL_REPLAY" : "PUBLIC_CONTROL_RELEASE_RECORD_REPLAY_FAILED",
      final_attestation_verify: finalAttestationVerifyFailures.length === 0 ? "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFIED" : "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFY_FAILED",
      final_attestation: finalAttestationFailures.length === 0 ? "PUBLIC_CONTROL_FINAL_ATTESTED_BY_LOCAL_REPLAY" : "PUBLIC_CONTROL_FINAL_ATTESTATION_REPLAY_FAILED",
      evidence_manifest_verify: evidenceManifestVerifyFailures.length === 0 ? "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED" : "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFY_FAILED",
      manifest: manifestPayload.status,
      archive_verify: manifestPayload.source_status ? manifestPayload.source_status.archive_verify : null,
      archive: manifestPayload.source_status ? manifestPayload.source_status.archive : null,
      product_os: os.status,
      route_map: route.status,
      policy: sealPolicy.status
    }
  };

  const releaseSealHash = await sha256Hex(stableStringify(releaseSealMaterial));

  const releaseSealInvariants = {
    release_record_verified: releaseRecordVerifyFailures.length === 0,
    release_record_verify_failures_zero: releaseRecordVerifyFailures.length === 0,
    release_recorded_by_local_replay: releaseRecordFailures.length === 0,
    final_attestation_verified: finalAttestationVerifyFailures.length === 0,
    evidence_manifest_verified: evidenceManifestVerifyFailures.length === 0,
    manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
    archive_verified: manifestPayload.source_status && manifestPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: manifestPayload.source_status && manifestPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: manifest.private_remaining === 0 && Number(liveStateValue(os, "private_remaining") ?? -1) === 0,
    workspace_entries_135: manifest.workspace_entries === 135 && Number(liveStateValue(os, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: manifest.recognized_execution_systems === 4 && Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 105,
    release_record_verifier_live: liveStateValue(os, "public_control_release_record_verifier") === "LIVE",
    marketplace_os_release_record_verified_live: liveStateValue(os, "marketplace_os_release_record_verified") === "LIVE",
    release_seal_live: liveStateValue(os, "public_control_release_seal") === "LIVE",
    release_seal_policy_live: sealPolicy.status === "LIVE"
  };

  const releaseSealFailures = Object.entries(releaseSealInvariants).filter(([, ok]) => ok !== true).map(([key]) => key);

  const verifierInvariants = {
    release_seal_hash_ok: /^[a-f0-9]{64}$/.test(releaseSealHash),
    release_sealed_by_local_replay: releaseSealFailures.length === 0,
    release_seal_failures_zero: releaseSealFailures.length === 0,
    release_record_verified: releaseRecordVerifyFailures.length === 0,
    release_record_verify_failures_zero: releaseRecordVerifyFailures.length === 0,
    final_attestation_verified: finalAttestationVerifyFailures.length === 0,
    evidence_manifest_verified: evidenceManifestVerifyFailures.length === 0,
    evidence_manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
    archive_verified: manifestPayload.source_status && manifestPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: manifestPayload.source_status && manifestPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: manifest.private_remaining === 0 && Number(liveStateValue(os, "private_remaining") ?? -1) === 0,
    workspace_entries_135: manifest.workspace_entries === 135 && Number(liveStateValue(os, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: manifest.recognized_execution_systems === 4 && Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 108,
    release_seal_live: liveStateValue(os, "public_control_release_seal") === "LIVE",
    marketplace_os_release_seal_live: liveStateValue(os, "marketplace_os_release_seal") === "LIVE",
    release_seal_verifier_live: liveStateValue(os, "public_control_release_seal_verifier") === "LIVE",
    release_seal_verify_policy_live: verifierPolicy.status === "LIVE"
  };

  const failures = Object.entries(verifierInvariants).filter(([, ok]) => ok !== true).map(([key]) => key);
  const verified = failures.length === 0;

  const verificationMaterial = {
    schema: "speedkit.public_control_release_seal_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    release_seal_hash: releaseSealHash,
    recomputed_release_seal_hash: releaseSealHash,
    release_record_verification_hash: releaseRecordVerificationHash,
    release_record_hash: releaseRecordHash,
    final_attestation_verification_hash: finalAttestationVerificationHash,
    attestation_hash: attestationHash,
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
    invariants: verifierInvariants
  };

  const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

  return json({
    schema: "speedkit.public_control_release_seal_verify_response.v1",
    status: verified ? "PUBLIC_CONTROL_RELEASE_SEAL_VERIFIED" : "PUBLIC_CONTROL_RELEASE_SEAL_VERIFY_FAILED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    verified,
    verification_hash: verificationHash,
    verification: {
      release_seal_hash: releaseSealHash,
      recomputed_release_seal_hash: releaseSealHash,
      release_seal_hash_ok: /^[a-f0-9]{64}$/.test(releaseSealHash),
      release_record_verification_hash: releaseRecordVerificationHash,
      release_record_hash: releaseRecordHash,
      final_attestation_verification_hash: finalAttestationVerificationHash,
      attestation_hash: attestationHash,
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
      failures_count: failures.length,
      failures
    },
    evidence_manifest_verification: {
      verification_hash: evidenceManifestVerificationHash,
      manifest_hash: manifest.manifest_hash || null,
      recomputed_manifest_hash: recomputedManifestHash,
      manifest_hash_ok: recomputedManifestHash === manifest.manifest_hash,
      failures_count: evidenceManifestVerifyFailures.length,
      failures: evidenceManifestVerifyFailures
    },
    final_attestation_replay: {
      attestation_hash: attestationHash,
      failures_count: finalAttestationFailures.length,
      failures: finalAttestationFailures
    },
    final_attestation_verification_replay: {
      verification_hash: finalAttestationVerificationHash,
      attestation_hash: attestationHash,
      failures_count: finalAttestationVerifyFailures.length,
      failures: finalAttestationVerifyFailures
    },
    release_record_replay: {
      release_record_hash: releaseRecordHash,
      failures_count: releaseRecordFailures.length,
      failures: releaseRecordFailures
    },
    release_record_verification_replay: {
      verification_hash: releaseRecordVerificationHash,
      release_record_hash: releaseRecordHash,
      failures_count: releaseRecordVerifyFailures.length,
      failures: releaseRecordVerifyFailures
    },
    release_seal_replay: {
      release_seal_hash: releaseSealHash,
      failures_count: releaseSealFailures.length,
      failures: releaseSealFailures
    },
    invariants: verifierInvariants,
    source_status: {
      release_seal: releaseSealFailures.length === 0 ? "PUBLIC_CONTROL_RELEASE_SEALED_BY_LOCAL_REPLAY" : "PUBLIC_CONTROL_RELEASE_SEAL_REPLAY_FAILED",
      release_record_verify: releaseRecordVerifyFailures.length === 0 ? "PUBLIC_CONTROL_RELEASE_RECORD_VERIFIED" : "PUBLIC_CONTROL_RELEASE_RECORD_VERIFY_FAILED",
      release_record: releaseRecordFailures.length === 0 ? "PUBLIC_CONTROL_RELEASE_RECORDED_BY_LOCAL_REPLAY" : "PUBLIC_CONTROL_RELEASE_RECORD_REPLAY_FAILED",
      final_attestation_verify: finalAttestationVerifyFailures.length === 0 ? "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFIED" : "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFY_FAILED",
      final_attestation: finalAttestationFailures.length === 0 ? "PUBLIC_CONTROL_FINAL_ATTESTED_BY_LOCAL_REPLAY" : "PUBLIC_CONTROL_FINAL_ATTESTATION_REPLAY_FAILED",
      evidence_manifest_verify: evidenceManifestVerifyFailures.length === 0 ? "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED" : "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFY_FAILED",
      manifest: manifestPayload.status,
      archive_verify: manifestPayload.source_status ? manifestPayload.source_status.archive_verify : null,
      archive: manifestPayload.source_status ? manifestPayload.source_status.archive : null,
      product_os: os.status,
      route_map: route.status,
      verifier_policy: verifierPolicy.status
    }
  }, verified ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_release_seal_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
