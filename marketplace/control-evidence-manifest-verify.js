(() => {
  const out = document.getElementById("speedkit-evidence-manifest-verify-output");
  const btn = document.getElementById("speedkit-evidence-manifest-verify-run");
  async function run(){
    out.textContent = "verifying...";
    const payload = await fetch("/api/marketplace/control-evidence-manifest-verify?t="+Date.now()).then(r=>r.json());
    out.textContent = JSON.stringify(payload,null,2);
  }
  if (btn) btn.addEventListener("click",()=>run().catch(e=>{ out.textContent = String(e); }));
  run().catch(()=>{});
})();
