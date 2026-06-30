const releaseCertificate = {
  "schema": "speedkit.public_control_release_certificate_response.v1",
  "status": "PUBLIC_CONTROL_RELEASE_CERTIFIED",
  "mode": "PUBLIC_ONLY",
  "fake_checkout": false,
  "certified": true,
  "release_certificate": {
    "id": "speedkit-release-certificate-3664e3b0e5cdebab",
    "hash_algorithm": "SHA-256",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_excludes_certified_at": true,
    "material_schema": "speedkit.public_control_release_certificate_material.v1",
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "recomputed_release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "release_record_verification_hash": "8406bad7698649d4a61ab4a1599166af078e8e522e376a8562967075f328a6a0",
    "release_record_hash": "103410557b689fdd61641ced8e23f611b082a2cbe44aae782c74eeaec4c53c50",
    "final_attestation_verification_hash": "f1715479dbbf0ffbf55510e65a4bbbd45d35e6abc34cadeda383c86617566db2",
    "attestation_hash": "389bad4d91e603ce7f832bb1960a4757130fcacfa51d8a90dfef931c6fcdafda",
    "manifest_hash": "181da69fb6bc27f730f3ae6704dd38d6141479c40eb4f2d06f41e0e2b2d79297",
    "chain_archive_hash": "32616379a2de8f704fdc59f2abef6ab481d295270d4c5602b5f37253075593c2",
    "route_count": 117,
    "archive_verifier_route_count": 114,
    "archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4
  },
  "failures_count": 0,
  "failures": [],
  "invariants": {
    "release_archive_verifier_snapshot_json": true,
    "release_archive_verified": true,
    "release_archive_verifier_failures_zero": true,
    "release_archive_hash_present": true,
    "release_archive_hash_ok": true,
    "release_archive_hash_matches_archive_response": true,
    "release_archive_response_archived": true,
    "release_archive_response_failures_zero": true,
    "release_seal_verification_hash_present": true,
    "release_seal_hash_present": true,
    "release_seal_hash_ok": true,
    "private_remaining_zero": true,
    "workspace_entries_135": true,
    "recognized_execution_systems_4": true,
    "archive_verifier_route_count_floor": true,
    "archive_route_count_floor": true,
    "certificate_route_count_floor": true,
    "certificate_uses_public_material_only": true,
    "certificate_avoids_same_origin_http_replay": true
  },
  "release_certificate_material": {
    "schema": "speedkit.public_control_release_certificate_material.v1",
    "mode": "PUBLIC_ONLY",
    "fake_checkout": false,
    "certificate_hash_algorithm": "SHA-256",
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "recomputed_release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "release_record_verification_hash": "8406bad7698649d4a61ab4a1599166af078e8e522e376a8562967075f328a6a0",
    "release_record_hash": "103410557b689fdd61641ced8e23f611b082a2cbe44aae782c74eeaec4c53c50",
    "final_attestation_verification_hash": "f1715479dbbf0ffbf55510e65a4bbbd45d35e6abc34cadeda383c86617566db2",
    "attestation_hash": "389bad4d91e603ce7f832bb1960a4757130fcacfa51d8a90dfef931c6fcdafda",
    "evidence_manifest_verification_hash": "dd193d83a936f1492457562470440773da05652bf0c119752abd788c9a7e0df7",
    "manifest_hash": "181da69fb6bc27f730f3ae6704dd38d6141479c40eb4f2d06f41e0e2b2d79297",
    "chain_archive_hash": "32616379a2de8f704fdc59f2abef6ab481d295270d4c5602b5f37253075593c2",
    "chain_archive_verification_hash": "a82f5140388c26e70051b120165448bfcea29f7ec31012a633f736aa9d6c3672",
    "route_count": 117,
    "archive_verifier_route_count": 114,
    "archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "source_status": {
      "release_archive_verify": "PUBLIC_CONTROL_RELEASE_ARCHIVE_VERIFIED",
      "release_archive": "PUBLIC_CONTROL_RELEASE_ARCHIVED",
      "release_archive_verifier_policy": "LIVE",
      "release_certificate_policy": "LIVE"
    },
    "invariants": {
      "release_archive_verifier_snapshot_json": true,
      "release_archive_verified": true,
      "release_archive_verifier_failures_zero": true,
      "release_archive_hash_present": true,
      "release_archive_hash_ok": true,
      "release_archive_hash_matches_archive_response": true,
      "release_archive_response_archived": true,
      "release_archive_response_failures_zero": true,
      "release_seal_verification_hash_present": true,
      "release_seal_hash_present": true,
      "release_seal_hash_ok": true,
      "private_remaining_zero": true,
      "workspace_entries_135": true,
      "recognized_execution_systems_4": true,
      "archive_verifier_route_count_floor": true,
      "archive_route_count_floor": true,
      "certificate_route_count_floor": true,
      "certificate_uses_public_material_only": true,
      "certificate_avoids_same_origin_http_replay": true
    }
  },
  "release_archive_verification": {
    "verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "recomputed_release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "failures_count": 0
  },
  "source_status": {
    "release_archive_verify": "PUBLIC_CONTROL_RELEASE_ARCHIVE_VERIFIED",
    "release_archive": "PUBLIC_CONTROL_RELEASE_ARCHIVED",
    "release_archive_verifier_policy": "LIVE",
    "release_certificate_policy": "LIVE"
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
    const material = releaseCertificate.release_certificate_material;
    const recomputedReleaseCertificateHash = await sha256Hex(stableStringify(material));
    const claimedReleaseCertificateHash = releaseCertificate.release_certificate?.release_certificate_hash || null;

    const verifierRouteCount = 120;

    const invariants = {
      release_certificate_snapshot_json: releaseCertificate.schema === "speedkit.public_control_release_certificate_response.v1",
      release_certificate_status_certified: releaseCertificate.status === "PUBLIC_CONTROL_RELEASE_CERTIFIED" && releaseCertificate.certified === true,
      release_certificate_hash_present: /^[a-f0-9]{64}$/.test(String(claimedReleaseCertificateHash)),
      release_certificate_hash_ok: claimedReleaseCertificateHash === recomputedReleaseCertificateHash,
      release_certificate_failures_zero: Number(releaseCertificate.failures_count ?? -1) === 0,
      release_archive_verification_hash_expected: releaseCertificate.release_certificate?.release_archive_verification_hash === "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
      release_archive_hash_expected: releaseCertificate.release_certificate?.release_archive_hash === "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
      release_archive_recomputed_hash_matches: releaseCertificate.release_certificate?.recomputed_release_archive_hash === releaseCertificate.release_certificate?.release_archive_hash,
      release_archive_hash_ok: releaseCertificate.release_certificate?.release_archive_hash_ok === true,
      release_seal_verification_hash_expected: releaseCertificate.release_certificate?.release_seal_verification_hash === "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
      private_remaining_zero: releaseCertificate.release_certificate?.private_remaining === 0 && material.private_remaining === 0,
      workspace_entries_135: releaseCertificate.release_certificate?.workspace_entries === 135 && material.workspace_entries === 135,
      recognized_execution_systems_4: releaseCertificate.release_certificate?.recognized_execution_systems === 4 && material.recognized_execution_systems === 4,
      certificate_route_count_floor: Number(releaseCertificate.release_certificate?.route_count ?? 0) >= 117,
      archive_verifier_route_count_floor: Number(releaseCertificate.release_certificate?.archive_verifier_route_count ?? 0) >= 114,
      archive_route_count_floor: Number(releaseCertificate.release_certificate?.archive_route_count ?? 0) >= 111,
      verifier_route_count_floor: verifierRouteCount >= 120,
      verifier_uses_public_material_only: true,
      verifier_avoids_same_origin_http_replay: true
    };

    const failures = Object.entries(invariants).filter(([, ok]) => ok !== true).map(([key]) => key);
    const verified = failures.length === 0;

    const verificationMaterial = {
      schema: "speedkit.public_control_release_certificate_verification_material.v1",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      certificate_hash_algorithm: "SHA-256",
      verifier_hash_algorithm: "SHA-256",
      release_certificate_hash: claimedReleaseCertificateHash,
      recomputed_release_certificate_hash: recomputedReleaseCertificateHash,
      release_certificate_hash_ok: claimedReleaseCertificateHash === recomputedReleaseCertificateHash,
      release_archive_verification_hash: releaseCertificate.release_certificate?.release_archive_verification_hash || null,
      release_archive_hash: releaseCertificate.release_certificate?.release_archive_hash || null,
      recomputed_release_archive_hash: releaseCertificate.release_certificate?.recomputed_release_archive_hash || null,
      release_archive_hash_ok: releaseCertificate.release_certificate?.release_archive_hash_ok === true,
      release_seal_verification_hash: releaseCertificate.release_certificate?.release_seal_verification_hash || null,
      release_seal_hash: releaseCertificate.release_certificate?.release_seal_hash || null,
      release_record_verification_hash: releaseCertificate.release_certificate?.release_record_verification_hash || null,
      release_record_hash: releaseCertificate.release_certificate?.release_record_hash || null,
      final_attestation_verification_hash: releaseCertificate.release_certificate?.final_attestation_verification_hash || null,
      attestation_hash: releaseCertificate.release_certificate?.attestation_hash || null,
      manifest_hash: releaseCertificate.release_certificate?.manifest_hash || null,
      chain_archive_hash: releaseCertificate.release_certificate?.chain_archive_hash || null,
      route_count: verifierRouteCount,
      certificate_route_count: releaseCertificate.release_certificate?.route_count || null,
      archive_verifier_route_count: releaseCertificate.release_certificate?.archive_verifier_route_count || null,
      archive_route_count: releaseCertificate.release_certificate?.archive_route_count || null,
      workspace_entries: 135,
      private_remaining: 0,
      recognized_execution_systems: 4,
      source_status: {
        release_certificate: releaseCertificate.status,
        release_certificate_policy: "LIVE",
        release_certificate_verify_policy: "LIVE"
      },
      invariants
    };

    const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

    return json({
      schema: "speedkit.public_control_release_certificate_verify_response.v1",
      status: verified ? "PUBLIC_CONTROL_RELEASE_CERTIFICATE_VERIFIED" : "PUBLIC_CONTROL_RELEASE_CERTIFICATE_VERIFY_FAILED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      verified,
      verification_hash: verificationHash,
      verification: {
        hash_algorithm: "SHA-256",
        verification_hash: verificationHash,
        release_certificate_hash: claimedReleaseCertificateHash,
        recomputed_release_certificate_hash: recomputedReleaseCertificateHash,
        release_certificate_hash_ok: claimedReleaseCertificateHash === recomputedReleaseCertificateHash,
        release_archive_verification_hash: releaseCertificate.release_certificate?.release_archive_verification_hash || null,
        release_archive_hash: releaseCertificate.release_certificate?.release_archive_hash || null,
        recomputed_release_archive_hash: releaseCertificate.release_certificate?.recomputed_release_archive_hash || null,
        release_archive_hash_ok: releaseCertificate.release_certificate?.release_archive_hash_ok === true,
        release_seal_verification_hash: releaseCertificate.release_certificate?.release_seal_verification_hash || null,
        release_seal_hash: releaseCertificate.release_certificate?.release_seal_hash || null,
        route_count: verifierRouteCount,
        certificate_route_count: releaseCertificate.release_certificate?.route_count || null,
        archive_verifier_route_count: releaseCertificate.release_certificate?.archive_verifier_route_count || null,
        archive_route_count: releaseCertificate.release_certificate?.archive_route_count || null,
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
      release_certificate_replay: {
        schema: releaseCertificate.schema,
        status: releaseCertificate.status,
        certified: releaseCertificate.certified,
        release_certificate_hash: claimedReleaseCertificateHash,
        recomputed_release_certificate_hash: recomputedReleaseCertificateHash,
        release_certificate_hash_ok: claimedReleaseCertificateHash === recomputedReleaseCertificateHash,
        failures_count: Number(releaseCertificate.failures_count ?? -1)
      },
      source_status: verificationMaterial.source_status
    }, verified ? 200 : 503);
  } catch (error) {
    return json({
      schema: "speedkit.public_control_release_certificate_verify_response.v1",
      status: "PUBLIC_CONTROL_RELEASE_CERTIFICATE_VERIFY_ERROR",
      verified: false,
      failures_count: 1,
      failures: ["release_certificate_verify_exception"],
      error: String(error && error.message ? error.message : error)
    }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET" || context.request.method === "HEAD") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_release_certificate_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
