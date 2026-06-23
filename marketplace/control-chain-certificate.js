(() => {
  const out = document.getElementById("speedkit-control-chain-certificate-output");
  const btn = document.getElementById("speedkit-control-chain-certificate-run");

  async function run() {
    out.textContent = "issuing public control chain certificate...";
    const payload = await fetch("/api/marketplace/control-chain-certificate?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_CHAIN_CERTIFICATE_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
