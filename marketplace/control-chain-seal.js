(() => {
  const out = document.getElementById("speedkit-control-chain-seal-output");
  const btn = document.getElementById("speedkit-control-chain-seal-run");

  async function run() {
    out.textContent = "issuing public control chain seal...";
    const payload = await fetch("/api/marketplace/control-chain-seal?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_CHAIN_SEAL_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
