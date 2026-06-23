(() => {
  const plan = document.getElementById("speedkit-quota-plan");
  const out = document.getElementById("speedkit-quota-output");
  const btn = document.getElementById("speedkit-quota-read");

  async function readQuota() {
    out.textContent = "reading quota...";
    const p = String(plan.value || "").trim();
    const payload = await fetch("/api/marketplace/quota?plan=" + encodeURIComponent(p) + "&t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => readQuota().catch(error => {
    out.textContent = JSON.stringify({ status: "QUOTA_READ_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  readQuota().catch(() => {});
})();
