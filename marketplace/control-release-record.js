(() => {
  const out = document.getElementById("speedkit-release-record-output");
  const btn = document.getElementById("speedkit-release-record-run");
  async function run() {
    out.textContent = "loading release record...";
    const payload = await fetch("/api/marketplace/control-release-record?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }
  if (btn) btn.addEventListener("click", () => run().catch(e => { out.textContent = String(e); }));
  run().catch(() => {});
})();
