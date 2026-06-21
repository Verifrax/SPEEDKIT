#!/usr/bin/env node
const fs = require('fs');
const cp = require('child_process');
function run(cmd, soft=false){ try { return cp.execSync(cmd,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim(); } catch(e){ if(soft) return ''; console.error(e.stderr ? e.stderr.toString() : e.message); process.exit(1); } }
function fail(x){ console.error('APPEND_ONLY_GATE_FAIL: ' + x); process.exit(1); }
const baseRef = process.env.GITHUB_BASE_REF || 'main';
const headRef = process.env.GITHUB_HEAD_REF || run('git branch --show-current', true);
run(`git fetch origin ${baseRef} --depth=200`, true);
let base = '';
for (const c of [`origin/${baseRef}`, 'origin/main', 'HEAD~1']) { if (run(`git rev-parse --verify ${c}`, true)) { base = c; break; } }
if (!base) fail('could not resolve comparison base');
const raw = run(`git diff --name-status ${base}...HEAD`, true);
const changes = raw.split('\n').filter(Boolean).map(x => { const p = x.split('\t'); return {status:p[0], path:p[p.length-1]}; });
if (changes.length === 0) { console.log('APPEND_ONLY_GATE_PASS=true'); console.log('REASON=no changes'); process.exit(0); }
if (changes.every(x => x.status === 'A')) { console.log('APPEND_ONLY_GATE_PASS=true'); console.log('REASON=pure append'); process.exit(0); }
const allowed = ['reconcile','reconciliation','public-universe','proof','family','workspace','governed','control-engine','live','health','control-chain'].some(t => headRef.includes(t));
if (!allowed) fail('non-append change on non-governed branch: ' + headRef);
if (!changes.some(x => x.path === 'PUBLIC_RECONCILIATION_PROOF.json')) fail('non-append reconciliation requires PUBLIC_RECONCILIATION_PROOF.json to change');
if (!fs.existsSync('PUBLIC_RECONCILIATION_PROOF.json')) fail('PUBLIC_RECONCILIATION_PROOF.json missing');
const proof = JSON.parse(fs.readFileSync('PUBLIC_RECONCILIATION_PROOF.json','utf8'));
if (proof.governed_reconciliation !== true) fail('proof does not declare governed_reconciliation');
if (proof.mode !== 'PUBLIC_ONLY') fail('proof mode is not PUBLIC_ONLY');
if (proof.systems !== 4) fail('proof systems must be 4');
if (proof.private_remaining !== 0) fail('proof private_remaining must be 0');
process.stdout.write(run('node scripts/speedkit-public-universe-audit.cjs') + '\n');
console.log('APPEND_ONLY_GATE_PASS=true');
console.log('REASON=governed public reconciliation');
console.log('HEAD_REF=' + headRef);
console.log('CHANGED_FILES=' + changes.length);
