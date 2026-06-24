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
  const response = await fetch(url, { headers: { "cache-control": "no-store" } });
  const payload = await response.json().catch(() => ({
    schema: "speedkit.fetch_response.v1",
    status: "JSON_PARSE_FAILED"
  }));
  return { ok: response.ok, http_status: response.status, payload };
}

async function fetchArchiveReady(origin) {
  let last = null;

  for (let i = 0; i < 10; i++) {
    const result = await fetchJson(origin + "/api/marketplace/control-chain-archive?t=" + Date.now() + "-" + i);
    last = result.payload || {};

    if (
      result.http_status === 200 &&
      last.schema === "speedkit.public_control_chain_archive_response.v1" &&
      last.status === "PUBLIC_CONTROL_CHAIN_ARCHIVED" &&
      last.archived === true &&
      last.failures_count === 0 &&
      last.archive &&
      last.archive.private_remaining === 0
    ) {
      return last;
    }

    await new Promise(resolve => setTimeout(resolve, 150));
  }

  return last || {};
}

function liveStateValue(os, key) {
  return os && os.live_state ? os.live_state[key] : undefined;
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const origin = url.origin;

  const archivePayload = await fetchArchiveReady(origin);

  const [osResult, routeResult, policyResult] = await Promise.all([
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-chain-archive-verify-policy.json?t=" + Date.now())
  ]);

  const osPayload = osResult.payload || {};
  const routePayload = routeResult.payload || {};
  const policyPayload = policyResult.payload || {};

  const archive = archivePayload.archive || {};
  const archiveMaterial = archivePayload.archive_material || {};
  const sourceStatus = archivePayload.source_status || {};
  const routeCount = Number(routePayload.route_count ?? archive.route_count ?? 0);

  const recomputedArchiveHash = await sha256Hex(stableStringify(archiveMaterial));

  const invariants = {
    archive_hash_ok: recomputedArchiveHash === archive.archive_hash,
    archive_issued: archivePayload.status === "PUBLIC_CONTROL_CHAIN_ARCHIVED" && archivePayload.archived === true,
    archive_failures_zero: archivePayload.failures_count === 0,
    archive_source_seal_verified: sourceStatus.seal_verify === "PUBLIC_CONTROL_CHAIN_SEAL_VERIFIED",
    archive_source_seal_issued: sourceStatus.seal === "PUBLIC_CONTROL_CHAIN_SEALED",
    archive_source_certificate_verified: sourceStatus.certificate_verify === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_VERIFIED",
    archive_source_certificate_issued: sourceStatus.certificate === "PUBLIC_CONTROL_CHAIN_CERTIFICATE_ISSUED",
    archive_source_chain_verified: sourceStatus.chain_verify === "PUBLIC_CONTROL_CHAIN_VERIFIED",
    archive_source_chain_index_ready: sourceStatus.chain_index === "PUBLIC_CONTROL_CHAIN_INDEX_READY",
    product_os_live: osPayload.status === "LIVE",
    route_map_live: routePayload.status === "LIVE",
    private_remaining_zero: archive.private_remaining === 0 && Number(liveStateValue(osPayload, "private_remaining") ?? -1) === 0,
    workspace_entries_135: archive.workspace_entries === 135 && Number(liveStateValue(osPayload, "workspace_entries") ?? 0) === 135,
    recognized_execution_systems_4: archive.recognized_execution_systems === 4 && Number(liveStateValue(osPayload, "recognized_execution_systems") ?? 0) === 4,
    route_count_floor: routeCount >= 84,
    marketplace_os_chain_archive_live: liveStateValue(osPayload, "marketplace_os_chain_archive") === "LIVE",
    archive_verifier_live: liveStateValue(osPayload, "public_control_chain_archive_verifier") === "LIVE",
    archive_verify_policy_live: policyPayload.status === "LIVE"
  };

  const failures = Object.entries(invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const verified = failures.length === 0;

  const verificationMaterial = {
    schema: "speedkit.public_control_chain_archive_verification_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    archive_hash: archive.archive_hash || null,
    recomputed_archive_hash: recomputedArchiveHash,
    seal_verification_hash: archive.seal_verification_hash || null,
    seal_hash: archive.seal_hash || null,
    certificate_verification_hash: archive.certificate_verification_hash || null,
    certificate_hash: archive.certificate_hash || null,
    chain_hash: archive.chain_hash || null,
    chain_verification_hash: archive.chain_verification_hash || null,
    public_control_digest: archive.public_control_digest || null,
    private_remaining: archive.private_remaining,
    workspace_entries: archive.workspace_entries,
    recognized_execution_systems: archive.recognized_execution_systems,
    route_count: routeCount,
    archive_source_status: sourceStatus,
    invariants
  };

  const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

  return json({
    schema: "speedkit.public_control_chain_archive_verify_response.v1",
    status: verified ? "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED" : "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFY_FAILED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    verified,
    verification_hash: verificationHash,
    verification: {
      archive_hash: archive.archive_hash || null,
      recomputed_archive_hash: recomputedArchiveHash,
      archive_hash_ok: recomputedArchiveHash === archive.archive_hash,
      seal_verification_hash: archive.seal_verification_hash || null,
      seal_hash: archive.seal_hash || null,
      certificate_verification_hash: archive.certificate_verification_hash || null,
      certificate_hash: archive.certificate_hash || null,
      chain_hash: archive.chain_hash || null,
      chain_verification_hash: archive.chain_verification_hash || null,
      public_control_digest: archive.public_control_digest || null,
      private_remaining: archive.private_remaining,
      workspace_entries: archive.workspace_entries,
      recognized_execution_systems: archive.recognized_execution_systems,
      route_count: routeCount,
      failures_count: failures.length,
      failures
    },
    invariants,
    source_status: {
      archive: archivePayload.status,
      seal_verify: sourceStatus.seal_verify,
      seal: sourceStatus.seal,
      certificate_verify: sourceStatus.certificate_verify,
      certificate: sourceStatus.certificate,
      chain_verify: sourceStatus.chain_verify,
      chain_index: sourceStatus.chain_index,
      product_os: osPayload.status,
      route_map: routePayload.status,
      verifier_policy: policyPayload.status
    },
    archive_source_status: sourceStatus,
    authorities: {
      archive: "/api/marketplace/control-chain-archive",
      archive_verify_policy: "/marketplace/control-chain-archive-verify-policy.json",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json"
    }
  }, verified ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_chain_archive_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
