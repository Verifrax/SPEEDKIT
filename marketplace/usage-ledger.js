(() => {
  const session = document.getElementById("speedkit-ledger-session");
  const plan = document.getElementById("speedkit-ledger-plan");
  const cap = document.getElementById("speedkit-ledger-capability");
  const recordBtn = document.getElementById("speedkit-ledger-record");
  const readBtn = document.getElementById("speedkit-ledger-read");
  const out = document.getElementById("speedkit-ledger-output");

  async function record() {
    out.textContent = "recording ledgered usage...";
    const body = {
      session_id: String(session.value || "").trim(),
      plan: String(plan.value || "").trim(),
      capability: String(cap.value || "").trim(),
      event: "browser_ledger_probe",
      units: 1,
      metadata: { source: "marketplace_usage_ledger_page" }
    };
    const res = await fetch("/api/marketplace/usage-ledger", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await res.json();
    out.textContent = JSON.stringify(payload, null, 2);
  }

  async function readLedger() {
    out.textContent = "reading ledger...";
    const sessionId = String(session.value || "").trim();
    const payload = await fetch("/api/marketplace/usage-ledger?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  recordBtn.addEventListener("click", () => record().catch(error => {
    out.textContent = JSON.stringify({ status: "USAGE_LEDGER_RECORD_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  readBtn.addEventListener("click", () => readLedger().catch(error => {
    out.textContent = JSON.stringify({ status: "USAGE_LEDGER_READ_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));
})();
