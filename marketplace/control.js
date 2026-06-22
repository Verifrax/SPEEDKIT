(() => {
  const out = document.getElementById("speedkit-control-output");
  const btn = document.getElementById("speedkit-refresh-control");

  async function load() {
    out.textContent = "loading...";
    const payload = await fetch("/api/marketplace/control?t=" + Date.now()).then(r => r.json());
    out.textContent = JSON.stringify(payload, null, 2);
  }

  btn.addEventListener("click", load);
  load().catch(error => {
    out.textContent = JSON.stringify({ status: "CONTROL_LOAD_ERROR", error: String(error && error.message ? error.message : error) }, null, 2);
  });
})();
