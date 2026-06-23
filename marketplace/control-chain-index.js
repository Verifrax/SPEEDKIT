(() => {
  const out = document.getElementById("speedkit-control-chain-index-output");
  const btn = document.getElementById("speedkit-control-chain-index-run");

  async function run() {
    out.textContent = "reading public control chain index...";
    const payload = await fetch("/api/marketplace/control-chain-index?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_CHAIN_INDEX_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
