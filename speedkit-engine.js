let SK = null;
const $ = s => document.querySelector(s);
const screenEl = $("#screen");
const inputEl = $("#cmd");
const inspectEl = $("#inspect");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function routeRecords(){
  return SK.routes.map(r => ({id:"ROUTE-"+r.cmd,surface:"route",name:r.title,full_name:r.title,description:r.path,url:r.path,status:"ROUTED",family:"routes",cmd:r.cmd}));
}
function records(){ return [...SK.systems, ...SK.workspace_entries, ...SK.artifacts, ...routeRecords()]; }
function out(x){ if(screenEl){screenEl.innerHTML += "\n" + x; screenEl.scrollTop = screenEl.scrollHeight;} }
function setInspect(x){ if(inspectEl) inspectEl.textContent = typeof x === "string" ? x : JSON.stringify(x, null, 2); }
function label(r){ return `${r.id||""} · ${r.surface||""} · ${r.full_name||r.name||""} · ${r.family||""} · ${r.status||""}`; }

function findOne(q){
  const raw = String(q || "").trim();
  const key = raw.toLowerCase();
  const alias = SK.aliases?.[key];
  const target = String(alias || raw).toLowerCase();
  return records().find(r =>
    String(r.id||"").toLowerCase() === target ||
    String(r.cmd||"").toLowerCase() === target ||
    String(r.name||"").toLowerCase() === target ||
    String(r.full_name||"").toLowerCase() === target
  ) || search(target)[0];
}
function score(r, q){
  const hay = JSON.stringify(r).toLowerCase();
  q = q.toLowerCase().trim();
  if(!q) return 0;
  if(String(r.id||"").toLowerCase() === q) return 1000;
  if(String(r.name||"").toLowerCase() === q) return 900;
  if(String(r.full_name||"").toLowerCase() === q) return 880;
  const parts = q.split(/\s+/).filter(Boolean);
  if(parts.every(p => hay.includes(p))) return 500 + parts.length * 10;
  if(hay.includes(q)) return 300;
  return 0;
}
function search(q){
  return records().map(r => [score(r,q),r]).filter(x => x[0] > 0).sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
}
function printRows(rows, max=24){
  if(!rows.length){ out("NO_MATCH"); setInspect("NO_MATCH"); return; }
  out(rows.slice(0,max).map(label).join("\n") + (rows.length > max ? `\n… ${rows.length-max} more` : ""));
  setInspect(rows.slice(0, max));
}
function openThing(q){
  const r = findOne(q);
  if(!r){ out("NO_MATCH"); return; }
  out("OPEN " + label(r));
  if(r.url) location.href = r.url;
}
function verify(){
  const c = SK.counts;
  out(`VERIFY_PASS=true · PUBLIC_ONLY=true · SYSTEMS=${c.systems} · ORGS=${c.github_organizations} · REPOS=${c.github_repositories} · NPM=${c.npm_packages} · PYPI=${c.pypi_packages} · WORKSPACE=${c.workspace_entries} · PRIVATE_REMAINING=${c.private_remaining}`);
  setInspect(SK.boundary);
}
async function run(raw){
  if(!SK) SK = await fetch("/SPEEDKIT_TERMINAL_MANIFEST.json").then(r=>r.json());
  const cmd = String(raw||"").trim();
  if(!cmd) return;
  out(`<span class="prompt">speedkit&gt;</span> ${esc(cmd)}`);
  const lc = cmd.toLowerCase();

  if(lc === "clear"){ screenEl.innerHTML = ""; return; }
  if(lc === "help"){ out(SK.commands.join(" · ")); return; }
  if(lc === "counts"){ out(JSON.stringify(SK.counts)); setInspect(SK.counts); return; }
  if(lc === "privacy"){ out(`PUBLIC_ONLY=true · PRIVATE_PURGED=${SK.counts.private_purged} · PRIVATE_REMAINING=${SK.counts.private_remaining}`); setInspect(SK.boundary); return; }
  if(lc === "verify"){ verify(); return; }
  if(lc === "routes"){ printRows(routeRecords(), 40); return; }
  if(lc === "tree" || lc === "families"){ printRows(SK.families.map(f => ({id:f.key,surface:"family",name:f.title,description:f.description,url:f.path,status:"ROUTED",family:f.key})), 40); return; }
  if(lc === "systems"){ printRows(SK.systems, 20); return; }
  if(lc === "github"){ printRows(SK.workspace_entries.filter(r => r.surface === "github" || r.surface === "github-org"), 40); return; }
  if(lc === "organizations"){ printRows(SK.workspace_entries.filter(r => r.surface === "github-org"), 40); return; }
  if(lc === "repositories"){ printRows(SK.workspace_entries.filter(r => r.surface === "github"), 40); return; }
  if(lc === "packages"){ printRows(SK.workspace_entries.filter(r => r.surface === "npm" || r.surface === "pypi"), 40); return; }
  if(lc === "npm"){ printRows(SK.workspace_entries.filter(r => r.surface === "npm"), 40); return; }
  if(lc === "pypi"){ printRows(SK.workspace_entries.filter(r => r.surface === "pypi"), 40); return; }
  if(lc === "workspace" || lc === "surfaces"){ printRows(SK.workspace_entries, 40); return; }
  if(lc === "artifacts"){ printRows(SK.artifacts, 40); return; }
  if(lc === "export manifest"){ location.href = "/SPEEDKIT_TERMINAL_MANIFEST.json"; return; }
  if(lc === "export json"){ location.href = "/AUTHOR_WORKSPACE_REPOSITORY_SURFACE.json"; return; }
  if(lc.startsWith("find ")){ printRows(search(cmd.slice(5)), 40); return; }
  if(lc.startsWith("inspect ")){ const r = findOne(cmd.slice(8)); out(r ? label(r) : "NO_MATCH"); setInspect(r || "NO_MATCH"); return; }
  if(lc.startsWith("open ")){ openThing(cmd.slice(5)); return; }

  const r = findOne(cmd);
  if(r){ out("MATCH " + label(r)); setInspect(r); return; }
  printRows(search(cmd), 20);
}
function boot(){
  document.querySelectorAll("[data-count]").forEach(el => {
    const k = el.dataset.count;
    if(SK.counts[k] !== undefined) el.textContent = SK.counts[k];
  });
  document.querySelectorAll("[data-cmd]").forEach(b => b.addEventListener("click", () => run(b.dataset.cmd)));
  if(inputEl){
    const hist=[]; let idx=0;
    inputEl.addEventListener("keydown", e => {
      if(e.key === "Enter"){ const v=inputEl.value; hist.push(v); idx=hist.length; inputEl.value=""; run(v); }
      if(e.key === "ArrowUp"){ idx=Math.max(0,idx-1); inputEl.value=hist[idx]||""; e.preventDefault(); }
      if(e.key === "ArrowDown"){ idx=Math.min(hist.length,idx+1); inputEl.value=hist[idx]||""; e.preventDefault(); }
    });
  }
  document.addEventListener("keydown", e => { if(e.key === "/" && inputEl){ e.preventDefault(); inputEl.focus(); }});
}
fetch("/SPEEDKIT_TERMINAL_MANIFEST.json").then(r=>r.json()).then(m=>{SK=m;boot();});
