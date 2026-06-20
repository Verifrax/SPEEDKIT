#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
function fail(x){ console.error('AUDIT_FAIL: ' + x); process.exit(1); }
const manifest = JSON.parse(fs.readFileSync('SPEEDKIT_TERMINAL_MANIFEST.json','utf8'));
const counts = manifest.counts;
const entries = manifest.entries || [];
const families = manifest.families || {};
if (manifest.title !== 'SPEEDKIT Control Engine') fail('bad title');
if (manifest.mode !== 'PUBLIC_ONLY') fail('mode is not PUBLIC_ONLY');
if (counts.systems !== 4) fail('systems must remain 4');
if (counts.private_remaining !== 0) fail('private_remaining must be 0');
if (entries.length && counts.workspace_entries !== entries.length) fail('workspace_entries does not match entries length');
if (!families.antimatterium) fail('antimatterium family missing');
for (const e of entries) {
  if (e.private === true) fail('private entry projected');
  if (String(e.visibility || '').toLowerCase() === 'private') fail('private visibility projected');
}
const textExts = new Set(['.html','.js','.json','.md','.txt','.css','.yml','.yaml','.py','.sh','.toml','.xml','.svg']);
const purgedHashes = new Set([
'7baaa424ab7dd30fd579010bfaafc426ac5165d1d1b16c8a36ac7ec0b67328d1',
'3f209432b5fa4789c05e3485e3032e9c3323f7414f85fdb7a56c67409645ea0d',
'e3a44cd2dd17226fb9694483ad7cd1d8399ca186663cf0d3f04ff37ae3b9c3e0',
'86fdd65b0f0819451bf3fec817c54d34b586cfb29a70027e36af177131797ef7',
'ec94999ed4e4ed8841c2c80b08685f1aeb822efc2b3fa706ae8d546da9063421',
'39192b0a2c926f5f4f0ed20140aea7a04c2d6f33947fa8ff1437554ad29a97c7',
'ed0c4eb29143d78809caa532b758e83e5c45a00491724cb9e23f9e53f8df8eba',
'96dde01e246abce90ec37d7a466c4d436a46e721ec53f1f7fcfc46ddcc9a683a',
'b9788d8b2149bbd9b3b8a82a0e350dc364f42a7c5723fd54febd3fa0aafef174'
]);
function walk(dir){
  let out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const parts = p.split(path.sep);
    if (parts.includes('.git') || parts.includes('.wrangler') || parts.includes('node_modules') || parts.includes('.venv') || parts.includes('__pycache__')) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) out = out.concat(walk(p));
    else if (textExts.has(path.extname(p).toLowerCase())) out.push(p);
  }
  return out;
}
const badWord = 'ide' + 'al';
const badRe = new RegExp('\\b' + badWord + '\\b', 'i');
const privateTrue = /\"private\"\s*:\s*true/i;
const visibilityPrivate = /\"visibility\"\s*:\s*\"private\"/i;
const tokenRe = /[A-Za-z0-9][A-Za-z0-9._-]{2,}/g;
for (const p of walk('.')) {
  const text = fs.readFileSync(p,'utf8');
  if (badRe.test(text)) fail('forbidden status word found in ' + p);
  if (privateTrue.test(text)) fail('private true found in ' + p);
  if (visibilityPrivate.test(text)) fail('private visibility found in ' + p);
  for (const tok of text.match(tokenRe) || []) {
    const h = crypto.createHash('sha256').update(tok.toLowerCase()).digest('hex');
    if (purgedHashes.has(h)) fail('purged private repository token found in ' + p);
  }
}
const indexSha = crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex');
const checksum = fs.readFileSync('INDEX_CHECKSUM.txt','utf8').trim();
if (checksum !== `${indexSha}  index.html`) fail('INDEX_CHECKSUM mismatch');
if (fs.existsSync('PUBLIC_RECONCILIATION_PROOF.json')) {
  const proof = JSON.parse(fs.readFileSync('PUBLIC_RECONCILIATION_PROOF.json','utf8'));
  if (proof.governed_reconciliation !== true) fail('proof is not governed');
  if (proof.mode !== 'PUBLIC_ONLY') fail('proof mode mismatch');
  if (proof.systems !== counts.systems) fail('proof systems mismatch');
  if (proof.workspace_entries !== counts.workspace_entries) fail('proof workspace mismatch');
  if (proof.private_remaining !== 0) fail('proof private mismatch');
  if (!proof.antimatterium || proof.antimatterium.count !== families.antimatterium.count) fail('proof antimatterium mismatch');
}
console.log('SPEEDKIT_PUBLIC_UNIVERSE_AUDIT_PASS=true');
console.log('TITLE=' + manifest.title);
console.log('MODE=' + manifest.mode);
console.log('SYSTEMS=' + counts.systems);
console.log('WORKSPACE=' + counts.workspace_entries);
console.log('PRIVATE_REMAINING=' + counts.private_remaining);
console.log('ANTIMATTERIUM=' + families.antimatterium.count);
console.log('INDEX_SHA256=' + indexSha);
