(() => {
  const out = document.getElementById("speedkit-release-archive-output");
  const btn = document.getElementById("speedkit-release-archive-run");
  async function run() {
    out.textContent = "loading release archive...";
    const payload = await fetch("/api/marketplace/control-release-archive?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }
  if (btn) btn.addEventListener("click", () => run().catch(e => { out.textContent = String(e); }));
  run().catch(() => {});
})();
