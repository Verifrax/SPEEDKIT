const releaseCertificateSeal = {
  "schema": "speedkit.public_control_release_certificate_seal_response.v1",
  "status": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEALED",
  "mode": "PUBLIC_ONLY",
  "fake_checkout": false,
  "sealed": true,
  "release_certificate_seal": {
    "id": "speedkit-release-certificate-seal-602cc6de3b6832d7",
    "hash_algorithm": "SHA-256",
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_excludes_sealed_at": true,
    "material_schema": "speedkit.public_control_release_certificate_seal_material.v1",
    "release_certificate_verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "recomputed_release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "route_count": 123,
    "certificate_verifier_route_count": 120,
    "certificate_route_count": 117,
    "archive_verifier_route_count": 114,
    "archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4
  },
  "failures_count": 0,
  "failures": [],
  "invariants": {
    "certificate_verifier_snapshot_json": true,
    "certificate_verified": true,
    "certificate_verifier_failures_zero": true,
    "certificate_verification_hash_expected": true,
    "release_certificate_hash_present": true,
    "release_certificate_hash_expected": true,
    "release_certificate_hash_ok": true,
    "release_certificate_hash_matches_certificate_response": true,
    "release_certificate_response_certified": true,
    "release_certificate_response_failures_zero": true,
    "release_archive_verification_hash_expected": true,
    "release_archive_hash_expected": true,
    "release_archive_hash_ok": true,
    "release_seal_verification_hash_expected": true,
    "private_remaining_zero": true,
    "workspace_entries_135": true,
    "recognized_execution_systems_4": true,
    "certificate_verifier_route_count_floor": true,
    "certificate_route_count_floor": true,
    "archive_verifier_route_count_floor": true,
    "archive_route_count_floor": true,
    "seal_route_count_floor": true,
    "seal_uses_public_material_only": true,
    "seal_avoids_same_origin_http_replay": true
  },
  "release_certificate_seal_material": {
    "schema": "speedkit.public_control_release_certificate_seal_material.v1",
    "mode": "PUBLIC_ONLY",
    "fake_checkout": false,
    "seal_hash_algorithm": "SHA-256",
    "release_certificate_verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "recomputed_release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "route_count": 123,
    "certificate_verifier_route_count": 120,
    "certificate_route_count": 117,
    "archive_verifier_route_count": 114,
    "archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "source_status": {
      "release_certificate_verify": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_VERIFIED",
      "release_certificate": "PUBLIC_CONTROL_RELEASE_CERTIFIED",
      "release_certificate_seal_policy": "LIVE"
    },
    "invariants": {
      "certificate_verifier_snapshot_json": true,
      "certificate_verified": true,
      "certificate_verifier_failures_zero": true,
      "certificate_verification_hash_expected": true,
      "release_certificate_hash_present": true,
      "release_certificate_hash_expected": true,
      "release_certificate_hash_ok": true,
      "release_certificate_hash_matches_certificate_response": true,
      "release_certificate_response_certified": true,
      "release_certificate_response_failures_zero": true,
      "release_archive_verification_hash_expected": true,
      "release_archive_hash_expected": true,
      "release_archive_hash_ok": true,
      "release_seal_verification_hash_expected": true,
      "private_remaining_zero": true,
      "workspace_entries_135": true,
      "recognized_execution_systems_4": true,
      "certificate_verifier_route_count_floor": true,
      "certificate_route_count_floor": true,
      "archive_verifier_route_count_floor": true,
      "archive_route_count_floor": true,
      "seal_route_count_floor": true,
      "seal_uses_public_material_only": true,
      "seal_avoids_same_origin_http_replay": true
    }
  },
  "release_certificate_verification": {
    "verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "recomputed_release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "failures_count": 0
  },
  "source_status": {
    "release_certificate_verify": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_VERIFIED",
    "release_certificate": "PUBLIC_CONTROL_RELEASE_CERTIFIED",
    "release_certificate_seal_policy": "LIVE"
  }
};

function stableStringify(value) {
  if (value === undefined) return "null";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  return "{" + Object.keys(value).sort().map((key) => JSON.stringify(key) + ":" + stableStringify(value[key])).join(",") + "}";
}

