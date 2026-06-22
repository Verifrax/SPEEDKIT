(() => {
  async function startCheckout(button) {
    const plan = button.getAttribute("data-plan") || "starter";
    const offerId = button.getAttribute("data-offer-id") || "offer-wsp-001";
    const original = button.textContent;

    button.disabled = true;
    button.textContent = "Opening Stripe Checkout...";

    try {
      const response = await fetch("/api/marketplace/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, offer_id: offerId })
      });

      const payload = await response.json();

      if (payload.status === "CHECKOUT_SESSION_CREATED" && payload.checkout_url) {
        window.location.href = payload.checkout_url;
        return;
      }

      button.textContent = "Checkout blocked";
      alert("SPEEDKIT checkout did not open:\n" + JSON.stringify(payload, null, 2));
    } catch (error) {
      button.textContent = "Checkout error";
      alert("SPEEDKIT checkout error:\n" + String(error && error.message ? error.message : error));
    } finally {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = original;
      }, 3000);
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-speedkit-checkout]");
    if (!button) return;
    event.preventDefault();
    startCheckout(button);
  });
})();
