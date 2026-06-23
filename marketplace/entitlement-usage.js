(() => {
  const session = document.getElementById("speedkit-entitlement-session");
  const cap = document.getElementById("speedkit-entitlement-capability");
  const out = document.getElementById("speedkit-entitlement-output");
  const btn = document.getElementById("speedkit-entitlement-run");

  async function run() {
    out.textContent = "running entitlement usage...";
    const body = {
      session_id: String(session.value || "").trim(),
      capability: String(cap.value || "").trim(),
      event: "browser_entitlement_usage_probe",
      units: 1,
      metadata: { source: "marketplace_entitlement_usage_page" }
    };
    const res = await fetch("/api/marketplace/entitlement-usage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await res.json();
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "ENTITLEMENT_USAGE_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));
})();
