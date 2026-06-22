(() => {
  const status = document.getElementById("speedkit-success-status");
  const proof = document.getElementById("speedkit-entitlement-proof");
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  function setProof(label, payload) {
    status.textContent = label;
    proof.textContent = JSON.stringify(payload, null, 2);
  }

  if (!sessionId) {
    setProof("NO_SESSION_ID", {
      schema: "speedkit.success_page.v1",
      status: "NO_SESSION_ID",
      instruction: "Stripe must return with ?session_id={CHECKOUT_SESSION_ID}."
    });
    return;
  }

  async function run() {
    setProof("READING_STRIPE_SESSION", { session_id: sessionId });

    const session = await fetch("/api/marketplace/session?session_id=" + encodeURIComponent(sessionId))
      .then(r => r.json());

    if (session.status !== "SESSION_RETRIEVED") {
      setProof("SESSION_READ_FAILED", session);
      return;
    }

    const reconcile = await fetch("/api/marketplace/entitlement-reconcile?session_id=" + encodeURIComponent(sessionId))
      .then(r => r.json());

    const entitlement = await fetch("/api/marketplace/entitlement?session_id=" + encodeURIComponent(sessionId))
      .then(r => r.json())
      .catch(error => ({ status: "ENTITLEMENT_READ_ERROR", error: String(error && error.message ? error.message : error) }));

    const receipt = await fetch("/api/marketplace/receipt?session_id=" + encodeURIComponent(sessionId))
      .then(r => r.json())
      .catch(error => ({ status: "RECEIPT_READ_ERROR", error: String(error && error.message ? error.message : error) }));

    setProof(reconcile.status || "ENTITLEMENT_PROOF_RESPONSE", {
      schema: "speedkit.success_entitlement_bundle.v1",
      session_id: sessionId,
      session,
      reconcile,
      entitlement,
      receipt
    });
  }

  run().catch(error => {
    setProof("SUCCESS_PAGE_ERROR", {
      status: "SUCCESS_PAGE_ERROR",
      error: String(error && error.message ? error.message : error)
    });
  });
})();
