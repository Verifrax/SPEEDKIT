(() => {
  const out = document.getElementById("speedkit-final-attestation-output");
  const btn = document.getElementById("speedkit-final-attestation-run");
  async function run(){
    out.textContent = "loading final attestation...";
    const payload = await fetch("/api/marketplace/control-final-attestation?t="+Date.now()).then(r=>r.json());
    out.textContent = JSON.stringify(payload,null,2);
  }
  if (btn) btn.addEventListener("click",()=>run().catch(e=>{ out.textContent = String(e); }));
  run().catch(()=>{});
})();
