(() => {
  const plan = document.getElementById("speedkit-plan-input");
  const cap = document.getElementById("speedkit-capability-input");
  const out = document.getElementById("speedkit-access-output");
  const btn = document.getElementById("speedkit-access-check");

  async function run() {
    const p = String(plan.value || "").trim();
    const c = String(cap.value || "").trim();
    out.textContent = "checking...";
    const payload = await fetch("/api/marketplace/access-check?plan=" + encodeURIComponent(p) + "&capability=" + encodeURIComponent(c) + "&t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "ACCESS_CHECK_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
