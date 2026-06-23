(() => {
  const out = document.getElementById("speedkit-control-digest-output");
  const btn = document.getElementById("speedkit-control-digest-run");

  async function run() {
    out.textContent = "computing public control digest...";
    const payload = await fetch("/api/marketplace/control-digest?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", () => run().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_DIGEST_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  }));

  run().catch(() => {});
})();
