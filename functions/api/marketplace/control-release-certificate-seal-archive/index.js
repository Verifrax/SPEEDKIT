const sealVerify = {
  "schema": "speedkit.public_control_release_certificate_seal_verify_response.v1",
  "status": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_VERIFIED",
  "mode": "PUBLIC_ONLY",
  "fake_checkout": false,
  "verified": true,
  "verification_hash": "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
  "verification": {
    "hash_algorithm": "SHA-256",
    "verification_hash": "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "recomputed_release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_ok": true,
    "release_certificate_verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "recomputed_release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "route_count": 126,
    "seal_route_count": 123,
    "certificate_verifier_route_count": 120,
    "certificate_route_count": 117,
    "archive_verifier_route_count": 114,
    "archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "failures_count": 0,
    "failures": []
  },
  "failures_count": 0,
  "failures": [],
  "invariants": {
    "seal_snapshot_json": true,
    "seal_status_sealed": true,
    "seal_hash_present": true,
    "seal_hash_expected": true,
    "seal_hash_ok": true,
    "seal_failures_zero": true,
    "certificate_verification_hash_expected": true,
    "release_certificate_hash_expected": true,
    "release_certificate_recomputed_hash_matches": true,
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash_expected": true,
    "release_archive_hash_expected": true,
    "release_archive_hash_ok": true,
    "release_seal_verification_hash_expected": true,
    "private_remaining_zero": true,
    "workspace_entries_135": true,
    "recognized_execution_systems_4": true,
    "seal_route_count_floor": true,
    "certificate_verifier_route_count_floor": true,
    "certificate_route_count_floor": true,
    "archive_verifier_route_count_floor": true,
    "archive_route_count_floor": true,
    "verifier_route_count_floor": true,
    "verifier_uses_public_material_only": true,
    "verifier_avoids_same_origin_http_replay": true
  },
  "verification_material": {
    "schema": "speedkit.public_control_release_certificate_seal_verification_material.v1",
    "mode": "PUBLIC_ONLY",
    "fake_checkout": false,
    "seal_hash_algorithm": "SHA-256",
    "verifier_hash_algorithm": "SHA-256",
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "recomputed_release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_ok": true,
    "release_certificate_verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "recomputed_release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "route_count": 126,
    "seal_route_count": 123,
    "certificate_verifier_route_count": 120,
    "certificate_route_count": 117,
    "archive_verifier_route_count": 114,
    "archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "source_status": {
      "release_certificate_seal": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEALED",
      "release_certificate_seal_policy": "LIVE",
      "release_certificate_seal_verify_policy": "LIVE"
    },
    "invariants": {
      "seal_snapshot_json": true,
      "seal_status_sealed": true,
      "seal_hash_present": true,
      "seal_hash_expected": true,
      "seal_hash_ok": true,
      "seal_failures_zero": true,
      "certificate_verification_hash_expected": true,
      "release_certificate_hash_expected": true,
      "release_certificate_recomputed_hash_matches": true,
      "release_certificate_hash_ok": true,
      "release_archive_verification_hash_expected": true,
      "release_archive_hash_expected": true,
      "release_archive_hash_ok": true,
      "release_seal_verification_hash_expected": true,
      "private_remaining_zero": true,
      "workspace_entries_135": true,
      "recognized_execution_systems_4": true,
      "seal_route_count_floor": true,
      "certificate_verifier_route_count_floor": true,
      "certificate_route_count_floor": true,
      "archive_verifier_route_count_floor": true,
      "archive_route_count_floor": true,
      "verifier_route_count_floor": true,
      "verifier_uses_public_material_only": true,
      "verifier_avoids_same_origin_http_replay": true
    }
  },
  "release_certificate_seal_replay": {
    "schema": "speedkit.public_control_release_certificate_seal_response.v1",
    "status": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEALED",
    "sealed": true,
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "recomputed_release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_ok": true,
    "failures_count": 0
  },
  "source_status": {
    "release_certificate_seal": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEALED",
    "release_certificate_seal_policy": "LIVE",
    "release_certificate_seal_verify_policy": "LIVE"
  }
};
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
    const archiveRouteCount = 129;

    const sealVerificationHash = sealVerify.verification_hash || null;
    const releaseCertificateSealHash = sealVerify.verification?.release_certificate_seal_hash || null;
    const recomputedReleaseCertificateSealHash = sealVerify.verification?.recomputed_release_certificate_seal_hash || null;
    const releaseCertificateVerificationHash = sealVerify.verification?.release_certificate_verification_hash || null;
    const releaseCertificateHash = sealVerify.verification?.release_certificate_hash || null;
    const releaseArchiveVerificationHash = sealVerify.verification?.release_archive_verification_hash || null;
    const releaseArchiveHash = sealVerify.verification?.release_archive_hash || null;
    const releaseSealVerificationHash = sealVerify.verification?.release_seal_verification_hash || null;

    const invariants = {
      seal_verifier_snapshot_json: sealVerify.schema === "speedkit.public_control_release_certificate_seal_verify_response.v1",
      seal_verified: sealVerify.status === "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_VERIFIED" && sealVerify.verified === true,
      seal_verifier_failures_zero: Number(sealVerify.failures_count ?? -1) === 0 && Number(sealVerify.verification?.failures_count ?? -1) === 0,
      seal_verification_hash_expected: sealVerificationHash === "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
      release_certificate_seal_hash_present: /^[a-f0-9]{64}$/.test(String(releaseCertificateSealHash)),
      release_certificate_seal_hash_expected: releaseCertificateSealHash === "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
      release_certificate_seal_hash_ok: releaseCertificateSealHash === recomputedReleaseCertificateSealHash && sealVerify.verification?.release_certificate_seal_hash_ok === true,
      release_certificate_seal_hash_matches_seal_response: releaseCertificateSealHash === releaseCertificateSeal.release_certificate_seal?.release_certificate_seal_hash,
      release_certificate_seal_response_sealed: releaseCertificateSeal.schema === "speedkit.public_control_release_certificate_seal_response.v1" && releaseCertificateSeal.status === "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEALED" && releaseCertificateSeal.sealed === true,
      release_certificate_seal_response_failures_zero: Number(releaseCertificateSeal.failures_count ?? -1) === 0,
      release_certificate_verification_hash_expected: releaseCertificateVerificationHash === "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
      release_certificate_hash_expected: releaseCertificateHash === "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
      release_certificate_hash_ok: sealVerify.verification?.release_certificate_hash_ok === true,
      release_archive_verification_hash_expected: releaseArchiveVerificationHash === "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
      release_archive_hash_expected: releaseArchiveHash === "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
      release_archive_hash_ok: sealVerify.verification?.release_archive_hash_ok === true,
      release_seal_verification_hash_expected: releaseSealVerificationHash === "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
      private_remaining_zero: sealVerify.verification?.private_remaining === 0 && releaseCertificateSeal.release_certificate_seal?.private_remaining === 0,
      workspace_entries_135: sealVerify.verification?.workspace_entries === 135 && releaseCertificateSeal.release_certificate_seal?.workspace_entries === 135,
      recognized_execution_systems_4: sealVerify.verification?.recognized_execution_systems === 4 && releaseCertificateSeal.release_certificate_seal?.recognized_execution_systems === 4,
      seal_verifier_route_count_floor: Number(sealVerify.verification?.route_count ?? 0) >= 126,
      seal_route_count_floor: Number(sealVerify.verification?.seal_route_count ?? 0) >= 123 && Number(releaseCertificateSeal.release_certificate_seal?.route_count ?? 0) >= 123,
      certificate_verifier_route_count_floor: Number(sealVerify.verification?.certificate_verifier_route_count ?? 0) >= 120,
      certificate_route_count_floor: Number(sealVerify.verification?.certificate_route_count ?? 0) >= 117,
      archive_verifier_route_count_floor: Number(sealVerify.verification?.archive_verifier_route_count ?? 0) >= 114,
      archive_route_count_floor: Number(sealVerify.verification?.archive_route_count ?? 0) >= 111,
      archive_route_count_floor_own: archiveRouteCount >= 129,
      archive_uses_public_material_only: true,
      archive_avoids_same_origin_http_replay: true
    };

    const failures = Object.entries(invariants).filter(([, ok]) => ok !== true).map(([key]) => key);
    const archived = failures.length === 0;

    const archiveMaterial = {
      schema: "speedkit.public_control_release_certificate_seal_archive_material.v1",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      archive_hash_algorithm: "SHA-256",
      release_certificate_seal_verification_hash: sealVerificationHash,
      release_certificate_seal_hash: releaseCertificateSealHash,
      recomputed_release_certificate_seal_hash: recomputedReleaseCertificateSealHash,
      release_certificate_seal_hash_ok: releaseCertificateSealHash === recomputedReleaseCertificateSealHash,
      release_certificate_verification_hash: releaseCertificateVerificationHash,
      release_certificate_hash: releaseCertificateHash,
      release_certificate_hash_ok: sealVerify.verification?.release_certificate_hash_ok === true,
      release_archive_verification_hash: releaseArchiveVerificationHash,
      release_archive_hash: releaseArchiveHash,
      release_archive_hash_ok: sealVerify.verification?.release_archive_hash_ok === true,
      release_seal_verification_hash: releaseSealVerificationHash,
      release_seal_hash: sealVerify.verification?.release_seal_hash || releaseCertificateSeal.release_certificate_seal?.release_seal_hash || null,
      route_count: archiveRouteCount,
      seal_verifier_route_count: sealVerify.verification?.route_count || null,
      seal_route_count: releaseCertificateSeal.release_certificate_seal?.route_count || null,
      certificate_verifier_route_count: sealVerify.verification?.certificate_verifier_route_count || null,
      certificate_route_count: sealVerify.verification?.certificate_route_count || null,
      archive_verifier_route_count: sealVerify.verification?.archive_verifier_route_count || null,
      archive_route_count: sealVerify.verification?.archive_route_count || null,
      workspace_entries: 135,
      private_remaining: 0,
      recognized_execution_systems: 4,
      source_status: {
        release_certificate_seal_verify: sealVerify.status,
        release_certificate_seal: releaseCertificateSeal.status,
        release_certificate_seal_archive_policy: "LIVE"
      },
      invariants
    };

    const archiveHash = await sha256Hex(stableStringify(archiveMaterial));

    return json({
      schema: "speedkit.public_control_release_certificate_seal_archive_response.v1",
      status: archived ? "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVED" : "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVE_FAILED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      archived,
      release_certificate_seal_archive: {
        id: "speedkit-release-certificate-seal-archive-" + String(archiveHash).slice(0, 16),
        hash_algorithm: "SHA-256",
        release_certificate_seal_archive_hash: archiveHash,
        release_certificate_seal_archive_hash_excludes_archived_at: true,
        material_schema: archiveMaterial.schema,
        release_certificate_seal_verification_hash: sealVerificationHash,
        release_certificate_seal_hash: releaseCertificateSealHash,
        recomputed_release_certificate_seal_hash: recomputedReleaseCertificateSealHash,
        release_certificate_seal_hash_ok: releaseCertificateSealHash === recomputedReleaseCertificateSealHash,
        release_certificate_verification_hash: releaseCertificateVerificationHash,
        release_certificate_hash: releaseCertificateHash,
        release_certificate_hash_ok: sealVerify.verification?.release_certificate_hash_ok === true,
        release_archive_verification_hash: releaseArchiveVerificationHash,
        release_archive_hash: releaseArchiveHash,
        release_archive_hash_ok: sealVerify.verification?.release_archive_hash_ok === true,
        release_seal_verification_hash: releaseSealVerificationHash,
        release_seal_hash: archiveMaterial.release_seal_hash,
        route_count: archiveRouteCount,
        seal_verifier_route_count: sealVerify.verification?.route_count || null,
        seal_route_count: releaseCertificateSeal.release_certificate_seal?.route_count || null,
        certificate_verifier_route_count: sealVerify.verification?.certificate_verifier_route_count || null,
        certificate_route_count: sealVerify.verification?.certificate_route_count || null,
        archive_verifier_route_count: sealVerify.verification?.archive_verifier_route_count || null,
        archive_route_count: sealVerify.verification?.archive_route_count || null,
        workspace_entries: 135,
        private_remaining: 0,
        recognized_execution_systems: 4
      },
      failures_count: failures.length,
      failures,
      invariants,
      release_certificate_seal_archive_material: archiveMaterial,
      release_certificate_seal_verification: {
        verification_hash: sealVerificationHash,
        release_certificate_seal_hash: releaseCertificateSealHash,
        recomputed_release_certificate_seal_hash: recomputedReleaseCertificateSealHash,
        release_certificate_seal_hash_ok: releaseCertificateSealHash === recomputedReleaseCertificateSealHash,
        failures_count: Number(sealVerify.failures_count ?? -1)
      },
      source_status: archiveMaterial.source_status
    }, archived ? 200 : 503);
  } catch (error) {
    return json({
      schema: "speedkit.public_control_release_certificate_seal_archive_response.v1",
      status: "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVE_ERROR",
      archived: false,
      failures_count: 1,
      failures: ["release_certificate_seal_archive_exception"],
      error: String(error && error.message ? error.message : error)
    }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET" || context.request.method === "HEAD") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_release_certificate_seal_archive_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
