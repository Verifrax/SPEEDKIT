
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
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({
    schema: "speedkit.fetch_response.v1",
    status: "JSON_PARSE_FAILED"
  }));
  return { ok: response.ok, http_status: response.status, payload };
}

function liveStateValue(os, key) {
  return os && os.live_state ? os.live_state[key] : undefined;
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const origin = url.origin;

  const [digestResult, receiptResult, verifyResult, closureResult, productOsResult, routeMapResult, policyResult] = await Promise.all([
    fetchJson(origin + "/api/marketplace/control-digest?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-receipt?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-receipt-verify?t=" + Date.now()),
    fetchJson(origin + "/api/marketplace/control-closure?t=" + Date.now()),
    fetchJson(origin + "/marketplace/product-os.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/route-map.json?t=" + Date.now()),
    fetchJson(origin + "/marketplace/control-chain-index-policy.json?t=" + Date.now())
  ]);

  const digest = digestResult.payload || {};
  const receipt = receiptResult.payload || {};
  const verify = verifyResult.payload || {};
  const closure = closureResult.payload || {};
  const os = productOsResult.payload || {};
  const route = routeMapResult.payload || {};
  const policy = policyResult.payload || {};

  const receiptObj = receipt.receipt || {};
  const verifyObj = verify.verification || {};
  const digestObj = digest.digest || {};
  const routeCount = Number(route.route_count ?? closure.route_count ?? receiptObj.route_count ?? 0);

  const chainNodes = [
    {
      id: "public_control_digest",
      route: "/api/marketplace/control-digest",
      status: digest.status,
      hash: digestObj.value || null,
      accepted: digest.status === "PUBLIC_CONTROL_DIGEST_READY" && digest.degraded_count === 0
    },
    {
      id: "public_control_receipt",
      route: "/api/marketplace/control-receipt",
      status: receipt.status,
      hash: receiptObj.receipt_hash || null,
      digest: receiptObj.public_control_digest || null,
      accepted: receipt.status === "PUBLIC_CONTROL_RECEIPT_ISSUED" && receipt.ready === true
    },
    {
      id: "public_control_receipt_verifier",
      route: "/api/marketplace/control-receipt-verify",
      status: verify.status,
      hash: verify.verification_hash || null,
      receipt_hash: verifyObj.receipt_hash || null,
      recomputed_receipt_hash: verifyObj.recomputed_receipt_hash || null,
      accepted: verify.status === "PUBLIC_CONTROL_RECEIPT_VERIFIED" && verify.verified === true && verifyObj.receipt_hash_ok === true && verifyObj.digest_match === true
    },
    {
      id: "control_closure",
      route: "/api/marketplace/control-closure",
      status: closure.status,
      route_count: closure.route_count,
      accepted: closure.status === "CONTROL_CLOSURE_READY"
    },
    {
      id: "product_os",
      route: "/marketplace/product-os.json",
      status: os.status,
      live_state: os.live_state || {},
      accepted: os.status === "LIVE"
    },
    {
      id: "route_map",
      route: "/marketplace/route-map.json",
      status: route.status,
      route_count: route.route_count,
      accepted: route.status === "LIVE"
    }
  ];

  const invariants = {
    digest_ready: digest.status === "PUBLIC_CONTROL_DIGEST_READY" && digest.degraded_count === 0,
    receipt_issued: receipt.status === "PUBLIC_CONTROL_RECEIPT_ISSUED" && receipt.ready === true,
    receipt_verified: verify.status === "PUBLIC_CONTROL_RECEIPT_VERIFIED" && verify.verified === true,
    receipt_hash_ok: verifyObj.receipt_hash_ok === true,
    digest_match: verifyObj.digest_match === true,
    control_closure_ready: closure.status === "CONTROL_CLOSURE_READY",
    product_os_live: os.status === "LIVE",
    route_map_live: route.status === "LIVE",
    private_remaining_zero: Number(liveStateValue(os, "private_remaining") ?? -1) === 0 && receiptObj.private_remaining === 0,
    workspace_entries_135: Number(liveStateValue(os, "workspace_entries") ?? 0) === 135 && receiptObj.workspace_entries === 135,
    recognized_execution_systems_4: Number(liveStateValue(os, "recognized_execution_systems") ?? 0) === 4 && receiptObj.recognized_execution_systems === 4,
    route_count_floor: routeCount >= 60,
    marketplace_os_receipt_live: liveStateValue(os, "marketplace_os_receipt") === "LIVE",
    receipt_external_replay_live: liveStateValue(os, "receipt_external_replay") === "LIVE",
    chain_index_policy_live: policy.status === "LIVE"
  };

  const failures = Object.entries(invariants)
    .filter(([, ok]) => ok !== true)
    .map(([key]) => key);

  const chainMaterial = {
    schema: "speedkit.public_control_chain_index_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    private_repository_access_included: false,
    chain_nodes: chainNodes.map(node => ({
      id: node.id,
      route: node.route,
      status: node.status,
      accepted: node.accepted,
      hash: node.hash || null,
      digest: node.digest || null,
      receipt_hash: node.receipt_hash || null,
      recomputed_receipt_hash: node.recomputed_receipt_hash || null,
      route_count: node.route_count || null
    })),
    invariants,
    counts: {
      route_count: routeCount,
      workspace_entries: Number(liveStateValue(os, "workspace_entries") ?? receiptObj.workspace_entries ?? 0),
      private_remaining: Number(liveStateValue(os, "private_remaining") ?? receiptObj.private_remaining ?? -1),
      recognized_execution_systems: Number(liveStateValue(os, "recognized_execution_systems") ?? receiptObj.recognized_execution_systems ?? 0)
    },
    hashes: {
      public_control_digest: digestObj.value || null,
      public_control_receipt_hash: receiptObj.receipt_hash || null,
      public_control_receipt_verification_hash: verify.verification_hash || null
    }
  };

  const chainHash = await sha256Hex(stableStringify(chainMaterial));
  const ready = failures.length === 0 && chainNodes.every(node => node.accepted === true);

  return json({
    schema: "speedkit.public_control_chain_index_response.v1",
    status: ready ? "PUBLIC_CONTROL_CHAIN_INDEX_READY" : "PUBLIC_CONTROL_CHAIN_INDEX_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    ready,
    chain: {
      hash_algorithm: "SHA-256",
      chain_hash: chainHash,
      material_schema: chainMaterial.schema,
      node_count: chainNodes.length,
      route_count: routeCount,
      workspace_entries: chainMaterial.counts.workspace_entries,
      private_remaining: chainMaterial.counts.private_remaining,
      recognized_execution_systems: chainMaterial.counts.recognized_execution_systems,
      public_control_digest: digestObj.value || null,
      public_control_receipt_hash: receiptObj.receipt_hash || null,
      public_control_receipt_verification_hash: verify.verification_hash || null
    },
    failures_count: failures.length,
    failures,
    invariants,
    chain_nodes: chainMaterial.chain_nodes,
    chain_material: chainMaterial,
    source_status: {
      digest: digest.status,
      receipt: receipt.status,
      verifier: verify.status,
      closure: closure.status,
      product_os: os.status,
      route_map: route.status,
      policy: policy.status
    },
    authorities: {
      digest: "/api/marketplace/control-digest",
      receipt: "/api/marketplace/control-receipt",
      verifier: "/api/marketplace/control-receipt-verify",
      closure: "/api/marketplace/control-closure",
      product_os: "/marketplace/product-os.json",
      route_map: "/marketplace/route-map.json",
      policy: "/marketplace/control-chain-index-policy.json"
    }
  }, ready ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_chain_index_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
