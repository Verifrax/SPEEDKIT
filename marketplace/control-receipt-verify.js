(() => {
  const out = document.getElementById("speedkit-control-receipt-verify-output");
  const btn = document.getElementById("speedkit-control-receipt-verify-run");

  async function run() {
    out.textContent = "verifying public control receipt...";
    const payload = await fetch("/api/marketplace/control-receipt-verify?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_RECEIPT_VERIFY_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
