import * as CheckoutApi from "../checkout.js";

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
  if (CheckoutApi.onRequest) return CheckoutApi.onRequest(context);
  if (context.request.method === "POST" && CheckoutApi.onRequestPost) return CheckoutApi.onRequestPost(context);
  if (context.request.method === "GET" && CheckoutApi.onRequestGet) return CheckoutApi.onRequestGet(context);
  return json({
    schema: "speedkit.checkout_response.v1",
    status: "CHECKOUT_HANDLER_NOT_EXPORTED",
    fake_checkout: false
  }, 500);
}
