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

  const finalPayload = await fetchReady(
    origin,
    "/api/marketplace/control-final-attestation",
    p =>
      p.schema === "speedkit.public_control_final_attestation_response.v1" &&
      p.status === "PUBLIC_CONTROL_FINAL_ATTESTED" &&
      p.attested === true &&
      p.failures_count === 0 &&
      p.attestation &&
      p.attestation_material
  );

  const [osR, routeR, policyR] = await Promise.all([
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-final-attestation-verify-policy.json?t=" + Date.now())
  ]);

  const os = osR.payload || {};
  const route = routeR.payload || {};
  const policy = policyR.payload || {};
  const attestation = finalPayload.attestation || {};
  const material = finalPayload.attestation_material || {};
  const evidence = finalPayload.evidence_manifest_verification || {};
  const routeCount = Number(route.route_count ?? attestation.route_count ?? material.route_count ?? 0);

  const recomputedAttestationHash = await sha256Hex(stableStringify(material));

  const invariants = {
    attestation_hash_ok: recomputedAttestationHash === attestation.attestation_hash,
    final_attested: finalPayload.status === "PUBLIC_CONTROL_FINAL_ATTESTED" && finalPayload.attested === true,
    final_attestation_failures_zero: finalPayload.failures_count === 0,
    evidence_manifest_verified: finalPayload.source_status && finalPayload.source_status.evidence_manifest_verify === "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED",
    evidence_manifest_hash_ok: evidence.manifest_hash_ok === true,
    evidence_manifest_failures_zero: evidence.failures_count === 0,
    archive_verified: finalPayload.source_status && finalPayload.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    archive_issued: finalPayload.source_status && finalPayload.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: attestation.private_remaining === 0 && Number(liveStateValue(os, "private_remaining") ?? -1) === 0,
    workspace_entries_135: attestation.workspace_entries === 135 && Number(liveStateValue(os, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: attestation.recognized_execution_systems === 4 && Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 96,
    final_attestation_live: liveStateValue(os, "public_control_final_attestation") === "LIVE",
    marketplace_os_final_attestation_live: liveStateValue(os, "marketplace_os_final_attestation") === "LIVE",
    final_attestation_verifier_live: liveStateValue(os, "public_control_final_attestation_verifier") === "LIVE",
    final_attestation_verify_policy_live: policy.status === "LIVE"
  };

  const failures = Object.entries(invariants).filter(([, ok]) => ok !== true).map(([key]) => key);
  const verified = failures.length === 0;

  const verificationMaterial = {
    schema: "speedkit.public_control_final_attestation_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    attestation_hash: attestation.attestation_hash || null,
    recomputed_attestation_hash: recomputedAttestationHash,
    evidence_manifest_verification_hash: attestation.evidence_manifest_verification_hash || null,
    manifest_hash: attestation.manifest_hash || null,
    archive_verification_hash: attestation.archive_verification_hash || null,
    archive_hash: attestation.archive_hash || null,
    seal_verification_hash: attestation.seal_verification_hash || null,
    seal_hash: attestation.seal_hash || null,
    certificate_verification_hash: attestation.certificate_verification_hash || null,
    certificate_hash: attestation.certificate_hash || null,
    chain_hash: attestation.chain_hash || null,
    chain_verification_hash: attestation.chain_verification_hash || null,
    public_control_digest: attestation.public_control_digest || null,
    route_count: routeCount,
    workspace_entries: attestation.workspace_entries,
    private_remaining: attestation.private_remaining,
    recognized_execution_systems: attestation.recognized_execution_systems,
    invariants
  };

  const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

  return json({
    schema: "speedkit.public_control_final_attestation_verify_response.v1",
    status: verified ? "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFIED" : "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFY_FAILED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    verified,
    verification_hash: verificationHash,
    verification: {
      attestation_hash: attestation.attestation_hash || null,
      recomputed_attestation_hash: recomputedAttestationHash,
      attestation_hash_ok: recomputedAttestationHash === attestation.attestation_hash,
      evidence_manifest_verification_hash: attestation.evidence_manifest_verification_hash || null,
      manifest_hash: attestation.manifest_hash || null,
      archive_verification_hash: attestation.archive_verification_hash || null,
      archive_hash: attestation.archive_hash || null,
      seal_verification_hash: attestation.seal_verification_hash || null,
      seal_hash: attestation.seal_hash || null,
      certificate_verification_hash: attestation.certificate_verification_hash || null,
      certificate_hash: attestation.certificate_hash || null,
      chain_hash: attestation.chain_hash || null,
      chain_verification_hash: attestation.chain_verification_hash || null,
      public_control_digest: attestation.public_control_digest || null,
      route_count: routeCount,
      workspace_entries: attestation.workspace_entries,
      private_remaining: attestation.private_remaining,
      recognized_execution_systems: attestation.recognized_execution_systems,
      failures_count: failures.length,
      failures
    },
    invariants,
    source_status: {
      final_attestation: finalPayload.status,
      evidence_manifest_verify: finalPayload.source_status ? finalPayload.source_status.evidence_manifest_verify : null,
      manifest: finalPayload.source_status ? finalPayload.source_status.manifest : null,
      archive_verify: finalPayload.source_status ? finalPayload.source_status.archive_verify : null,
      archive: finalPayload.source_status ? finalPayload.source_status.archive : null,
      product_os: os.status,
      route_map: route.status,
      verifier_policy: policy.status
    }
  }, verified ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_final_attestation_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