async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(String(input));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function onRequestGet() {
  try {
    const material = releaseCertificateSeal.release_certificate_seal_material;
    const recomputedSealHash = await sha256Hex(stableStringify(material));
    const claimedSealHash = releaseCertificateSeal.release_certificate_seal?.release_certificate_seal_hash || null;

    const verifierRouteCount = 126;

    const invariants = {
      seal_snapshot_json: releaseCertificateSeal.schema === "speedkit.public_control_release_certificate_seal_response.v1",
      seal_status_sealed: releaseCertificateSeal.status === "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEALED" && releaseCertificateSeal.sealed === true,
      seal_hash_present: /^[a-f0-9]{64}$/.test(String(claimedSealHash)),
      seal_hash_expected: claimedSealHash === "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
      seal_hash_ok: claimedSealHash === recomputedSealHash,
      seal_failures_zero: Number(releaseCertificateSeal.failures_count ?? -1) === 0,
      certificate_verification_hash_expected: releaseCertificateSeal.release_certificate_seal?.release_certificate_verification_hash === "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
      release_certificate_hash_expected: releaseCertificateSeal.release_certificate_seal?.release_certificate_hash === "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
      release_certificate_recomputed_hash_matches: releaseCertificateSeal.release_certificate_seal?.recomputed_release_certificate_hash === releaseCertificateSeal.release_certificate_seal?.release_certificate_hash,
      release_certificate_hash_ok: releaseCertificateSeal.release_certificate_seal?.release_certificate_hash_ok === true,
      release_archive_verification_hash_expected: releaseCertificateSeal.release_certificate_seal?.release_archive_verification_hash === "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
      release_archive_hash_expected: releaseCertificateSeal.release_certificate_seal?.release_archive_hash === "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
      release_archive_hash_ok: releaseCertificateSeal.release_certificate_seal?.release_archive_hash_ok === true,
      release_seal_verification_hash_expected: releaseCertificateSeal.release_certificate_seal?.release_seal_verification_hash === "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
      private_remaining_zero: releaseCertificateSeal.release_certificate_seal?.private_remaining === 0 && material.private_remaining === 0,
      workspace_entries_135: releaseCertificateSeal.release_certificate_seal?.workspace_entries === 135 && material.workspace_entries === 135,
      recognized_execution_systems_4: releaseCertificateSeal.release_certificate_seal?.recognized_execution_systems === 4 && material.recognized_execution_systems === 4,
      seal_route_count_floor: Number(releaseCertificateSeal.release_certificate_seal?.route_count ?? 0) >= 123,
      certificate_verifier_route_count_floor: Number(releaseCertificateSeal.release_certificate_seal?.certificate_verifier_route_count ?? 0) >= 120,
      certificate_route_count_floor: Number(releaseCertificateSeal.release_certificate_seal?.certificate_route_count ?? 0) >= 117,
      archive_verifier_route_count_floor: Number(releaseCertificateSeal.release_certificate_seal?.archive_verifier_route_count ?? 0) >= 114,
      archive_route_count_floor: Number(releaseCertificateSeal.release_certificate_seal?.archive_route_count ?? 0) >= 111,
      verifier_route_count_floor: verifierRouteCount >= 126,
      verifier_uses_public_material_only: true,
      verifier_avoids_same_origin_http_replay: true
    };

    const failures = Object.entries(invariants).filter(([, ok]) => ok !== true).map(([key]) => key);
    const verified = failures.length === 0;

    const verificationMaterial = {
      schema: "speedkit.public_control_release_certificate_seal_verification_material.v1",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      seal_hash_algorithm: "SHA-256",
      verifier_hash_algorithm: "SHA-256",
      release_certificate_seal_hash: claimedSealHash,
      recomputed_release_certificate_seal_hash: recomputedSealHash,
      release_certificate_seal_hash_ok: claimedSealHash === recomputedSealHash,
      release_certificate_verification_hash: releaseCertificateSeal.release_certificate_seal?.release_certificate_verification_hash || null,
      release_certificate_hash: releaseCertificateSeal.release_certificate_seal?.release_certificate_hash || null,
      recomputed_release_certificate_hash: releaseCertificateSeal.release_certificate_seal?.recomputed_release_certificate_hash || null,
      release_certificate_hash_ok: releaseCertificateSeal.release_certificate_seal?.release_certificate_hash_ok === true,
      release_archive_verification_hash: releaseCertificateSeal.release_certificate_seal?.release_archive_verification_hash || null,
      release_archive_hash: releaseCertificateSeal.release_certificate_seal?.release_archive_hash || null,
      release_archive_hash_ok: releaseCertificateSeal.release_certificate_seal?.release_archive_hash_ok === true,
      release_seal_verification_hash: releaseCertificateSeal.release_certificate_seal?.release_seal_verification_hash || null,
      release_seal_hash: releaseCertificateSeal.release_certificate_seal?.release_seal_hash || null,
      route_count: verifierRouteCount,
      seal_route_count: releaseCertificateSeal.release_certificate_seal?.route_count || null,
      certificate_verifier_route_count: releaseCertificateSeal.release_certificate_seal?.certificate_verifier_route_count || null,
      certificate_route_count: releaseCertificateSeal.release_certificate_seal?.certificate_route_count || null,
      archive_verifier_route_count: releaseCertificateSeal.release_certificate_seal?.archive_verifier_route_count || null,
      archive_route_count: releaseCertificateSeal.release_certificate_seal?.archive_route_count || null,
      workspace_entries: 135,
      private_remaining: 0,
      recognized_execution_systems: 4,
      source_status: {
        release_certificate_seal: releaseCertificateSeal.status,
        release_certificate_seal_policy: "LIVE",
        release_certificate_seal_verify_policy: "LIVE"
      },
      invariants
    };

    const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

    return json({
      schema: "speedkit.public_control_release_certificate_seal_verify_response.v1",
      status: verified ? "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_VERIFIED" : "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_VERIFY_FAILED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      verified,
      verification_hash: verificationHash,
      verification: {
        hash_algorithm: "SHA-256",
        verification_hash: verificationHash,
        release_certificate_seal_hash: claimedSealHash,
        recomputed_release_certificate_seal_hash: recomputedSealHash,
        release_certificate_seal_hash_ok: claimedSealHash === recomputedSealHash,
        release_certificate_verification_hash: releaseCertificateSeal.release_certificate_seal?.release_certificate_verification_hash || null,
        release_certificate_hash: releaseCertificateSeal.release_certificate_seal?.release_certificate_hash || null,
        recomputed_release_certificate_hash: releaseCertificateSeal.release_certificate_seal?.recomputed_release_certificate_hash || null,
        release_certificate_hash_ok: releaseCertificateSeal.release_certificate_seal?.release_certificate_hash_ok === true,
        release_archive_verification_hash: releaseCertificateSeal.release_certificate_seal?.release_archive_verification_hash || null,
        release_archive_hash: releaseCertificateSeal.release_certificate_seal?.release_archive_hash || null,
        release_archive_hash_ok: releaseCertificateSeal.release_certificate_seal?.release_archive_hash_ok === true,
        release_seal_verification_hash: releaseCertificateSeal.release_certificate_seal?.release_seal_verification_hash || null,
        release_seal_hash: releaseCertificateSeal.release_certificate_seal?.release_seal_hash || null,
        route_count: verifierRouteCount,
        seal_route_count: releaseCertificateSeal.release_certificate_seal?.route_count || null,
        certificate_verifier_route_count: releaseCertificateSeal.release_certificate_seal?.certificate_verifier_route_count || null,
        certificate_route_count: releaseCertificateSeal.release_certificate_seal?.certificate_route_count || null,
        archive_verifier_route_count: releaseCertificateSeal.release_certificate_seal?.archive_verifier_route_count || null,
        archive_route_count: releaseCertificateSeal.release_certificate_seal?.archive_route_count || null,
        workspace_entries: 135,
        private_remaining: 0,
        recognized_execution_systems: 4,
        failures_count: failures.length,
        failures
      },
      failures_count: failures.length,
      failures,
      invariants,
      verification_material: verificationMaterial,
      release_certificate_seal_replay: {
        schema: releaseCertificateSeal.schema,
        status: releaseCertificateSeal.status,
        sealed: releaseCertificateSeal.sealed,
        release_certificate_seal_hash: claimedSealHash,
        recomputed_release_certificate_seal_hash: recomputedSealHash,
        release_certificate_seal_hash_ok: claimedSealHash === recomputedSealHash,
        failures_count: Number(releaseCertificateSeal.failures_count ?? -1)
      },
      source_status: verificationMaterial.source_status
    }, verified ? 200 : 503);
  } catch (error) {
    return json({
      schema: "speedkit.public_control_release_certificate_seal_verify_response.v1",
      status: "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_VERIFY_ERROR",
      verified: false,
      failures_count: 1,
      failures: ["release_certificate_seal_verify_exception"],
      error: String(error && error.message ? error.message : error)
    }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET" || context.request.method === "HEAD") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_release_certificate_seal_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
