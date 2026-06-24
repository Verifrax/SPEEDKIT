(() => {
  const out = document.getElementById("speedkit-control-chain-archive-output");
  const btn = document.getElementById("speedkit-control-chain-archive-run");

  async function run() {
    out.textContent = "reading public control chain archive...";
    const payload = await fetch("/api/marketplace/control-chain-archive?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_CHAIN_ARCHIVE_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
