(() => {
  const out = document.getElementById("speedkit-control-receipt-output");
  const btn = document.getElementById("speedkit-control-receipt-run");

  async function run() {
    out.textContent = "issuing public control receipt...";
    const payload = await fetch("/api/marketplace/control-receipt?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_RECEIPT_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
