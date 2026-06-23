(() => {
  const session = document.getElementById("speedkit-control-closure-session");
  const out = document.getElementById("speedkit-control-closure-output");
  const btn = document.getElementById("speedkit-control-closure-run");

  async function run() {
    out.textContent = "reading control closure...";
    const sessionId = String(session.value || "").trim();
    const suffix = sessionId ? "?session_id=" + encodeURIComponent(sessionId) + "&t=" + Date.now() : "?t=" + Date.now();
    const payload = await fetch("/api/marketplace/control-closure" + suffix).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_CLOSURE_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
