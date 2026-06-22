(() => {
  const input = document.getElementById("speedkit-session-id");
  const button = document.getElementById("speedkit-entitlement-check");
  const output = document.getElementById("speedkit-entitlement-output");

  async function readJson(url) {
    const response = await fetch(url);
    return response.json();
  }

  async function verify() {
    const sessionId = String(input.value || "").trim();
    if (!sessionId) {
      output.textContent = JSON.stringify({ status: "SESSION_ID_REQUIRED" }, null, 2);
      return;
    }

    button.disabled = true;
    button.textContent = "Verifying...";

    try {
      const session = await readJson("/api/marketplace/session?session_id=" + encodeURIComponent(sessionId));
      const reconcile = await readJson("/api/marketplace/entitlement-reconcile?session_id=" + encodeURIComponent(sessionId));
      const entitlement = await readJson("/api/marketplace/entitlement?session_id=" + encodeURIComponent(sessionId));
      const receipt = await readJson("/api/marketplace/receipt?session_id=" + encodeURIComponent(sessionId));

      output.textContent = JSON.stringify({
        schema: "speedkit.entitlement_lookup_bundle.v1",
        session_id: sessionId,
        session,
        reconcile,
        entitlement,
        receipt
      }, null, 2);
    } catch (error) {
      output.textContent = JSON.stringify({
        status: "ENTITLEMENT_LOOKUP_ERROR",
        error: String(error && error.message ? error.message : error)
      }, null, 2);
    } finally {
      button.disabled = false;
      button.textContent = "Verify entitlement";
    }
  }

  button.addEventListener("click", verify);
})();
