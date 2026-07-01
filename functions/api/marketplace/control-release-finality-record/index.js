const archiveVerify = {
  "schema": "speedkit.public_control_release_certificate_seal_archive_verify_response.v1",
  "status": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVE_VERIFIED",
  "mode": "PUBLIC_ONLY",
  "fake_checkout": false,
  "verified": true,
  "verification_hash": "46725ca4bf940694254e35ddafc0712f34a64f4ce727d9c14da5097476b00754",
  "verification": {
    "hash_algorithm": "SHA-256",
    "verification_hash": "46725ca4bf940694254e35ddafc0712f34a64f4ce727d9c14da5097476b00754",
    "release_certificate_seal_archive_hash": "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
    "recomputed_release_certificate_seal_archive_hash": "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
    "release_certificate_seal_archive_hash_ok": true,
    "release_certificate_seal_verification_hash": "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "recomputed_release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_ok": true,
    "release_certificate_verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "route_count": 132,
    "archive_route_count": 129,
    "seal_verifier_route_count": 126,
    "seal_route_count": 123,
    "certificate_verifier_route_count": 120,
    "certificate_route_count": 117,
    "root_archive_verifier_route_count": 114,
    "root_archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "failures_count": 0,
    "failures": []
  },
  "failures_count": 0,
  "failures": [],
  "invariants": {
    "archive_snapshot_json": true,
    "archive_status_archived": true,
    "archive_hash_present": true,
    "archive_hash_expected": true,
    "archive_hash_ok": true,
    "archive_failures_zero": true,
    "seal_verification_hash_expected": true,
    "seal_hash_expected": true,
    "seal_recomputed_hash_matches": true,
    "seal_hash_ok": true,
    "certificate_verification_hash_expected": true,
    "certificate_hash_expected": true,
    "certificate_hash_ok": true,
    "release_archive_verification_hash_expected": true,
    "release_archive_hash_expected": true,
    "release_archive_hash_ok": true,
    "release_seal_verification_hash_expected": true,
    "private_remaining_zero": true,
    "workspace_entries_135": true,
    "recognized_execution_systems_4": true,
    "archive_route_count_floor": true,
    "seal_verifier_route_count_floor": true,
    "seal_route_count_floor": true,
    "certificate_verifier_route_count_floor": true,
    "certificate_route_count_floor": true,
    "archive_verifier_route_count_floor": true,
    "root_archive_route_count_floor": true,
    "verifier_route_count_floor": true,
    "verifier_uses_public_material_only": true,
    "verifier_avoids_same_origin_http_replay": true
  },
  "verification_material": {
    "schema": "speedkit.public_control_release_certificate_seal_archive_verification_material.v1",
    "mode": "PUBLIC_ONLY",
    "fake_checkout": false,
    "archive_hash_algorithm": "SHA-256",
    "verifier_hash_algorithm": "SHA-256",
    "release_certificate_seal_archive_hash": "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
    "recomputed_release_certificate_seal_archive_hash": "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
    "release_certificate_seal_archive_hash_ok": true,
    "release_certificate_seal_verification_hash": "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "recomputed_release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_ok": true,
    "release_certificate_verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "route_count": 132,
    "archive_route_count": 129,
    "seal_verifier_route_count": 126,
    "seal_route_count": 123,
    "certificate_verifier_route_count": 120,
    "certificate_route_count": 117,
    "root_archive_verifier_route_count": 114,
    "root_archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "source_status": {
      "release_certificate_seal_archive": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVED",
      "release_certificate_seal_archive_policy": "LIVE",
      "release_certificate_seal_archive_verify_policy": "LIVE"
    },
    "invariants": {
      "archive_snapshot_json": true,
      "archive_status_archived": true,
      "archive_hash_present": true,
      "archive_hash_expected": true,
      "archive_hash_ok": true,
      "archive_failures_zero": true,
      "seal_verification_hash_expected": true,
      "seal_hash_expected": true,
      "seal_recomputed_hash_matches": true,
      "seal_hash_ok": true,
      "certificate_verification_hash_expected": true,
      "certificate_hash_expected": true,
      "certificate_hash_ok": true,
      "release_archive_verification_hash_expected": true,
      "release_archive_hash_expected": true,
      "release_archive_hash_ok": true,
      "release_seal_verification_hash_expected": true,
      "private_remaining_zero": true,
      "workspace_entries_135": true,
      "recognized_execution_systems_4": true,
      "archive_route_count_floor": true,
      "seal_verifier_route_count_floor": true,
      "seal_route_count_floor": true,
      "certificate_verifier_route_count_floor": true,
      "certificate_route_count_floor": true,
      "archive_verifier_route_count_floor": true,
      "root_archive_route_count_floor": true,
      "verifier_route_count_floor": true,
      "verifier_uses_public_material_only": true,
      "verifier_avoids_same_origin_http_replay": true
    }
  },
  "release_certificate_seal_archive_replay": {
    "schema": "speedkit.public_control_release_certificate_seal_archive_response.v1",
    "status": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVED",
    "archived": true,
    "release_certificate_seal_archive_hash": "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
    "recomputed_release_certificate_seal_archive_hash": "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
    "release_certificate_seal_archive_hash_ok": true,
    "failures_count": 0
  },
  "source_status": {
    "release_certificate_seal_archive": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVED",
    "release_certificate_seal_archive_policy": "LIVE",
    "release_certificate_seal_archive_verify_policy": "LIVE"
  }
};
const archive = {
  "schema": "speedkit.public_control_release_certificate_seal_archive_response.v1",
  "status": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVED",
  "mode": "PUBLIC_ONLY",
  "fake_checkout": false,
  "archived": true,
  "release_certificate_seal_archive": {
    "id": "speedkit-release-certificate-seal-archive-46c33df74b66ec62",
    "hash_algorithm": "SHA-256",
    "release_certificate_seal_archive_hash": "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
    "release_certificate_seal_archive_hash_excludes_archived_at": true,
    "material_schema": "speedkit.public_control_release_certificate_seal_archive_material.v1",
    "release_certificate_seal_verification_hash": "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "recomputed_release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_ok": true,
    "release_certificate_verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "route_count": 129,
    "seal_verifier_route_count": 126,
    "seal_route_count": 123,
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
    "seal_verifier_snapshot_json": true,
    "seal_verified": true,
    "seal_verifier_failures_zero": true,
    "seal_verification_hash_expected": true,
    "release_certificate_seal_hash_present": true,
    "release_certificate_seal_hash_expected": true,
    "release_certificate_seal_hash_ok": true,
    "release_certificate_seal_hash_matches_seal_response": true,
    "release_certificate_seal_response_sealed": true,
    "release_certificate_seal_response_failures_zero": true,
    "release_certificate_verification_hash_expected": true,
    "release_certificate_hash_expected": true,
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash_expected": true,
    "release_archive_hash_expected": true,
    "release_archive_hash_ok": true,
    "release_seal_verification_hash_expected": true,
    "private_remaining_zero": true,
    "workspace_entries_135": true,
    "recognized_execution_systems_4": true,
    "seal_verifier_route_count_floor": true,
    "seal_route_count_floor": true,
    "certificate_verifier_route_count_floor": true,
    "certificate_route_count_floor": true,
    "archive_verifier_route_count_floor": true,
    "archive_route_count_floor": true,
    "archive_route_count_floor_own": true,
    "archive_uses_public_material_only": true,
    "archive_avoids_same_origin_http_replay": true
  },
  "release_certificate_seal_archive_material": {
    "schema": "speedkit.public_control_release_certificate_seal_archive_material.v1",
    "mode": "PUBLIC_ONLY",
    "fake_checkout": false,
    "archive_hash_algorithm": "SHA-256",
    "release_certificate_seal_verification_hash": "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "recomputed_release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_ok": true,
    "release_certificate_verification_hash": "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
    "release_certificate_hash": "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
    "release_certificate_hash_ok": true,
    "release_archive_verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "route_count": 129,
    "seal_verifier_route_count": 126,
    "seal_route_count": 123,
    "certificate_verifier_route_count": 120,
    "certificate_route_count": 117,
    "archive_verifier_route_count": 114,
    "archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "source_status": {
      "release_certificate_seal_verify": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_VERIFIED",
      "release_certificate_seal": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEALED",
      "release_certificate_seal_archive_policy": "LIVE"
    },
    "invariants": {
      "seal_verifier_snapshot_json": true,
      "seal_verified": true,
      "seal_verifier_failures_zero": true,
      "seal_verification_hash_expected": true,
      "release_certificate_seal_hash_present": true,
      "release_certificate_seal_hash_expected": true,
      "release_certificate_seal_hash_ok": true,
      "release_certificate_seal_hash_matches_seal_response": true,
      "release_certificate_seal_response_sealed": true,
      "release_certificate_seal_response_failures_zero": true,
      "release_certificate_verification_hash_expected": true,
      "release_certificate_hash_expected": true,
      "release_certificate_hash_ok": true,
      "release_archive_verification_hash_expected": true,
      "release_archive_hash_expected": true,
      "release_archive_hash_ok": true,
      "release_seal_verification_hash_expected": true,
      "private_remaining_zero": true,
      "workspace_entries_135": true,
      "recognized_execution_systems_4": true,
      "seal_verifier_route_count_floor": true,
      "seal_route_count_floor": true,
      "certificate_verifier_route_count_floor": true,
      "certificate_route_count_floor": true,
      "archive_verifier_route_count_floor": true,
      "archive_route_count_floor": true,
      "archive_route_count_floor_own": true,
      "archive_uses_public_material_only": true,
      "archive_avoids_same_origin_http_replay": true
    }
  },
  "release_certificate_seal_verification": {
    "verification_hash": "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
    "release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "recomputed_release_certificate_seal_hash": "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
    "release_certificate_seal_hash_ok": true,
    "failures_count": 0
  },
  "source_status": {
    "release_certificate_seal_verify": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_VERIFIED",
    "release_certificate_seal": "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEALED",
    "release_certificate_seal_archive_policy": "LIVE"
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
    const routeCount = 135;

    const archiveVerificationHash = archiveVerify.verification_hash || null;
    const archiveHash = archiveVerify.verification?.release_certificate_seal_archive_hash || null;
    const recomputedArchiveHash = archiveVerify.verification?.recomputed_release_certificate_seal_archive_hash || null;

    const invariants = {
      archive_verifier_snapshot_json: archiveVerify.schema === "speedkit.public_control_release_certificate_seal_archive_verify_response.v1",
      archive_verified: archiveVerify.status === "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVE_VERIFIED" && archiveVerify.verified === true,
      archive_verifier_failures_zero: Number(archiveVerify.failures_count ?? -1) === 0 && Number(archiveVerify.verification?.failures_count ?? -1) === 0,
      archive_verification_hash_expected: archiveVerificationHash === "46725ca4bf940694254e35ddafc0712f34a64f4ce727d9c14da5097476b00754",
      archive_hash_expected: archiveHash === "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
      archive_hash_ok: archiveHash === recomputedArchiveHash && archiveVerify.verification?.release_certificate_seal_archive_hash_ok === true,
      archive_response_archived: archive.schema === "speedkit.public_control_release_certificate_seal_archive_response.v1" && archive.status === "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVED" && archive.archived === true,
      archive_response_hash_matches: archive.release_certificate_seal_archive?.release_certificate_seal_archive_hash === archiveHash,
      archive_response_failures_zero: Number(archive.failures_count ?? -1) === 0,
      seal_verification_hash_expected: archiveVerify.verification?.release_certificate_seal_verification_hash === "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
      seal_hash_expected: archiveVerify.verification?.release_certificate_seal_hash === "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
      seal_hash_ok: archiveVerify.verification?.release_certificate_seal_hash_ok === true,
      certificate_verification_hash_expected: archiveVerify.verification?.release_certificate_verification_hash === "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
      certificate_hash_expected: archiveVerify.verification?.release_certificate_hash === "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
      certificate_hash_ok: archiveVerify.verification?.release_certificate_hash_ok === true,
      release_archive_verification_hash_expected: archiveVerify.verification?.release_archive_verification_hash === "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
      release_archive_hash_expected: archiveVerify.verification?.release_archive_hash === "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
      release_archive_hash_ok: archiveVerify.verification?.release_archive_hash_ok === true,
      release_seal_verification_hash_expected: archiveVerify.verification?.release_seal_verification_hash === "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
      private_remaining_zero: archiveVerify.verification?.private_remaining === 0,
      workspace_entries_135: archiveVerify.verification?.workspace_entries === 135,
      recognized_execution_systems_4: archiveVerify.verification?.recognized_execution_systems === 4,
      route_count_equals_workspace_entries: routeCount === 135,
      previous_route_count_floor: Number(archiveVerify.verification?.route_count ?? 0) >= 132,
      finality_uses_public_material_only: true,
      finality_avoids_same_origin_http_replay: true
    };

    const failures = Object.entries(invariants).filter(([, ok]) => ok !== true).map(([key]) => key);
    const recorded = failures.length === 0;

    const recordMaterial = {
      schema: "speedkit.public_control_release_finality_record_material.v1",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      finality_hash_algorithm: "SHA-256",
      release_certificate_seal_archive_verification_hash: archiveVerificationHash,
      release_certificate_seal_archive_hash: archiveHash,
      recomputed_release_certificate_seal_archive_hash: recomputedArchiveHash,
      release_certificate_seal_archive_hash_ok: archiveHash === recomputedArchiveHash,
      release_certificate_seal_verification_hash: archiveVerify.verification?.release_certificate_seal_verification_hash || null,
      release_certificate_seal_hash: archiveVerify.verification?.release_certificate_seal_hash || null,
      release_certificate_seal_hash_ok: archiveVerify.verification?.release_certificate_seal_hash_ok === true,
      release_certificate_verification_hash: archiveVerify.verification?.release_certificate_verification_hash || null,
      release_certificate_hash: archiveVerify.verification?.release_certificate_hash || null,
      release_certificate_hash_ok: archiveVerify.verification?.release_certificate_hash_ok === true,
      release_archive_verification_hash: archiveVerify.verification?.release_archive_verification_hash || null,
      release_archive_hash: archiveVerify.verification?.release_archive_hash || null,
      release_archive_hash_ok: archiveVerify.verification?.release_archive_hash_ok === true,
      release_seal_verification_hash: archiveVerify.verification?.release_seal_verification_hash || null,
      release_seal_hash: archiveVerify.verification?.release_seal_hash || null,
      route_count: routeCount,
      previous_route_count: archiveVerify.verification?.route_count || null,
      workspace_entries: 135,
      private_remaining: 0,
      recognized_execution_systems: 4,
      public_workspace_route_alignment: "ROUTE_COUNT_EQUALS_WORKSPACE_ENTRIES",
      source_status: {
        release_certificate_seal_archive_verify: archiveVerify.status,
        release_certificate_seal_archive: archive.status,
        release_finality_record_policy: "LIVE"
      },
      invariants
    };

    const finalityHash = await sha256Hex(stableStringify(recordMaterial));

    return json({
      schema: "speedkit.public_control_release_finality_record_response.v1",
      status: recorded ? "PUBLIC_CONTROL_RELEASE_FINALITY_RECORDED" : "PUBLIC_CONTROL_RELEASE_FINALITY_RECORD_FAILED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      recorded,
      release_finality_record: {
        id: "speedkit-release-finality-record-" + String(finalityHash).slice(0, 16),
        hash_algorithm: "SHA-256",
        release_finality_record_hash: finalityHash,
        release_finality_record_hash_excludes_recorded_at: true,
        material_schema: recordMaterial.schema,
        release_certificate_seal_archive_verification_hash: archiveVerificationHash,
        release_certificate_seal_archive_hash: archiveHash,
        recomputed_release_certificate_seal_archive_hash: recomputedArchiveHash,
        release_certificate_seal_archive_hash_ok: archiveHash === recomputedArchiveHash,
        release_certificate_seal_verification_hash: recordMaterial.release_certificate_seal_verification_hash,
        release_certificate_seal_hash: recordMaterial.release_certificate_seal_hash,
        release_certificate_seal_hash_ok: recordMaterial.release_certificate_seal_hash_ok,
        release_certificate_verification_hash: recordMaterial.release_certificate_verification_hash,
        release_certificate_hash: recordMaterial.release_certificate_hash,
        release_certificate_hash_ok: recordMaterial.release_certificate_hash_ok,
        release_archive_verification_hash: recordMaterial.release_archive_verification_hash,
        release_archive_hash: recordMaterial.release_archive_hash,
        release_archive_hash_ok: recordMaterial.release_archive_hash_ok,
        release_seal_verification_hash: recordMaterial.release_seal_verification_hash,
        release_seal_hash: recordMaterial.release_seal_hash,
        route_count: routeCount,
        previous_route_count: recordMaterial.previous_route_count,
        workspace_entries: 135,
        private_remaining: 0,
        recognized_execution_systems: 4,
        public_workspace_route_alignment: recordMaterial.public_workspace_route_alignment
      },
      failures_count: failures.length,
      failures,
      invariants,
      release_finality_record_material: recordMaterial,
      source_status: recordMaterial.source_status
    }, recorded ? 200 : 503);
  } catch (error) {
    return json({
      schema: "speedkit.public_control_release_finality_record_response.v1",
      status: "PUBLIC_CONTROL_RELEASE_FINALITY_RECORD_ERROR",
      recorded: false,
      failures_count: 1,
      failures: ["release_finality_record_exception"],
      error: String(error && error.message ? error.message : error)
    }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET" || context.request.method === "HEAD") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_release_finality_record_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
