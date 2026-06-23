(() => {
  const session = document.getElementById("speedkit-buyer-control-session");
  const out = document.getElementById("speedkit-buyer-control-output");
  const btn = document.getElementById("speedkit-buyer-control-run");

  async function run() {
    out.textContent = "reading buyer control...";
    const sessionId = String(session.value || "").trim();
    const payload = await fetch("/api/marketplace/buyer-control?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "BUYER_CONTROL_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));
})();
