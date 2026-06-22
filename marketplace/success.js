(() => {
  const status = document.getElementById("speedkit-success-status");
  const proof = document.getElementById("speedkit-entitlement-proof");
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  if (!sessionId) {
    status.textContent = "No session_id in URL yet. Stripe must return with session_id after checkout.";
    proof.textContent = JSON.stringify({ status: "NO_SESSION_ID" }, null, 2);
    return;
  }

  status.textContent = "Reading entitlement for " + sessionId;

  fetch("/api/marketplace/entitlement?session_id=" + encodeURIComponent(sessionId))
    .then(r => r.json())
    .then(j => {
      status.textContent = j.status || "ENTITLEMENT_RESPONSE";
      proof.textContent = JSON.stringify(j, null, 2);
    })
    .catch(err => {
      status.textContent = "ENTITLEMENT_READ_ERROR";
      proof.textContent = JSON.stringify({ error: String(err && err.message ? err.message : err) }, null, 2);
    });
})();
