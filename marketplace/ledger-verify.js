(() => {
  const session = document.getElementById("speedkit-ledger-verify-session");
  const out = document.getElementById("speedkit-ledger-verify-output");
  const btn = document.getElementById("speedkit-ledger-verify-run");

  async function verify() {
    out.textContent = "verifying...";
    const sessionId = String(session.value || "").trim();
    const payload = await fetch("/api/marketplace/usage-ledger-verify?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => verify().catch(error => {
    out.textContent = JSON.stringify({ status: "LEDGER_VERIFY_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));
})();
