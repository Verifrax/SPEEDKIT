#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');
const manifest = JSON.parse(fs.readFileSync('SPEEDKIT_TERMINAL_MANIFEST.json','utf8'));
const counts = manifest.counts;
const families = manifest.families || {};
const entries = manifest.entries || [];
const indexSha = crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex');
fs.writeFileSync('INDEX_CHECKSUM.txt', `${indexSha}  index.html\n`);
const proof = {
  schema: 'speedkit.public_reconciliation.proof.v1',
  generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  governed_reconciliation: true,
  title: manifest.title,
  mode: manifest.mode,
  source_manifest: 'SPEEDKIT_TERMINAL_MANIFEST.json',
  index_sha256: indexSha,
  systems: counts.systems,
  workspace_entries: counts.workspace_entries,
  github_namespaces: counts.github_namespaces,
  github_repositories: counts.github_repositories,
  github_surfaces: counts.github_surfaces,
  npm_packages: counts.npm_packages,
  pypi_packages: counts.pypi_packages,
  package_surfaces: counts.package_surfaces,
  families: Object.keys(families).length,
  entry_count: entries.length,
  private_remaining: counts.private_remaining,
  private_purged: counts.private_purged,
  antimatterium: {
    present: Boolean(families.antimatterium),
    count: families.antimatterium ? families.antimatterium.count : null,
    route: '/workspace/antimatterium/'
  },
  boundary: {
    systems_layer: 'admitted execution systems only',
    workspace_layer: 'public source, package, namespace, route, and family surfaces',
    repository_is_not_automatic_system: true,
    organization_is_not_automatic_system: true,
    package_is_not_automatic_system: true
  }
};
fs.writeFileSync('PUBLIC_RECONCILIATION_PROOF.json', JSON.stringify(proof, null, 2) + '\n');
console.log('PUBLIC_RECONCILIATION_PROOF_STAMPED=true');
console.log('SYSTEMS=' + proof.systems);
console.log('WORKSPACE=' + proof.workspace_entries);
console.log('PRIVATE_REMAINING=' + proof.private_remaining);
console.log('ANTIMATTERIUM=' + proof.antimatterium.count);
console.log('INDEX_SHA256=' + indexSha);
