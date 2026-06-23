
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

function pickSurface(id, payload) {
  if (!payload || typeof payload !== "object") return payload;

  if (id === "product_os") {
    return {
      schema: payload.schema,
      status: payload.status,
      live_state: payload.live_state || {},
      control_fields: {
        product_os: payload.status,
        access_policy_status: payload.access_policy_status,
        usage_metering_status: payload.usage_metering_status,
        usage_ledger_status: payload.usage_ledger_status,
        quota_enforcement_status: payload.quota_enforcement_status,
        ledger_verification_status: payload.ledger_verification_status,
        entitlement_usage_status: payload.entitlement_usage_status,
        buyer_control_status: payload.buyer_control_status,
        control_closure_status: payload.control_closure_status,
        public_control_digest_status: payload.public_control_digest_status
      }
    };
  }

  if (id === "route_map") {
    return {
      schema: payload.schema,
      status: payload.status,
      route_count: payload.route_count,
      routes: payload.routes || [],
      statuses: {
        usage_ledger_routes_status: payload.usage_ledger_routes_status,
        quota_enforcement_routes_status: payload.quota_enforcement_routes_status,
        ledger_verification_routes_status: payload.ledger_verification_routes_status,
        entitlement_usage_routes_status: payload.entitlement_usage_routes_status,
        buyer_control_routes_status: payload.buyer_control_routes_status,
        control_closure_routes_status: payload.control_closure_routes_status,
        public_control_digest_routes_status: payload.public_control_digest_routes_status
      }
    };
  }

  if (id === "marketplace_control") {
    return {
      schema: payload.schema,
      status: payload.status,
      mode: payload.mode,
      fake_checkout: payload.fake_checkout,
      control_state: payload.control_state || {}
    };
  }

  if (id === "runtime") {
    return {
      schema: payload.schema,
      status: payload.status,
      fake_checkout: payload.fake_checkout,
      provider: payload.provider,
      configured: payload.configured || {}
    };
  }

  if (id === "control_closure") {
    return {
      schema: payload.schema,
      status: payload.status,
      closure: payload.closure || {},
      route_count: payload.route_count,
      buyer_path_stages: payload.buyer_path_stages,
      control_state: payload.control_state || {},
      live_state: payload.live_state || {}
    };
  }

  return payload;
}

function acceptedStatus(status) {
  return [
    "LIVE",
    "COMMERCE_READY",
    "PRODUCT_CONTROL_OS_READY",
    "CONTROL_CLOSURE_READY"
  ].includes(status);
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const origin = url.origin;

  const specs = [
    { id: "product_os", route: "/marketplace/product-os.json" },
    { id: "route_map", route: "/marketplace/route-map.json" },
    { id: "control_closure_policy", route: "/marketplace/control-closure-policy.json" },
    { id: "buyer_control_policy", route: "/marketplace/buyer-control-policy.json" },
    { id: "entitlement_usage_policy", route: "/marketplace/entitlement-usage-policy.json" },
    { id: "quota_policy", route: "/marketplace/quota-policy.json" },
    { id: "ledger_verify_policy", route: "/marketplace/ledger-verify.json" },
    { id: "usage_ledger_policy", route: "/marketplace/usage-ledger.json" },
    { id: "usage_policy", route: "/marketplace/usage-policy.json" },
    { id: "access_policy", route: "/marketplace/access-policy.json" },
    { id: "capabilities", route: "/marketplace/capabilities.json" },
    { id: "commerce_control", route: "/marketplace/commerce-control.json" },
    { id: "marketplace", route: "/marketplace.json" },
    { id: "runtime", route: "/api/marketplace/runtime" },
    { id: "marketplace_control", route: "/api/marketplace/control" },
    { id: "control_closure", route: "/api/marketplace/control-closure" }
  ];

  const surfaces = [];

  for (const spec of specs) {
    const fetched = await fetchJson(origin + spec.route + "?t=" + Date.now());
    const selected = pickSurface(spec.id, fetched.payload);
    const surfaceHash = await sha256Hex(stableStringify(selected));
    surfaces.push({
      id: spec.id,
      route: spec.route,
      http_status: fetched.http_status,
      ok: fetched.ok,
      schema: fetched.payload ? fetched.payload.schema : null,
      status: fetched.payload ? fetched.payload.status : null,
      accepted: fetched.ok && acceptedStatus(fetched.payload ? fetched.payload.status : null),
      surface_hash: surfaceHash,
      material: selected
    });
  }

  const material = {
    schema: "speedkit.public_control_digest_material.v1",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    digest_algorithm: "SHA-256",
    private_repository_access_included: false,
    surface_count: surfaces.length,
    surfaces: surfaces.map(s => ({
      id: s.id,
      route: s.route,
      schema: s.schema,
      status: s.status,
      surface_hash: s.surface_hash,
      material: s.material
    }))
  };

  const digest = await sha256Hex(stableStringify(material));
  const degraded = surfaces.filter(s => !s.accepted);

  return json({
    schema: "speedkit.public_control_digest_response.v1",
    status: degraded.length === 0 ? "PUBLIC_CONTROL_DIGEST_READY" : "PUBLIC_CONTROL_DIGEST_DEGRADED",
    mode: "PUBLIC_ONLY",
    fake_checkout: false,
    digest: {
      algorithm: "SHA-256",
      value: digest,
      material_schema: material.schema,
      surface_count: surfaces.length
    },
    degraded_count: degraded.length,
    degraded_surfaces: degraded.map(s => ({
      id: s.id,
      route: s.route,
      http_status: s.http_status,
      status: s.status
    })),
    surfaces: surfaces.map(s => ({
      id: s.id,
      route: s.route,
      http_status: s.http_status,
      schema: s.schema,
      status: s.status,
      accepted: s.accepted,
      surface_hash: s.surface_hash
    })),
    material
  }, degraded.length === 0 ? 200 : 503);
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({
    schema: "speedkit.public_control_digest_response.v1",
    status: "METHOD_NOT_ALLOWED"
  }, 405);
}
