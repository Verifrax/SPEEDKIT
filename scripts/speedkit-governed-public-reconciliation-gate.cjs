#!/usr/bin/env node
const fs = require('fs');
const cp = require('child_process');

function sh(cmd) {
  return cp.execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function fail(msg) {
  console.error('APPEND_ONLY_GATE_FAIL: ' + msg);
  process.exit(1);
}

function run(cmd) {
  cp.execSync(cmd, { stdio: 'inherit' });
}

const headRef =
  process.env.GITHUB_HEAD_REF ||
  process.env.BRANCH_NAME ||
  sh('git branch --show-current');

let base = '';
try {
  base = sh('git merge-base HEAD origin/main');
} catch {
  try {
    base = sh('git rev-parse HEAD^');
  } catch {
    base = '';
  }
}

let raw = '';
if (base) {
  raw = sh(`git diff --name-status ${base}..HEAD`);
}

const changes = raw
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => {
    const parts = line.split(/\s+/);
    return { status: parts[0], path: parts.slice(1).join(' ') };
  });

if (changes.length === 0) {
  console.log('APPEND_ONLY_GATE_PASS=true');
  console.log('REASON=no changes');
  process.exit(0);
}

const appendOnly = changes.every(x => x.status === 'A' || x.status.startsWith('A'));
if (appendOnly) {
  console.log('APPEND_ONLY_GATE_PASS=true');
  console.log('REASON=append only');
  console.log('HEAD_REF=' + headRef);
  console.log('CHANGED_FILES=' + changes.length);
  process.exit(0);
}

const governedTokens = [
  'reconcile',
  'reconciliation',
  'public-universe',
  'proof',
  'family',
  'workspace',
  'governed',
  'control-engine',
  'live',
  'health',
  'control-chain',
  'marketplace',
  'offer',
  'offers',
  'install',
  'install-rail'
];

const governedBranch = governedTokens.some(token => headRef.includes(token));
if (!governedBranch) {
  fail('non-append change on non-governed branch: ' + headRef);
}

if (!changes.some(x => x.path === 'PUBLIC_RECONCILIATION_PROOF.json')) {
  fail('non-append reconciliation requires PUBLIC_RECONCILIATION_PROOF.json to change');
}

if (!fs.existsSync('PUBLIC_RECONCILIATION_PROOF.json')) {
  fail('PUBLIC_RECONCILIATION_PROOF.json missing');
}

const proof = JSON.parse(fs.readFileSync('PUBLIC_RECONCILIATION_PROOF.json', 'utf8'));

if (proof.governed_reconciliation !== true) fail('proof is not governed reconciliation');
if (proof.mode !== 'PUBLIC_ONLY') fail('proof mode is not PUBLIC_ONLY');
if (proof.systems !== 4) fail('proof system count is not 4');
if (proof.private_remaining !== 0) fail('proof private remaining is not zero');

run('node scripts/speedkit-public-universe-audit.cjs');

console.log('APPEND_ONLY_GATE_PASS=true');
console.log('REASON=governed public reconciliation');
console.log('HEAD_REF=' + headRef);
console.log('CHANGED_FILES=' + changes.length);
