(() => {
  const out = document.getElementById("speedkit-release-record-verify-output");
  const btn = document.getElementById("speedkit-release-record-verify-run");
  async function run() {
    out.textContent = "verifying release record...";
    const payload = await fetch("/api/marketplace/control-release-record-verify?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }
  if (btn) btn.addEventListener("click", () => run().catch(e => { out.textContent = String(e); }));
  run().catch(() => {});
})();
