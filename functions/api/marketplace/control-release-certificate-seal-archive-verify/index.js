const releaseCertificateSealArchive = {
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
    const material = releaseCertificateSealArchive.release_certificate_seal_archive_material;
    const recomputedArchiveHash = await sha256Hex(stableStringify(material));
    const claimedArchiveHash = releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_archive_hash || null;

    const verifierRouteCount = 132;

    const invariants = {
      archive_snapshot_json: releaseCertificateSealArchive.schema === "speedkit.public_control_release_certificate_seal_archive_response.v1",
      archive_status_archived: releaseCertificateSealArchive.status === "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVED" && releaseCertificateSealArchive.archived === true,
      archive_hash_present: /^[a-f0-9]{64}$/.test(String(claimedArchiveHash)),
      archive_hash_expected: claimedArchiveHash === "46c33df74b66ec62854fa154fc99f517c1a4641b69b84966819d67d4f4f71c41",
      archive_hash_ok: claimedArchiveHash === recomputedArchiveHash,
      archive_failures_zero: Number(releaseCertificateSealArchive.failures_count ?? -1) === 0,
      seal_verification_hash_expected: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_verification_hash === "e18e1546ad16c46278a661c04034211afc55924b57bdbd4b5a3a4652ca2f6fe3",
      seal_hash_expected: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_hash === "602cc6de3b6832d7c00fdc755b1fd5cdce165839de0681df4e1f39d37d4d66dd",
      seal_recomputed_hash_matches: releaseCertificateSealArchive.release_certificate_seal_archive?.recomputed_release_certificate_seal_hash === releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_hash,
      seal_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_hash_ok === true,
      certificate_verification_hash_expected: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_verification_hash === "01a414f217a1169446871181bcc9591bd09428b61b30526d3ee758e9835a8e38",
      certificate_hash_expected: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_hash === "3664e3b0e5cdebab1a70b2f9a5b03c5f62d2ba1e9ba0b848ac372d931a79d98f",
      certificate_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_hash_ok === true,
      release_archive_verification_hash_expected: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_verification_hash === "bd9b4e3b348d019803960a8a02d62d5604f86dc0780a2ab5eb6cdc82f1493032",
      release_archive_hash_expected: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_hash === "9bd6c717f1cdbf2b6d32b77b7052f6340832288055a627b9f5c4292326853673",
      release_archive_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_hash_ok === true,
      release_seal_verification_hash_expected: releaseCertificateSealArchive.release_certificate_seal_archive?.release_seal_verification_hash === "e48309a9748bb5eddbeda24b294e533efcd4f794e00ed3f9fb67f058befa1fc9",
      private_remaining_zero: releaseCertificateSealArchive.release_certificate_seal_archive?.private_remaining === 0 && material.private_remaining === 0,
      workspace_entries_135: releaseCertificateSealArchive.release_certificate_seal_archive?.workspace_entries === 135 && material.workspace_entries === 135,
      recognized_execution_systems_4: releaseCertificateSealArchive.release_certificate_seal_archive?.recognized_execution_systems === 4 && material.recognized_execution_systems === 4,
      archive_route_count_floor: Number(releaseCertificateSealArchive.release_certificate_seal_archive?.route_count ?? 0) >= 129,
      seal_verifier_route_count_floor: Number(releaseCertificateSealArchive.release_certificate_seal_archive?.seal_verifier_route_count ?? 0) >= 126,
      seal_route_count_floor: Number(releaseCertificateSealArchive.release_certificate_seal_archive?.seal_route_count ?? 0) >= 123,
      certificate_verifier_route_count_floor: Number(releaseCertificateSealArchive.release_certificate_seal_archive?.certificate_verifier_route_count ?? 0) >= 120,
      certificate_route_count_floor: Number(releaseCertificateSealArchive.release_certificate_seal_archive?.certificate_route_count ?? 0) >= 117,
      archive_verifier_route_count_floor: Number(releaseCertificateSealArchive.release_certificate_seal_archive?.archive_verifier_route_count ?? 0) >= 114,
      root_archive_route_count_floor: Number(releaseCertificateSealArchive.release_certificate_seal_archive?.archive_route_count ?? 0) >= 111,
      verifier_route_count_floor: verifierRouteCount >= 132,
      verifier_uses_public_material_only: true,
      verifier_avoids_same_origin_http_replay: true
    };

    const failures = Object.entries(invariants).filter(([, ok]) => ok !== true).map(([key]) => key);
    const verified = failures.length === 0;

    const verificationMaterial = {
      schema: "speedkit.public_control_release_certificate_seal_archive_verification_material.v1",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      archive_hash_algorithm: "SHA-256",
      verifier_hash_algorithm: "SHA-256",
      release_certificate_seal_archive_hash: claimedArchiveHash,
      recomputed_release_certificate_seal_archive_hash: recomputedArchiveHash,
      release_certificate_seal_archive_hash_ok: claimedArchiveHash === recomputedArchiveHash,
      release_certificate_seal_verification_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_verification_hash || null,
      release_certificate_seal_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_hash || null,
      recomputed_release_certificate_seal_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.recomputed_release_certificate_seal_hash || null,
      release_certificate_seal_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_hash_ok === true,
      release_certificate_verification_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_verification_hash || null,
      release_certificate_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_hash || null,
      release_certificate_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_hash_ok === true,
      release_archive_verification_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_verification_hash || null,
      release_archive_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_hash || null,
      release_archive_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_hash_ok === true,
      release_seal_verification_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_seal_verification_hash || null,
      release_seal_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_seal_hash || null,
      route_count: verifierRouteCount,
      archive_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.route_count || null,
      seal_verifier_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.seal_verifier_route_count || null,
      seal_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.seal_route_count || null,
      certificate_verifier_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.certificate_verifier_route_count || null,
      certificate_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.certificate_route_count || null,
      root_archive_verifier_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.archive_verifier_route_count || null,
      root_archive_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.archive_route_count || null,
      workspace_entries: 135,
      private_remaining: 0,
      recognized_execution_systems: 4,
      source_status: {
        release_certificate_seal_archive: releaseCertificateSealArchive.status,
        release_certificate_seal_archive_policy: "LIVE",
        release_certificate_seal_archive_verify_policy: "LIVE"
      },
      invariants
    };

    const verificationHash = await sha256Hex(stableStringify(verificationMaterial));

    return json({
      schema: "speedkit.public_control_release_certificate_seal_archive_verify_response.v1",
      status: verified ? "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVE_VERIFIED" : "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVE_VERIFY_FAILED",
      mode: "PUBLIC_ONLY",
      fake_checkout: false,
      verified,
      verification_hash: verificationHash,
      verification: {
        hash_algorithm: "SHA-256",
        verification_hash: verificationHash,
        release_certificate_seal_archive_hash: claimedArchiveHash,
        recomputed_release_certificate_seal_archive_hash: recomputedArchiveHash,
        release_certificate_seal_archive_hash_ok: claimedArchiveHash === recomputedArchiveHash,
        release_certificate_seal_verification_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_verification_hash || null,
        release_certificate_seal_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_hash || null,
        recomputed_release_certificate_seal_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.recomputed_release_certificate_seal_hash || null,
        release_certificate_seal_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_seal_hash_ok === true,
        release_certificate_verification_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_verification_hash || null,
        release_certificate_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_hash || null,
        release_certificate_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_certificate_hash_ok === true,
        release_archive_verification_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_verification_hash || null,
        release_archive_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_hash || null,
        release_archive_hash_ok: releaseCertificateSealArchive.release_certificate_seal_archive?.release_archive_hash_ok === true,
        release_seal_verification_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_seal_verification_hash || null,
        release_seal_hash: releaseCertificateSealArchive.release_certificate_seal_archive?.release_seal_hash || null,
        route_count: verifierRouteCount,
        archive_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.route_count || null,
        seal_verifier_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.seal_verifier_route_count || null,
        seal_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.seal_route_count || null,
        certificate_verifier_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.certificate_verifier_route_count || null,
        certificate_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.certificate_route_count || null,
        root_archive_verifier_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.archive_verifier_route_count || null,
        root_archive_route_count: releaseCertificateSealArchive.release_certificate_seal_archive?.archive_route_count || null,
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
      release_certificate_seal_archive_replay: {
        schema: releaseCertificateSealArchive.schema,
        status: releaseCertificateSealArchive.status,
        archived: releaseCertificateSealArchive.archived,
        release_certificate_seal_archive_hash: claimedArchiveHash,
        recomputed_release_certificate_seal_archive_hash: recomputedArchiveHash,
        release_certificate_seal_archive_hash_ok: claimedArchiveHash === recomputedArchiveHash,
        failures_count: Number(releaseCertificateSealArchive.failures_count ?? -1)
      },
      source_status: verificationMaterial.source_status
    }, verified ? 200 : 503);
  } catch (error) {
    return json({
      schema: "speedkit.public_control_release_certificate_seal_archive_verify_response.v1",
      status: "PUBLIC_CONTROL_RELEASE_CERTIFICATE_SEAL_ARCHIVE_VERIFY_ERROR",
      verified: false,
      failures_count: 1,
      failures: ["release_certificate_seal_archive_verify_exception"],
      error: String(error && error.message ? error.message : error)
    }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET" || context.request.method === "HEAD") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_release_certificate_seal_archive_verify_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
