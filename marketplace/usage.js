(() => {
  const session = document.getElementById("speedkit-usage-session");
  const plan = document.getElementById("speedkit-usage-plan");
  const cap = document.getElementById("speedkit-usage-capability");
  const btn = document.getElementById("speedkit-usage-record");
  const out = document.getElementById("speedkit-usage-output");

  async function record() {
    out.textContent = "recording...";
    const body = {
      session_id: String(session.value || "").trim(),
      plan: String(plan.value || "").trim(),
      capability: String(cap.value || "").trim(),
      event: "browser_usage_probe",
      units: 1,
      metadata: { source: "marketplace_usage_page" }
    };

    const response = await fetch("/api/marketplace/usage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => record().catch(error => {
    out.textContent = JSON.stringify({ status: "USAGE_RECORD_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));
})();
