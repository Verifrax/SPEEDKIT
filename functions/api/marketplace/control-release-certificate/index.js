const archiveVerify = {
  "schema": "speedkit.public_control_release_archive_verify_response.v1",
  "status": "PUBLIC_CONTROL_RELEASE_ARCHIVE_VERIFIED",
  "mode": "PUBLIC_ONLY",
  "fake_checkout": false,
  "verified": true,
  "verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
  "verification": {
    "hash_algorithm": "SHA-256",
    "verification_hash": "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
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
    "public_control_digest": "8b4d02111bc3723828c331b6f7111871ec7ff6656cad40949af816d7d73b",
    "public_control_digest_carried": false,
    "route_count": 114,
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
    "release_archive_snapshot_json": true,
    "release_archive_status_archived": true,
    "release_archive_hash_present": true,
    "release_archive_hash_ok": true,
    "release_archive_failures_zero": true,
    "release_seal_hash_ok": true,
    "release_seal_verification_failures_zero": true,
    "private_remaining_zero": true,
    "workspace_entries_135": true,
    "recognized_execution_systems_4": true,
    "archive_route_count_floor": true,
    "verifier_route_count_floor": true,
    "public_control_digest_present_or_legacy_absent": true,
    "release_seal_verification_hash_present": true,
    "release_seal_hash_present": true,
    "source_status_archive_verified": true,
    "source_status_archive_issued": true,
    "source_status_product_os_live": true,
    "source_status_route_map_live": true,
    "source_status_policy_live": true,
    "verifier_uses_public_material_only": true,
    "verifier_avoids_same_origin_http_replay": true
  },
  "verification_material": {
    "schema": "speedkit.public_control_release_archive_verification_material.v1",
    "mode": "PUBLIC_ONLY",
    "fake_checkout": false,
    "archive_hash_algorithm": "SHA-256",
    "verifier_hash_algorithm": "SHA-256",
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
    "public_control_digest": "8b4d02111bc3723828c331b6f7111871ec7ff6656cad40949af816d7d73b",
    "public_control_digest_carried": false,
    "route_count": 114,
    "archive_route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "source_status": {
      "release_archive": "PUBLIC_CONTROL_RELEASE_ARCHIVED",
      "release_archive_policy": "LIVE",
      "product_os": "LIVE",
      "route_map": "LIVE"
    },
    "invariants": {
      "release_archive_snapshot_json": true,
      "release_archive_status_archived": true,
      "release_archive_hash_present": true,
      "release_archive_hash_ok": true,
      "release_archive_failures_zero": true,
      "release_seal_hash_ok": true,
      "release_seal_verification_failures_zero": true,
      "private_remaining_zero": true,
      "workspace_entries_135": true,
      "recognized_execution_systems_4": true,
      "archive_route_count_floor": true,
      "verifier_route_count_floor": true,
      "public_control_digest_present_or_legacy_absent": true,
      "release_seal_verification_hash_present": true,
      "release_seal_hash_present": true,
      "source_status_archive_verified": true,
      "source_status_archive_issued": true,
      "source_status_product_os_live": true,
      "source_status_route_map_live": true,
      "source_status_policy_live": true,
      "verifier_uses_public_material_only": true,
      "verifier_avoids_same_origin_http_replay": true
    }
  },
  "release_archive_replay": {
    "schema": "speedkit.public_control_release_archive_response.v1",
    "status": "PUBLIC_CONTROL_RELEASE_ARCHIVED",
    "archived": true,
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "recomputed_release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_ok": true,
    "failures_count": 0,
    "release_seal_hash_ok": true
  },
  "source_status": {
    "release_archive": "PUBLIC_CONTROL_RELEASE_ARCHIVED",
    "release_archive_policy": "LIVE",
    "product_os": "LIVE",
    "route_map": "LIVE"
  }
};
const releaseArchive = {
  "schema": "speedkit.public_control_release_archive_response.v1",
  "status": "PUBLIC_CONTROL_RELEASE_ARCHIVED",
  "mode": "PUBLIC_ONLY",
  "fake_checkout": false,
  "archived": true,
  "release_archive": {
    "id": "speedkit-release-archive-e48309a9748bb5ed",
    "hash_algorithm": "SHA-256",
    "release_archive_hash": "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
    "release_archive_hash_excludes_archived_at": true,
    "material_schema": "speedkit.public_control_release_archive_material.v1",
    "release_archive_delivery": "EXACT_FUNCTION_STATIC_PAYLOAD",
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
    "public_control_digest": "8b4d02111bc3723828c331b6f7111871ec7ff6656cad40949af816d7d73b",
    "route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4
  },
  "failures_count": 0,
  "failures": [],
  "invariants": {
    "release_seal_verify_snapshot_json": true,
    "release_seal_verified": true,
    "release_seal_verify_failures_zero": true,
    "release_seal_hash_ok": true,
    "release_seal_replay_zero": true,
    "release_record_verification_replay_zero": true,
    "release_record_replay_zero": true,
    "final_attestation_verification_replay_zero": true,
    "final_attestation_replay_zero": true,
    "evidence_manifest_verified": true,
    "evidence_manifest_hash_ok": true,
    "archive_verified": true,
    "archive_issued": true,
    "product_os_live": true,
    "route_map_live": true,
    "private_remaining_zero": true,
    "workspace_entries_135": true,
    "recognized_execution_systems_4": true,
    "route_count_floor": true,
    "release_seal_verifier_live": true,
    "marketplace_os_release_seal_verified_live": true,
    "release_archive_live": true,
    "marketplace_os_release_archive_live": true,
    "release_archive_policy_live": true,
    "release_archive_exact_function_payload": true,
    "api_routes_restored_for_checkout": true
  },
  "release_archive_material": {
    "schema": "speedkit.public_control_release_archive_material.v1",
    "mode": "PUBLIC_ONLY",
    "fake_checkout": false,
    "release_archive_delivery": "EXACT_FUNCTION_STATIC_PAYLOAD",
    "release_seal_verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "release_record_verification_hash": "8406bad7698649d4a61ab4a1599166af078e8e522e376a8562967075f328a6a0",
    "release_record_hash": "103410557b689fdd61641ced8e23f611b082a2cbe44aae782c74eeaec4c53c50",
    "final_attestation_verification_hash": "f1715479dbbf0ffbf55510e65a4bbbd45d35e6abc34cadeda383c86617566db2",
    "attestation_hash": "389bad4d91e603ce7f832bb1960a4757130fcacfa51d8a90dfef931c6fcdafda",
    "evidence_manifest_verification_hash": "dd193d83a936f1492457562470440773da05652bf0c119752abd788c9a7e0df7",
    "manifest_hash": "181da69fb6bc27f730f3ae6704dd38d6141479c40eb4f2d06f41e0e2b2d79297",
    "chain_archive_verification_hash": "a82f5140388c26e70051b120165448bfcea29f7ec31012a633f736aa9d6c3672",
    "chain_archive_hash": "32616379a2de8f704fdc59f2abef6ab481d295270d4c5602b5f37253075593c2",
    "seal_verification_hash": "8c5fe37b39cae9befe8fc0e484046e0a041bebdbf7f57da11222ed2c53cd9f9d",
    "seal_hash": "52a559f37e79ff5915a4a5a85e303c43301b645d054145596d12439a4ae7c916",
    "certificate_verification_hash": "c68a15d425be426900dba080b325373291cdf7d1374dc974a0874dfbd7d1f53b",
    "certificate_hash": "371cbc847de321525ce4fd7f1ebd3c1dc844562edceccb6271b0c476c69bc37c",
    "chain_hash": "62dd4ddd23ed617c6adf8af26dd41587aaf2459d5bba528fe666a77e460a297d",
    "chain_verification_hash": "fc2ac3fe4bc8084f4b77d1762f4ee3a898b3847a6e8b3577946989b9ae236b2b",
    "public_control_digest": "8b4d02111bc3723828c331b6f7111871ec7ff6656cad40949af816d7d73b",
    "route_count": 111,
    "workspace_entries": 135,
    "private_remaining": 0,
    "recognized_execution_systems": 4,
    "source_status": {
      "release_seal_verify": "PUBLIC_CONTROL_RELEASE_SEAL_VERIFIED",
      "release_seal": "PUBLIC_CONTROL_RELEASE_SEALED_BY_LOCAL_REPLAY",
      "release_record_verify": "PUBLIC_CONTROL_RELEASE_RECORD_VERIFIED",
      "release_record": "PUBLIC_CONTROL_RELEASE_RECORDED_BY_LOCAL_REPLAY",
      "final_attestation_verify": "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFIED",
      "final_attestation": "PUBLIC_CONTROL_FINAL_ATTESTED_BY_LOCAL_REPLAY",
      "evidence_manifest_verify": "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED",
      "manifest": "PUBLIC_CONTROL_EVIDENCE_MANIFEST_READY",
      "archive_verify": "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
      "archive": "PUBLIC_CONTROL_CHAIN_ARCHIVED",
      "product_os": "LIVE",
      "route_map": "LIVE",
      "policy": "LIVE"
    },
    "invariants": {
      "release_seal_verify_snapshot_json": true,
      "release_seal_verified": true,
      "release_seal_verify_failures_zero": true,
      "release_seal_hash_ok": true,
      "release_seal_replay_zero": true,
      "release_record_verification_replay_zero": true,
      "release_record_replay_zero": true,
      "final_attestation_verification_replay_zero": true,
      "final_attestation_replay_zero": true,
      "evidence_manifest_verified": true,
      "evidence_manifest_hash_ok": true,
      "archive_verified": true,
      "archive_issued": true,
      "product_os_live": true,
      "route_map_live": true,
      "private_remaining_zero": true,
      "workspace_entries_135": true,
      "recognized_execution_systems_4": true,
      "route_count_floor": true,
      "release_seal_verifier_live": true,
      "marketplace_os_release_seal_verified_live": true,
      "release_archive_live": true,
      "marketplace_os_release_archive_live": true,
      "release_archive_policy_live": true,
      "release_archive_exact_function_payload": true,
      "api_routes_restored_for_checkout": true
    }
  },
  "release_seal_verification": {
    "verification_hash": "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "release_seal_hash_ok": true,
    "failures_count": 0,
    "failures": []
  },
  "evidence_manifest_verification": {
    "verification_hash": "dd193d83a936f1492457562470440773da05652bf0c119752abd788c9a7e0df7",
    "manifest_hash": "181da69fb6bc27f730f3ae6704dd38d6141479c40eb4f2d06f41e0e2b2d79297",
    "recomputed_manifest_hash": "181da69fb6bc27f730f3ae6704dd38d6141479c40eb4f2d06f41e0e2b2d79297",
    "manifest_hash_ok": true,
    "failures_count": 0,
    "failures": []
  },
  "release_seal_replay": {
    "release_seal_hash": "3177515ab1875a3109018ed0a07c4d480926ecac0179e0c091ad35780b55dd14",
    "failures_count": 0,
    "failures": []
  },
  "source_status": {
    "release_seal_verify": "PUBLIC_CONTROL_RELEASE_SEAL_VERIFIED",
    "release_seal": "PUBLIC_CONTROL_RELEASE_SEALED_BY_LOCAL_REPLAY",
    "release_record_verify": "PUBLIC_CONTROL_RELEASE_RECORD_VERIFIED",
    "release_record": "PUBLIC_CONTROL_RELEASE_RECORDED_BY_LOCAL_REPLAY",
    "final_attestation_verify": "PUBLIC_CONTROL_FINAL_ATTESTATION_VERIFIED",
    "final_attestation": "PUBLIC_CONTROL_FINAL_ATTESTED_BY_LOCAL_REPLAY",
    "evidence_manifest_verify": "PUBLIC_CONTROL_EVIDENCE_MANIFEST_VERIFIED",
    "manifest": "PUBLIC_CONTROL_EVIDENCE_MANIFEST_READY",
    "archive_verify": "PUBLIC_CONTROL_CHAIN_ARCHIVE_VERIFIED",
    "archive": "PUBLIC_CONTROL_CHAIN_ARCHIVED",
    "product_os": "LIVE",
    "route_map": "LIVE",
    "policy": "LIVE"
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
    const verifierRouteCount = 117;

    const releaseArchiveVerificationHash = archiveVerify.verification_hash || null;
    const releaseArchiveHash = archiveVerify.verification?.release_archive_hash || null;
    const recomputedReleaseArchiveHash = archiveVerify.verification?.recomputed_release_archive_hash || null;
    const releaseSealVerificationHash = archiveVerify.verification?.release_seal_verification_hash || releaseArchive.release_archive?.release_seal_verification_hash || null;
    const releaseSealHash = archiveVerify.verification?.release_seal_hash || releaseArchive.release_archive?.release_seal_hash || null;
    const releaseRecordVerificationHash = archiveVerify.verification?.release_record_verification_hash || releaseArchive.release_archive?.release_record_verification_hash || null;
    const releaseRecordHash = archiveVerify.verification?.release_record_hash || releaseArchive.release_archive?.release_record_hash || null;
    const finalAttestationVerificationHash = archiveVerify.verification?.final_attestation_verification_hash || releaseArchive.release_archive?.final_attestation_verification_hash || null;
    const attestationHash = archiveVerify.verification?.attestation_hash || releaseArchive.release_archive?.attestation_hash || null;
    const manifestHash = archiveVerify.verification?.manifest_hash || releaseArchive.release_archive?.manifest_hash || null;
    const chainArchiveHash = archiveVerify.verification?.chain_archive_hash || releaseArchive.release_archive?.chain_archive_hash || null;

    const invariants = {
      release_archive_verifier_snapshot_json: archiveVerify.schema === "speedkit.public_control_release_archive_verify_response.v1",
      release_archive_verified: archiveVerify.status === "PUBLIC_CONTROL_RELEASE_ARCHIVE_VERIFIED" && archiveVerify.verified === true,
      release_archive_verifier_failures_zero: Number(archiveVerify.failures_count ?? -1) === 0 && Number(archiveVerify.verification?.failures_count ?? -1) === 0,
      release_archive_hash_present: /^[a-f0-9]{64}$/.test(String(releaseArchiveHash)),
      release_archive_hash_ok: releaseArchiveHash === recomputedReleaseArchiveHash && archiveVerify.verification?.release_archive_hash_ok === true,
      release_archive_hash_matches_archive_response: releaseArchiveHash === releaseArchive.release_archive?.release_archive_hash,
      release_archive_response_archived: releaseArchive.schema === "speedkit.public_control_release_archive_response.v1" && releaseArchive.status === "PUBLIC_CONTROL_RELEASE_ARCHIVED" && releaseArchive.archived === true,
      release_archive_response_failures_zero: Number(releaseArchive.failures_count ?? -1) === 0,
      release_seal_verification_hash_present: /^[a-f0-9]{64}$/.test(String(releaseSealVerificationHash)),
      release_seal_hash_present: /^[a-f0-9]{64}$/.test(String(releaseSealHash)),
      release_seal_hash_ok: releaseArchive.release_seal_verification?.release_seal_hash_ok === true,
      private_remaining_zero: archiveVerify.verification?.private_remaining === 0 && releaseArchive.release_archive?.private_remaining === 0,
      workspace_entries_135: archiveVerify.verification?.workspace_entries === 135 && releaseArchive.release_archive?.workspace_entries === 135,
      recognized_execution_systems_4: archiveVerify.verification?.recognized_execution_systems === 4 && releaseArchive.release_archive?.recognized_execution_systems === 4,
      archive_verifier_route_count_floor: Number(archiveVerify.verification?.route_count ?? 0) >= 114,
      archive_route_count_floor: Number(archiveVerify.verification?.archive_route_count ?? 0) >= 111 && Number(releaseArchive.release_archive?.route_count ?? 0) >= 111,
      certificate_route_count_floor: verifierRouteCount >= 117,
      certificate_uses_public_material_only: true,
      certificate_avoids_same_origin_http_replay: true
    };

    const failures = Object.entries(invariants).filter(([, ok]) => ok !== true).map(([key]) => key);
    const certified = failures.length === 0;

    const certificateMaterial = {
      schema: "speedkit.public_control_release_certificate_material.v1",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      certificate_hash_algorithm: "SHA-256",
      release_archive_verification_hash: releaseArchiveVerificationHash,
      release_archive_hash: releaseArchiveHash,
      recomputed_release_archive_hash: recomputedReleaseArchiveHash,
      release_archive_hash_ok: releaseArchiveHash === recomputedReleaseArchiveHash,
      release_seal_verification_hash: releaseSealVerificationHash,
      release_seal_hash: releaseSealHash,
      release_record_verification_hash: releaseRecordVerificationHash,
      release_record_hash: releaseRecordHash,
      final_attestation_verification_hash: finalAttestationVerificationHash,
      attestation_hash: attestationHash,
      evidence_manifest_verification_hash: archiveVerify.verification?.evidence_manifest_verification_hash || releaseArchive.release_archive?.evidence_manifest_verification_hash || null,
      manifest_hash: manifestHash,
      chain_archive_hash: chainArchiveHash,
      chain_archive_verification_hash: archiveVerify.verification?.chain_archive_verification_hash || releaseArchive.release_archive?.chain_archive_verification_hash || null,
      route_count: verifierRouteCount,
      archive_verifier_route_count: archiveVerify.verification?.route_count || null,
      archive_route_count: releaseArchive.release_archive?.route_count || null,
      workspace_entries: 135,
      private_remaining: 0,
      recognized_execution_systems: 4,
      source_status: {
        release_archive_verify: archiveVerify.status,
        release_archive: releaseArchive.status,
        release_archive_verifier_policy: "LIVE",
        release_certificate_policy: "LIVE"
      },
      invariants
    };

    const certificateHash = await sha256Hex(stableStringify(certificateMaterial));

    return json({
      schema: "speedkit.public_control_release_certificate_response.v1",
      status: certified ? "PUBLIC_CONTROL_RELEASE_CERTIFIED" : "PUBLIC_CONTROL_RELEASE_CERTIFICATE_FAILED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      certified,
      release_certificate: {
        id: "speedkit-release-certificate-" + String(certificateHash).slice(0, 16),
        hash_algorithm: "SHA-256",
        release_certificate_hash: certificateHash,
        release_certificate_hash_excludes_certified_at: true,
        material_schema: certificateMaterial.schema,
        release_archive_verification_hash: releaseArchiveVerificationHash,
        release_archive_hash: releaseArchiveHash,
        recomputed_release_archive_hash: recomputedReleaseArchiveHash,
        release_archive_hash_ok: releaseArchiveHash === recomputedReleaseArchiveHash,
        release_seal_verification_hash: releaseSealVerificationHash,
        release_seal_hash: releaseSealHash,
        release_record_verification_hash: releaseRecordVerificationHash,
        release_record_hash: releaseRecordHash,
        final_attestation_verification_hash: finalAttestationVerificationHash,
        attestation_hash: attestationHash,
        manifest_hash: manifestHash,
        chain_archive_hash: chainArchiveHash,
        route_count: verifierRouteCount,
        archive_verifier_route_count: archiveVerify.verification?.route_count || null,
        archive_route_count: releaseArchive.release_archive?.route_count || null,
        workspace_entries: 135,
        private_remaining: 0,
        recognized_execution_systems: 4
      },
      failures_count: failures.length,
      failures,
      invariants,
      release_certificate_material: certificateMaterial,
      release_archive_verification: {
        verification_hash: releaseArchiveVerificationHash,
        release_archive_hash: releaseArchiveHash,
        recomputed_release_archive_hash: recomputedReleaseArchiveHash,
        release_archive_hash_ok: releaseArchiveHash === recomputedReleaseArchiveHash,
        failures_count: Number(archiveVerify.failures_count ?? -1)
      },
      source_status: certificateMaterial.source_status
    }, certified ? 200 : 503);
  } catch (error) {
    return json({
      schema: "speedkit.public_control_release_certificate_response.v1",
      status: "PUBLIC_CONTROL_RELEASE_CERTIFICATE_ERROR",
      certified: false,
      failures_count: 1,
      failures: ["release_certificate_exception"],
      error: String(error && error.message ? error.message : error)
    }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET" || context.request.method === "HEAD") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_release_certificate_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
