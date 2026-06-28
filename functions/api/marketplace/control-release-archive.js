import * as ControlReleaseSealVerifyApi from "./control-release-seal-verify.js";

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
  if (value === undefined) return "null";
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
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = {
      schema: "speedkit.fetch_error.v1",
      status: "JSON_PARSE_FAILED",
      body_prefix: text.slice(0, 260)
    };
  }
  return { http_status: response.status, payload };
}

async function responseJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      schema: "speedkit.local_replay_error.v1",
      status: "JSON_PARSE_FAILED",
      body_prefix: text.slice(0, 260)
    };
  }
}

function liveStateValue(os, key) {
  return os && os.live_state ? os.live_state[key] : undefined;
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function onRequestGet(context) {
  try {
    const origin = new URL(context.request.url).origin;
    const stamp = Date.now();

    const localSealVerifyResponse = await ControlReleaseSealVerifyApi.onRequest({
      request: new Request(origin + "/api/marketplace/control-release-seal-verify?local_replay=" + stamp, {
        method: "GET",
        headers: context.request.headers
      }),
      env: context.env,
      params: context.params,
      waitUntil: context.waitUntil,
      next: context.next,
      data: context.data
    });

    const [releaseSealVerify, osR, routeR, policyR] = await Promise.all([
      responseJson(localSealVerifyResponse),
      fetchJson(origin + "/marketplace/product-os.json?t=" + stamp),
      fetchJson(origin + "/marketplace/route-map.json?t=" + stamp),
      fetchJson(origin + "/marketplace/control-release-archive-policy.json?t=" + stamp)
    ]);

    const os = osR.payload || {};
    const route = routeR.payload || {};
    const policy = policyR.payload || {};
    const v = releaseSealVerify.verification || {};
    const routeCount = num(route.route_count ?? v.route_count, 0);

    const invariants = {
      release_seal_verify_local_replay_json: releaseSealVerify.schema === "speedkit.public_control_release_seal_verify_response.v1",
      release_seal_verified: releaseSealVerify.status === "PUBLIC_CONTROL_RELEASE_SEAL_VERIFIED" && releaseSealVerify.verified === true,
      release_seal_verify_failures_zero: num(v.failures_count, -1) === 0,
      release_seal_hash_ok: v.release_seal_hash_ok === true,
      release_seal_replay_zero: !!releaseSealVerify.release_seal_replay && num(releaseSealVerify.release_seal_replay.failures_count, -1) === 0,
      release_record_verification_replay_zero: !!releaseSealVerify.release_record_verification_replay && num(releaseSealVerify.release_record_verification_replay.failures_count, -1) === 0,
      release_record_replay_zero: !!releaseSealVerify.release_record_replay && num(releaseSealVerify.release_record_replay.failures_count, -1) === 0,
      final_attestation_verification_replay_zero: !!releaseSealVerify.final_attestation_verification_replay && num(releaseSealVerify.final_attestation_verification_replay.failures_count, -1) === 0,
      final_attestation_replay_zero: !!releaseSealVerify.final_attestation_replay && num(releaseSealVerify.final_attestation_replay.failures_count, -1) === 0,
      evidence_manifest_verified: !!releaseSealVerify.evidence_manifest_verification && num(releaseSealVerify.evidence_manifest_verification.failures_count, -1) === 0,
      evidence_manifest_hash_ok: !!releaseSealVerify.evidence_manifest_verification && releaseSealVerify.evidence_manifest_verification.manifest_hash_ok === true,
      archive_verified: !!releaseSealVerify.source_status && releaseSealVerify.source_status.archive_verify === "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
      archive_issued: !!releaseSealVerify.source_status && releaseSealVerify.source_status.archive === "PUBLIC_CONTROL_CHAIN_ARCHIVED",
      product_os_live: os.status === "LIVE",
      route_map_live: route.status === "LIVE",
      private_remaining_zero: v.private_remaining === 0 && num(liveStateValue(os, "private_remaining"), -1) === 0,
      workspace_entries_135: v.workspace_entries === 135 && num(liveStateValue(os, "workspace_entries"), 0) === 135,
      recognized_execution_systems_4: v.recognized_execution_systems === 4 && num(liveStateValue(os, "recognized_execution_systems"), 0) === 4,
      route_count_floor: routeCount >= 111,
      release_seal_verifier_live: liveStateValue(os, "public_control_release_seal_verifier") === "LIVE",
      marketplace_os_release_seal_verified_live: liveStateValue(os, "marketplace_os_release_seal_verified") === "LIVE",
      release_archive_live: liveStateValue(os, "public_control_release_archive") === "LIVE",
      marketplace_os_release_archive_live: liveStateValue(os, "marketplace_os_release_archive") === "LIVE",
      release_archive_policy_live: policy.status === "LIVE"
    };

    const failures = Object.entries(invariants)
      .filter(([, ok]) => ok !== true)
      .map(([key]) => key);

    const archived = failures.length === 0;

    const releaseArchiveMaterial = {
      schema: "speedkit.public_control_release_archive_material.v1",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      release_seal_verification_hash: releaseSealVerify.verification_hash || null,
      release_seal_hash: v.release_seal_hash || null,
      release_record_verification_hash: v.release_record_verification_hash || null,
      release_record_hash: v.release_record_hash || null,
      final_attestation_verification_hash: v.final_attestation_verification_hash || null,
      attestation_hash: v.attestation_hash || null,
      evidence_manifest_verification_hash: v.evidence_manifest_verification_hash || null,
      manifest_hash: v.manifest_hash || null,
      chain_archive_verification_hash: v.archive_verification_hash || null,
      chain_archive_hash: v.archive_hash || null,
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
      source_status: {
        release_seal_verify: releaseSealVerify.status || null,
        release_seal: releaseSealVerify.source_status ? releaseSealVerify.source_status.release_seal : null,
        release_record_verify: releaseSealVerify.source_status ? releaseSealVerify.source_status.release_record_verify : null,
        release_record: releaseSealVerify.source_status ? releaseSealVerify.source_status.release_record : null,
        final_attestation_verify: releaseSealVerify.source_status ? releaseSealVerify.source_status.final_attestation_verify : null,
        final_attestation: releaseSealVerify.source_status ? releaseSealVerify.source_status.final_attestation : null,
        evidence_manifest_verify: releaseSealVerify.source_status ? releaseSealVerify.source_status.evidence_manifest_verify : null,
        manifest: releaseSealVerify.source_status ? releaseSealVerify.source_status.manifest : null,
        archive_verify: releaseSealVerify.source_status ? releaseSealVerify.source_status.archive_verify : null,
        archive: releaseSealVerify.source_status ? releaseSealVerify.source_status.archive : null,
        product_os: os.status || null,
        route_map: route.status || null,
        policy: policy.status || null
      },
      invariants
    };

    const releaseArchiveHash = await sha256Hex(stableStringify(releaseArchiveMaterial));

    return json({
      schema: "speedkit.public_control_release_archive_response.v1",
      status: archived ? "PUBLIC_CONTROL_RELEASE_ARCHIVED" : "PUBLIC_CONTROL_RELEASE_ARCHIVE_DEGRADED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      archived,
      release_archive: {
        id: "speedkit-release-archive-" + String(releaseSealVerify.verification_hash || releaseArchiveHash).slice(0, 16),
        hash_algorithm: "SHA-256",
        release_archive_hash: releaseArchiveHash,
        release_archive_hash_excludes_archived_at: true,
        material_schema: releaseArchiveMaterial.schema,
        release_seal_verification_hash: releaseSealVerify.verification_hash || null,
        release_seal_hash: v.release_seal_hash || null,
        release_record_verification_hash: v.release_record_verification_hash || null,
        release_record_hash: v.release_record_hash || null,
        final_attestation_verification_hash: v.final_attestation_verification_hash || null,
        attestation_hash: v.attestation_hash || null,
        evidence_manifest_verification_hash: v.evidence_manifest_verification_hash || null,
        manifest_hash: v.manifest_hash || null,
        chain_archive_hash: v.archive_hash || null,
        chain_archive_verification_hash: v.archive_verification_hash || null,
        public_control_digest: v.public_control_digest || null,
        route_count: routeCount,
        workspace_entries: v.workspace_entries,
        private_remaining: v.private_remaining,
        recognized_execution_systems: v.recognized_execution_systems
      },
      failures_count: failures.length,
      failures,
      invariants,
      release_archive_material: releaseArchiveMaterial,
      release_seal_verification: {
        verification_hash: releaseSealVerify.verification_hash || null,
        release_seal_hash: v.release_seal_hash || null,
        release_seal_hash_ok: v.release_seal_hash_ok === true,
        failures_count: num(v.failures_count, -1),
        failures: Array.isArray(v.failures) ? v.failures : []
      },
      evidence_manifest_verification: releaseSealVerify.evidence_manifest_verification || null,
      release_seal_replay: releaseSealVerify.release_seal_replay || null,
      source_status: releaseArchiveMaterial.source_status
    }, archived ? 200 : 503);
  } catch (error) {
    return json({
      schema: "speedkit.public_control_release_archive_response.v1",
      status: "PUBLIC_CONTROL_RELEASE_ARCHIVE_ERROR",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      archived: false,
      failures_count: 1,
      failures: ["release_archive_exception"],
      error: {
        name: error && error.name ? error.name : "Error",
        message: error && error.message ? error.message : String(error)
      }
    }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_release_archive_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
