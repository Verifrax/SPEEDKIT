import * as MarketplaceRouter from "./[[path]].js";

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function onRequest(context) {
  if (MarketplaceRouter.onRequest) {
    return MarketplaceRouter.onRequest(context);
  }

  return json({
    schema: "speedkit.checkout_response.v1",
    status: "CHECKOUT_ROUTER_NOT_EXPORTED",
    fake_checkout: false,
    provider: "stripe_checkout"
  }, 500);
}

export async function onRequestGet(context) {
  return onRequest(context);
}

export async function onRequestPost(context) {
  return onRequest(context);
}
