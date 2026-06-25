(() => {
  const out = document.getElementById("speedkit-evidence-manifest-output");
  const btn = document.getElementById("speedkit-evidence-manifest-run");
  async function run(){
    out.textContent = "loading...";
    const payload = await fetch("/api/marketplace/control-evidence-manifest?t="+Date.now()).then(r=>r.json());
    out.textContent = JSON.stringify(payload,null,2);
  }
  if (btn) btn.addEventListener("click",()=>run().catch(e=>{ out.textContent = String(e); }));
  run().catch(()=>{});
})();
